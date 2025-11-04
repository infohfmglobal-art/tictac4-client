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

    this.mode = "Player vs CPU";  // or "Player vs Player"
    this.difficulty = "Easy";     // Easy / Normal / Hard
    this.skin = "Runes";
    this.theme = "Rune";
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

  // Move from UI; return "cpuPending" if CPU should move
  move(r, c, fromPlayer = false) {
    if (this.winner || !this.board.isEmpty(r, c)) return false;

    this.board.set(r, c, this.turn);
    this._finishTurn();

    if (fromPlayer && this.mode === "Player vs CPU" && !this.winner && this.turn === "O") {
      return "cpuPending";
    }
    return true;
  }

  // CPU actual move (called from app.js after delay)
  performCpuMove() {
    if (this.mode !== "Player vs CPU" || this.turn !== "O" || this.winner) return;

    const [r, c] = this.cpuMove();
    this.board.set(r, c, "O");
    this._finishTurn();
  }

  _finishTurn() {
    const res = this.board.checkWin();
    if (res) {
      this.winner = res;
      if (res === "X") this.scoreX++;
      else if (res === "O") this.scoreO++;
      else this.scoreD++;
      return;
    }

    this.turn = this.turn === "X" ? "O" : "X";
  }

  getWinningCells() {
    return this.board.winCells.slice();
  }

  // ================= AI LOGIC =================
  cpuMove() {
    const diff = this.difficulty.toLowerCase();

    if (diff === "easy") {
      return this.randomMove();
    }

    if (diff === "normal") {
      return this.mediumMove();
    }

    return this.minimaxMove(); // Hard (unbeatable)
  }

  randomMove() {
    const cells = this.board.emptyCells();
    return cells[Math.floor(Math.random() * cells.length)];
  }

  mediumMove() {
    // win if possible
    let m = this.findBestFor("O");
    if (m) return m;

    // block player
    m = this.findBestFor("X");
    if (m) return m;

    // sometimes random mistake (30%)
    if (Math.random() < 0.3) return this.randomMove();

    // center → corners → sides
    if (this.board.isEmpty(1, 1)) return [1, 1];

    const corners = [[0,0],[0,2],[2,0],[2,2]].filter(p=>this.board.isEmpty(...p));
    if (corners.length) return corners[Math.floor(Math.random()*corners.length)];

    const sides = [[0,1],[1,0],[1,2],[2,1]].filter(p=>this.board.isEmpty(...p));
    return sides[Math.floor(Math.random()*sides.length)];
  }

  findBestFor(player) {
    for (const [r, c] of this.board.emptyCells()) {
      this.board.set(r, c, player);
      const w = this.board.checkWin();
      this.board.set(r, c, "");
      if (w === player) return [r, c];
    }
    return null;
  }

  // === HARD MODE: Minimax ===
  minimaxMove() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (const [r, c] of this.board.emptyCells()) {
      this.board.set(r, c, "O");
      const score = this.minimax(false);
      this.board.set(r, c, "");
      if (score > bestScore) {
        bestScore = score;
        bestMove = [r, c];
      }
    }
    return bestMove;
  }

  minimax(isMaximizing) {
    const winner = this.board.checkWin();
    if (winner === "O") return 10;
    if (winner === "X") return -10;
    if (winner === "Draw") return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (const [r, c] of this.board.emptyCells()) {
        this.board.set(r, c, "O");
        best = Math.max(best, this.minimax(false));
        this.board.set(r, c, "");
      }
      return best;
    } else {
      let best = Infinity;
      for (const [r, c] of this.board.emptyCells()) {
        this.board.set(r, c, "X");
        best = Math.min(best, this.minimax(true));
        this.board.set(r, c, "");
      }
      return best;
    }
  }
}
