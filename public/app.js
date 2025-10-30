import Game from "./game.js";
import UI   from "./ui.js";

let game, ui;

function startGame() {
  game = new Game(4);
  ui   = new UI(onCellClick);
  ui.renderBoard(4);
  ui.updateStatus("Your Turn…");
}

function onCellClick(row, col) {
  if (!game) return;
  const moved = game.makeMove(row, col);
  if (!moved) return;

  ui.playClick();
  ui.updateBoard(game.board.cells);

  if (game.isGameOver) {
    ui.updateStatus(`Game Over! Winner: ${game.winner}`);
  } else {
    ui.updateStatus(`Turn: ${game.currentPlayer}`);
  }
}

// Reset
document.addEventListener("DOMContentLoaded", () => {
  startGame();
  document.getElementById("resetBtn").addEventListener("click", startGame);
});
