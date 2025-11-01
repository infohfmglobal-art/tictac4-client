// Splash Screen Control
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash-screen");

  setTimeout(() => {
    if (splash) {
      splash.style.opacity = "0";
      splash.style.transition = "0.6s";
      setTimeout(() => splash.remove(), 600);
    }
  }, 1800);
});
