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

  /* Local time under the intro */
  const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Denver" });
  const clocks = document.querySelectorAll("[data-clock]");
  const tick = () => { const t = "Salt Lake City, Utah · " + fmt.format(new Date()) + " MT"; clocks.forEach((c) => { c.textContent = t; }); };
  tick();
  setInterval(tick, 15000);

  /* Category filter */
  const chips = Array.from(document.querySelectorAll(".chip"));
  const pick = document.getElementById("cat-select");
  const objs = Array.from(document.querySelectorAll(".gallery > .obj"));
  const applyFilter = (f) => {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === f)));
    if (pick) pick.value = f;
    objs.forEach((o) => {
      const cats = (o.dataset.cat || "").split(" ");
      o.hidden = f !== "all" && !cats.includes(f);
    });
  };
  chips.forEach((c) => c.addEventListener("click", () => applyFilter(c.dataset.filter)));
  if (pick) pick.addEventListener("change", () => applyFilter(pick.value));

  /* Copy email */
  document.querySelectorAll("[data-copy]").forEach((b) => {
    b.addEventListener("click", () => {
      const text = b.dataset.copy;
      const done = () => { b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy email"; }, 1600); };
      const fallback = () => {
        const el = document.getElementById("email-text");
        const r = document.createRange(); r.selectNodeContents(el);
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        b.textContent = "Selected"; setTimeout(() => { b.textContent = "Copy email"; }, 2400);
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

  /* Full-length compare: one scroll window moves both pages; the shorter page
     scrolls proportionally so both reach their footers together. The handle drags. */
  const setupBA = (root, list) => {
    root.querySelectorAll(".ba.big").forEach((ba) => {
      if (ba.classList.contains("split")) { dragHandle(ba); return; }
      const sc = ba.querySelector(".ba-scroll");
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
    const barTags = document.getElementById("lb-bar-tags");
    if (barTags) barTags.innerHTML = tagsEl.innerHTML;
    lbDisposers.forEach((off) => off()); lbDisposers = [];
    content.replaceChildren(tpl.content.cloneNode(true));
    realize(content);
    content.querySelectorAll(".ph.is-real img").forEach((im) => { im.tabIndex = 0; im.setAttribute("role", "button"); im.setAttribute("aria-label", "View larger: " + (im.alt || "image")); });
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
    closeZoom();
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
  /* Image viewer: any image in a project opens full screen; tap or click it to see it at 2x and pan */
  const zoom = document.getElementById("zoom");
  const zImg = document.getElementById("zoom-img");
  let zoomFrom = null;
  const openZoom = (img) => {
    zoomFrom = img;
    zImg.src = img.currentSrc || img.src;
    zImg.alt = img.alt || "";
    zImg.style.width = "";
    zoom.classList.remove("actual", "tall");
    const tall = () => zoom.classList.toggle("tall", zImg.naturalHeight > zImg.naturalWidth * 1.6);
    if (zImg.complete && zImg.naturalWidth) tall(); else zImg.addEventListener("load", tall, { once: true });
    zoom.hidden = false;
    zoom.scrollTo(0, 0);
    zoom.querySelector("[data-zoom-close]").focus();
  };
  const closeZoom = () => {
    if (zoom.hidden) return;
    zoom.hidden = true;
    zImg.removeAttribute("src");
    if (zoomFrom && document.contains(zoomFrom)) zoomFrom.focus();
  };
  const imgOf = (el) => el.closest && el.closest("#lb-content .ph.is-real img");
  content.addEventListener("click", (e) => { const img = imgOf(e.target); if (img) openZoom(img); });
  content.addEventListener("keydown", (e) => {
    const img = imgOf(e.target);
    if (img && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openZoom(img); }
  });
  zImg.addEventListener("click", (e) => {
    e.stopPropagation();
    if (zoom.classList.contains("actual")) { zoom.classList.remove("actual"); zImg.style.width = ""; return; }
    const w = zImg.getBoundingClientRect().width;
    const fx = e.offsetX / w, fy = e.offsetY / zImg.getBoundingClientRect().height;
    zImg.style.width = Math.round(w * 2) + "px";
    zoom.classList.add("actual");
    // keep the tapped spot under the finger
    zoom.scrollTo(fx * zImg.offsetWidth - zoom.clientWidth / 2, fy * zImg.offsetHeight - zoom.clientHeight / 2);
  });
  zoom.addEventListener("click", (e) => { if (e.target === zoom) closeZoom(); });
  zoom.querySelector("[data-zoom-close]").addEventListener("click", closeZoom);
  dlg.addEventListener("cancel", (e) => { if (!zoom.hidden) { e.preventDefault(); closeZoom(); } });

  dlg.addEventListener("keydown", (e) => {
    if (!zoom.hidden) { if (e.key === "Escape") { e.preventDefault(); closeZoom(); } return; }
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
