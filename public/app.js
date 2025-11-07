// === MAGIC INTRO / HOME TRANSITION ===

// play intro bell and fade splash out
window.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("introSplash");
  const bell = document.getElementById("introBell");
  const loginGate = document.getElementById("loginGate");

  // play bell after slight delay
  setTimeout(() => {
    bell.volume = 0.8;
    bell.play().catch(() => {});
  }, 600);

  // fade out splash after 3 seconds
  setTimeout(() => {
    splash.classList.add("hide");
    // show login after fade
    setTimeout(() => loginGate.classList.remove("hidden"), 1000);
  }, 3000);
});

// === LOGIN → HOME TRANSITION ===
const flashOverlay = document.getElementById("flashOverlay");
const guestBtn = document.getElementById("guestLoginGate");
const googleBtn = document.getElementById("googleLoginGate");
const homeScreen = document.getElementById("homeScreen");
const installOrb = document.getElementById("installOrb");

function goldenFlashThen(callback) {
  flashOverlay.classList.add("flash-show");
  setTimeout(() => {
    flashOverlay.classList.remove("flash-show");
    flashOverlay.classList.add("flash-hide");
    if (callback) callback();
  }, 700);
}

function showHome() {
  goldenFlashThen(() => {
    document.getElementById("loginGate").classList.add("hidden");
    homeScreen.classList.remove("hidden");

    // reveal orb after home shows
    setTimeout(() => {
      installOrb.classList.remove("hidden");
      installOrb.classList.add("show");
    }, 1500);
  });
}

// click handlers
guestBtn.addEventListener("click", () => {
  alert("Guest mode activated! 🪄 Coins will not be saved online.");
  showHome();
});

googleBtn.addEventListener("click", () => {
  alert("Google Login coming soon ✨ (Phase 2)");
  showHome();
});
// === INSTALL ORB HANDLER ===
installOrb.addEventListener("click", async () => {
  const prompt = window.deferredPrompt;
  if (!prompt) {
    alert("Already installed or not supported yet!");
    return;
  }
  prompt.prompt();
  await prompt.userChoice;
  window.deferredPrompt = null;
});

// === HOME → GAME START HANDLER ===
const startBtn = document.getElementById("startBtn");

if (startBtn) {
  startBtn.addEventListener("click", () => {
    console.log("▶️ Play button clicked!");
    startGame();
  });
}

function startGame() {
  const homeScreen = document.getElementById("homeScreen");
  const gameArea = document.getElementById("gameArea"); // adjust if your game div ID is different

  // Fade home screen out smoothly
  homeScreen.classList.add("fade-out");
  setTimeout(() => {
    homeScreen.classList.add("hidden");
    if (gameArea) gameArea.classList.remove("hidden");
  }, 600);

  // Sound feedback
  const clickSound = new Audio("./sound/click.mp3");
  clickSound.volume = 0.7;
  clickSound.play().catch(() => {});
}

// === GAME LOGIC START ===
function startGame() {
  const homeScreen = document.getElementById("homeScreen");
  const gameArea = document.getElementById("gameArea"); // or your actual game div ID

  // hide home screen
  homeScreen.classList.add("hidden");

  // show the game board
  if (gameArea) gameArea.classList.remove("hidden");

  // Optional: play click sound
  const clickSound = new Audio("./sound/click.mp3");
  clickSound.volume = 0.7;
  clickSound.play().catch(() => {});
}
// === HOME → GAME START HANDLER ===
const startBtn = document.getElementById("startBtn");
if (startBtn) {
  startBtn.addEventListener("click", () => startGame());
}

function startGame() {
  const homeScreen = document.getElementById("homeScreen");
  const gameArea   = document.getElementById("gameArea");

  homeScreen.classList.add("fade-out");
  setTimeout(() => {
    homeScreen.classList.add("hidden");
    gameArea.classList.remove("hidden");
  }, 600);

  new Audio("./sound/click.mp3").play().catch(() => {});
}
