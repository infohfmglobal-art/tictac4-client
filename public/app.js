import { Game } from "./game.js";
import { UI } from "./ui.js";

let game = new Game();
let ui = new UI(handleClick);

let score = JSON.parse(localStorage.getItem("score") || `{"X":0,"O":0}`);

function saveScore() {
  localStorage.setItem("score", JSON.stringify(score));
  document.getElementById("score").textContent = `Score — X: ${score.X} | O: ${score.O}`;
}
saveScore();

function handleClick(r,c) {
  if (!game.move(r,c)) return;
  ui.playClick();
  ui.updateBoard(game.board.cells);

  if (game.winner) {
    score[game.winner]++;
    saveScore();
    ui.msg.textContent = `Winner: ${game.winner}!`;
    ui.playWin();
  } else {
    ui.msg.textContent = `Turn: ${game.turn}`;
  }
}

document.getElementById("nextBtn").onclick = () => {
  game.reset();
  ui.renderBoard();
  ui.msg.textContent = "New Round!";
};

document.getElementById("resetBtn").onclick = () => {
  score = {X:0,O:0};
  saveScore();
  game.reset();
  ui.renderBoard();
  ui.msg.textContent = "Scores reset!";
};

document.getElementById("sfxBtn").onclick = e => {
  ui.sfxOn = !ui.sfxOn;
  e.target.textContent = `SFX: ${ui.sfxOn ? "On" : "Off"}`;
};

document.getElementById("installBtn").onclick = async () => {
  if (!window.deferredPrompt) return alert("Install not available yet!");
  window.deferredPrompt.prompt();
  window.deferredPrompt = null;
};
