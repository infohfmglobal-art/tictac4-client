import { Game } from "./game.js";
const game = new Game();

const boardElement = document.getElementById("board");
const scoreText = document.getElementById("score");
const msgDiv = document.getElementById("msg");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const sfxBtn = document.getElementById("sfxBtn");
const themeSelect = document.getElementById("themeSelect");

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
    cells[i].innerText = game.board.grid[r][c] || "";
  }

  scoreText.textContent = `Score — X: ${game.scoreX} | O: ${game.scoreO}`;
  msgDiv.textContent = game.winner ? `Winner: ${game.winner}` : "";
}

themeSelect.addEventListener("change", () => {
  document.body.className = "";
  const theme = themeSelect.value.toLowerCase();
  document.body.classList.add(`theme-${theme}`);
});

nextBtn.addEventListener("click", () => {
  game.nextRound();
  msgDiv.textContent = "";
  renderBoard();
});

resetBtn.addEventListener("click", () => {
  game.resetAll();
  msgDiv.textContent = "";
  scoreText.textContent = `Score — X: 0 | O: 0`;
  renderBoard();
});

sfxBtn.addEventListener("click", () => {
  game.toggleSfx();
  sfxBtn.textContent = `SFX: ${game.sfxOn ? "On" : "Off"}`;
});

renderBoard();
updateBoard();
