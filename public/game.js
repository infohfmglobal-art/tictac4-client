// game.js
import { Board } from "./board.js";

export class Game {
  constructor() {
    this.board = new Board();
    this.turn = "X";
    this.winner = null;

    // scores
    this.scoreX = 0;
    this.scoreO = 0;
    this.scoreD = 0;

    // settings from UI
    this.mode = "Player vs CPU"; 
    this.difficulty = "Easy";  
    this.skin = "Runes";         
    this.theme = "Rune";        
    this.sfxOn = true;

    // timestamp for leaderboard
    this.roundStart = performance.now();
  }

  resetAll() {
    this.board.reset();
    this.turn = "X";
    this.winner = null;
    this.roundStart = performance.now();
  }

  nextRound() { this.resetAll(); }

  toggleSfx() { this.sfxOn = !this.sfxOn; }

  /** === Move API called from UI === */
  move(r, c, isPlayer = true) {
    if (this.winner || !this.board.isEmpty(r, c)) return false;

    this.board.set(r, c, this.turn);
    this.checkWinner();

    if (!this.winner) {
      this.turn = this.turn === "X" ? "O" : "X";

      // CPU turn
      if (this.mode === "Player vs CPU" && this.turn === "O" && isPlayer) {
        return "cpuPending";
      }
    }

    return true;
  }

  performCpuMove() {
    const [r, c] = this.cpuMove();
    this.board.set(r, c, "O");
    this.checkWinner();
    if (!this.winner) this.turn = "X";
  }

  /** Winner check */
  checkWinner() {
    const res = this.board.checkWin();
    if (res) {
      this.winner = res;
      if (res === "X") this.scoreX++;
      else if (res === "O") this.scoreO++;
      else this.scoreD++;
    }
  }

  getWinningCells() { return this.board.winCells.slice(); }

  /** === CPU AI === */
  cpuMove() {
    const diff = this.difficulty.toLowerCase();

    // EASY → completely random
    if (diff === "easy") {
      const moves = this.board.emptyCells();
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // MEDIUM → 50% random, 50% smart
    if (diff === "medium") {
      const moves = this.board.emptyCells();

      if (Math.random() < 0.5) {
        return moves[Math.floor(Math.random() * moves.length)];
      }

      // Try to win
      const win = this.findBestFor("O");
      if (win) return win;

      // Try to block
      const block = this.findBestFor("X");
      if (block) return block;

      return moves[Math.floor(Math.random() * moves.length)];
    }

    // HARD (advanced coming later)
    const win = this.findBestFor("O");
    if (win) return win;
    const block = this.findBestFor("X");
    if (block) return block;

    if (this.board.isEmpty(1,1)) return [1,1];

    const corners = [[0,0],[0,2],[2,0],[2,2]].filter(([r,c])=>this.board.isEmpty(r,c));
    if (corners.length) return corners[Math.floor(Math.random()*corners.length)];

    const sides = [[0,1],[1,0],[1,2],[2,1]].filter(([r,c])=>this.board.isEmpty(r,c));
    return sides[Math.floor(Math.random()*sides.length)];
  }

  /** check if placing wins */
  findBestFor(player) {
    for (const [r,c] of this.board.emptyCells()) {
      this.board.set(r, c, player);
      const win = this.board.checkWin();
      this.board.set(r, c, "");
      if (win === player) return [r,c];
    }
    return null;
  }
}
