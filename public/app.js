import { Game } from "./game.js";

const game = new Game();

const boardElement = document.getElementById("board");
const scoreText = document.getElementById("score");
const msgText = document.getElementById("msg");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const sfxBtn = document.getElementById("sfxBtn");

// --- Render Grid ---
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
renderBoard();

// --- Update UI ---
function updateUI() {
  const cells = boardElement.children;
  for (let i = 0; i < cells.length; i++) {
    const r = Math.floor(i / 3);
    const c = i % 3;
    cells[i].textContent = game.board.grid[r][c] || "";
  }
  msgText.textContent = game.winner ? `Winner: ${game.winner}` : "";
  scoreText.textContent = `Score — X: ${game.scoreX} | O: ${game.scoreO}`;
}

// --- Handle move ---
function handleMove(r, c) {
  if (game.move(r, c)) {
    updateUI();
  }
}

// --- Buttons ---
nextBtn.onclick = () => {
  game.reset();
  updateUI();
};

resetBtn.onclick = () => {
  game.resetAll();
  updateUI();
};

sfxBtn.onclick = () => {
  game.toggleSFX();
  sfxBtn.textContent = `SFX: ${game.sfxOn ? "On" : "Off"}`;
};
