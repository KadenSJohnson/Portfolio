/* Nitpicks header: the title starts a few pixels out of line with the text under it. A visitor's
   cursor ("You") comes in and pins a comment, "Can we fix this?". Then Kaden's cursor selects the
   title and drags it back into line; a red alignment guide flashes as it snaps, and the comment
   resolves. Plays once after the page loads; click the title to play it again.
   Reduced motion: the title is simply in line. */
(() => {
  const head = document.querySelector("[data-np]");
  if (!head || !Element.prototype.animate) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const word = head.querySelector("[data-np-word]");
  const lede = head.querySelector(".np-lede");
  const guide = head.querySelector(".np-guide");
  const pin = head.querySelector(".np-pin");
  const bubble = head.querySelector(".np-bubble");
  const you = head.querySelector(".np-cur.you");
  const me = head.querySelector(".np-cur.me");
  const OFF = 18; // how far out of line the title starts
  const ease = "cubic-bezier(.45,0,.2,1)";
  let anims = [], timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const anim = (el, frames, opts) => { const a = el.animate(frames, { fill: "both", easing: ease, ...opts }); anims.push(a); return a; };
  const at = (x, y) => `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;

  const stop = () => { anims.forEach((a) => a.cancel()); anims = []; timers.forEach(clearTimeout); timers = []; word.classList.remove("selected"); };

  const play = () => {
    stop();
    const H = head.getBoundingClientRect();
    const W = word.getBoundingClientRect();
    const L = lede.getBoundingClientRect();
    const x0 = L.left - H.left, y0 = W.top - H.top;          // the title's place, in line with the text under it
    // 2. "You" glides in from the right and clicks just above the title's top-right corner
    const pinX = x0 + OFF + W.width * 0.5, pinY = y0 + 6;
    // open the comment to the left of the pin if it would run past the card
    bubble.classList.toggle("flip", pinX + 34 + bubble.offsetWidth > H.width - 8);
    anim(you, [
      { opacity: 0, transform: at(H.width - 30, pinY + 70) },
      { opacity: 1, transform: at(H.width - 60, pinY + 60), offset: 0.15 },
      { opacity: 1, transform: at(pinX, pinY), offset: 0.75 },
      { opacity: 1, transform: at(pinX, pinY) },
    ], { duration: 900 });
    later(() => {
      anim(you, [{ opacity: 1, transform: at(pinX, pinY) }, { opacity: 0, transform: at(pinX + 40, pinY + 50) }], { duration: 500, delay: 450 });
    }, 900);
    // 3. the pin drops and the comment opens
    anim(pin, [{ opacity: 0, transform: at(pinX, pinY) + " scale(.4)" }, { opacity: 1, transform: at(pinX, pinY) + " scale(1)" }],
      { duration: 260, delay: 900, easing: "cubic-bezier(.3,1.5,.5,1)" });
    anim(bubble, [{ opacity: 0, transform: "translateX(-6px)" }, { opacity: 1, transform: "none" }], { duration: 240, delay: 1080 });
    // 4. Kaden's cursor comes in from the lower left, grabs the title and drags it into line.
    //    The title and the cursor share one timeline so they move as one piece.
    const grabX = x0 + OFF + W.width * 0.3, grabY = y0 + W.height * 0.55;
    const T = 3100, DRAG = 2400, DRAG_MS = 650, drag = "cubic-bezier(.35,0,.15,1)";
    anim(word, [
      { transform: `translateX(${OFF}px)`, offset: 0 },
      { transform: `translateX(${OFF}px)`, offset: DRAG / T, easing: drag },
      { transform: "translateX(0px)", offset: (DRAG + DRAG_MS) / T },
      { transform: "translateX(0px)", offset: 1 },
    ], { duration: T, easing: "linear" });
    anim(me, [
      { opacity: 0, transform: at(grabX - 120, grabY + 110), offset: 0 },
      { opacity: 0, transform: at(grabX - 120, grabY + 110), offset: 1500 / T, easing: ease },
      { opacity: 1, transform: at(grabX - 90, grabY + 80), offset: 1640 / T, easing: ease },
      { opacity: 1, transform: at(grabX, grabY), offset: 2200 / T },
      { opacity: 1, transform: at(grabX, grabY), offset: DRAG / T, easing: drag },
      { opacity: 1, transform: at(grabX - OFF, grabY), offset: (DRAG + DRAG_MS) / T },
      { opacity: 1, transform: at(grabX - OFF, grabY), offset: 1 },
    ], { duration: T, easing: "linear" });
    later(() => word.classList.add("selected"), 2200);
    // 5. the red guide shows the title now lines up with the text under it
    guide.style.height = (L.bottom - W.top + 16).toFixed(0) + "px";
    anim(guide, [{ opacity: 0, transform: at(x0, y0 - 8) }, { opacity: 1, transform: at(x0, y0 - 8), offset: 0.15 },
      { opacity: 1, transform: at(x0, y0 - 8), offset: 0.7 }, { opacity: 0, transform: at(x0, y0 - 8) }], { duration: 650, delay: 2900, easing: "linear" });
    // 6. let go, the selection clears, Kaden's cursor leaves, the comment resolves
    later(() => word.classList.remove("selected"), 3300);
    later(() => {
      anim(me, [{ opacity: 1, transform: at(grabX - OFF, grabY) }, { opacity: 0, transform: at(grabX - OFF + 50, grabY + 40) }], { duration: 450 });
      anim(pin, [{ opacity: 1, transform: at(pinX, pinY) + " scale(1)" }, { opacity: 0, transform: at(pinX, pinY) + " scale(.6)" }], { duration: 300, delay: 300 });
    }, 3400);
  };

  word.addEventListener("click", play);
  const go = () => setTimeout(play, 150);
  if (window.siteReady) window.siteReady.then(go); else go();
})();
