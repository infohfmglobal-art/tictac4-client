// board.js
export class Board {
  constructor() { this.reset(); }

  reset() {
    this.grid = [["","",""],["","",""],["","",""]];
    this._win = null;           // "X"|"O"|"Draw"|null
    this.winCellsArr = [];      // [[r,c],...]
  }

  isEmpty(r,c){ return this.grid[r][c] === ""; }
  set(r,c,val){ this.grid[r][c] = val; }
  full(){ return this.emptyCells().length === 0; }

  emptyCells(){
    const res=[];
    for (let r=0;r<3;r++) for (let c=0;c<3;c++)
      if (this.grid[r][c]==="") res.push([r,c]);
    return res;
  }

  checkWin(){
    const g=this.grid;
    const lines=[
      [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
      [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
      [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]],
    ];
    for (const line of lines){
      const [a,b,c]=line;
      const va=g[a[0]][a[1]], vb=g[b[0]][b[1]], vc=g[c[0]][c[1]];
      if (va && va===vb && vb===vc){ this._win=va; this.winCellsArr=line; return va; }
    }
    if (this.full()){ this._win="Draw"; this.winCellsArr=[]; return "Draw"; }
    this._win=null; this.winCellsArr=[]; return null;
  }

  get win(){ return this._win; }
  getWinningCells(){ return this.winCellsArr.slice(); }
}
