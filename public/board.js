// board.js
export class Board{
  constructor(){ this.reset(); }
  reset(){
    this.grid = [["","",""],["","",""],["","",""]];
    this.winCells = [];
  }
  isEmpty(r,c){ return this.grid[r][c] === ""; }
  set(r,c,val){ this.grid[r][c] = val; }
  emptyCells(){
    const out=[];
    for(let r=0;r<3;r++)for(let c=0;c<3;c++) if(this.isEmpty(r,c)) out.push([r,c]);
    return out;
  }
  full(){ return this.emptyCells().length === 0; }

  checkWin(){
    const G=this.grid; this.winCells=[];
    const lines=[
      [[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]],
      [[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]],
      [[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]],
    ];
    for(const line of lines){
      const [a,b,c]=line;
      const va=G[a[0]][a[1]], vb=G[b[0]][b[1]], vc=G[c[0]][c[1]];
      if(va && va===vb && vb===vc){ this.winCells=line; return va; }
    }
    if(this.full()) return "Draw";
    return null;
  }
}
