export class Board {
  constructor(size = 3) {
    this.size = size;
    this.grid = Array.from({ length: size }, () => Array(size).fill(""));
  }

  isEmpty(r, c) { return this.grid[r][c] === ""; }

  makeMove(r, c, sym) {
    if (!this.isEmpty(r, c)) return false;
    this.grid[r][c] = sym;
    return true;
  }

  isFull() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === "") return false;
      }
    }
    return true;
  }

  checkWinner() {
    const n = this.size;
    const g = this.grid;

    // Rows & Cols
    for (let i = 0; i < n; i++) {
      if (g[i][0] && g[i].every(v => v === g[i][0])) return g[i][0];
      const col0 = g[0][i];
      if (col0) {
        let ok = true;
        for (let r = 1; r < n; r++) if (g[r][i] !== col0) { ok = false; break; }
        if (ok) return col0;
      }
    }

    // Diagonal
    const d0 = g[0][0];
    if (d0) {
      let ok = true;
      for (let i = 1; i < n; i++) if (g[i][i] !== d0) { ok = false; break; }
      if (ok) return d0;
    }
    // Anti-diagonal
    const d1 = g[0][n - 1];
    if (d1) {
      let ok = true;
      for (let i = 1; i < n; i++) if (g[i][n - 1 - i] !== d1) { ok = false; break; }
      if (ok) return d1;
    }
    return null;
  }

  resetGrid() {
    for (let r = 0; r < this.size; r++) this.grid[r].fill("");
  }
}
