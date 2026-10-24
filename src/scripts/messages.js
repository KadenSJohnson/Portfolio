/* Testimonials as iOS Messages: when a thread scrolls into view it plays out in order.
   Kaden types his ask on the keyboard and sends it, the person "types" (dots) and their quote
   arrives one bubble at a time, then Kaden types a thank-you. The photo opens a contact card;
   Done closes it. Every bubble keeps its space from the start, so nothing shifts.
   Reduced motion: the whole conversation is simply there. */
(() => {
  const threads = Array.from(document.querySelectorAll("[data-imsg]"));
  if (!threads.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Their message: typing dots, then the text
  const theirs = async (b) => {
    const len = b.querySelector(".im-text").textContent.length;
    b.classList.add("typing");
    await wait(Math.min(1100, 450 + len * 5));
    b.classList.remove("typing");
    b.classList.add("in");
    await wait(280);
  };

  // Kaden's message: keyboard up, keys light up as each character goes into the bar, send
  const mine = async (card, b, perChar) => {
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

  const play = async (card) => {
    if (card.dataset.played) return;
    card.dataset.played = "1";
    await wait(200);
    for (const b of card.querySelectorAll(".im-thread .im-bubble")) {
      if (b.classList.contains("me")) await mine(card, b, b.classList.contains("ask") ? 40 : 60);
      else await theirs(b);
      if (b.classList.contains("ask")) await wait(200);
    }
    const status = card.querySelector(".im-status");
    if (status) status.classList.add("in");
  };

  if (!reduce && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-imsg");
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) { io.unobserve(e.target); play(e.target); }
    }), { threshold: 0.55 });
    threads.forEach((t) => io.observe(t));
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
