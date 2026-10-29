/* Nitpicks as a magazine. The pages live in <template id="bk-pages"> in reading order
   (left, right, left, right…). Wide screens: an open spread; each "leaf" carries a right page on
   its front and the next left page on its back, and turns 180° around the spine. Phones: one page
   at a time; each page turns away to the left to show the next. Arrows, swipe and keys turn pages. */
(() => {
  const tpl = document.getElementById("bk-pages");
  const stage = document.querySelector("[data-book]");
  if (!tpl || !stage) return;
  const pages = Array.from(tpl.content.children);
  const prevB = document.querySelector("[data-bk-prev]");
  const nextB = document.querySelector("[data-bk-next]");
  const atEl = document.querySelector("[data-bk-at]");
  const WIDE = matchMedia("(min-width: 900px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let mode = "", leaves = [], at = 0; // at = spread index (wide) or page index (phone)

  const face = (pg, cls) => {
    const f = document.createElement("div");
    f.className = "bk-face " + cls;
    if (pg) {
      const c = pg.cloneNode(true);
      f.append(c);
      c.querySelectorAll("video").forEach((v) => { v.muted = true; v.playsInline = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); });
    } else f.classList.add("blank");
    return f;
  };

  const count = () => (mode === "wide" ? pages.length / 2 : pages.length);
  const layer = () => {
    const n = leaves.length;
    leaves.forEach((l, k) => { if (!l.classList.contains("moving")) l.style.zIndex = l.classList.contains("turned") ? 10 + k : 10 + n - k; });
  };
  const label = () => {
    const pg = mode === "wide" ? pages[at * 2 + 1] : pages[at];
    atEl.textContent = at === 0 ? (mode === "wide" ? "Contents" : "Cover") : mode === "wide"
      ? `${pg.dataset.label} · ${at} of ${count() - 1}`
      : `Page ${at + 1} of ${count()}`;
    prevB.disabled = at === 0;
    nextB.disabled = at >= count() - 1;
  };

  const build = () => {
    const m = WIDE.matches ? "wide" : "phone";
    if (m === mode) return;
    // keep the reader's place when switching layouts
    if (mode === "wide") at = at * 2; else if (mode === "phone") at = Math.floor(at / 2);
    mode = m;
    stage.replaceChildren();
    stage.className = "bk-stage bk-" + mode;
    leaves = [];
    if (mode === "wide") {
      const n = pages.length / 2;
      stage.append(Object.assign(face(pages[0], "base left"), {}));
      stage.append(face(pages[pages.length - 1], "base right"));
      for (let k = 0; k < n - 1; k++) {
        const leaf = document.createElement("div");
        leaf.className = "bk-leaf";
        leaf.append(face(pages[2 * k + 1], "front"), face(pages[2 * k + 2], "back"));
        stage.append(leaf);
        leaves.push(leaf);
      }
    } else {
      pages.forEach((pg) => {
        const leaf = document.createElement("div");
        leaf.className = "bk-leaf";
        leaf.append(face(pg, "front"));
        stage.append(leaf);
        leaves.push(leaf);
      });
    }
    stage.classList.add("instant");
    leaves.forEach((l, k) => l.classList.toggle("turned", k < at));
    layer();
    void stage.offsetWidth;
    stage.classList.remove("instant");
    label();
  };

  const go = (to) => {
    to = Math.max(0, Math.min(count() - 1, to));
    if (to === at) return;
    const dir = to > at ? 1 : -1;
    // turn every leaf between here and there, one after another
    const list = [];
    if (dir > 0) for (let k = at; k < to; k++) list.push(k); else for (let k = at - 1; k >= to; k--) list.push(k);
    list.forEach((k, i) => {
      const l = leaves[k];
      if (!l) return;
      setTimeout(() => {
        l.classList.add("moving");
        l.style.zIndex = 100 + i;
        l.classList.toggle("turned", dir > 0);
        const done = () => { l.classList.remove("moving"); layer(); };
        if (reduce) done(); else l.addEventListener("transitionend", done, { once: true });
      }, reduce ? 0 : i * 120);
    });
    at = to;
    label();
  };

  prevB.addEventListener("click", () => go(at - 1));
  nextB.addEventListener("click", () => go(at + 1));
  // Contents links (and the "Contents" label) jump to a nitpick's spread
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-bk-goto]");
    if (!b) return;
    const s = Number(b.dataset.bkGoto);
    go(mode === "wide" ? s : s === 0 ? 0 : s * 2);
  });
  addEventListener("keydown", (e) => {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.key === "ArrowRight") go(at + 1);
    if (e.key === "ArrowLeft") go(at - 1);
  });
  // Swipe
  let sx = null, sy = 0;
  stage.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; });
  stage.addEventListener("pointerup", (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) go(at + (dx < 0 ? 1 : -1));
  });
  WIDE.addEventListener("change", build);
  build();
})();
