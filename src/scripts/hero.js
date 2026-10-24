/* Hero: the name starts small inside a Figma-style selection box. A cursor moves to the
   bottom-right handle, grabs it and drags the text out to its full size, with the size label
   updating as it goes. Click the name to play it again. Reduced motion: full size, no cursor. */
(() => {
  const stage = document.querySelector("[data-name-stage]");
  if (!stage) return;
  const sel = stage.querySelector("[data-sel]");
  const dims = stage.querySelector("[data-dims]");
  const cur = stage.querySelector("[data-cursor]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const START = 0.3;

  const setK = (k) => sel.style.setProperty("--k", k.toFixed(4));
  const showDims = () => {
    const r = sel.getBoundingClientRect();
    dims.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
  };
  // Bottom-right handle position inside the stage
  const handle = () => {
    const s = stage.getBoundingClientRect(), r = sel.getBoundingClientRect();
    return { x: r.right - s.left, y: r.bottom - s.top };
  };
  const place = (x, y, hx, hy, opacity) => {
    cur.style.transform = `translate(${(x - hx).toFixed(1)}px, ${(y - hy).toFixed(1)}px)`;
    cur.style.opacity = String(opacity);
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (t) => Math.max(0, Math.min(1, t));

  let raf = 0;
  const play = () => {
    cancelAnimationFrame(raf);
    if (reduce) { setK(1); showDims(); return; }
    setK(START); showDims();
    cur.classList.remove("dragging");
    const t0 = performance.now();
    const h0 = handle();
    const from = { x: h0.x + 90, y: h0.y + 70 };
    const frame = (now) => {
      const t = now - t0;
      if (t < 450) {                                   // cursor fades in
        place(from.x, from.y, 5, 3, clamp(t / 300));
      } else if (t < 1100) {                           // glide to the corner handle
        const p = ease(clamp((t - 450) / 650)), h = handle();
        place(from.x + (h.x - from.x) * p, from.y + (h.y - from.y) * p, 5, 3, 1);
      } else if (t < 1250) {                           // grab
        cur.classList.add("dragging");
        const h = handle(); place(h.x, h.y, 12, 12, 1);
      } else if (t < 2550) {                           // drag the corner out to full size
        setK(START + (1 - START) * ease(clamp((t - 1250) / 1300)));
        showDims();
        const h = handle(); place(h.x, h.y, 12, 12, 1);
      } else if (t < 3300) {                           // let go and move away
        setK(1); showDims();
        cur.classList.remove("dragging");
        const p = ease(clamp((t - 2550) / 750)), h = handle();
        place(h.x + 40 * p, h.y + 26 * p, 5, 3, 1 - clamp((t - 2850) / 450));
      } else {
        place(0, 0, 0, 0, 0);
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  };

  addEventListener("resize", showDims);
  sel.addEventListener("click", play);
  sel.style.cursor = "pointer";
  // Start once the web font is in, so the box measures the real text
  const go = () => setTimeout(play, 250);
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(go);
  else go();
  showDims();
})();
