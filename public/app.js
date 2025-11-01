import { Game } from "./game.js";
const game = new Game();

// Elements
const boardElement = document.getElementById("board");
const scoreText    = document.getElementById("score");
const msgDiv       = document.getElementById("msg");
const nextBtn      = document.getElementById("nextBtn");
const resetBtn     = document.getElementById("resetBtn");
const sfxBtn       = document.getElementById("sfxBtn");
const themeSelect  = document.getElementById("themeSelect");
const installBtn   = document.getElementById("installBtn");

// Build board DOM once per round
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

// Click handler
function handleMove(r, c) {
  if (!game.move(r, c)) return;
  updateBoard();
}

// Refresh UI text/icons
function updateBoard() {
  const cells = boardElement.children;
  for (let i = 0; i < cells.length; i++) {
    const r = Math.floor(i / 3);
    const c = i % 3;
    cells[i].innerText = game.board.grid[r][c] || "";
  }
  scoreText.textContent = `Score — X: ${game.scoreX} | O: ${game.scoreO}`;
  msgDiv.textContent = game.winner
    ? (game.winner === "Draw" ? "Draw!" : `Winner: ${game.winner}`)
    : `Turn: ${game.turn}`;
}

// Theme switch
themeSelect.addEventListener("change", () => {
  document.body.className = "";
  const theme = themeSelect.value.toLowerCase();
  document.body.classList.add(`theme-${theme}`);
});

// Buttons
nextBtn.addEventListener("click", () => {
  game.nextRound();
  msgDiv.textContent = "";
  renderBoard();
  updateBoard();
});
resetBtn.addEventListener("click", () => {
  game.resetAll();
  msgDiv.textContent = "";
  renderBoard();
  updateBoard();
});
sfxBtn.addEventListener("click", () => {
  game.toggleSfx();
  sfxBtn.textContent = `SFX: ${game.sfxOn ? "On" : "Off"}`;
});

// PWA install
installBtn.addEventListener("click", async () => {
  const prompt = window.deferredPrompt;
  if (!prompt) return;
  prompt.prompt();
  await prompt.userChoice;
  window.deferredPrompt = null;
});

renderBoard();
updateBoard();
