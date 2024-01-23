document.addEventListener("DOMContentLoaded", function () {
  setActiveNavItem();
  setupDropdownClicks();
  setActiveNavItem();
  window.addEventListener("popstate", setActiveNavItem);
});

function setupDropdownClicks() {
  // Get all dropdowns
  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach((dropdown) => {
    const navItem = dropdown.querySelector(".nav-item");

    // Toggle dropdown on click
    navItem.addEventListener("click", function (event) {
      event.stopPropagation(); // Prevent event from bubbling up
      closeAllDropdowns(); // Close all dropdowns first
      dropdown.classList.toggle("open"); // Then toggle this one
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", function (event) {
    if (!event.target.matches(".dropdown, .dropdown *")) {
      closeAllDropdowns();
    }
  });
}

function closeAllDropdowns() {
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    dropdown.classList.remove("open");
  });
}

window.addEventListener("popstate", setActiveNavItem);

function setActiveNavItem() {
  const currentPath = window.location.pathname;

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");

    if (item.getAttribute("href") === currentPath) {
      item.classList.add("active");
    }
  });

  document.querySelectorAll(".dropdown-content a").forEach((link) => {
    link.classList.remove("active");

    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
      let parentNavItem = link.closest(".dropdown").querySelector(".nav-item");
      if (parentNavItem) {
        parentNavItem.classList.add("active");
      }
    }
  });
}

// page transition code

barba.init({
  sync: true,

  transitions: [
    {
      async leave(data) {
        const done = this.async();
        pageTransition();
        await delay(1500);
        done();
      },

      async enter(data) {
        window.scrollTo(0, 0);
        contentAnimation();
        initializeFlick();
        setActiveNavItem();
        setupDropdownClicks();
        if (data.next.namespace === "home") {
          riveAnime();
        }
      },
      async once(data) {
        window.scrollTo(0, 0);
        initializeFlick();
        setActiveNavItem();
        setupDropdownClicks();
        if (data.next.namespace === "home") {
          riveAnime();
        }
      },
    },
  ],
});

function pageTransition() {
  var tl = gsap.timeline();

  tl.to("ul.morph li", {
    duration: 0.8,
    scaleY: 1,
    transformOrigin: "bottom left",
    ease: "cubic-bezier(0.3, 0.0, 0.8, 0.15)",
    delay: 0.5,
  });
  tl.to("ul.morph li", {
    duration: 0.8,
    scaleY: 0,
    transformOrigin: "bottom left",
    ease: "	cubic-bezier(0.05, 0.7, 0.1, 1.0)",
    delay: 0.5,
  });
  return tl;
}

function contentAnimation() {
  var tl = gsap.timeline();

  tl.from(".hero-text", {
    duration: 1,
    translateY: -50,
    opacity: 0,
  });
  tl.from(".study-header", {
    duration: 1,
    translateY: -50,
    opacity: 0,
  });
}

function delay(n) {
  n = n || 2000;
  return new Promise((done) => {
    setTimeout(() => {
      done();
    }, n);
  });
}

// study scroll animation
function initializeFlick() {
  var carousels = document.querySelectorAll(".main-carousel");
  for (var i = 0; i < carousels.length; i++) {
    new Flickity(carousels[i], {
      // options
      cellAlign: "left",
      contain: true,
      wrapAround: true,
      draggable: true,
    });
  }
}

function toggleText() {
  var shortTextElements = document.querySelectorAll(".short-text");
  var longTextElements = document.querySelectorAll(".long-text");
  var isShortTextVisible =
    shortTextElements[0] &&
    getComputedStyle(shortTextElements[0]).display !== "none";

  shortTextElements.forEach(function (element) {
    element.style.display = isShortTextVisible ? "none" : "block";
  });

  longTextElements.forEach(function (element) {
    element.style.display = isShortTextVisible ? "block" : "none";
  });
}

function riveAnime() {
  console.log("rive animation?");
  const r = new rive.Rive({
    src: "Bush animation.riv",
    canvas: document.getElementById("riveCanvas"),
    autoplay: true,
    stateMachines: "State Machine 1",
    onLoad: () => {
      r.resizeDrawingSurfaceToCanvas();
    },
  });
}
