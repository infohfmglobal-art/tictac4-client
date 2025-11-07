// === Import Modules ===
import {
  auth, db, GoogleAuthProvider, signInWithPopup,
  doc, getDoc, setDoc, updateDoc
} from "./firebaseSetup.js";
import { Game } from "./game.js";
import { triggerRuneBurst, confettiBurst, screenShake } from "./runes.js";

// === Initialize Game ===
const game = new Game();

// === DOM References ===
const boardEl    = document.getElementById("board");
const scoreEl    = document.getElementById("score");
const msgEl      = document.getElementById("msg");
const winnerTxt  = document.getElementById("winnerText");

const nextBtn    = document.getElementById("nextBtn");
const resetBtn   = document.getElementById("resetBtn");
const homeBtn    = document.getElementById("homeBtn");
const sfxBtn     = document.getElementById("sfxBtn");
const musicBtn   = document.getElementById("musicBtn");
const installBtn = document.getElementById("installBtn");
const installBtn2= document.getElementById("installBtn2");

const modeBar    = document.getElementById("modeBar");
const modeBadge  = document.getElementById("modeBadge");
const diffBadge  = document.getElementById("diffBadge");
const skinBadge  = document.getElementById("skinBadge");
const pX         = document.getElementById("pX");
const pO         = document.getElementById("pO");

// Home screen
const homeScreen = document.getElementById("homeScreen");
const startBtn   = document.getElementById("startBtn");
const gameMode   = document.getElementById("gameMode");
const difficulty = document.getElementById("difficulty");
const skinSel    = document.getElementById("skin");
const themeSel   = document.getElementById("themeSelect");
const leaderList = document.getElementById("leaderList");

// Login Gate
const gateScreen = document.getElementById("loginGate");
const gateGoogle = document.getElementById("googleLoginGate");
const gateGuest  = document.getElementById("guestLoginGate");
const flashOv    = document.getElementById("flashOverlay");

// Quick login bar (in-game)
const quickGoogle = document.getElementById("googleLoginBtn");
const quickGuest  = document.getElementById("guestLoginBtn");
const homeGoogle  = document.getElementById("googleLoginBtnHome");
const homeGuest   = document.getElementById("guestLoginBtnHome");

// === Audio ===
const clickSfx = new Audio("./sound/click.mp3");
const winSfx   = new Audio("./sound/win.mp3");
const music    = new Audio("./sound/bg.mp3");
music.loop = true;
let musicWanted = false;

// === Coins / Rewards ===
let rewardGranted = false;

// === Coin FX ===
function coinBurstFX(text = "+20") {
  const badge = document.getElementById("playerCoins");
  if (!badge) return;
  const r = badge.getBoundingClientRect();
  const fx = document.createElement("div");
  fx.className = "coin-fx";
  fx.textContent = `💰 ${text}`;
  fx.style.left = (r.left + r.width/2 - 14) + "px";
  fx.style.top  = (r.top - 6) + "px";
  document.body.appendChild(fx);
  setTimeout(()=> fx.remove(), 1000);
}

async function grantCoins(amount){
  try{
    if (auth.currentUser) {
      await updateCoins(amount);
    } else {
      window.currentCoins = (window.currentCoins || 0) + amount;
      const topCoin  = document.getElementById("playerCoins");
      const homeCoin = document.getElementById("playerCoinsHome");
      if (topCoin)  topCoin.textContent  = `💰 ${window.currentCoins}`;
      if (homeCoin) homeCoin.textContent = `💰 ${window.currentCoins}`;
    }
    coinBurstFX("+" + amount);
  }catch(e){
    console.warn("coin grant failed:", e);
  }
}

// === Section Toggles ===
function setVisible(afterLogin) {
  gateScreen.classList.toggle("hidden", afterLogin);
  [modeBar, document.querySelector(".avatars"), scoreEl, msgEl,
   document.querySelector(".btngrp"), boardEl, document.getElementById("loginBar"),
   homeScreen].forEach(el => el.classList.toggle("hidden", !afterLogin));
}

