// === Import Modules ===
import {
  auth, db, GoogleAuthProvider, signInWithPopup, signOut,
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

// === Audio ===
const clickSfx = new Audio("./sound/click.mp3");
const winSfx   = new Audio("./sound/win.mp3");
const music    = new Audio("./sound/bg.mp3");
music.loop = true;
let musicWanted = false;
// --- Coin reward helper (works for Google login AND guest) ---
let rewardGranted = false;

function coinBurstFX(text = "+20") {
  // find coin badge position
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
      await updateCoins(amount);             // Firebase path (already defined in your file)
    } else {
      // guest coins (local only)
      window.currentCoins = (window.currentCoins || 0) + amount;
      const pc = document.getElementById("playerCoins");
      if (pc) pc.textContent = `💰 ${window.currentCoins}`;
    }
    coinBurstFX("+" + amount);
  }catch(e){
    console.warn("coin grant failed:", e);
  }
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

    // reset base class
    cell.className = "cell";
    cell.style.color = "";
    cell.style.textShadow = "";
    cell.textContent = "";

    // empty cell → skip drawing
    if (!val) continue;

    // === Render Skins (X/O/Emoji) ===
    if (game.skin.startsWith("Classic")) {
      cell.textContent = val;
      if (val === "X") {
        cell.style.color = "#00ffff"; // cyan
        cell.style.textShadow = "0 0 12px #00ffff, 0 0 25px #00cccc";
      } else {
        cell.style.color = "#ff66cc"; // pink
        cell.style.textShadow = "0 0 12px #ff66cc, 0 0 25px #ff3399";
      }
    } else if (game.skin === "Fruit") {
      if (val === "X") {
        cell.textContent = "🍎";
        cell.style.textShadow = "0 0 15px #ff3366, 0 0 25px #ff0033";
      } else {
        cell.textContent = "🍊";
        cell.style.textShadow = "0 0 15px #ffaa00, 0 0 25px #ff7700";
      }
    } else if (game.skin === "Runes") {
      if (val === "X") {
        cell.textContent = "🐉";
        cell.style.color = "#00ffff";
        cell.style.textShadow = "0 0 15px #00ffff, 0 0 30px #00cccc";
      } else {
        cell.textContent = "🕊️";
        cell.style.color = "#ff66cc";
        cell.style.textShadow = "0 0 15px #ff66cc, 0 0 30px #ff3399";
      }
    }
  }

  // Active player badge
  pX.classList.toggle("active", game.turn === "X");
  pO.classList.toggle("active", game.turn === "O");

  // === Winner / Draw messaging ===
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
    msgEl.classList.add("show-winner");

    // highlight winning cells
    for (const [r, c] of game.getWinningCells()) {
      const idx = r * 3 + c;
      boardEl.children[idx].classList.add("win-cell");
    }

    // celebration
    triggerRuneBurst(game.winner);
    confettiBurst();
    screenShake();
    haptic([40, 40, 80]);
    if (game.sfxOn) { winSfx.currentTime = 0; winSfx.play().catch(() => {}); }

    // leaderboard record for PvC when X (player) wins
    if (game.mode === "Player vs CPU" && game.winner === "X") {
      const elapsed = ((performance.now() - game.roundStart) / 1000).toFixed(2);
      const moves = 9 - game.board.emptyCells().length;
      addLeaderboard({
        time: elapsed,
        moves,
        diff: game.difficulty.toLowerCase(),
        skin: game.skin.toLowerCase()
      });
    }
  } else if (game.winner === "Draw") {
    winnerTxt.textContent = "Draw!";
    msgEl.classList.add("show-winner");
  } else {
    msgEl.classList.remove("show-winner");
    winnerTxt.textContent = "";
  }

  // score line
  scoreEl.textContent =
    `Score – X: ${game.scoreX} | O: ${game.scoreO} | D: ${game.scoreD}`;
}

// === Buttons ===
nextBtn.onclick = () => {
  game.nextRound();
  renderBoard();
  updateBoard();
  game.roundStart = performance.now();
};
resetBtn.onclick = () => {
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
  boardEl.style.display = show ? "none" : "grid";
  document.querySelector(".btngrp").style.display = show ? "none" : "flex";
  modeBar.style.display = show ? "none" : "flex";
  document.querySelector(".avatars").style.display = show ? "none" : "flex";
  scoreEl.style.display = show ? "none" : "block";
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
  game.resetAll();
  renderBoard();
  updateBoard();
  showHome(false);
};

showHome(true);
loadLeaderboard();

// === Haptics ===
function haptic(pattern) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

// === Leaderboard (local) ===
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

// === Firebase Login + Coin System ===
async function loginGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const ref = doc(db, "players", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName,
      email: user.email,
      coins: 200,
      wins: 0,
      createdAt: Date.now(),
    });
    alert(`Welcome ${user.displayName}! 🎉 You've received 200 coins.`);
    window.currentCoins = 200;
  } else {
    window.currentCoins = snap.data().coins;
  }
  document.getElementById("playerCoins").textContent = `💰 ${window.currentCoins}`;
}

async function updateCoins(change) {
  const user = auth.currentUser;
  if (!user) return;
  const ref = doc(db, "players", user.uid);
  const snap = await getDoc(ref);
  const coins = (snap.data().coins || 0) + change;
  await updateDoc(ref, { coins });
  window.currentCoins = coins;
  document.getElementById("playerCoins").textContent = `💰 ${coins}`;
}

// buttons for login/guest
document.getElementById("googleLoginBtn").addEventListener("click", loginGoogle);
document.getElementById("guestLoginBtn").addEventListener("click", () => {
  alert("Guest mode: coins not saved!");
  window.currentCoins = 100;
  document.getElementById("playerCoins").textContent = `💰 ${window.currentCoins}`;
});
