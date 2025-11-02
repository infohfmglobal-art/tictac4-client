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

    // settings
    this.mode = "Player vs CPU"; // or "Player vs Player"
    this.difficulty = "Easy";    // Easy / Normal / Hard
    this.skin = "Runes";         // Runes / Classic X / O / Fruit
    this.theme = "Rune";         // for body class outside
    this.sfxOn = true;

    // timing for leaderboard
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

  /** Public move API (r,c from UI) */
  move(r, c) {
    if (this.winner || !this.board.isEmpty(r, c)) return false;
    this.board.set(r, c, this.turn);
    this.checkWinner();

    // switch & maybe CPU move
    if (!this.winner) {
      this.turn = this.turn === "X" ? "O" : "X";
      if (this.mode === "Player vs CPU" && this.turn === "O") {
        const [cr, cc] = this.cpuMove();
        this.board.set(cr, cc, "O");
        this.checkWinner();
        if (!this.winner) this.turn = "X";
      }
    }
    return true;
  }

  checkWinner() {
    const res = this.board.checkWin();
    if (res) {
      this.winner = res; // "X" | "O" | "Draw"
      if (res === "X") this.scoreX++;
      else if (res === "O") this.scoreO++;
      else this.scoreD++;
    }
  }

  getWinningCells() { return this.board.winCells.slice(); }

  // === AI (simple heuristic + difficulty bias) ===
  cpuMove() {
    // 1) If can win, win
    let move = this.findBestFor("O");
    if (move) return move;

    // 2) If player can win next, block
    move = this.findBestFor("X");
    if (move) return move;

    // 3) Center, corners, sides
    if (this.board.isEmpty(1,1)) return [1,1];

    const corners = [[0,0],[0,2],[2,0],[2,2]].filter(([r,c])=>this.board.isEmpty(r,c));
    const sides = [[0,1],[1,0],[1,2],[2,1]].filter(([r,c])=>this.board.isEmpty(r,c));

    // Difficulty bias
    const diff = this.difficulty.toLowerCase();
    if (diff === "hard") {
      if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
      if (sides.length) return sides[Math.floor(Math.random()*sides.length)];
    } else if (diff === "normal") {
      // 70% corner first
      if (Math.random() < 0.7 && corners.length) {
        return corners[Math.floor(Math.random()*corners.length)];
      }
      const pool = corners.concat(sides);
      return pool[Math.floor(Math.random()*pool.length)];
    } else {
      // easy = random any empty
      const empties = this.board.emptyCells();
      return empties[Math.floor(Math.random()*empties.length)];
    }
  }

  findBestFor(player) {
    // try every empty → if placing player wins, take it
    for (const [r,c] of this.board.emptyCells()) {
      this.board.set(r,c,player);
      const w = this.board.checkWin();
      this.board.set(r,c,"");
      if (w === player) return [r,c];
    }
    return null;
  }
}
