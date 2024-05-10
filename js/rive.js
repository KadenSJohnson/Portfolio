document.addEventListener("DOMContentLoaded", function () {
  riveAnime();
});

function riveAnime() {
  console.log("rive animation?");
  const r = new rive.Rive({
    src: "../Bush animation.riv",
    canvas: document.getElementById("riveCanvas"),
    autoplay: true,
    stateMachines: "State Machine 1",
    onLoad: () => {
      r.resizeDrawingSurfaceToCanvas();
    },
  });
}
