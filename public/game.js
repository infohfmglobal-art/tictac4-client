const clickSound = new Audio('/sound/click.mp3');
const winSound = new Audio('/sound/win.mp3');
const loseSound = new Audio('/sound/lose.mp3');

import { Board } from "./board.js";
export class Game {
  constructor() {
    this.board = new Board(3);
    this.turn = "X";
    this.winner = null;
  }

  move(r, c) {
    if (this.winner) return false;
    if (!this.board.makeMove(r, c, this.turn)) return false;

    // 🔊 Play click sound when a move is placed
    clickSound.play();

    this.winner = this.board.checkWinner();
    if (this.winner) {
      // 🔊 Play winner / loser sound
      if (this.winner === this.turn) {
        winSound.play();   // Player wins
      } else {
        loseSound.play();  // Player loses
      }
      return true;
    }

    this.turn = this.turn === "X" ? "O" : "X";
    return true;
  }

  reset() {
    this.board = new Board(3);
    this.turn = "X";
    this.winner = null;
  }
}
