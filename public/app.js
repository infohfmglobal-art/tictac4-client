import { Game } from "./game.js";
import { triggerRuneBurst } from "./runes.js";

const game = new Game();

const boardElement = document.getElementById("board");
const scoreText    = document.getElementById("score");
const msgDiv       = document.getElementById("msg");
const nextBtn      = document.getElementById("nextBtn");
const resetBtn     = document.getElementById("resetBtn");
const sfxBtn       = document.getElementById("sfxBtn");
const themeSelect  = document.getElementById("themeSelect");
const installBtn   = document.getElementById("installBtn");
const winnerText   = document.getElementById("winnerText");

function renderBoard() {
  boardElement.innerHTML = "";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.addEventListener("click", () => handleMove(r, c));
      boardElement.appendChild(cell);
    }
  }
}

function handleMove(r, c) {
  if (!game.move(r, c)) return;
  updateBoard();
}

function updateBoard() {
  const cells = boardElement.children;

  for (let i = 0; i < cells.length; i++) {
    const r = Math.floor(i / 3);
    const c = i % 3;
    const val = game.board.grid[r][c];

    if (val === "X") {
      cells[i].innerHTML = "🐉";
      cells[i].classList.add("dragon");
      cells[i].classList.remove("phoenix");
    } 
    else if (val === "O") {
      cells[i].innerHTML = "🕊️";
      cells[i].classList.add("phoenix");
      cells[i].classList.remove("dragon");
    } 
    else {
      cells[i].innerHTML = "";
      cells[i].classList.remove("dragon", "phoenix");
    }
  }

  if (game.winner && game.winner !== "Draw") {
    winnerText.textContent = game.winner === "X" ? "Dragon Wins!" : "Phoenix Wins!";
    msgDiv.classList.add("show-winner");

    triggerRuneBurst(game.winner);

    const winCells = game.getWinningCells();
    for (const [r, c] of winCells) {
      const idx = r * 3 + c;
      cells[idx].classList.add("win-cell");
    }
  } 
  else if (game.winner === "Draw") {
    winnerText.textContent = "Draw!";
    msgDiv.classList.add("show-winner");
  } 
  else {
    msgDiv.classList.remove("show-winner");
    winnerText.textContent = `Turn: ${game.turn === "X" ? "Dragon" : "Phoenix"}`;
  }

  scoreText.textContent =
    `Score – X: ${game.scoreX} | O: ${game.scoreO} | D: ${game.scoreD}`;
}

themeSelect.addEventListener("change", () => {
  document.body.className = "";
  document.body.classList.add(`theme-${themeSelect.value.toLowerCase()}`);
});

nextBtn.addEventListener("click", () => {
  game.nextRound();
  renderBoard();
  updateBoard();
});

resetBtn.addEventListener("click", () => {
  game.resetAll();
  renderBoard();
  updateBoard();
});

sfxBtn.addEventListener("click", () => {
  game.toggleSfx();
  sfxBtn.textContent = `SFX: ${game.sfxOn ? "On" : "Off"}`;
});

installBtn.addEventListener("click", async () => {
  const prompt = window.deferredPrompt;
  if (!prompt) return;
  prompt.prompt();
  await prompt.userChoice;
  window.deferredPrompt = null;
});

renderBoard();
updateBoard();
