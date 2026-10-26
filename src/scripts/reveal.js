/* Page load: a white cover fades away once the font and first images are in, then the hero
   plays. Cards: as each one scrolls into view, a blue Figma "slot" appears and the card is
   dropped into it like a component being placed, then the slot clears. Plays once per card.
   Reduced motion: no card animation. */
const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
window.siteReady = Promise.race([Promise.all([loaded, fonts]), new Promise((r) => setTimeout(r, 1800))])
  .then(() => { root.classList.add("ready"); return new Promise((r) => setTimeout(r, 200)); });

const gallery = document.querySelector(".gallery");
if (gallery && !reduce && "IntersectionObserver" in window && Element.prototype.animate) {
  const DUR = 360;
  const drop = (card, delay) => {
    card.classList.add("shown");
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.style.cssText = `top:${card.offsetTop}px;left:${card.offsetLeft}px;width:${card.offsetWidth}px;height:${card.offsetHeight}px`;
    gallery.append(slot);
    slot.animate([{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.72 }, { opacity: 0 }],
      { duration: DUR + 160, delay, fill: "both" }).onfinish = () => slot.remove();
    card.animate([
      { opacity: 0, transform: "translate(14px, -16px) scale(1.02)", boxShadow: "inset 1px 1px 0 #ECECEC, 0 16px 30px -12px rgba(0,0,0,.24)" },
      { opacity: 1, offset: 0.3 },
      { opacity: 1, transform: "translate(0, 0) scale(1)", boxShadow: "inset 1px 1px 0 #ECECEC, 0 0 0 0 rgba(0,0,0,0)" },
    ], { duration: DUR, delay: delay + 60, easing: "cubic-bezier(.2,.75,.25,1)", fill: "backwards" });
  };
  window.siteReady.then(() => {
    const io = new IntersectionObserver((entries) => {
      let i = 0;
      entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((e) => { io.unobserve(e.target); drop(e.target, i++ * 70); });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.12 });
    gallery.querySelectorAll(":scope > .obj").forEach((c) => io.observe(c));
  });
} else {
  root.classList.remove("anim");
}
