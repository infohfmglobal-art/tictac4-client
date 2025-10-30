export class Board {
  constructor(size = 3) {
    this.size = size;
    this.cells = Array.from({ length: size }, () => Array(size).fill(""));
  }

  makeMove(r, c, sym) {
    if (this.cells[r][c] !== "") return false;
    this.cells[r][c] = sym;
    return true;
  }

  checkWinner() {
    const s = this.size;
    const c = this.cells;

    for (let i = 0; i < s; i++) {
      if (c[i][0] && c[i].every(v => v === c[i][0])) return c[i][0];
      if (c[0][i] && c.map(r => r[i]).every(v => v === c[0][i])) return c[0][i];
    }

    if (c[0][0] && c.every((r,i)=>r[i]===c[0][0])) return c[0][0];
    if (c[0][s-1] && c.every((r,i)=>r[s-1-i]===c[0][s-1])) return c[0][s-1];

    return null;
  }
}
