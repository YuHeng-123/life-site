const cards = document.querySelectorAll(".image-card, .movie-card, .quick-panel a");

const reveal = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.12 }
);

cards.forEach((card) => reveal.observe(card));
