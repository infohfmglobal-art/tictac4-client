// game.js
import { Board } from "./board.js";

export class Game{
  constructor(){
    this.board = new Board();
    this.turn = "X";
    this.winner = null;

    // Scores
    this.scoreX=0; this.scoreO=0; this.scoreD=0;

    // Settings (updated from Home)
    this.mode = "Player vs CPU";
    this.difficulty = "Easy";
    this.skin = "Runes";
    this.sfxOn = true;

    // Timing for leaderboard
    this.roundStart = performance.now();
  }

  resetAll(){
    this.board.reset();
    this.turn="X";
    this.winner=null;
    this.roundStart = performance.now();
  }
  nextRound(){ this.resetAll(); }
  toggleSfx(){ this.sfxOn=!this.sfxOn; }

  /** UI calls this; returns:
   *  false -> move rejected
   *  "ok"   -> player moved; game continues / or finished
   *  "cpuPending" -> player moved and CPU should move next (PvC)
   */
  move(r,c,fromPlayer=false){
    if(this.winner || !this.board.isEmpty(r,c)) return false;

    this.board.set(r,c,this.turn);
    this._afterPlaced();

    if(this.winner) return "ok";

    // Switch turn
    this.turn = (this.turn==="X") ? "O" : "X";

    // If PvC and CPU's turn after a **player** move, tell UI to schedule CPU
    if(fromPlayer && this.mode==="Player vs CPU" && this.turn==="O"){
      return "cpuPending";
    }

    return "ok";
  }

  /** Used by UI after a timeout to actually perform the CPU move */
  performCpuMove(){
    if(this.mode!=="Player vs CPU" || this.turn!=="O" || this.winner) return;
    const [r,c] = this.cpuMove();
    this.board.set(r,c,"O");
    this._afterPlaced();
    if(!this.winner) this.turn="X";
  }

  _afterPlaced(){
    const who = this.board.checkWin();
    if(!who) return;
    this.winner = who; // "X" | "O" | "Draw"
    if(who==="X") this.scoreX++;
    else if(who==="O") this.scoreO++;
    else this.scoreD++;
  }

  getWinningCells(){ return this.board.winCells.slice(); }

  // ===== CPU AI =====
  cpuMove(){
    // 1) win if possible
    let mv = this._tactical("O"); if(mv) return mv;
    // 2) block X if needed
    mv = this._tactical("X"); if(mv) return mv;
    // 3) pick by difficulty
    const empties = this.board.emptyCells();
    const center = this.board.isEmpty(1,1) ? [1,1] : null;
    const corners = [[0,0],[0,2],[2,0],[2,2]].filter(([r,c])=>this.board.isEmpty(r,c));
    const sides   = [[0,1],[1,0],[1,2],[2,1]].filter(([r,c])=>this.board.isEmpty(r,c));

    const diff = this.difficulty.toLowerCase();
    if(diff==="hard"){
      if(center) return center;
      if(corners.length) return corners[Math.floor(Math.random()*corners.length)];
      return empties[Math.floor(Math.random()*empties.length)];
    }
    if(diff==="normal"){
      if(center && Math.random()<0.8) return center;
      const pool = (Math.random()<0.7 ? corners.concat(sides) : empties);
      return pool[Math.floor(Math.random()*pool.length)];
    }
    // easy
    return empties[Math.floor(Math.random()*empties.length)];
  }

  _tactical(player){
    for(const [r,c] of this.board.emptyCells()){
      this.board.set(r,c,player);
      const w=this.board.checkWin();
      this.board.set(r,c,"");
      if(w===player) return [r,c];
    }
    return null;
  }
}
