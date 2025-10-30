import { Board } from "./board.js";

const LS_KEY = "t4_score_v1";

export class Game {
  constructor(size = 4) {
    this.board = new Board(size);
    this.currentPlayer = "X";
    this.winner = null;
    this.isGameOver = false;
    this.score = this.loadScore();
  }

  loadScore() {
    try {
      const s = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      return { X: s.X || 0, O: s.O || 0 };
    } catch {
      return { X: 0, O: 0 };
    }
  }
  saveScore() {
    localStorage.setItem(LS_KEY, JSON.stringify(this.score));
  }

  makeMove(row, col) {
    if (this.isGameOver) return { moved:false };
    const moved = this.board.makeMove(row, col, this.currentPlayer);
    if (!moved) return { moved:false };

    const { winner, line } = this.board.checkWinner();
    if (winner) {
      this.isGameOver = true;
      this.winner = winner;
      this.score[winner] += 1;
      this.saveScore();
      return { moved:true, winLine: line };
    }
    if (this.board.isFull()) {
      this.isGameOver = true;
      return { moved:true, draw:true };
    }
    this.togglePlayer();
    return { moved:true };
  }

  togglePlayer() {
    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
  }

  nextRound() {
    this.board.reset();
    this.isGameOver = false;
    this.winner = null;
    this.currentPlayer = "X";
  }

  resetAll() {
    this.nextRound();
    this.score = { X: 0, O: 0 };
    this.saveScore();
  }
}
