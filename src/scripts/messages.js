/* Testimonials as iOS Messages: when a thread scrolls into view, each bubble shows typing dots
   and then its text, one after another. The photo opens a contact card; Done closes it.
   Reduced motion: the messages are simply there. */
(() => {
  const threads = Array.from(document.querySelectorAll("[data-imsg]"));
  if (!threads.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const play = async (card) => {
    if (card.dataset.played) return;
    card.dataset.played = "1";
    const bubbles = Array.from(card.querySelectorAll(".im-bubble"));
    await wait(350);
    for (const b of bubbles) {
      const len = b.querySelector(".im-text").textContent.length;
      b.classList.add("typing");
      await wait(Math.min(1700, 700 + len * 9));
      b.classList.remove("typing");
      b.classList.add("in");
      await wait(450);
    }
  };

  if (!reduce && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-imsg");
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) { io.unobserve(e.target); play(e.target); }
    }), { threshold: 0.55 });
    threads.forEach((t) => io.observe(t));
  }

  // Contact card
  threads.forEach((card) => {
    const who = card.querySelector(".im-who");
    const sheet = card.querySelector(".im-card");
    const done = card.querySelector(".im-done");
    if (!who || !sheet) return;
    const open = () => { sheet.hidden = false; who.setAttribute("aria-expanded", "true"); done.focus(); };
    const close = () => { sheet.hidden = true; who.setAttribute("aria-expanded", "false"); who.focus(); };
    who.setAttribute("aria-expanded", "false");
    who.addEventListener("click", open);
    done.addEventListener("click", close);
    sheet.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } });
  });
})();
