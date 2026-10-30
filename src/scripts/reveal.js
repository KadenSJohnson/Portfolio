/* Page load: the hero plays once the font is in. Cards: as each one scrolls into view, a blue Figma "slot" appears and the card is
   dropped into it like a component being placed, then the slot clears. Plays once per card.
   Reduced motion: no card animation. */
const root = document.documentElement;

// Videos load only when they're about to scroll into view, so they don't compete with the first
// screen. (Copies opened in the lightbox are started by app.js.)
const startVideo = (v) => {
  if (v.dataset.src && !v.getAttribute("src")) { v.src = v.dataset.src; v.preload = "auto"; }
  v.muted = true;
  const p = v.play(); if (p && p.catch) p.catch(() => {});
};
window.startVideo = startVideo;
const vids = document.querySelectorAll("video[data-src]");
if ("IntersectionObserver" in window) {
  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) startVideo(e.target); else if (!e.target.paused) e.target.pause();
  }), { rootMargin: "300px 0px" });
  vids.forEach((v) => vio.observe(v));
} else vids.forEach(startVideo);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Animations start once the web font is in (so text is measured right), or after 0.8s at most
const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
window.siteReady = Promise.race([fonts, new Promise((r) => setTimeout(r, 800))]).then(() => { root.classList.add("ready"); });

const lists = Array.from(document.querySelectorAll(".gallery, .rl-list"));
if (lists.length && !reduce && "IntersectionObserver" in window && Element.prototype.animate) {
  const DUR = 680;
  const drop = (card, delay) => {
    card.classList.add("shown");
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.style.cssText = `top:${card.offsetTop}px;left:${card.offsetLeft}px;width:${card.offsetWidth}px;height:${card.offsetHeight}px`;
    card.parentElement.append(slot);
    slot.animate([{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.82 }, { opacity: 0 }],
      { duration: DUR + 600, delay, fill: "both" }).onfinish = () => slot.remove();
    card.animate([
      { opacity: 0, transform: "translate(0, 18px)", boxShadow: "0 16px 30px -12px rgba(0,0,0,.24)" },
      { opacity: 1, offset: 0.55 },
      { opacity: 1, transform: "translate(0, 0)", boxShadow: "0 0 0 0 rgba(0,0,0,0)" },
    ], { duration: DUR, delay: delay + 60, easing: "cubic-bezier(.45,0,.2,1)", fill: "backwards" });
  };
  window.siteReady.then(() => {
    const io = new IntersectionObserver((entries) => {
      let i = 0;
      entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((e) => { io.unobserve(e.target); drop(e.target, i++ * 90); });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.12 });
    lists.forEach((list) => list.querySelectorAll(":scope > .obj, :scope > .rl").forEach((c) => io.observe(c)));
  });
} else {
  root.classList.remove("anim");
}

// Hover (mouse and trackpad only): the card lifts out of a blue slot, the reverse of the scroll-in
if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".gallery > .obj, .rl-list > .rl").forEach((card) => {
    let slot = null;
    card.addEventListener("pointerenter", () => {
      if (!card.classList.contains("shown") && root.classList.contains("anim")) return; // still dropping in
      if (!slot) {
        slot = document.createElement("div");
        slot.className = "slot hover";
        card.parentElement.append(slot);
      }
      slot.style.cssText = `top:${card.offsetTop}px;left:${card.offsetLeft}px;width:${card.offsetWidth}px;height:${card.offsetHeight}px`;
      requestAnimationFrame(() => slot && slot.classList.add("on"));
      card.classList.add("lifted");
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("lifted");
      if (!slot) return;
      const s = slot; slot = null;
      setTimeout(() => s.classList.remove("on"), 250);   // the slot clears as the card settles
      setTimeout(() => s.remove(), 600);
    });
  });
}
