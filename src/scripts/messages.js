/* Testimonials as iOS Messages: when a thread scrolls into view it plays out in order.
   Kaden types his ask on the keyboard and sends it, the person "types" (dots) and their quote
   arrives one bubble at a time, then Kaden types a thank-you. The photo opens a contact card;
   Done closes it. Every bubble keeps its space from the start, so nothing shifts.
   Reduced motion: the whole conversation is simply there. */
(() => {
  const threads = Array.from(document.querySelectorAll("[data-imsg]"));
  if (!threads.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Each playthrough has a run number; skipping or restarting bumps it, and the old run stops
  // at its next pause
  class Stop extends Error {}
  const pause = (card, run, ms) => new Promise((r, x) => setTimeout(() => (card._run === run ? r() : x(new Stop())), ms));

  // Their message: typing dots, then the text
  const theirs = async (b, wait) => {
    const len = b.querySelector(".im-text").textContent.length;
    b.classList.add("typing");
    await wait(Math.min(1100, 450 + len * 5));
    b.classList.remove("typing");
    b.classList.add("in");
    await wait(280);
  };

  // Kaden's message: keyboard up, keys light up as each character goes into the bar, send
  const mine = async (card, b, perChar, wait) => {
    const screen = card.querySelector(".im-screen");
    const kb = card.querySelector(".im-kb");
    const typed = card.querySelector(".im-typed");
    const send = card.querySelector(".im-send");
    const text = b.dataset.type || b.textContent;
    screen.style.setProperty("--kbh", kb.offsetHeight + "px");
    screen.classList.add("kb");
    await wait(320);
    const tap = async (key, hold) => { if (!key) return; key.classList.add("down"); await wait(hold); key.classList.remove("down"); };
    for (const ch of text) {
      const lower = ch.toLowerCase();
      if (ch !== lower) await tap(kb.querySelector('[data-k="shift"]'), perChar * 0.6);
      const key = kb.querySelector(`[data-k="${CSS.escape(lower)}"]`); // punctuation has no key on this layer
      if (key) key.classList.add("down");
      typed.textContent += ch;
      send.classList.add("on");
      await wait(perChar * 0.6);
      if (key) key.classList.remove("down");
      await wait(perChar * (0.3 + Math.random() * 0.6));
    }
    await wait(180);
    send.classList.add("down");
    await wait(130);
    send.classList.remove("down", "on");
    typed.textContent = "";
    screen.classList.remove("kb");
    await wait(120);
    b.classList.add("in");
    await wait(320);
  };

  const reset = (card) => {
    card.querySelectorAll(".im-thread .im-bubble, .im-status").forEach((el) => el.classList.remove("in", "typing"));
    card.querySelectorAll(".k.down").forEach((k) => k.classList.remove("down"));
    card.querySelector(".im-screen").classList.remove("kb");
    const typed = card.querySelector(".im-typed"); if (typed) typed.textContent = "";
    const send = card.querySelector(".im-send"); if (send) send.classList.remove("on", "down");
  };
  // Double tap: jump to the finished conversation
  const finish = (card) => {
    card._run = (card._run || 0) + 1;
    reset(card);
    card.querySelectorAll(".im-thread .im-bubble, .im-status").forEach((el) => el.classList.add("in"));
  };
  const play = async (card) => {
    const run = (card._run = (card._run || 0) + 1);
    const wait = (ms) => pause(card, run, ms);
    reset(card);
    try {
      await wait(200);
      for (const b of card.querySelectorAll(".im-thread .im-bubble")) {
        if (b.classList.contains("me")) await mine(card, b, b.classList.contains("ask") ? 40 : 60, wait);
        else await theirs(b, wait);
        if (b.classList.contains("ask")) await wait(200);
      }
      const status = card.querySelector(".im-status");
      if (status) status.classList.add("in");
    } catch (e) { if (!(e instanceof Stop)) throw e; }
  };

  if (!reduce && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-imsg");
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) { io.unobserve(e.target); play(e.target); }
    }), { threshold: 0.55 });
    threads.forEach((t) => io.observe(t));
    threads.forEach((card) => {
      const screen = card.querySelector(".im-screen");
      // double tap (or double click) on the conversation skips to the end
      let last = 0;
      screen.addEventListener("pointerup", (e) => {
        if (e.target.closest("button, .im-card")) return;
        const now = Date.now();
        if (now - last < 320) { finish(card); last = 0; } else last = now;
      });
      screen.addEventListener("dblclick", (e) => { if (!e.target.closest("button, .im-card")) e.preventDefault(); });
      // the back chevron plays it again
      const back = card.querySelector(".im-back");
      if (back) back.addEventListener("click", () => play(card));
    });
  }

  // Contact card
  threads.forEach((card) => {
    const who = card.querySelector(".im-who");
    const sheet = card.querySelector(".im-card");
    const done = card.querySelector(".im-done");
    if (!who || !sheet) return;
    const open = () => { sheet.hidden = false; who.setAttribute("aria-expanded", "true"); done.focus(); };
    const close = () => { sheet.hidden = true; who.setAttribute("aria-expanded", "false"); who.focus(); };
    who.setAttribute("aria-expanded", "false");
    who.addEventListener("click", open);
    done.addEventListener("click", close);
    sheet.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } });
  });
})();
