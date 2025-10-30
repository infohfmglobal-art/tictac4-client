import { Game } from "./game.js";
import { UI } from "./ui.js";

let game, ui;

function start() {
  game = new Game(4);
  ui = new UI(onCellClick);

  // wire buttons
  document.getElementById("nextRound").onclick = () => {
    game.nextRound();
    ui.renderBoard(game.board.cells);
    ui.setStatus("Your Turn…");
    ui.enableNextRound(false);
  };
  document.getElementById("resetAll").onclick = () => {
    game.resetAll();
    ui.renderBoard(game.board.cells);
    ui.setScore(game.score.X, game.score.O);
    ui.setStatus("Scores cleared. New Round!");
    ui.enableNextRound(false);
  };

  // initial render
  ui.renderBoard(game.board.cells);
  ui.setScore(game.score.X, game.score.O);
  ui.setStatus("Your Turn…");

  // Fake “Connected” indicator (since we’re local-only here)
  const conn = document.getElementById("conn");
  setTimeout(() => { conn.textContent = "Connected"; conn.classList.remove("badge-amber"); }, 700);
}

function onCellClick(row, col) {
  ui.clickSnd();
  const res = game.makeMove(row, col);
  if (!res.moved) return;

  ui.updateBoard(game.board.cells);

  if (res.winLine) {
    ui.highlightWin(res.winLine);
    ui.setScore(game.score.X, game.score.O);
    ui.setStatus(`Game Over — Winner: ${game.winner}`);
    ui.enableNextRound(true);
    return;
  }
  if (res.draw) {
    ui.setStatus("Draw! No more moves.");
    ui.enableNextRound(true);
    return;
  }
  ui.setStatus(`Turn: ${game.currentPlayer}`);
}

start();