function flashThen(callback){
  flashOv.classList.remove("flash-hide");
  flashOv.classList.add("flash-show");
  setTimeout(()=>{
    flashOv.classList.remove("flash-show");
    flashOv.classList.add("flash-hide");
    callback && callback();
  }, 550);
}

function enterHome(){
  flashThen(()=>{
    setVisible(true);
    showHome(true);
  });
}

// === Board Rendering ===
function renderBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.addEventListener("click", () => handleMove(r, c));
      boardEl.appendChild(cell);
    }
  }
}
renderBoard();

// === Handle Move ===
function handleMove(r, c) {
  if (musicWanted && music.paused) music.play().catch(() => {});
  const result = game.move(r, c, true);
  if (!result) return;

  haptic(15);
  if (game.sfxOn) { clickSfx.currentTime = 0; clickSfx.play().catch(() => {}); }
  updateBoard();

  if (result === "cpuPending") {
    setTimeout(() => {
      game.performCpuMove();
      haptic(15);
      if (game.sfxOn) { clickSfx.currentTime = 0; clickSfx.play().catch(() => {}); }
      updateBoard();
    }, 500);
  }
}

// === Update UI ===
function updateBoard() {
  const cells = boardEl.children;
  for (let i = 0; i < cells.length; i++) {
    const r = Math.floor(i / 3);
    const c = i % 3;
    const val = game.board.grid[r][c];
    const cell = cells[i];
    cell.className = "cell";
    cell.style.color = "";
    cell.style.textShadow = "";
    cell.textContent = "";
    if (!val) continue;

    if (game.skin.startsWith("Classic")) {
      cell.textContent = val;
      cell.style.color = (val === "X") ? "#00ffff" : "#ff66cc";
      cell.style.textShadow = (val === "X")
        ? "0 0 12px #00ffff, 0 0 25px #00cccc"
        : "0 0 12px #ff66cc, 0 0 25px #ff3399";
    } else if (game.skin === "Fruit") {
      cell.textContent = (val === "X") ? "🍎" : "🍊";
      cell.style.textShadow = (val === "X")
        ? "0 0 15px #ff3366, 0 0 25px #ff0033"
        : "0 0 15px #ffaa00, 0 0 25px #ff7700";
    } else if (game.skin === "Runes") {
      cell.textContent = (val === "X") ? "🐉" : "🕊️";
      cell.style.color = (val === "X") ? "#00ffff" : "#ff66cc";
      cell.style.textShadow = (val === "X")
        ? "0 0 15px #00ffff, 0 0 30px #00cccc"
        : "0 0 15px #ff66cc, 0 0 30px #ff3399";
    }
  }

  pX.classList.toggle("active", game.turn === "X");
  pO.classList.toggle("active", game.turn === "O");

  if (game.winner && game.winner !== "Draw") {
    let winnerName = "";
    if (game.skin === "Classic X / O") {
      winnerName = (game.winner === "X") ? "❌ X Wins!" : "🟣 O Wins!";
    } else if (game.skin === "Fruit") {
      winnerName = (game.winner === "X") ? "🍎 Apple Wins!" : "🍊 Orange Wins!";
    } else if (game.skin === "Runes") {
      winnerName = (game.winner === "X") ? "🐉 Dragon Wins!" : "🕊️ Phoenix Wins!";
    } else {
      winnerName = `${game.winner} Wins!`;
    }

    winnerTxt.textContent = winnerName;
    msgEl.classList.remove("draw");
    msgEl.classList.add("show-winner");
    for (const [r, c] of game.getWinningCells()) {
      const idx = r * 3 + c;
      boardEl.children[idx].classList.add("win-cell");
    }
    triggerRuneBurst(game.winner);
    confettiBurst();
    screenShake();
    haptic([40, 40, 80]);
    if (game.sfxOn) { winSfx.currentTime = 0; winSfx.play().catch(() => {}); }
    if (game.mode === "Player vs CPU" && game.winner === "X") {
      const elapsed = ((performance.now() - game.roundStart) / 1000).toFixed(2);
      const moves = 9 - game.board.emptyCells().length;
      addLeaderboard({ time: elapsed, moves, diff: game.difficulty.toLowerCase(), skin: game.skin.toLowerCase() });
    }
    if (!rewardGranted) { rewardGranted = true; grantCoins(20); }
  } else if (game.winner === "Draw") {
    winnerTxt.textContent = "Draw!";
    msgEl.classList.add("show-winner", "draw");
    if (!rewardGranted) { rewardGranted = true; grantCoins(5); }
  } else {
    msgEl.classList.remove("show-winner", "draw");
    winnerTxt.textContent = "";
  }
  scoreEl.textContent = `Score – X: ${game.scoreX} | O: ${game.scoreO} | D: ${game.scoreD}`;
}

