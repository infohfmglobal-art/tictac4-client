// game.js
import { Board } from "./board.js";

export class Game{
  constructor(){
    this.board = new Board();
    this.turn = "X";
    this.winner = null;

    this.scoreX=0; this.scoreO=0; this.scoreD=0;

    this.mode = "Player vs CPU"; // or "Player vs Player"
    this.difficulty = "Easy";    // Easy / Normal / Hard
    this.skin = "Runes";
    this.theme = "Rune";
    this.sfxOn = true;

    this.roundStart = performance.now();
  }

  resetAll(){ this.board.reset(); this.turn="X"; this.winner=null; this.roundStart=performance.now(); }
  nextRound(){ this.resetAll(); }
  toggleSfx(){ this.sfxOn = !this.sfxOn; }

  /** move from UI. If fromPlayer===true we return "cpuPending" when CPU should move next */
  move(r,c,fromPlayer=false){
    if(this.winner || !this.board.isEmpty(r,c)) return false;
    this.board.set(r,c,this.turn);
    this._finishTurn();
    if(fromPlayer && this.mode==="Player vs CPU" && !this.winner && this.turn==="O"){
      return "cpuPending";
    }
    return true;
  }

  /** actually perform CPU move (used by UI after delay) */
  performCpuMove(){
    if(this.mode!=="Player vs CPU" || this.turn!=="O" || this.winner) return;
    const [r,c] = this.cpuMove();
    this.board.set(r,c,"O");
    this._finishTurn();
  }

  _finishTurn(){
    const res=this.board.checkWin();
    if(res){
      this.winner=res;
      if(res==="X") this.scoreX++; else if(res==="O") this.scoreO++; else this.scoreD++;
      return;
    }
    this.turn = (this.turn==="X")?"O":"X";
  }

  getWinningCells(){ return this.board.winCells.slice(); }

  // ===== AI =====
  cpuMove(){
    // 1) win if possible
    let mv=this._bestFor("O"); if(mv) return mv;
    // 2) block player
    mv=this._bestFor("X"); if(mv) return mv;
    // 3) heuristics by difficulty
    const empties=this.board.emptyCells();
    if(this.difficulty.toLowerCase()==="easy"){
      return empties[Math.floor(Math.random()*empties.length)];
    }
    // prefer center -> corners -> sides
    if(this.board.isEmpty(1,1)) return [1,1];
    const corners=[[0,0],[0,2],[2,0],[2,2]].filter(([r,c])=>this.board.isEmpty(r,c));
    const sides  =[[0,1],[1,0],[1,2],[2,1]].filter(([r,c])=>this.board.isEmpty(r,c));

    if(this.difficulty.toLowerCase()==="normal"){
      if(Math.random()<0.7 && corners.length) return corners[Math.floor(Math.random()*corners.length)];
      const pool=corners.concat(sides); return pool[Math.floor(Math.random()*pool.length)];
    }
    // hard
    if(corners.length) return corners[Math.floor(Math.random()*corners.length)];
    if(sides.length) return sides[Math.floor(Math.random()*sides.length)];
    return empties[Math.floor(Math.random()*empties.length)];
  }

  _bestFor(player){
    for(const [r,c] of this.board.emptyCells()){
      this.board.set(r,c,player);
      const w=this.board.checkWin();
      this.board.set(r,c,"");
      if(w===player) return [r,c];
    }
    return null;
  }
}
