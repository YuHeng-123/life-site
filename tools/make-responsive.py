#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
花影食途 · 响应式派生图生成

给 assets/ 里的原图生成一套「按宽度 + 按格式」的派生图，供 <picture>/srcset 使用。

产物（全部在 assets/derived/ 下）：
  卡片图  <key>-480 / -960 / -1440  .webp 与 .avif
  兜底图  <key>-960.jpg              （不支持 webp/avif 的老浏览器）
  页头图  hero-*-1280 / -1920        .webp 与 .avif
  分享图  share/<hero>-cover.jpg     （1200x630，社交平台卡片用的标准尺寸）
  占位图  lqip.js                    （16px 宽的 WebP 转成 data URI，供模糊占位）

原图一个都不动，只新增 assets/derived/。

用法：
  python tools/make-responsive.py            # 只补缺失的
  python tools/make-responsive.py --force    # 全部重做
"""
import base64
import io
import json
import sys
import time
from pathlib import Path

from PIL import Image

Image.MAX_IMAGE_PIXELS = None

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
OUT = ASSETS / "derived"
SHARE = ASSETS / "share"

CARD_WIDTHS = (480, 960, 1440)
HERO_WIDTHS = (1280, 1920)
CARD_FALLBACK_W = 960
LQIP_W = 16

# og:image / twitter:image 的标准尺寸
SHARE_W, SHARE_H = 1200, 630

WEBP_Q = 80
AVIF_Q = 58
JPG_Q = 82
SHARE_Q = 82
LQIP_Q = 32

# 页头图单独一档。它是首屏最大的一张（lavender 那张原图 1MB、1920x1440），
# 而且最终是被深色遮罩盖住的背景，不是让人盯着看的正文图。
# 实测降到 46 档：1280 宽从 193KB 降到 118KB（-39%），
# 遮罩之后的 PSNR 仍有 32dB，1:1 看不出差别。
# 卡片图不降 —— 卡片是给人逐张看的，AVIF_Q 保持不变。
HERO_WEBP_Q = 82
HERO_AVIF_Q = 46


def is_hero(stem: str) -> bool:
    return stem.startswith("hero-")


def targets(stem: str):
    """返回 [(输出文件名, 宽度, 格式, 编码参数)]"""
    hero = is_hero(stem)
    widths = HERO_WIDTHS if hero else CARD_WIDTHS
    webp_q = HERO_WEBP_Q if hero else WEBP_Q
    avif_q = HERO_AVIF_Q if hero else AVIF_Q
    out = []
    for w in widths:
        out.append((f"{stem}-{w}.webp", w, "WEBP", {"quality": webp_q, "method": 6}))
        out.append((f"{stem}-{w}.avif", w, "AVIF", {"quality": avif_q, "speed": 8}))
    if not hero:
        out.append((f"{stem}-{CARD_FALLBACK_W}.jpg", CARD_FALLBACK_W, "JPEG", {"quality": JPG_Q, "optimize": True, "progressive": True}))
    return out


def resize_to_width(im: Image.Image, width: int) -> Image.Image:
    if im.width <= width:
        return im
    h = max(1, round(im.height * width / im.width))
    return im.resize((width, h), Image.LANCZOS)


def lqip_data_uri(im: Image.Image) -> str:
    small = im.resize((LQIP_W, max(1, round(im.height * LQIP_W / im.width))), Image.LANCZOS)
    buf = io.BytesIO()
    small.save(buf, "WEBP", quality=LQIP_Q, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def share_cover(im: Image.Image, dest: Path) -> None:
    """裁成 1200x630（社交卡片的通行比例），取景重心略微上移，避免切掉主体。"""
    ratio = SHARE_W / SHARE_H
    w, h = im.size
    if w / h > ratio:
        nw = max(1, round(h * ratio))
        left = (w - nw) // 2
        box = (left, 0, left + nw, h)
    else:
        nh = max(1, round(w / ratio))
        top = int((h - nh) * 0.30)
        box = (0, top, w, top + nh)
    im.crop(box).resize((SHARE_W, SHARE_H), Image.LANCZOS).save(
        dest, "JPEG", quality=SHARE_Q, optimize=True, progressive=True
    )


def main() -> int:
    force = "--force" in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)

    sources = sorted(p for p in ASSETS.glob("*.jpg") if p.is_file())
    if not sources:
        print("!! assets/ 下没有 jpg")
        return 1

    t0 = time.time()
    made = skipped = 0
    total_bytes = 0
    lqip = {}
    failures = []

    for idx, src in enumerate(sources, 1):
        stem = src.stem

        # 先把源图读一次，后面所有宽度都从它缩放
        try:
            im = Image.open(src)
            im.load()
            im = im.convert("RGB")
        except Exception as exc:  # noqa: BLE001
            failures.append((src.name, f"打开失败: {exc}"))
            continue

        # 页头图是 CSS 背景，不走 <img>，不需要模糊占位
        if not is_hero(stem):
            lqip[stem] = lqip_data_uri(im)

        for name, width, fmt, kw in targets(stem):
            dest = OUT / name
            if dest.exists() and not force and dest.stat().st_size > 0:
                skipped += 1
                total_bytes += dest.stat().st_size
                continue
            try:
                resize_to_width(im, width).save(dest, fmt, **kw)
                made += 1
                total_bytes += dest.stat().st_size
            except Exception as exc:  # noqa: BLE001
                failures.append((name, f"{fmt} 编码失败: {exc}"))

        if idx % 10 == 0 or idx == len(sources):
            print(f"  [{idx}/{len(sources)}] {stem}  已用 {time.time()-t0:.0f}s")

    # ---- 分享封面（og:image）---- #
    SHARE.mkdir(parents=True, exist_ok=True)
    covers = 0
    for src in sources:
        if not src.stem.startswith("hero-"):
            continue
        dest = SHARE / f"{src.stem}-cover.jpg"
        if dest.exists() and not force:
            continue
        try:
            share_cover(Image.open(src).convert("RGB"), dest)
            covers += 1
        except Exception as exc:  # noqa: BLE001
            failures.append((dest.name, f"封面生成失败: {exc}"))

    # ---- LQIP ---- #
    js = (
        "/* 由 tools/make-responsive.py 自动生成，请勿手工编辑。\n"
        "   每张图 16px 宽的 WebP 缩略图（data URI），用作卡片图的模糊占位。 */\n"
        "window.LIFE_SITE_LQIP = " + json.dumps(lqip, ensure_ascii=False, separators=(",", ":")) + ";\n"
    )
    (OUT / "lqip.js").write_text(js, encoding="utf-8")

    print()
    print(f"新生成 {made} 个文件，跳过已存在 {skipped} 个，分享封面 {covers} 张")
    print(f"assets/derived 合计 {total_bytes/1024/1024:.1f} MB（{len(list(OUT.iterdir()))} 个文件）")
    print(f"lqip.js {len(js.encode('utf-8'))/1024:.1f} KB，覆盖 {len(lqip)} 张图")
    print(f"总耗时 {time.time()-t0:.0f}s")
    if failures:
        print(f"\n!! 失败 {len(failures)} 项：")
        for n, why in failures[:20]:
            print(f"   {n}: {why}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
