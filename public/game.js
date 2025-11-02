// Core game state + logic (no DOM)
export class Game {
  constructor(skin = "runes") {
    this.grid = Array.from({ length: 3 }, () => Array(3).fill(""));
    this.currentPlayer = "X";
    this.winner = null; // "X" | "O" | "Draw" | null
    this.scoreX = 0; this.scoreO = 0; this.scoreD = 0;
    this.sfxOn = true;
    this.skin = skin;
    this.winningCells = [];
    this.roundMoves = 0;
    this.roundStart = performance.now();
  }

  isEmpty(r, c) { return this.grid[r][c] === ""; }
  getEmptyCells() {
    const out = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (this.isEmpty(r,c)) out.push({r,c});
    return out;
  }

  makeMove(r, c, sym = this.currentPlayer) {
    if (this.winner) return false;
    if (!this.isEmpty(r, c)) return false;
    this.grid[r][c] = sym;
    this.roundMoves++;
    const result = this.checkWinner();
    if (result) {
      if (result === "Draw") {
        this.winner = "Draw"; this.scoreD++;
      } else {
        this.winner = result;
        if (result === "X") this.scoreX++; else this.scoreO++;
      }
    } else {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    }
    return true;
  }

  checkWinner() {
    const g = this.grid, n = 3;
    // rows
    for (let r = 0; r < n; r++) {
      if (g[r][0] && g[r][0] === g[r][1] && g[r][1] === g[r][2]) {
        this.winningCells = [[r,0],[r,1],[r,2]];
        return g[r][0];
      }
    }
    // cols
    for (let c = 0; c < n; c++) {
      if (g[0][c] && g[0][c] === g[1][c] && g[1][c] === g[2][c]) {
        this.winningCells = [[0,c],[1,c],[2,c]];
        return g[0][c];
      }
    }
    // diag
    if (g[0][0] && g[0][0] === g[1][1] && g[1][1] === g[2][2]) {
      this.winningCells = [[0,0],[1,1],[2,2]];
      return g[0][0];
    }
    if (g[0][2] && g[0][2] === g[1][1] && g[1][1] === g[2][0]) {
      this.winningCells = [[0,2],[1,1],[2,0]];
      return g[0][2];
    }
    // draw?
    if (this.getEmptyCells().length === 0) return "Draw";
    return null;
  }

  getWinningCells() { return this.winningCells; }

  nextRound() {
    this.grid.forEach(row => row.fill(""));
    this.currentPlayer = "X";
    this.winner = null;
    this.winningCells = [];
    this.roundMoves = 0;
    this.roundStart = performance.now();
  }

  resetAll() {
    this.nextRound();
    this.scoreX = 0; this.scoreO = 0; this.scoreD = 0;
  }
}
