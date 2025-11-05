// app.js (RuneXO) — clean, final
import { Game } from "./game.js";
import { triggerRuneBurst, confettiBurst, screenShake } from "./runes.js";

const game = new Game();

// --- DOM ---
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

// badges / avatars
const modeBar    = document.getElementById("modeBar");
const modeBadge  = document.getElementById("modeBadge");
const diffBadge  = document.getElementById("diffBadge");
const skinBadge  = document.getElementById("skinBadge");
const pX         = document.getElementById("pX");
const pO         = document.getElementById("pO");

// home screen
const homeScreen = document.getElementById("homeScreen");
const startBtn   = document.getElementById("startBtn");
const gameMode   = document.getElementById("gameMode");
const difficulty = document.getElementById("difficulty");
const skinSel    = document.getElementById("skin");
const themeSel   = document.getElementById("themeSelect");
const leaderList = document.getElementById("leaderList");

// --- Audio ---
const clickSfx = new Audio("sound/click.mp3");
const winSfx   = new Audio("sound/win.mp3");
const music    = new Audio("sound/bg.mp3");
music.loop = true;

let musicWanted = false; // user toggle

// ===============================================
// Build board
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

// ===============================================
// Handle move (human + delayed CPU)
function handleMove(r, c) {
  // start music after first gesture (autoplay policy)
  if (musicWanted && music.paused) music.play().catch(() => {});

  // human move
  const result = game.move(r, c, true); // 'true' = from human
  if (!result) return;

  haptic(15);
  if (game.sfxOn) { clickSfx.currentTime = 0; clickSfx.play().catch(() => {}); }
  updateBoard();

  // if CPU must play next (PvC + now turn 'O'), delay & perform
  if (result === "cpuPending") {
    setTimeout(() => {
      game.performCpuMove(); // does one O move + winner check internally

      // CPU feedback
      haptic(15);
      if (game.sfxOn) { clickSfx.currentTime = 0; clickSfx.play().catch(() => {}); }

      updateBoard();
    }, 450);
  }
}

// ===============================================
// UI update
function updateBoard() {
  const cells = boardEl.children;

  // paint cells
  for (let i = 0; i < cells.length; i++) {
    const r = Math.floor(i / 3), c = i % 3;
    const val = game.board.grid[r][c];
    const cell = cells[i];

    cell.className = "cell"; // reset classes
    cell.textContent = "";   // reset content

    if (!val) continue;

    if (game.skin.startsWith("Classic")) {
      cell.textContent = val;
      cell.classList.add(val === "X" ? "classicX" : "classicO");
    } else if (game.skin === "Fruit") {
      cell.textContent = (val === "X") ? "🍎" : "🍊";
      cell.classList.add(val === "X" ? "fruitX" : "fruitO");
    } else {
      // Runes
      cell.textContent = (val === "X") ? "🐉" : "🕊️";
      cell.classList.add(val === "X" ? "dragon" : "phoenix");
    }
  }

  // avatar turn highlight
  if (pX && pO) {
    pX.classList.toggle("active", game.turn === "X");
    pO.classList.toggle("active", game.turn === "O");
  }

  // winner / draw banner + effects
  if (game.winner) {
    if (game.winner === "Draw") {
      winnerTxt.textContent = "Draw!";
      msgEl.classList.add("show-winner");
    } else {
      winnerTxt.textContent = (game.winner === "X") ? "Dragon Wins!" : "Phoenix Wins!";
      msgEl.classList.add("show-winner");

      // highlight winning cells
      const line = game.getWinningCells?.() || [];
      for (const [r, c] of line) {
        const idx = r * 3 + c;
        cells[idx]?.classList.add("win-cell");
      }

      // celebrations
      triggerRuneBurst(game.winner);
      confettiBurst();
      screenShake();
      haptic([40, 40, 80]);
      if (game.sfxOn) { winSfx.currentTime = 0; winSfx.play().catch(() => {}); }

      // leaderboard — only when human X beats CPU
      if (game.mode === "Player vs CPU" && game.winner === "X") {
        const elapsed = ((performance.now() - game.roundStart) / 1000).toFixed(2);
        const moves = 9 - game.board.emptyCells().length;
        addLeaderboard({
          time: elapsed,
          moves,
          diff: game.difficulty.toLowerCase(),
          skin: game.skin.toLowerCase(),
        });
      }
    }
  } else {
    msgEl.classList.remove("show-winner");
    winnerTxt.textContent = "";
  }

  scoreEl.textContent =
    `Score – X: ${game.scoreX} | O: ${game.scoreO} | D: ${game.scoreD}`;
}

// ===============================================
// Buttons
nextBtn?.addEventListener("click", () => {
  game.nextRound();
  renderBoard();
  updateBoard();
  game.roundStart = performance.now();
});

resetBtn?.addEventListener("click", () => {
  game.scoreX = game.scoreO = game.scoreD = 0;
  game.resetAll();
  renderBoard();
  updateBoard();
});

homeBtn?.addEventListener("click", () => showHome(true));

sfxBtn?.addEventListener("click", () => {
  game.toggleSfx();
  sfxBtn.textContent = `SFX: ${game.sfxOn ? "On" : "Off"}`;
});

musicBtn?.addEventListener("click", () => {
  musicWanted = !musicWanted;
  musicBtn.textContent = `Music: ${musicWanted ? "On" : "Off"}`;
  if (musicWanted) music.play().catch(() => {}); else music.pause();
});

[installBtn, installBtn2].forEach(btn => {
  if (!btn) return;
  btn.addEventListener("click", async () => {
    if (!window.deferredPrompt) return;
    window.deferredPrompt.prompt();
    await window.deferredPrompt.userChoice;
    window.deferredPrompt = null;
  });
});

// ===============================================
// Home screen
function showHome(show) {
  homeScreen.classList.toggle("hidden", !show);
  boardEl.style.display = show ? "none" : "grid";
  document.querySelector(".btngrp").style.display = show ? "none" : "flex";
  modeBar.style.display = show ? "none" : "flex";
  const avatars = document.querySelector(".avatars");
  if (avatars) avatars.style.display = show ? "none" : "flex";

  if (show) { // clear banner when going home
    msgEl.classList.remove("show-winner");
    winnerTxt.textContent = "";
  }
}

startBtn?.addEventListener("click", () => {
  // apply selections
  game.mode       = gameMode.value;
  game.difficulty = difficulty.value;
  game.skin       = skinSel.value;

  // theme apply
  document.body.className = `theme-${themeSel.value.toLowerCase()}`;

  // badges
  modeBadge.textContent = `Mode: ${game.mode === "Player vs CPU" ? "PvC" : "PvP"}`;
  diffBadge.textContent = `Difficulty: ${game.difficulty}`;
  skinBadge.textContent = `Skin: ${game.skin}`;

  if (musicWanted) music.play().catch(() => {});

  game.resetAll();
  renderBoard();
  updateBoard();
  showHome(false);
});

// initial
showHome(true);
loadLeaderboard();

// ===============================================
// Haptics
function haptic(pattern) {
  if (!("vibrate" in navigator)) return;
  navigator.vibrate(pattern);
}

// ===============================================
// Leaderboard (localStorage)
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
  if (!leaderList) return;
  leaderList.innerHTML = "";
  list.forEach((e, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${e.time}s · ${e.moves} moves · ${e.diff} · ${e.skin}`;
    leaderList.appendChild(li);
  });
}
