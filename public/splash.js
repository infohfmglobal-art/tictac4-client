// Tiny splash fade
const splash = document.getElementById("splash-screen");
if (splash) {
  setTimeout(() => splash.classList.add("hide"), 600);
  setTimeout(() => splash.remove(), 1400);
}
