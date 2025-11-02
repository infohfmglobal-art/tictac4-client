import { Board } from "./board.js";

const clickSound = new Audio("/sound/click.mp3");
const winSound   = new Audio("/sound/win.mp3");
const loseSound  = new Audio("/sound/lose.mp3"); // used on draw beep

export class Game {
  constructor() {
    this.board = new Board(3);
    this.turn = "X";
    this.winner = null;

    this.scoreX = 0;
    this.scoreO = 0;
    this.scoreD = 0; // ✅ Draw counter

    this.sfxOn = true;
    this.winningCells = []; // ✅ store winning cells for animation
  }

  play(sound) {
    if (!this.sfxOn) return;
    try { sound.currentTime = 0; sound.play(); } catch (_) {}
  }

  move(r, c) {
    if (this.winner) return false;
    if (!this.board.makeMove(r, c, this.turn)) return false;

    this.play(clickSound);

    const result = this.board.checkWinner();

    if (result) {
      if (result !== "Draw") {
        this.winner = result;
        this.winningCells = this.board.getWinningCells(); // ✅ new win cell memory
        if (result === "X") this.scoreX++;
        else this.scoreO++;

        this.play(winSound);
      } else {
        // ✅ Proper draw
        this.winner = "Draw";
        this.scoreD++;
        this.play(loseSound);
      }
    } else {
      this.turn = this.turn === "X" ? "O" : "X";
    }

    return true;
  }

  nextRound() {
    this.board.resetGrid();
    this.turn = "X";
    this.winner = null;
    this.winningCells = []; // ✅ clear win cells
  }

  resetAll() {
    this.nextRound();
    this.scoreX = 0;
    this.scoreO = 0;
    this.scoreD = 0; // ✅ reset draws too
  }

  toggleSfx() { 
    this.sfxOn = !this.sfxOn; 
  }

  // ✅ Expose winning cells for UI animation
  getWinningCells() {
    return this.winningCells;
  }
}
