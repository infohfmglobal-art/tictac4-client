import { auth, db, GoogleAuthProvider, signInWithPopup, doc, getDoc, setDoc, updateDoc } from "./firebaseSetup.js";
import { Game } from "./game.js";
import { triggerRuneBurst, confettiBurst, screenShake } from "./runes.js";

const game = new Game();

// Elements
const introSplash = document.getElementById("introSplash");
const gateScreen = document.getElementById("loginGate");
const flashOv = document.getElementById("flashOverlay");
const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const msgEl = document.getElementById("msg");
const winnerTxt = document.getElementById("winnerText");
const startBtn = document.getElementById("startBtn");
const homeScreen = document.getElementById("homeScreen");
const guestBtn = document.getElementById("guestLoginGate");
const googleBtn = document.getElementById("googleLoginGate");
const playerCoins = document.getElementById("playerCoins");

// Audio
const clickSfx = new Audio("./sound/click.mp3");
const winSfx = new Audio("./sound/win.mp3");
const music = new Audio("./sound/bg.mp3");
music.loop = true;
let musicWanted = false;

// Hide/show sections safely
function setVisible(afterLogin) {
  gateScreen.classList.toggle("hidden", afterLogin);
  [homeScreen, boardEl, msgEl].forEach(el => { if (el) el.classList.toggle("hidden", !afterLogin); });
}

function flashThen(callback) {
  flashOv.classList.add("flash-show");
  setTimeout(() => {
    flashOv.classList.remove("flash-show");
    callback && callback();
  }, 550);
}

// Transition from splash → login
window.addEventListener("load", () => {
  setTimeout(() => introSplash.classList.add("hide"), 2600);
  setTimeout(() => gateScreen.classList.remove("hidden"), 3200);
});

// Login
guestBtn.addEventListener("click", () => {
  window.currentCoins = 100;
  playerCoins.textContent = `💰 ${window.currentCoins}`;
  flashThen(() => setVisible(true));
});

googleBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const ref = doc(db, "players", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { name: user.displayName, email: user.email, coins: 200 });
    window.currentCoins = 200;
  } else {
    window.currentCoins = snap.data().coins;
  }
  playerCoins.textContent = `💰 ${window.currentCoins}`;
  flashThen(() => setVisible(true));
});

// Start button → show game
startBtn.onclick = () => {
  homeScreen.classList.add("hidden");
  boardEl.classList.remove("hidden");
  renderBoard();
};

// Render board
function renderBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.onclick = () => handleMove(r, c);
      boardEl.appendChild(cell);
    }
  }
}

function handleMove(r, c) {
  if (musicWanted && music.paused) music.play().catch(() => {});
  const result = game.move(r, c, true);
  if (!result) return;
  clickSfx.play().catch(() => {});
  updateBoard();
  if (result === "cpuPending") {
    setTimeout(() => { game.performCpuMove(); updateBoard(); }, 500);
  }
}

function updateBoard() {
  const cells = boardEl.children;
  for (let i = 0; i < 9; i++) {
    const r = Math.floor(i / 3), c = i % 3;
    const val = game.board.grid[r][c];
    const cell = cells[i];
    cell.textContent = val === "X" ? "🐉" : val === "O" ? "🕊️" : "";
  }

  if (game.winner) {
    winnerTxt.textContent = game.winner === "Draw" ? "Draw!" : `${game.winner} Wins!`;
    msgEl.classList.remove("hidden");
    confettiBurst();
  }
}
