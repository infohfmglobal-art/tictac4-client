import { Game } from "./game.js";

const game = new Game();

const boardElement = document.getElementById("board");
const msg = document.getElementById("msg");
const scoreText = document.getElementById("score");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const sfxBtn = document.getElementById("sfxBtn");

let sfxEnabled = true;

function drawBoard() {
  boardElement.innerHTML = "";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => handleMove(r, c));
      boardElement.appendChild(cell);
    }
  }
}

function updateUI() {
  const cells = boardElement.children;
  for (let i = 0; i < cells.length; i++) {
    const r = Math.floor(i / 3);
    const c = i % 3;
    cells[i].textContent = game.board.grid[r][c] || "";
  }

  if (game.winner) {
    msg.textContent = `Winner: ${game.winner}!`;
  } else {
    msg.textContent = `Turn: ${game.turn}`;
  }
}

function updateScore() {
  scoreText.textContent = `Score — X: ${game.score.X} | O: ${game.score.O}`;
}

function handleMove(r, c) {
  if (game.move(r, c)) {
    updateUI();
    if (game.winner && sfxEnabled) {
      if (game.winner === "X" || game.winner === "O") winSound.play();
    }
  }
}

nextBtn.addEventListener("click", () => {
  game.nextRound();
  msg.textContent = "";
  drawBoard();
  updateUI();
  updateScore();
});

resetBtn.addEventListener("click", () => {
  game.resetAll();
  msg.textContent = "";
  drawBoard();
  updateUI();
  updateScore();
});

sfxBtn.addEventListener("click", () => {
  sfxEnabled = !sfxEnabled;
  sfxBtn.textContent = `SFX: ${sfxEnabled ? "On" : "Off"}`;
});

drawBoard();
updateUI();
updateScore();
