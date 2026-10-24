/* Layout grid: measures one grid cell (content width / --cols) and rounds the height of each
   block up to whole cells, so card edges, section edges and lines of text sit on the grid
   lines drawn behind the page. Re-runs on resize, once fonts load, and as images arrive. */
(() => {
  const page = document.querySelector(".page");
  const gallery = document.querySelector(".gallery");
  if (!page) return;
  const root = document.documentElement;
  let raf = 0;

  const snap = () => {
    raf = 0;
    const cs = getComputedStyle(page);
    const width = page.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const cols = parseFloat(getComputedStyle(root).getPropertyValue("--cols")) || 12;
    const cell = width / cols;
    root.style.setProperty("--cell", cell + "px");
    root.style.setProperty("--gx", (page.getBoundingClientRect().left + parseFloat(cs.paddingLeft)) + "px");
    const blocks = Array.from(document.querySelectorAll("[data-snap], .gallery > .obj"));
    // Measure natural heights first (cards stop stretching while measured), then round up
    if (gallery) gallery.style.alignItems = "start";
    const media = Array.from(document.querySelectorAll(".gallery > .obj > .obj-img"));
    media.forEach((m) => { m.style.height = ""; });
    const mh = media.map((m) => m.getBoundingClientRect().height);
    media.forEach((m, i) => { if (mh[i]) m.style.height = Math.max(2, Math.round(mh[i] / cell)) * cell + "px"; });
    blocks.forEach((el) => { el.style.minHeight = ""; });
    const heights = blocks.map((el) => el.getBoundingClientRect().height);
    blocks.forEach((el, i) => {
      el.style.minHeight = Math.max(1, Math.ceil(heights[i] / cell - 0.02)) * cell + "px";
    });
    if (gallery) gallery.style.alignItems = "";
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(snap); };

  snap();
  if ("ResizeObserver" in window) new ResizeObserver(queue).observe(page);
  addEventListener("resize", queue);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
  document.querySelectorAll(".page img").forEach((im) => { if (!im.complete) im.addEventListener("load", queue, { once: true }); });
  // Filtering hides cards and reflows rows
  document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest(".chip")) queue(); });
  document.addEventListener("change", (e) => { if (e.target.id === "cat-select") queue(); });
})();
