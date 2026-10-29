/* Layout grid: measures one grid cell (content width / --cols) and rounds the height of each
   block up to whole cells, so card edges, section edges and lines of text sit on the grid
   lines drawn behind the page. Re-runs on resize, once fonts load, and as images arrive. */
(() => {
  const page = document.querySelector(".page");
  const gallery = document.querySelector(".gallery");
  if (!page) return;
  const root = document.documentElement;
  let raf = 0;
  // Dotted grid: one cell drawn as an SVG tile with 1px dots along its top and left edges.
  // The dot spacing is picked to divide the cell evenly, so the dots line up across tiles.
  let lastCell = 0;
  const dots = (cell) => {
    if (cell === lastCell) return;
    lastCell = cell;
    const color = (getComputedStyle(root).getPropertyValue("--dot") || "#D6CCC1").trim();
    // Dot spacing grows with the cell (about 1/8 of it), so bigger screens get visibly dotted lines.
    // Prefer a spacing that divides the cell evenly so the dots line up across tiles.
    const want = Math.max(3, Math.round(cell / 8));
    let step = want;
    for (const s of [want, want + 1, want - 1, want + 2, want - 2]) if (s >= 3 && cell % s === 0) { step = s; break; }
    let r = "";
    for (let p = 0; p < cell; p += step) r += `<rect x="${p}" y="0" width="1" height="1"/>` + (p ? `<rect x="0" y="${p}" width="1" height="1"/>` : "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cell}" height="${cell}" shape-rendering="crispEdges" fill="${color}">${r}</svg>`;
    root.style.setProperty("--dot-step", step + "px");
    root.style.setProperty("--grid-img", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  };

  const snap = () => {
    raf = 0;
    // Whole-pixel cells: fractional cells drift (browsers round each tile of the background),
    // so the content width is set to exactly cols × cell and placed on a whole pixel.
    const vw = root.clientWidth;
    const cols = parseFloat(getComputedStyle(root).getPropertyValue("--cols")) || 12;
    const gut = vw < 720 ? 20 : 40;
    const maxw = parseFloat(getComputedStyle(root).getPropertyValue("--maxw")) || 1440;
    const cell = Math.max(8, Math.floor((Math.min(maxw, vw) - 2 * gut) / cols));
    const content = cell * cols;
    root.style.setProperty("--cell", cell + "px");
    dots(cell);
    root.style.setProperty("--content", content + "px");
    root.style.setProperty("--gx", Math.floor((vw - content) / 2) + "px");
    root.classList.add("gridded");
    const blocks = Array.from(document.querySelectorAll("[data-snap], .gallery > .obj"));
    // Measure natural heights first (cards stop stretching while measured), then round up
    if (gallery) gallery.style.alignItems = "start";
    const media = Array.from(document.querySelectorAll(".gallery > .obj > .obj-img"));
    media.forEach((m) => { m.style.height = ""; });
    const mh = media.map((m) => m.getBoundingClientRect().height);
    // Each card image ends on a grid line (the card has a 1px top edge, hence the -1)
    media.forEach((m, i) => { if (mh[i]) m.style.height = Math.max(2, Math.round(mh[i] / cell)) * cell - 1 + "px"; });
    blocks.forEach((el) => { el.style.minHeight = ""; });
    const heights = blocks.map((el) => el.getBoundingClientRect().height);
    blocks.forEach((el, i) => {
      el.style.minHeight = Math.max(1, Math.ceil(heights[i] / cell - 0.02)) * cell + "px";
    });
    if (gallery) gallery.style.alignItems = "";
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(snap); };

  snap();
  if ("ResizeObserver" in window) new ResizeObserver(queue).observe(document.querySelector(".canvas") || page);
  addEventListener("resize", queue);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
  document.querySelectorAll(".page img").forEach((im) => { if (!im.complete) im.addEventListener("load", queue, { once: true }); });
  // Filtering hides cards and reflows rows
  document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest(".chip")) queue(); });
  document.addEventListener("change", (e) => { if (e.target.id === "cat-select") queue(); });
})();
