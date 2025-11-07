// === MAGIC INTRO / HOME TRANSITION ===

// play intro bell and fade splash out
window.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("introSplash");
  const bell = document.getElementById("introBell");
  const loginGate = document.getElementById("loginGate");

  setTimeout(() => {
    bell.volume = 0.8;
    bell.play().catch(() => {});
  }, 600);

  // fade out splash after 3 seconds
  setTimeout(() => {
    splash.classList.add("hide");
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

    setTimeout(() => {
      installOrb.classList.remove("hidden");
      installOrb.classList.add("show");
    }, 1500);
  });
}

// === LOGIN BUTTON HANDLERS ===
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

// === GAME BOARD INITIALIZATION ===
function initGameBoard() {
  const board = document.getElementById("gameBoard");
  if (!board) return;

  const cells = board.querySelectorAll(".cell");
  let currentPlayer = "X";

  cells.forEach(cell => {
    cell.addEventListener("click", () => {
      if (cell.textContent !== "") return;
      cell.textContent = currentPlayer;
      cell.style.textShadow = "0 0 10px gold";
      cell.style.color = "gold";
      currentPlayer = currentPlayer === "X" ? "O" : "X";
    });
  });

  // Button controls
  const resetBtn = document.getElementById("resetBtn");
  const nextRoundBtn = document.getElementById("nextRoundBtn");
  const homeBtn = document.getElementById("homeBtn");

  if (resetBtn) {
    resetBtn.onclick = () => {
      cells.forEach(c => (c.textContent = ""));
      currentPlayer = "X";
    };
  }

  if (nextRoundBtn) {
    nextRoundBtn.onclick = () => {
      cells.forEach(c => (c.textContent = ""));
      currentPlayer = "X";
    };
  }

  if (homeBtn) {
    homeBtn.onclick = () => {
      document.getElementById("gameArea").classList.add("hidden");
      document.getElementById("homeScreen").classList.remove("hidden");
    };
  }
}

// === START GAME (FROM HOME) ===
const startBtn = document.getElementById("startBtn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    console.log("▶️ Play button clicked!");
    startGame();
  });
}

function startGame() {
  const homeScreen = document.getElementById("homeScreen");
  const gameArea = document.getElementById("gameArea");

  homeScreen.classList.add("fade-out");

  setTimeout(() => {
    homeScreen.classList.add("hidden");
    gameArea.classList.remove("hidden");
    initGameBoard(); // Initialize game
  }, 600);

  new Audio("./sound/click.mp3").play().catch(() => {});
}
