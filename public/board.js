export class Board {
  constructor(size = 3) {
    this.size = size;
    this.grid = Array.from({ length: size }, () => Array(size).fill(""));
    this.winningCells = []; // ✅ Store winning cells
  }

  isEmpty(r, c) { 
    return this.grid[r][c] === ""; 
  }

  makeMove(r, c, sym) {
    if (!this.isEmpty(r, c)) return false;
    this.grid[r][c] = sym;
    return true;
  }

  isFull() {
    return this.grid.every(row => row.every(cell => cell !== ""));
  }

  checkWinner() {
    const n = this.size;
    const g = this.grid;
    this.winningCells = []; // reset

    // ✅ Check rows
    for (let r = 0; r < n; r++) {
      if (g[r][0] && g[r].every(v => v === g[r][0])) {
        this.winningCells = [[r,0], [r,1], [r,2]];
        return g[r][0];
      }
    }

    // ✅ Check columns
    for (let c = 0; c < n; c++) {
      const val = g[0][c];
      if (val && g.every(row => row[c] === val)) {
        this.winningCells = [[0,c], [1,c], [2,c]];
        return val;
      }
    }

    // ✅ Diagonal
    if (g[0][0] && g[0][0] === g[1][1] && g[0][0] === g[2][2]) {
      this.winningCells = [[0,0], [1,1], [2,2]];
      return g[0][0];
    }

    // ✅ Anti-diagonal
    if (g[0][2] && g[0][2] === g[1][1] && g[0][2] === g[2][0]) {
      this.winningCells = [[0,2], [1,1], [2,0]];
      return g[0][2];
    }

    // ✅ Draw
    if (this.isFull()) return "Draw";

    return null;
  }

  getWinningCells() {
    return this.winningCells;
  }

  resetGrid() {
    for (let r = 0; r < this.size; r++) this.grid[r].fill("");
    this.winningCells = [];
  }
}
