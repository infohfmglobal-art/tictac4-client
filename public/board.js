// board.js
export class Board {
  constructor() {
    this.grid = [["","",""],["","",""],["","",""]];
    this.winCells = [];
  }
  reset() {
    this.grid = [["","",""],["","",""],["","",""]];
    this.winCells = [];
  }
  isEmpty(r,c){ return this.grid[r][c] === ""; }
  set(r,c,v){ this.grid[r][c] = v; }
  emptyCells(){
    const out=[];
    for(let r=0;r<3;r++)for(let c=0;c<3;c++) if(this.grid[r][c]==="") out.push([r,c]);
    return out;
  }
  checkWin(){
    const g=this.grid, L=[[0,0],[0,1],[0,2]];
    const lines=[
      [[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]],
      [[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]],
      [[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]]
    ];
    for(const line of lines){
      const [a,b,c]=line.map(([r,c])=>g[r][c]);
      if(a && a===b && b===c) { this.winCells=line; return a; }
    }
    if (this.emptyCells().length===0) { this.winCells=[]; return "Draw"; }
    return null;
  }
}
