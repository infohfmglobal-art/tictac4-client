import { Board } from "./board.js";

const clickSound = new Audio("/sound/click.mp3");
const winSound   = new Audio("/sound/win.mp3");
const loseSound  = new Audio("/sound/lose.mp3"); // used on draw if you like

export class Game {
  constructor() {
    this.board = new Board(3);
    this.turn = "X";
    this.winner = null;
    this.scoreX = 0;
    this.scoreO = 0;
    this.sfxOn = true;
  }

  play(sound) {
    if (!this.sfxOn) return;
    try { sound.currentTime = 0; sound.play(); } catch (_) {}
  }

  move(r, c) {
    if (this.winner) return false;
    if (!this.board.makeMove(r, c, this.turn)) return false;

    this.play(clickSound);

    const w = this.board.checkWinner();
    if (w) {
      this.winner = w;
      if (w === "X") this.scoreX++; else this.scoreO++;
      this.play(winSound);
    } else if (this.board.isFull()) {
      // Draw
      this.winner = "Draw";
      this.play(loseSound);
    } else {
      this.turn = this.turn === "X" ? "O" : "X";
    }
    return true;
  }

  nextRound() {
    this.board.resetGrid();
    this.turn = "X";
    this.winner = null;
  }

  resetAll() {
    this.nextRound();
    this.scoreX = 0;
    this.scoreO = 0;
  }

  toggleSfx() { this.sfxOn = !this.sfxOn; }
}
