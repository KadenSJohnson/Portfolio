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

  // Bio: a new Figma text layer that says "Text", gets selected, deleted, then typed out
  const boxes = ["[data-bio]"].map((q) => document.querySelector(q)).filter(Boolean).map((el) => {
    let timers = [];
    const live = el.querySelector("[data-bio-live]");
    const ghost = el.querySelector(".bio-ghost");
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const render = (text, marked) => {
      live.textContent = "";
      if (marked) { const m = document.createElement("mark"); m.textContent = text; live.append(m); }
      else live.append(document.createTextNode(text));
      const c = document.createElement("span"); c.className = "caret"; live.append(c);
    };
    const reset = () => { timers.forEach(clearTimeout); timers = []; live.textContent = ""; el.classList.remove("editing", "typed"); };
    const type = () => {
      reset();
      // Once typed, the real text shows (so the clock can keep updating)
      const done = () => { live.textContent = ""; el.classList.remove("editing"); el.classList.add("typed"); };
      if (reduce) { done(); return; }
      const full = ghost.textContent.trim();
      el.classList.add("editing");
      render("Text", false);
      later(() => render("Text", true), 320);
      later(() => render("", false), 620);
      let t = 700;
      for (let i = 1; i <= full.length; i++) {
        const ch = full[i - 1];
        t += ch === " " ? 18 : /[.,·]/.test(ch) ? 70 : 8 + Math.random() * 12;
        later(() => render(full.slice(0, i), false), t);
      }
      later(done, t + 350);
    };
    return { type, reset };
  });
  const typeBio = () => boxes.forEach((b) => b.type());
  const resetBio = () => boxes.forEach((b) => b.reset());

  // Location: a second ("multiplayer") cursor drags the finished text layer in from off screen
  const where = document.querySelector("[data-where]");
  let whereAnim = null, whereT = 0;
  const dragWhere = () => {
    if (!where) return;
    if (whereAnim) whereAnim.cancel();
    clearTimeout(whereT);
    where.classList.remove("leaving");
    where.style.opacity = "1";
    if (reduce || !where.animate) { where.classList.remove("moving"); return; }
    where.classList.add("moving");
    const r = where.getBoundingClientRect();
    const dx = innerWidth - r.left + 40;
    whereAnim = where.animate(
      [{ transform: `translate(${dx}px, 18px)` }, { transform: "translate(0, 0)" }],
      { duration: 1250, easing: "cubic-bezier(.25,.75,.25,1)", fill: "backwards" }
    );
    whereAnim.onfinish = () => {
      // let go: the selection clears and the cursor drifts away
      whereT = setTimeout(() => { where.classList.remove("moving"); where.classList.add("leaving"); }, 120);
    };
  };
  // Park it off screen until its turn
  const parkWhere = () => {
    if (!where || reduce || !where.animate) { if (where) where.style.opacity = "1"; return; }
    if (whereAnim) whereAnim.cancel();
    where.classList.remove("moving", "leaving");
    where.style.opacity = "0";
  };

  let raf = 0;
  const play = () => {
    cancelAnimationFrame(raf);
    if (reduce) { setK(1); showDims(); sel.classList.add("done"); typeBio(); dragWhere(); return; }
    resetBio(); parkWhere();
    sel.classList.remove("done");
    setK(START); showDims();
    cur.classList.remove("dragging");
    const t0 = performance.now();
    const h0 = handle();
    const from = { x: h0.x + 90, y: h0.y + 70 };
    let bioStarted = false;
    const frame = (now) => {
      const t = now - t0;
      // The bio and location start as the cursor grabs the name's handle, so they overlap the drag
      if (!bioStarted && t >= 650) { bioStarted = true; typeBio(); dragWhere(); }
      if (t >= 1900) sel.classList.add("done");        // name becomes plain text
      if (t < 250) {                                   // cursor appears
        place(from.x, from.y, 5, 3, clamp(t / 200));
      } else if (t < 700) {                            // glide to the corner handle
        const p = ease(clamp((t - 250) / 450)), h = handle();
        place(from.x + (h.x - from.x) * p, from.y + (h.y - from.y) * p, 5, 3, 1);
      } else if (t < 800) {                            // grab
        cur.classList.add("dragging");
        const h = handle(); place(h.x, h.y, 12, 12, 1);
      } else if (t < 1700) {                           // drag the corner out to full size
        setK(START + (1 - START) * ease(clamp((t - 800) / 900)));
        showDims();
        const h = handle(); place(h.x, h.y, 12, 12, 1);
      } else if (t < 2150) {                           // let go and move away
        setK(1); showDims();
        cur.classList.remove("dragging");
        const p = ease(clamp((t - 1700) / 450)), h = handle();
        place(h.x + 40 * p, h.y + 26 * p, 5, 3, 1 - clamp((t - 1850) / 300));
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
  // Start once the load cover clears (the web font is in by then, so the box measures the real text)
  const go = () => setTimeout(play, 100);
  if (window.siteReady) window.siteReady.then(go);
  else if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(go);
  else go();
  showDims();
})();
