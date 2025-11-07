export class Game {
  constructor(){
    this.mode = 'Player vs CPU';       // 'Player vs Player'
    this.difficulty = 'Easy';          // 'Normal' | 'Hard'
    this.skin = 'Runes';
    this.sfxOn = true;

    this.scoreX = 0; this.scoreO = 0; this.scoreD = 0;

    this.resetAll();
  }

  resetAll(){
    this.board = {
      grid: [['','',''],['','',''],['','','']],
      clone: () => JSON.parse(JSON.stringify(this.board)),
      emptyCells: () => {
        const cells=[];
        for(let r=0;r<3;r++) for(let c=0;c<3;c++) if(!this.board.grid[r][c]) cells.push([r,c]);
        return cells;
      }
    };
    this.turn = 'X';
    this.winner = '';
    this._winCells = [];
    this.roundStart = performance.now();
  }

  nextRound(){
    this.resetAll();
  }

  toggleSfx(){ this.sfxOn = !this.sfxOn; }

  move(r,c,playerAction=false){
    if (this.winner) return false;
    if (this.board.grid[r][c]) return false;
    this.board.grid[r][c] = this.turn;

    this._evaluateAfterMove();

    if (this.winner) return true;

    // Switch turn
    this.turn = (this.turn==='X') ? 'O' : 'X';

    // CPU move
    if (this.mode==='Player vs CPU' && this.turn==='O' && playerAction){
      return 'cpuPending';
    }
    return true;
  }

  performCpuMove(){
    if (this.winner || this.turn!=='O') return;

    const [r,c] = this._bestCpuMove();
    if (r!=null) {
      this.board.grid[r][c] = 'O';
    }
    this._evaluateAfterMove();
    if (!this.winner) this.turn='X';
  }

  _evaluateAfterMove(){
    const w = this._checkWin('X') || this._checkWin('O');
    if (w){
      this.winner = w;
      if (w==='X') this.scoreX++; else this.scoreO++;
      return;
    }
    if (this.board.emptyCells().length===0){
      this.winner = 'Draw'; this.scoreD++;
    }
  }

  getWinningCells(){ return this._winCells || []; }

  _checkWin(p){
    const g=this.board.grid;
    const lines=[
      [[0,0],[0,1],[0,2]],
      [[1,0],[1,1],[1,2]],
      [[2,0],[2,1],[2,2]],
      [[0,0],[1,0],[2,0]],
      [[0,1],[1,1],[2,1]],
      [[0,2],[1,2],[2,2]],
      [[0,0],[1,1],[2,2]],
      [[0,2],[1,1],[2,0]],
    ];
    for(const line of lines){
      const [a,b,c]=line;
      if (g[a[0]][a[1]]===p && g[b[0]][b[1]]===p && g[c[0]][c[1]]===p){
        this._winCells = line;
        return p;
      }
    }
    return '';
  }

  emptyCells(){ return this.board.emptyCells(); }

  // Simple AI: try win, then block, else center/corners/random.
  _bestCpuMove(){
    const empties = this.board.emptyCells();
    if (!empties.length) return [null, null];
    const tryPlace = (grid,r,c,mark)=>{ const clone=grid.map(row=>row.slice()); clone[r][c]=mark; return clone; };
    const check = (grid,mark)=>{
      const lines=[
        [[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]],
        [[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]],
        [[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]]
      ];
      for(const L of lines){
        const [a,b,c]=L;
        if (grid[a[0]][a[1]]===mark && grid[b[0]][b[1]]===mark && grid[c[0]][c[1]]===mark) return true;
      }
      return false;
    };

    // Difficulty weight
    const level = this.difficulty; // Easy/Normal/Hard

    // 1) win if possible
    for(const [r,c] of empties){
      const g2 = tryPlace(this.board.grid,r,c,'O');
      if (check(g2,'O')) return [r,c];
    }
    // 2) block X
    if (level!=='Easy'){
      for(const [r,c] of empties){
        const g2 = tryPlace(this.board.grid,r,c,'X');
        if (check(g2,'X')) return [r,c];
      }
    }
    // 3) center
    if (this.board.grid[1][1]==='') return [1,1];

    // 4) corners first (Normal/Hard)
    if (level==='Hard' || level==='Normal'){
      const corners=[[0,0],[0,2],[2,0],[2,2]].filter(([r,c])=>!this.board.grid[r][c]);
      if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
    }

    // 5) random
    return empties[Math.floor(Math.random()*empties.length)];
  }
}
