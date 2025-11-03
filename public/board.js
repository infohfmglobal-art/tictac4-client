// board.js
export class Board{
  constructor(){ this.reset(); }
  reset(){ this.grid=[["","",""],["","",""],["","",""]]; this.winCells=[]; }
  isEmpty(r,c){ return this.grid[r][c]===""; }
  set(r,c,v){ this.grid[r][c]=v; }
  full(){ return this.emptyCells().length===0; }
  emptyCells(){
    const out=[]; for(let r=0;r<3;r++)for(let c=0;c<3;c++) if(!this.grid[r][c]) out.push([r,c]); return out;
  }
  checkWin(){
    const g=this.grid, lines=[
      [[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]],
      [[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]],
      [[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]],
    ];
    for(const L of lines){
      const [a,b,c]=L, va=g[a[0]][a[1]], vb=g[b[0]][b[1]], vc=g[c[0]][c[1]];
      if(va && va===vb && vb===vc){ this.winCells=L; return va; }
    }
    this.winCells=[];
    return this.full() ? "Draw" : null;
  }
}