// === Buttons ===
nextBtn.onclick = () => {
  rewardGranted = false;
  game.nextRound();
  renderBoard();
  updateBoard();
  game.roundStart = performance.now();
};
resetBtn.onclick = () => {
  rewardGranted = false;
  game.scoreX = game.scoreO = game.scoreD = 0;
  game.resetAll();
  renderBoard();
  updateBoard();
};
homeBtn.onclick = () => showHome(true);
sfxBtn.onclick = () => {
  game.toggleSfx();
  sfxBtn.textContent = `SFX: ${game.sfxOn ? "On" : "Off"}`;
};
musicBtn.onclick = () => {
  musicWanted = !musicWanted;
  musicBtn.textContent = `Music: ${musicWanted ? "On" : "Off"}`;
  if (musicWanted) music.play().catch(() => {}); else music.pause();
};
[installBtn, installBtn2].forEach((b) => b && (b.onclick = async () => {
  const p = window.deferredPrompt;
  if (!p) return;
  p.prompt();
  await p.userChoice;
  window.deferredPrompt = null;
}));

// === Home Screen ===
function showHome(show) {
  homeScreen.classList.toggle("hidden", !show);
  boardEl.classList.toggle("hidden", show);
  document.querySelector(".btngrp").classList.toggle("hidden", show);
  modeBar.classList.toggle("hidden", show);
  document.querySelector(".avatars").classList.toggle("hidden", show);
  scoreEl.classList.toggle("hidden", show);
  msgEl.classList.toggle("hidden", show);
  document.getElementById("loginBar").classList.toggle("hidden", show);
}

startBtn.onclick = () => {
  game.mode = gameMode.value;
  game.difficulty = difficulty.value;
  game.skin = skinSel.value;
  document.body.className = `theme-${themeSel.value.toLowerCase()}`;
  modeBadge.textContent = `Mode: ${game.mode === "Player vs CPU" ? "PvC" : "PvP"}`;
  diffBadge.textContent = `Difficulty: ${game.difficulty}`;
  skinBadge.textContent = `Skin: ${game.skin}`;
  if (musicWanted) music.play().catch(() => {});
  rewardGranted = false;
  game.resetAll();
  renderBoard();
  updateBoard();
  showHome(false);
};

// === Intro Splash ===
window.addEventListener("load", () => {
  const splash = document.getElementById("introSplash");
  if (splash) {
    setTimeout(() => {
      splash.classList.add("hide");
      setTimeout(() => splash.remove(), 1000);
    }, 2500);
  }
});

// === Init ===
setVisible(false);
loadLeaderboard();

// === Haptics ===
function haptic(pattern) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

// === Leaderboard ===
function addLeaderboard(entry) {
  const key = "rxo_leader";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push(entry);
  list.sort((a, b) =>
    (parseFloat(a.time) - parseFloat(b.time)) || (a.moves - b.moves)
  );
  localStorage.setItem(key, JSON.stringify(list.slice(0, 10)));
  loadLeaderboard();
}
function loadLeaderboard() {
  const key = "rxo_leader";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  leaderList.innerHTML = "";
  list.forEach((e, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${e.time}s · ${e.moves} moves · ${e.diff} · ${e.skin}`;
    leaderList.appendChild(li);
  });
}
