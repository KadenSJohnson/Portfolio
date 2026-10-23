/* Shared interactions for the KPM homepage prototypes: reveal on scroll, count-up numbers,
   carousels (slide and fade), parallax images, header shadow. Links are inert. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Prototype: links and forms go nowhere
  document.addEventListener("click", (e) => { const a = e.target.closest("a"); if (a) e.preventDefault(); });
  document.querySelectorAll("form").forEach((f) => f.addEventListener("submit", (e) => e.preventDefault()));

  // Header shadow once the page scrolls
  const hdr = document.querySelector("[data-header]");
  const onScroll = () => { if (hdr) hdr.classList.toggle("scrolled", scrollY > 8); };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Reveal + count-up when an element enters the viewport
  const fmt = (n) => n.toLocaleString("en-US");
  const count = (el) => {
    const to = Number(el.dataset.count), dur = 1600, t0 = performance.now();
    if (reduce) { el.textContent = fmt(to); return; }
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add("in");
    if (el.dataset.count) count(el);
    io.unobserve(el);
  }), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll("[data-reveal],[data-count]").forEach((el) => {
    if (el.dataset.count) el.textContent = "0";
    io.observe(el);
  });
  document.documentElement.classList.add("js");

  // Parallax: images inside [data-parallax] drift as the section passes
  const par = Array.from(document.querySelectorAll("[data-parallax]"));
  if (par.length && !reduce) {
    const tick = () => {
      const vh = innerHeight;
      par.forEach((sec) => {
        const r = sec.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        sec.querySelector("img").style.transform = `translate3d(0, ${(p * 60).toFixed(1)}px, 0) scale(1.12)`;
      });
    };
    addEventListener("scroll", () => requestAnimationFrame(tick), { passive: true });
    tick();
  }

  // Slide carousel: [data-car] holds a .track of .slide; buttons [data-prev]/[data-next] with
  // data-for="id"; optional [data-bar] progress for that id. data-fade="1" crossfades instead.
  const cars = {};
  document.querySelectorAll("[data-car]").forEach((root) => {
    const id = root.id, fade = root.dataset.fade === "1";
    const track = root.querySelector(".track");
    const slides = Array.from(track.children);
    const prevs = document.querySelectorAll(`[data-prev][data-for="${id}"]`);
    const nexts = document.querySelectorAll(`[data-next][data-for="${id}"]`);
    const bars = document.querySelectorAll(`[data-bar][data-for="${id}"]`);
    const dots = document.querySelectorAll(`[data-dot][data-for="${id}"]`);
    const loop = root.dataset.loop === "1";
    let i = 0;
    const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
    const maxI = () => {
      if (fade || loop) return slides.length - 1;
      const w = slides[0].getBoundingClientRect().width + gap();
      const vis = Math.max(1, Math.floor((root.clientWidth + gap() + 2) / w));
      return Math.max(0, slides.length - vis);
    };
    const go = (n, user) => {
      const m = maxI();
      i = loop ? (n + slides.length) % slides.length : Math.max(0, Math.min(m, n));
      if (fade) slides.forEach((s, k) => s.classList.toggle("on", k === i));
      else {
        const w = slides[0].getBoundingClientRect().width + gap();
        track.style.transform = `translate3d(${-i * w}px,0,0)`;
        slides.forEach((s, k) => s.classList.toggle("on", k === i));
      }
      prevs.forEach((b) => { b.disabled = !loop && i === 0; });
      nexts.forEach((b) => { b.disabled = !loop && i >= m; });
      bars.forEach((b) => {
        const n = loop || fade ? slides.length : m + 1;
        b.style.setProperty("--w", (100 / n) + "%");
        b.style.setProperty("--x", (i * 100) + "%");
      });
      dots.forEach((d) => d.classList.toggle("on", Number(d.dataset.dot) === i));
      if (user) restart();
    };
    prevs.forEach((b) => b.addEventListener("click", () => go(i - 1, true)));
    nexts.forEach((b) => b.addEventListener("click", () => go(i + 1, true)));
    dots.forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.dot), true)));
    // Swipe / drag
    let x0 = null;
    root.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
    root.addEventListener("pointerup", (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1), true);
    });
    root.addEventListener("dragstart", (e) => e.preventDefault());
    // Autoplay
    const every = Number(root.dataset.auto || 0);
    let timer = 0;
    const restart = () => {
      clearInterval(timer);
      if (every && !reduce) timer = setInterval(() => go(i + 1 > maxI() ? 0 : i + 1), every);
    };
    addEventListener("resize", () => go(i));
    go(0); restart();
    cars[id] = { go };
  });
})();
