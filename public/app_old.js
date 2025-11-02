import { Game } from "./game.js";

const game = new Game();

const boardElement = document.getElementById("board");
const scoreText = document.getElementById("score");
const msgText = document.getElementById("msg");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const sfxBtn = document.getElementById("sfxBtn");

// Render Board
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

// Update Visual Cell
function updateCell(r, c, sym) {
  const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  if (!cell) return;

  if (sym === "X") {
    cell.innerHTML = `<span class="rune-x">X</span>`;
  } else if (sym === "O") {
    cell.innerHTML = `<span class="rune-o">O</span>`;
  }
}

// Handle Move
function handleMove(r, c) {
  if (!game.board.isEmpty(r, c)) return;

  const sym = game.turn;
  game.board.makeMove(r, c, sym);
  updateCell(r, c, sym);

  if (game.board.checkWin(sym)) {
    msgText.textContent = `${sym} Wins!`;
    game.addScore(sym);
    updateScore();
    return;
  }

  if (game.board.isFull()) {
    msgText.textContent = "Draw!";
    return;
  }

  game.switchTurn();
  msgText.textContent = `Turn: ${game.turn}`;
}

// Update Score Text
function updateScore() {
  scoreText.textContent = `Score – X: ${game.scoreX} | O: ${game.scoreO}`;
}

// Next Round
nextBtn.addEventListener("click", () => {
  game.resetBoard();
  msgText.textContent = `Turn: X`;
  renderBoard();
});

// Reset All
resetBtn.addEventListener("click", () => {
  game.resetAll();
  updateScore();
  msgText.textContent = `Turn: X`;
  renderBoard();
});

// SFX Toggle
sfxBtn.addEventListener("click", () => {
  game.toggleSfx();
  sfxBtn.textContent = `SFX: ${game.sfxOn ? "On" : "Off"}`;
});

// Init
renderBoard();
updateScore();
msgText.textContent = `Turn: X`;
