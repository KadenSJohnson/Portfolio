import { Model3D } from "./model3d.js";

(() => {
  /* Images: each placeholder keeps its original file name in data-src. When this page is
     hosted next to the real images (for example kadenjohnson.me/images/), set IMAGE_BASE
     to that folder and every placeholder becomes the real image. */
  const IMAGE_BASE = "/images/";
  const realize = (root) => {
    if (!IMAGE_BASE) return;
    root.querySelectorAll(".ph[data-src]").forEach((ph) => {
      const img = new Image();
      img.src = IMAGE_BASE + ph.dataset.src;
      img.alt = ph.dataset.alt || "";
      img.loading = "lazy";
      img.decoding = "async";
      ph.replaceChildren(img);
      ph.classList.add("is-real");
    });
  };
  realize(document);

  /* Ruler numbers, one per inch, along the top and left edges of the mat */
  const mat = document.getElementById("mat");
  const rx = document.getElementById("ruler-x");
  const ry = document.getElementById("ruler-y");
  const IN = 96;
  const fill = (el, length, axis) => {
    const n = Math.floor(length / IN);
    if (el.childElementCount === n) return;
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= n; i++) {
      const s = document.createElement("span");
      s.textContent = i;
      s.style[axis === "x" ? "left" : "top"] = i * IN + "px";
      frag.appendChild(s);
    }
    el.replaceChildren(frag);
  };
  const rulers = () => {
    fill(rx, rx.parentElement.clientWidth, "x");
    fill(ry, ry.parentElement.clientHeight, "y");
  };
  rulers();
  if ("ResizeObserver" in window) new ResizeObserver(rulers).observe(mat);
  else window.addEventListener("resize", rulers);

  /* Clock in the intro card */
  const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Denver" });
  const clocks = document.querySelectorAll("[data-clock]");
  const tick = () => { const t = "Springville, UT · " + fmt.format(new Date()) + " MT"; clocks.forEach((c) => { c.textContent = t; }); };
  tick();
  setInterval(tick, 15000);

  /* Category filter */
  const chips = Array.from(document.querySelectorAll(".chip"));
  const objs = Array.from(document.querySelectorAll(".gallery > .obj"));
  const applyFilter = (f) => {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === f)));
    objs.forEach((o) => {
      const cats = (o.dataset.cat || "").split(" ");
      o.hidden = f !== "all" && !cats.includes(f);
    });
  };
  chips.forEach((c) => c.addEventListener("click", () => applyFilter(c.dataset.filter)));

  /* Copy email */
  document.querySelectorAll("[data-copy]").forEach((b) => {
    b.addEventListener("click", () => {
      const text = b.dataset.copy;
      const done = () => { b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy email"; }, 1600); };
      const fallback = () => {
        const el = document.getElementById("email-text");
        const r = document.createRange(); r.selectNodeContents(el);
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        b.textContent = "Selected";
      };
      try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
    });
  });

  /* 3D models: card previews spin slowly; the lightbox copy is interactive.
     Each canvas names its model in data-model; the OBJ text is inlined as
     <script id="obj-NAME"> and its texture is published as model-NAME.png. */
  let lbDisposers = [];
  const mountModels = (root, list) => {
    root.querySelectorAll("canvas[data-model]").forEach((cv) => {
      const key = cv.dataset.model;
      const src = (document.getElementById("obj-" + key) || {}).textContent;
      if (!src) return;
      const color = cv.dataset.color;
      Model3D.load(key, src, color ? null : "/model-" + key + ".png", color).then(() => {
        const big = cv.hasAttribute("data-interactive");
        const off = Model3D.mount(cv, { key, interactive: big, yaw: Number(cv.dataset.yaw || -0.6), pitch: Number(cv.dataset.pitch || 0.3), dist: big ? 4.2 : 4.4 });
        if (list) list.push(off);
      });
    });
  };
  mountModels(document.querySelector(".gallery"));

  /* Before / after sliders (works for copies cloned into the lightbox too) */
  document.addEventListener("input", (e) => {
    if (!e.target.matches || !e.target.matches(".ba-range")) return;
    e.target.closest(".ba").style.setProperty("--pos", e.target.value + "%");
  });

  /* Drag the compare handle (pointer capture keeps the drag going over the pages) */
  const dragHandle = (ba) => {
    const line = ba.querySelector(".ba-line");
    const range = ba.querySelector(".ba-range");
    let drag = false;
    const move = (e) => {
      const r = ba.getBoundingClientRect();
      const p = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      ba.style.setProperty("--pos", p + "%");
      if (range) range.value = String(Math.round(p));
    };
    const end = () => { drag = false; ba.classList.remove("dragging"); };
    line.addEventListener("pointerdown", (e) => { drag = true; ba.classList.add("dragging"); line.setPointerCapture(e.pointerId); move(e); e.preventDefault(); });
    line.addEventListener("pointermove", (e) => { if (drag) move(e); });
    line.addEventListener("pointerup", end);
    line.addEventListener("pointercancel", end);
  };

  /* Live compare: two real pages rendered at desktop width and scaled to fit the window */
  const setupLive = (ba, list) => {
    const fit = () => {
      const w = ba.clientWidth || 1;
      const vw = 1440; // the prototypes are desktop pages
      ba.style.setProperty("--vw", vw + "px");
      ba.style.setProperty("--s", String(w / vw));
    };
    fit();
    let ro = null;
    if ("ResizeObserver" in window) { ro = new ResizeObserver(fit); ro.observe(ba); }
    const hint = ba.querySelector(".ba-hint");
    const frames = Array.from(ba.querySelectorAll("iframe"));
    let loaded = 0;
    frames.forEach((f) => f.addEventListener("load", () => {
      f.classList.add("is-loaded");
      if (++loaded >= frames.length && hint) hint.hidden = true;
    }, { once: true }));
    // If the archive is slow, keep the screenshots up and say so; each page appears when it arrives
    const t = setTimeout(() => { if (hint && !hint.hidden) hint.textContent = "Still loading the prototypes…"; }, 15000);
    dragHandle(ba);
    if (list) list.push(() => { clearTimeout(t); ro && ro.disconnect(); });
  };

  /* Full-length compare: one scroll window moves both pages; the shorter page
     scrolls proportionally so both reach their footers together. The handle drags. */
  const setupBA = (root, list) => {
    root.querySelectorAll(".ba.big").forEach((ba) => {
      const sc = ba.querySelector(".ba-scroll");
      if (ba.classList.contains("live")) return setupLive(ba, list);
      if (!sc) return;
      const st = sc.querySelector(".ba-stage");
      const imgs = Array.from(st.querySelectorAll("img"));
      const hint = ba.querySelector(".ba-hint");
      const range = ba.querySelector(".ba-range");
      const layout = () => {
        const w = st.clientWidth;
        const hs = imgs.map((im) => w * (Number(im.getAttribute("height")) || im.naturalHeight) / (Number(im.getAttribute("width")) || im.naturalWidth));
        const tall = Math.max.apply(null, hs);
        st.style.height = tall + "px";
        const V = sc.clientHeight, s = sc.scrollTop;
        imgs.forEach((im, k) => { im.style.transform = "translateY(" + (tall > V ? s * (tall - hs[k]) / (tall - V) : 0) + "px)"; });
        if (hint) hint.hidden = s > 8;
      };
      sc.addEventListener("scroll", layout, { passive: true });
      let ro = null;
      if ("ResizeObserver" in window) { ro = new ResizeObserver(layout); ro.observe(sc); }
      layout();
      dragHandle(ba);
      if (list) list.push(() => { ro && ro.disconnect(); });
    });
  };

  /* Lightbox */
  const dlg = document.getElementById("lightbox");
  const sheet = dlg.querySelector(".sheet");
  const content = document.getElementById("lb-content");
  const titleEl = document.getElementById("lb-title");
  const subEl = document.getElementById("lb-sub");
  const tagsEl = document.getElementById("lb-tags");
  let current = null, opener = null;

  const visibleIds = () => Array.from(document.querySelectorAll(".gallery > .obj[data-id]")).filter((o) => !o.hidden).map((o) => o.dataset.id);
  const setHash = (h) => { try { history.replaceState(null, "", h ? "#" + h : location.pathname + location.search); } catch (e) {} };

  const show = (id) => {
    const tpl = document.getElementById("p-" + id);
    if (!tpl) return;
    current = id;
    titleEl.textContent = tpl.dataset.title;
    subEl.textContent = tpl.dataset.sub;
    const card = document.querySelector('.obj[data-id="' + id + '"] .tags');
    tagsEl.innerHTML = card ? card.innerHTML : "";
    lbDisposers.forEach((off) => off()); lbDisposers = [];
    content.replaceChildren(tpl.content.cloneNode(true));
    realize(content);
    mountModels(content, lbDisposers);
    setupBA(content, lbDisposers);
    sheet.scrollTop = 0;
    if (!dlg.open) {
      dlg.showModal();
      document.documentElement.style.overflow = "hidden";
    }
    setHash(id);
  };
  const close = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener("close", () => {
    document.documentElement.style.overflow = "";
    lbDisposers.forEach((off) => off()); lbDisposers = [];
    setHash("");
    if (opener && document.contains(opener)) opener.focus();
    current = null;
  });

  document.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => { opener = b; show(b.dataset.open); }));
  dlg.querySelector("[data-close]").addEventListener("click", close);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  dlg.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => {
    const ids = visibleIds();
    if (!ids.length) return;
    const i = ids.indexOf(current);
    const next = ids[(i + Number(b.dataset.step) + ids.length) % ids.length];
    opener = document.querySelector('[data-open="' + next + '"]');
    show(next);
  }));
  dlg.addEventListener("keydown", (e) => {
    if (e.target.closest("a,button") && (e.key === "Enter" || e.key === " ")) return;
    if (e.target.closest("canvas[data-model], .ba-range")) return;
    if (e.key === "ArrowRight") dlg.querySelector('[data-step="1"]').click();
    if (e.key === "ArrowLeft") dlg.querySelector('[data-step="-1"]').click();
  });

  const fromHash = location.hash.slice(1);
  if (fromHash && document.getElementById("p-" + fromHash)) {
    opener = document.querySelector('[data-open="' + fromHash + '"]');
    show(fromHash);
  }
})();
