// app.js ✅ CLEAN STABLE BUILD WITH CPU DELAY + SOUND + HOME SCREEN

import { Game } from "./game.js";
import { triggerRuneBurst, confettiBurst, screenShake } from "./runes.js";

const game = new Game();

// DOM elements
const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const msgEl = document.getElementById("msg");
const winnerTxt = document.getElementById("winnerText");

const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const homeBtn = document.getElementById("homeBtn");
const sfxBtn = document.getElementById("sfxBtn");
const musicBtn = document.getElementById("musicBtn");
const installBtn = document.getElementById("installBtn");
const installBtn2 = document.getElementById("installBtn2");

const modeBar = document.getElementById("modeBar");
const modeBadge = document.getElementById("modeBadge");
const diffBadge = document.getElementById("diffBadge");
const skinBadge = document.getElementById("skinBadge");
const pX = document.getElementById("pX");
const pO = document.getElementById("pO");

// Home screen UI
const homeScreen = document.getElementById("homeScreen");
const startBtn = document.getElementById("startBtn");
const gameMode = document.getElementById("gameMode");
const difficulty = document.getElementById("difficulty");
const skinSel = document.getElementById("skin");
const themeSel = document.getElementById("themeSelect");
const leaderList = document.getElementById("leaderList");

// Sounds
const clickSfx = new Audio("sound/click.mp3");
const winSfx = new Audio("sound/win.mp3");
const music = new Audio("sound/bg.mp3");
music.loop = true;
let musicWanted = false;

// Render board
function renderBoard() {
    boardEl.innerHTML = "";
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.addEventListener("click", () => handleMove(r, c));
            boardEl.appendChild(cell);
        }
    }
}
renderBoard();

// ===== Handle move =====
function handleMove(r, c) {
  // Start music after first gesture
  if (musicWanted && music.paused) music.play().catch(()=>{});

  // Player move
  const result = game.move(r, c, true);
  if (!result) return;

  haptic(15);
  if (game.sfxOn) {
    clickSfx.currentTime = 0;
    clickSfx.play().catch(()=>{});
  }
  updateBoard();

  // CPU turn (if needed)
  if (result === "cpuPending") {
    setTimeout(() => {
      game.performCpuMove();

      haptic(20);
      if (game.sfxOn) {
        clickSfx.currentTime = 0;
        clickSfx.play().catch(()=>{});
      }

      updateBoard();
    }, 550);
  }
}
// Update UI
function updateBoard() {
    const cells = boardEl.children;
    for (let i = 0; i < cells.length; i++) {
        const r = Math.floor(i / 3), c = i % 3;
        const val = game.board.grid[r][c];
        cells[i].className = "cell";
        cells[i].textContent = "";

        if (val === "X") {
            cells[i].textContent = game.skin === "Fruit" ? "🍎" : (game.skin === "Classic" ? "X" : "🐉");
            cells[i].classList.add("xMark");
        }
        if (val === "O") {
            cells[i].textContent = game.skin === "Fruit" ? "🍊" : (game.skin === "Classic" ? "O" : "🕊️");
            cells[i].classList.add("oMark");
        }
    }

    pX.classList.toggle("active", game.turn === "X");
    pO.classList.toggle("active", game.turn === "O");

    if (game.winner) {
        winnerTxt.textContent = 
            game.winner === "Draw" ? "Draw!" : (game.winner === "X" ? "Dragon Wins!" : "Phoenix Wins!");

        msgEl.classList.add("show-winner");
        triggerRuneBurst(game.winner);
        confettiBurst();
        screenShake();
        winSfx.play().catch(() => {});
        return;
    }

    msgEl.classList.remove("show-winner");
    winnerTxt.textContent = "";
}

// Buttons
nextBtn.onclick = () => { game.nextRound(); renderBoard(); updateBoard(); };
resetBtn.onclick = () => { game.scoreX = game.scoreO = game.scoreD = 0; game.resetAll(); renderBoard(); updateBoard(); };
homeBtn.onclick = () => showHome(true);
sfxBtn.onclick = () => { game.toggleSfx(); sfxBtn.textContent = `SFX: ${game.sfxOn ? "On" : "Off"}`; };
musicBtn.onclick = () => {
    musicWanted = !musicWanted;
    musicBtn.textContent = `Music: ${musicWanted ? "On" : "Off"}`;
    musicWanted ? music.play().catch(() => {}) : music.pause();
};

// Home screen
function showHome(show){
  if (show) {
      // show home screen
      homeScreen.style.display = "block";
      boardEl.style.display = "none";
      document.querySelector(".btngrp").style.display = "none";
      modeBar.style.display = "none";
      document.querySelector(".avatars").style.display = "none";
      msgEl.classList.remove("show-winner");
  } else {
      // show game screen
      homeScreen.style.display = "none";
      boardEl.style.display = "grid";
      document.querySelector(".btngrp").style.display = "flex";
      modeBar.style.display = "flex";
      document.querySelector(".avatars").style.display = "flex";
  }
}
showHome(true);

startBtn.onclick = () => {
    game.mode = gameMode.value;
    game.difficulty = difficulty.value;
    game.skin = skinSel.value;
    document.body.className = `theme-${themeSel.value.toLowerCase()}`;
    game.resetAll();
    renderBoard();
    updateBoard();
    showHome(false);
};

// Vibration
function haptic(x) {
    if (navigator.vibrate) navigator.vibrate(x);
}
