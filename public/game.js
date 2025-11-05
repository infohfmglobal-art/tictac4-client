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

    // settings (kept compatible with your UI)
    this.mode = "Player vs CPU";   // or "Player vs Player"
    this.difficulty = "Easy";      // Easy / Normal / Hard
    this.skin = "Runes";           // Runes / Classic X / O / Fruit
    this.theme = "Rune";
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

  /** Public move API (r,c from UI). Returns true if human move was placed. */
  move(r, c) {
    if (this.winner || !this.board.isEmpty(r, c)) return false;

    // human (or current player in PvP)
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
    const res = this.board.checkWin(); // "X" | "O" | "Draw" | null
    if (res) {
      this.winner = res;
      if (res === "X") this.scoreX++;
      else if (res === "O") this.scoreO++;
      else this.scoreD++;
    }
  }

  getWinningCells() {
    return this.board.winCells.slice();
  }

  // ------------------------------
  //           CPU LOGIC
  // ------------------------------
  cpuMove() {
    const diff = (this.difficulty || "Easy").toLowerCase();

    if (diff === "hard") {
      // Unbeatable via minimax (with small alpha-beta pruning)
      return this.minimaxBestMove("O");
    }

    if (diff === "normal") {
      // Smart heuristics with a touch of randomness
      const winNow = this.findLineComplete("O");
      if (winNow) return winNow;

      const block = this.findLineComplete("X");
      if (block) return block;

      if (this.board.isEmpty(1, 1)) return [1, 1];

      const corners = [[0,0],[0,2],[2,0],[2,2]].filter(([r,c])=>this.board.isEmpty(r,c));
      const sides   = [[0,1],[1,0],[1,2],[2,1]].filter(([r,c])=>this.board.isEmpty(r,c));

      // 70% choose corners first, else mix
      if (Math.random() < 0.7 && corners.length) {
        return corners[Math.floor(Math.random()*corners.length)];
      }
      const pool = corners.concat(sides);
      return pool[Math.floor(Math.random()*pool.length)];
    }

    // Easy: random
    const empties = this.board.emptyCells();
    return empties[Math.floor(Math.random() * empties.length)];
  }

  /** If placing `who` in one move can win, return that move [r,c], else null */
  findLineComplete(who) {
    for (const [r, c] of this.board.emptyCells()) {
      this.board.set(r, c, who);
      const w = this.board.checkWin();
      this.board.set(r, c, ""); // undo
      if (w === who) return [r, c];
    }
    return null;
  }

  // ------------------------------
  //        Minimax (3x3)
  // ------------------------------
  minimaxBestMove(aiPlayer) {
    const human = aiPlayer === "O" ? "X" : "O";

    let bestScore = -Infinity;
    let best = null;

    for (const [r, c] of this.board.emptyCells()) {
      this.board.set(r, c, aiPlayer);
      const score = this.minimax(human, aiPlayer, -Infinity, Infinity);
      this.board.set(r, c, "");

      if (score > bestScore) {
        bestScore = score;
        best = [r, c];
      }
    }
    // Fallback (shouldn’t happen)
    if (!best) {
      const empties = this.board.emptyCells();
      return empties[Math.floor(Math.random() * empties.length)];
    }
    return best;
  }

  /**
   * Minimax with alpha-beta pruning.
   * current – the symbol whose turn it is in this simulated branch.
   * ai – the AI symbol ("O").
   * Returns score from AI's perspective.
   */
  minimax(current, ai, alpha, beta) {
    const winner = this.board.checkWin();
    if (winner) {
      // terminal node scoring
      if (winner === ai) return 10;
      if (winner === "Draw") return 0;
      return -10; // human wins
    }

    const isMaximizing = (current === ai);
    const next = current === "X" ? "O" : "X";

    if (isMaximizing) {
      let best = -Infinity;
      for (const [r, c] of this.board.emptyCells()) {
        this.board.set(r, c, current);
        const val = this.minimax(next, ai, alpha, beta);
        this.board.set(r, c, "");

        best = Math.max(best, val);
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break; // prune
      }
      return best;
    } else {
      let best = Infinity;
      for (const [r, c] of this.board.emptyCells()) {
        this.board.set(r, c, current);
        const val = this.minimax(next, ai, alpha, beta);
        this.board.set(r, c, "");

        best = Math.min(best, val);
        beta = Math.min(beta, best);
        if (beta <= alpha) break; // prune
      }
      return best;
    }
  }
}
