// board.js
export class Board {
  constructor() { this.reset(); }
  reset() {
    this.grid = [["","",""],["","",""],["","",""]];
    this.winCells = [];
  }
  isEmpty(r,c){ return this.grid[r][c] === ""; }
  set(r,c,v){ this.grid[r][c] = v; }
  full(){ return this.grid.flat().every(v => v); }
  emptyCells(){
    const cells = [];
    for (let r=0;r<3;r++) for (let c=0;c<3;c++) if (this.isEmpty(r,c)) cells.push([r,c]);
    return cells;
  }
  checkWin(){
    const L = this.grid;
    const lines = [
      [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
      [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
      [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]],
    ];
    for (const line of lines){
      const [a,b,c] = line;
      const v = L[a[0]][a[1]];
      if (v && v === L[b[0]][b[1]] && v === L[c[0]][c[1]]) {
        this.winCells = line;
        return v; // "X" or "O"
      }
    }
    this.winCells = [];
    return this.full() ? "Draw" : null;
  }
}
