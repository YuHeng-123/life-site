window.LIFE_SITE_DATA = {
  movies: {
    label: "电影",
    filterLabel: "类型",
    items: [
      { id: "coco", title: "寻梦环游记", group: "动画", meta: "家庭 · 音乐", image: "assets/movie-coco.jpg", summary: "关于亲情、记忆和梦想的温柔动画。", story: "米格进入亡灵世界寻找家族秘密，也理解了家人为什么害怕音乐。", feeling: "看完会想给家人打电话。爱不是只在热闹时存在，也在每一次想念里。", tip: "适合写亲情、成长、音乐和被记得这件事。" },
      { id: "flipped", title: "怦然心动", group: "青春", meta: "初恋 · 成长", image: "assets/movie-flipped.jpg", summary: "一部干净的青春片，用双视角讲同一段关系。", story: "两个孩子对同一件事有完全不同的理解，故事慢慢展示他们如何看见彼此。", feeling: "真诚和善良不是幼稚，而是一个人很珍贵的底色。", tip: "适合写青春、视角差异、真诚和自我成长。" },
      { id: "our-little-sister", title: "海街日记", group: "文艺", meta: "家庭 · 日常", image: "assets/movie-our-little-sister.jpg", summary: "节奏慢，但慢得舒服，像夏天屋檐下的谈话。", story: "三姐妹接回同父异母的妹妹，四个人在镰仓一起生活。", feeling: "生活不是突然变好的，而是一点点被善意照亮的。", tip: "适合写家庭关系、姐妹、镰仓和日常温柔。" },
      { id: "spirited-away", title: "千与千寻", group: "动画", meta: "奇幻 · 成长", image: "assets/movie-spirited-away.jpg", summary: "小时候看是冒险，长大后看像成长考试。", story: "千寻误入神灵世界，为救父母开始工作，也学会守住自己的名字。", feeling: "长大不是不害怕，而是在害怕时仍愿意往前走。", tip: "适合写成长、勇气、规则和自我身份。" },
      { id: "inception", title: "盗梦空间", group: "科幻", meta: "梦境 · 悬疑", image: "assets/movie-inception.jpg", summary: "层层梦境让故事紧张，也让情感更重。", story: "柯布进入梦境执行植入想法的任务，同时被自己的执念困住。", feeling: "最难走出的不是梦，而是心里的遗憾。", tip: "适合写梦境结构、执念、现实和真相。" },
      { id: "life-of-pi", title: "少年派的奇幻漂流", group: "冒险", meta: "海上 · 信念", image: "assets/movie-life-of-pi.jpg", summary: "画面很美，故事背后是孤独、信念和选择。", story: "少年派与老虎漂流海上，表面是求生，深处是创伤后的讲述方式。", feeling: "有些故事不是为了给唯一答案，而是让人重新理解希望。", tip: "适合写信念、孤独、海上冒险和故事真相。" },
      { id: "shawshank", title: "肖申克的救赎", group: "剧情", meta: "希望 · 自由", image: "assets/movie-shawshank.jpg", summary: "关于自由、耐心和希望的经典电影。", story: "安迪被困监狱多年，用理性、耐心和信念为自己开出一条路。", feeling: "希望不是一句口号，而是长期忍耐里仍不放弃自己。", tip: "适合写自由、友情、耐心和人生困境。" },
      { id: "godfather", title: "教父", group: "犯罪", meta: "家族 · 权力", image: "assets/movie-godfather.jpg", summary: "家族故事里藏着权力、责任和代价。", story: "柯里昂家族的兴衰，展示了一个人如何被家族与时代推向权力中心。", feeling: "越冷静的选择，有时越沉重。", tip: "适合写权力、家族、选择和人物命运。" },
      { id: "interstellar", title: "星际穿越", group: "科幻", meta: "宇宙 · 亲情", image: "assets/movie-interstellar.jpg", summary: "把宇宙尺度和亲情放在一起。", story: "父亲离开地球寻找人类未来，时间差让亲情变得更加痛。", feeling: "距离很远，爱仍可能成为一个人回家的线索。", tip: "适合写时间、宇宙、父女关系和牺牲。" },
      { id: "truman", title: "楚门的世界", group: "剧情", meta: "自由 · 真实", image: "assets/movie-truman.jpg", summary: "一个人发现自己的人生被安排。", story: "楚门生活在巨大的节目布景里，逐渐察觉世界的异常。", feeling: "真实有风险，但被安排的安全并不等于自由。", tip: "适合写自由、真实、媒体和人生选择。" },
      { id: "wall-e", title: "机器人总动员", group: "动画", meta: "环保 · 陪伴", image: "assets/movie-wall-e.jpg", summary: "台词很少，却讲清楚孤独和陪伴。", story: "瓦力在废弃地球上清理垃圾，遇见伊娃后开始一段跨越星际的旅程。", feeling: "温柔有时不是说很多话，而是长久地守着一件事。", tip: "适合写环保、孤独、陪伴和未来想象。" },
      { id: "amadeus", title: "莫扎特传", group: "传记", meta: "音乐 · 天才", image: "assets/movie-amadeus.jpg", summary: "讲天才，也讲嫉妒和命运。", story: "萨列里回忆莫扎特的一生，在敬畏和嫉妒之间被撕扯。", feeling: "才华会照亮世界，也会刺痛旁观的人。", tip: "适合写艺术、天才、嫉妒和音乐。" },
      { id: "titanic", title: "泰坦尼克号", group: "爱情", meta: "灾难 · 阶层", image: "assets/movie-titanic.jpg", summary: "浪漫外壳下是灾难、阶层和生命选择。", story: "杰克与露丝在巨轮上相遇，短暂爱情被灾难推向永恒记忆。", feeling: "有些相遇很短，却足以改变一个人的余生。", tip: "适合写爱情、阶层、灾难和告别。" },
      { id: "la-la-land", title: "爱乐之城", group: "音乐", meta: "梦想 · 爱情", image: "assets/movie-la-la-land.jpg", summary: "歌舞片里有梦想和错过。", story: "两个追梦的人相爱，也在各自的道路上慢慢分开。", feeling: "不是所有相爱都能同行，但美好的东西不会因此失效。", tip: "适合写梦想、选择、音乐和遗憾。" },
      { id: "forrest-gump", title: "阿甘正传", group: "剧情", meta: "人生 · 时代", image: "assets/movie-forrest-gump.jpg", summary: "用单纯视角看时代变化。", story: "阿甘用自己的方式经历美国几十年变迁，也守住了朴素的爱。", feeling: "聪明不一定是人生唯一答案，真诚也能穿过很多风浪。", tip: "适合写人生、时代、单纯和坚持。" },
      { id: "totoro", title: "龙猫", group: "动画", meta: "童年 · 乡间", image: "assets/movie-totoro.jpg", summary: "温柔、童年和夏天的乡间气息。", story: "姐妹搬到乡下，遇见神秘的龙猫，也在等待母亲康复的日子里获得安慰。", feeling: "童年的魔法，常常来自被自然和善意接住的瞬间。", tip: "适合写童年、自然、家庭和治愈。" }
    ]
  },
  travel: {
    label: "旅行",
    filterLabel: "地区",
    items: [
      { id: "fuji", title: "富士山与河口湖", group: "亚洲", meta: "日本", image: "assets/travel-fuji.jpg", summary: "春天樱花映着远处雪山。", story: "河口湖适合慢慢看富士山，天气晴朗时湖面、樱花和山形会形成很安静的画面。", feeling: "风俗上，赏樱是一种迎接春天的生活仪式。", tip: "清晨和傍晚更适合拍照，人也相对少。" },
      { id: "paris", title: "埃菲尔铁塔", group: "欧洲", meta: "法国", image: "assets/travel-paris.jpg", summary: "白天看结构，夜晚看灯光。", story: "巴黎铁塔是城市地标，也连接着咖啡馆、塞纳河和街边慢生活。", feeling: "法国街边坐着聊天，本身就是旅行的一部分。", tip: "可以从特罗卡德罗广场远看全景。" },
      { id: "santorini", title: "圣托里尼", group: "欧洲", meta: "希腊", image: "assets/travel-santorini.jpg", summary: "蓝白建筑、海岸线和日落。", story: "爱琴海边的白色小镇很适合慢旅行，傍晚光线让建筑和海面都变柔和。", feeling: "当地生活节奏偏慢，晚餐常常和日落连在一起。", tip: "黄昏前后适合拍海景和白墙巷子。" },
      { id: "marrakech", title: "马拉喀什老城集市", group: "非洲", meta: "摩洛哥", image: "assets/travel-marrakech.jpg", summary: "香料、果摊和热闹街巷。", story: "老城集市是当地日常生活的一部分，颜色、气味和声音都很密集。", feeling: "问候、挑选和讨价还价是集市体验的一部分。", tip: "注意保管随身物品，拍人像前先征得同意。" },
      { id: "great-wall", title: "箭扣长城", group: "亚洲", meta: "中国", image: "assets/travel-greatwall.jpg", summary: "山脊上的古老城墙。", story: "长城顺山势起伏，把历史和自然连在一起。", feeling: "登高看山，会更容易感到时间的厚度。", tip: "选择安全开放路线，清晨光线更有层次。" },
      { id: "grand-canyon", title: "大峡谷", group: "美洲", meta: "美国", image: "assets/travel-grandcanyon.jpg", summary: "岩层写成的时间感。", story: "阳光变化会让峡谷颜色不断改变，尺度感非常强。", feeling: "这里适合提醒人，自然比日常烦恼大得多。", tip: "观景台日落很美，也要注意风和温差。" },
      { id: "giza", title: "吉萨金字塔", group: "非洲", meta: "埃及", image: "assets/travel-giza.jpg", summary: "沙漠里的古文明轮廓。", story: "金字塔和狮身人面像把建筑、神话和历史放在同一片沙地上。", feeling: "古迹会让人感到文明留下来的重量。", tip: "请当地向导讲解会更容易理解背景。" },
      { id: "taj-mahal", title: "泰姬陵", group: "亚洲", meta: "印度", image: "assets/travel-tajmahal.jpg", summary: "白色大理石和水池倒影。", story: "泰姬陵的对称花园和建筑比例让它有强烈仪式感。", feeling: "宏大的建筑也能表达很私人、很深的情感。", tip: "清晨游客少，白色建筑的光线更柔。" },
      { id: "zhangjiajie", title: "张家界", group: "亚洲", meta: "中国", image: "assets/travel-zhangjiajie.jpg", summary: "石柱山峰像从云雾里长出来。", story: "森林、峡谷和奇峰构成很有想象力的山地景观。", feeling: "雾气一来，风景会变得像电影场景。", tip: "雨后和清晨更容易看到云雾。" },
      { id: "banff", title: "班夫国家公园", group: "美洲", meta: "加拿大", image: "assets/travel-banff.jpg", summary: "雪山湖泊和松林非常干净。", story: "班夫适合自驾、徒步和看湖，湖水颜色常让人停很久。", feeling: "冷色自然风景会让人心里安静。", tip: "露易丝湖和梦莲湖适合早到。" },
      { id: "cappadocia", title: "卡帕多奇亚", group: "欧洲", meta: "土耳其", image: "assets/travel-cappadocia.jpg", summary: "热气球和奇岩地貌。", story: "清晨热气球升起时，天空和岩石地貌一起变成很特别的画面。", feeling: "它像一个适合把梦放上天的地方。", tip: "热气球受天气影响，行程要留缓冲。" },
      { id: "machu-picchu", title: "马丘比丘", group: "美洲", meta: "秘鲁", image: "assets/travel-machu-picchu.jpg", summary: "山顶古城与云雾。", story: "古城藏在高山之间，适合写文明、远行和抵达感。", feeling: "走到高处看到遗址，会很容易理解人的渺小和创造力。", tip: "提前预约门票，注意高原反应。" },
      { id: "queenstown", title: "皇后镇", group: "大洋洲", meta: "新西兰", image: "assets/travel-queenstown.jpg", summary: "湖光山色和户外运动。", story: "皇后镇把安静自然和冒险活动放在一起。", feeling: "这里适合写自由、风和远方。", tip: "湖边散步和缆车视角都值得记录。" },
      { id: "aurora", title: "冰岛极光", group: "欧洲", meta: "冰岛", image: "assets/travel-aurora.jpg", summary: "冷色天空里的流动光带。", story: "极光需要天气、季节和耐心配合，是很有等待感的旅行体验。", feeling: "看到天空变化时，会觉得等待被奖励了。", tip: "冬季、远离城市光源更容易看到。" },
      { id: "barcelona", title: "圣家堂", group: "欧洲", meta: "西班牙", image: "assets/travel-barcelona.jpg", summary: "彩窗和建筑细节非常丰富。", story: "高迪的建筑像把自然形态变成石头和光。", feeling: "建筑也可以像森林一样生长。", tip: "室内彩窗在阳光下最有层次。" },
      { id: "great-barrier-reef", title: "大堡礁", group: "大洋洲", meta: "澳大利亚", image: "assets/travel-great-barrier-reef.jpg", summary: "珊瑚和海洋生态。", story: "大堡礁适合写蓝色世界，也适合提醒人保护海洋。", feeling: "海底颜色会让人重新理解生命的丰富。", tip: "潜水或浮潜要选择合规旅行服务。" }
    ]
  },
  food: {
    label: "美食",
    filterLabel: "地区",
    items: [
      { id: "sushi", title: "寿司", group: "亚洲", meta: "日本", image: "assets/food-sushi.jpg", summary: "醋饭和海味的克制平衡。", story: "寿司从保存鱼类的方法演变成讲究季节和手艺的料理。", feeling: "好吃的寿司不靠复杂，而靠干净的比例。", tip: "记录米饭温度、鱼料新鲜度和入口感。" },
      { id: "pizza", title: "玛格丽特披萨", group: "欧洲", meta: "意大利", image: "assets/food-pizza.jpg", summary: "番茄、奶酪和罗勒。", story: "常被看作那不勒斯披萨的代表，颜色也让人想到意大利国旗。", feeling: "简单食材如果比例好，就足够快乐。", tip: "写面饼边缘、奶酪拉丝和番茄酸甜。" },
      { id: "tacos", title: "Tacos al Pastor", group: "美洲", meta: "墨西哥", image: "assets/food-tacos.jpg", summary: "街头烟火气里的玉米卷。", story: "吸收中东烤肉做法，又变成墨西哥街头代表味道。", feeling: "菠萝、肉香和辣酱让它很有现场感。", tip: "适合写摊位、炭火和手拿着吃的轻松。" },
      { id: "baklava", title: "巴克拉瓦", group: "亚洲", meta: "土耳其", image: "assets/food-baklava.jpg", summary: "酥皮、坚果和糖浆。", story: "常出现在节日和待客场景里，甜味带着分享的热情。", feeling: "甜得直接，也很适合配茶。", tip: "记录层次、坚果香和糖浆湿润度。" },
      { id: "dumplings", title: "饺子", group: "亚洲", meta: "中国", image: "assets/food-dumplings.jpg", summary: "一口包住团圆的味道。", story: "春节和家庭聚餐里常见，重点不只是吃，也是一家人一起包。", feeling: "饺子最动人的部分，常常在上桌之前。", tip: "写馅料、蘸料和家人一起包的过程。" },
      { id: "hotpot", title: "四川火锅", group: "亚洲", meta: "中国", image: "assets/food-hotpot.jpg", summary: "麻辣锅底和热闹聚餐。", story: "火锅把不同食材放进同一口锅，也把人围到同一张桌。", feeling: "它不只是味道，也是气氛。", tip: "写锅底香气、蘸碟和最喜欢的食材。" },
      { id: "ramen", title: "拉面", group: "亚洲", meta: "日本", image: "assets/food-ramen.jpg", summary: "汤底、面条和叉烧。", story: "不同地区有不同汤底和面条风格。", feeling: "一碗热汤面很适合夜晚和雨天。", tip: "记录汤底浓度、面条软硬和配菜。" },
      { id: "pho", title: "牛肉河粉", group: "亚洲", meta: "越南", image: "assets/food-pho.jpg", summary: "清汤、米粉、香草和牛肉。", story: "它常出现在早餐和街边小店里，味道清爽但有层次。", feeling: "香草和热汤让早晨变得很舒服。", tip: "写汤头清澈度、香草和酸辣搭配。" },
      { id: "tom-yum", title: "冬阴功汤", group: "亚洲", meta: "泰国", image: "assets/food-tom-yum.jpg", summary: "酸辣香茅和海鲜味。", story: "热带香料让汤有鲜明性格。", feeling: "它像一口就把人带到潮湿热闹的街边。", tip: "记录酸、辣、香茅和椰奶版本差别。" },
      { id: "paella", title: "西班牙海鲜饭", group: "欧洲", meta: "西班牙", image: "assets/food-paella.jpg", summary: "米饭吸收海鲜汤汁。", story: "常与周末、家庭聚餐和大锅分享有关。", feeling: "锅底焦香是它很迷人的部分。", tip: "写米粒口感、海鲜鲜味和锅底。" },
      { id: "croissant", title: "可颂", group: "欧洲", meta: "法国", image: "assets/food-croissant.jpg", summary: "黄油层次和酥皮口感。", story: "早餐、咖啡和面包店共同组成法式日常。", feeling: "咬开那一刻的酥响很有幸福感。", tip: "写外皮酥、内里软和黄油香。" },
      { id: "tagine", title: "塔吉锅", group: "非洲", meta: "摩洛哥", image: "assets/food-tagine.jpg", summary: "陶锅慢炖肉类与香料。", story: "果干、香料和肉类一起慢炖，甜咸味很有辨识度。", feeling: "它像把集市香料慢慢煮进晚餐。", tip: "写香料、肉质软烂和果干甜味。" },
      { id: "koshari", title: "Koshari", group: "非洲", meta: "埃及", image: "assets/food-koshari.jpg", summary: "米饭、豆子、意面和番茄酱。", story: "平民美食常常最能说明一个地方的日常。", feeling: "混搭但实在，是很有生活感的一餐。", tip: "写酱汁、炸洋葱和饱腹感。" },
      { id: "burger", title: "汉堡", group: "美洲", meta: "美国", image: "assets/food-burger.jpg", summary: "面包、牛肉饼和酱料。", story: "快餐文化里最有代表性的食物之一，也能做得很讲究。", feeling: "一口下去是直接的满足。", tip: "写肉饼汁水、面包和酱料比例。" },
      { id: "ceviche", title: "酸橘汁腌鱼", group: "美洲", meta: "秘鲁", image: "assets/food-ceviche.jpg", summary: "柑橘汁、鱼肉和洋葱。", story: "海岸饮食里很清爽的一道，靠酸度和新鲜度取胜。", feeling: "它像把海风和酸味放进盘子里。", tip: "写鱼肉质感、酸度和辣椒香气。" },
      { id: "satay", title: "沙爹", group: "亚洲", meta: "印尼", image: "assets/food-satay.jpg", summary: "烤肉串配花生酱。", story: "夜市炭火味和酱料是它的灵魂。", feeling: "边走边吃的时候最有街头感。", tip: "写炭火香、酱汁厚度和肉的焦边。" }
    ]
  },
  flowers: {
    label: "百花",
    filterLabel: "季节",
    items: [
      { id: "tulip", title: "郁金香", group: "春季", meta: "荷兰", image: "assets/flower-tulip.jpg", summary: "像春天铺开的彩色地毯。", story: "大片花田让人一眼记住春天的颜色。", feeling: "它适合写颜色、秩序和春游。", tip: "拍远景花田，也拍单朵花瓣。" },
      { id: "sakura", title: "樱花", group: "春季", meta: "日本", image: "assets/flower-sakura.jpg", summary: "短暂盛开，所以格外珍惜。", story: "樱花常被用来表达春天、相遇和告别。", feeling: "它美在热烈，也美在很快落下。", tip: "拍树下人群、水面花瓣和傍晚枝头。" },
      { id: "peony", title: "牡丹", group: "春季", meta: "中国", image: "assets/flower-peony.jpg", summary: "热烈、丰盛、有古典气质。", story: "牡丹在中国文化里常有富贵和春日盛景的意味。", feeling: "它不是小清新，而是很有气场的盛放。", tip: "拍花瓣层次、雨后水珠和园林背景。" },
      { id: "lavender", title: "薰衣草", group: "夏季", meta: "法国", image: "assets/flower-lavender.jpg", summary: "紫色花海和夏天的风。", story: "普罗旺斯薰衣草让人想到香气、阳光和慢生活。", feeling: "它适合写远方和宁静。", tip: "拍花田线条、远处村庄和紫色层次。" },
      { id: "sunflower", title: "向日葵", group: "夏季", meta: "美国", image: "assets/flower-sunflower.jpg", summary: "朝着太阳生长的明亮花海。", story: "向日葵常被看作阳光、热情和希望的象征。", feeling: "它的颜色很直接，像夏天的笑。", tip: "拍逆光花盘、蓝天和黄色花海。" },
      { id: "lotus", title: "荷花", group: "夏季", meta: "中国", image: "assets/flower-lotus.jpg", summary: "池塘里的清雅主角。", story: "荷花和莲叶、水面、雨滴常常一起出现。", feeling: "它适合写安静和清透。", tip: "雨后拍水珠，清晨拍柔光。" },
      { id: "plum", title: "梅花", group: "冬季", meta: "中国", image: "assets/flower-plum.jpg", summary: "冬春开放，清冷坚韧。", story: "梅花常与寒冬、风骨和等待春天联系在一起。", feeling: "它美得不热闹，却很有力量。", tip: "雪景、枝干和留白都很适合。" },
      { id: "rose", title: "玫瑰", group: "夏季", meta: "英国", image: "assets/flower-rose.jpg", summary: "花园里的浪漫与古典。", story: "玫瑰常与爱情、庭院和香气联系在一起。", feeling: "它被写过很多次，但仍然有用。", tip: "拍花瓣边缘、露水和不同颜色。" },
      { id: "orchid", title: "兰花", group: "四季", meta: "新加坡", image: "assets/flower-orchid.jpg", summary: "热带花园里的精致花形。", story: "兰花品种丰富，常被用来表达优雅和珍贵。", feeling: "它的美不张扬，但很耐看。", tip: "适合拍花瓣纹理和背景虚化。" },
      { id: "jasmine", title: "茉莉花", group: "夏季", meta: "印度", image: "assets/flower-jasmine.jpg", summary: "香气比花形更让人记住。", story: "茉莉常用于花环、节日和日常佩戴。", feeling: "它是靠香气进入记忆的花。", tip: "写香味、夜晚和花串。" },
      { id: "frangipani", title: "鸡蛋花", group: "夏季", meta: "泰国", image: "assets/flower-frangipani.jpg", summary: "热带海岛和寺庙感很强。", story: "鸡蛋花常出现在庭院、寺庙和度假场景。", feeling: "它一出现，就像空气变暖了。", tip: "拍落花、白墙和热带光线。" },
      { id: "dahlia", title: "大丽花", group: "秋季", meta: "墨西哥", image: "assets/flower-dahlia.jpg", summary: "花型饱满，颜色强烈。", story: "大丽花很适合做花展主角，层次和色彩都丰富。", feeling: "它像一朵自带节庆感的花。", tip: "拍花心结构和颜色渐变。" },
      { id: "king-protea", title: "帝王花", group: "四季", meta: "南非", image: "assets/flower-king-protea.jpg", summary: "花型有野性和力量感。", story: "帝王花辨识度很高，适合做特色花朵专题。", feeling: "它不像柔弱的花，更像自然雕塑。", tip: "拍正面花型和粗粝背景。" },
      { id: "wattle", title: "金合欢", group: "春季", meta: "澳大利亚", image: "assets/flower-wattle.jpg", summary: "明亮黄色小花。", story: "金合欢常与澳大利亚春天和本土植物联系在一起。", feeling: "它的黄色很轻快。", tip: "拍小花簇和阳光。" },
      { id: "hibiscus", title: "木槿花", group: "夏季", meta: "韩国", image: "assets/flower-hibiscus.jpg", summary: "花期长，有持续盛开的寓意。", story: "木槿常被写作坚韧和不断开放。", feeling: "它的美在于日常而长久。", tip: "拍单朵开放和枝叶对比。" },
      { id: "bougainvillea", title: "三角梅", group: "四季", meta: "巴西", image: "assets/flower-bougainvillea.jpg", summary: "热带街巷里的明亮花瀑。", story: "三角梅常沿墙面和屋檐盛开，很有城市生活气。", feeling: "它适合写热烈、街巷和阳光。", tip: "拍墙面花瀑和街角建筑。" }
    ]
  }
};
