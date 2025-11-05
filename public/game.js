// game.js
import { Board } from "./board.js";

export class Game {
  constructor() {
    this.board = new Board();
    this.turn = "X";
    this.winner = null;

    this.scoreX = 0;
    this.scoreO = 0;
    this.scoreD = 0;

    this.mode = "Player vs CPU";
    this.difficulty = "Easy";
    this.skin = "Runes";
    this.sfxOn = true;

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

  move(r, c, isHuman = false) {
    if (this.winner || !this.board.isEmpty(r, c)) return false;

    this.board.set(r, c, this.turn);
    this.checkWinner();

    if (!this.winner) {
      this.turn = this.turn === "X" ? "O" : "X";
    }

    if (this.mode === "Player vs CPU" && isHuman && this.turn === "O") {
      return "cpuPending";
    }

    return true;
  }

  performCpuMove() {
    if (this.turn !== "O" || this.winner) return;

    const [r, c] = this.cpuMove();
    this.board.set(r, c, "O");
    this.checkWinner();

    if (!this.winner) this.turn = "X";
  }

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

  cpuMove() {
    let move = this.findBestFor("O");
    if (move) return move;

    move = this.findBestFor("X");
    if (move) return move;

    if (this.board.isEmpty(1,1)) return [1,1];

    const corners = [[0,0],[0,2],[2,0],[2,2]].filter(([r,c])=>this.board.isEmpty(r,c));
    const sides = [[0,1],[1,0],[1,2],[2,1]].filter(([r,c])=>this.board.isEmpty(r,c));
    const diff = this.difficulty.toLowerCase();

    if (diff === "hard") {
      if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
      if (sides.length) return sides[Math.floor(Math.random()*sides.length)];
    } else if (diff === "normal") {
      if (Math.random() < 0.7 && corners.length) {
        return corners[Math.floor(Math.random()*corners.length)];
      }
      const pool = corners.concat(sides);
      return pool[Math.floor(Math.random()*pool.length)];
    }

    const empties = this.board.emptyCells();
    return empties[Math.floor(Math.random()*empties.length)];
  }

  findBestFor(player) {
    for (const [r,c] of this.board.emptyCells()) {
      this.board.set(r,c,player);
      const w = this.board.checkWin();
      this.board.set(r,c,"");
      if (w === player) return [r,c];
    }
    return null;
  }
}
