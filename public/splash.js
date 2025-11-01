// Splash Screen Control
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash-screen");

  // Remove splash after animation completes
  setTimeout(() => {
    if (splash) splash.remove();
  }, 2500);
});
