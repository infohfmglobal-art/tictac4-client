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
  cpuMove() {
  const diff = this.difficulty.toLowerCase();

  // EASY — random move
  if (diff === "easy") {
    const cells = this.board.emptyCells();
    return cells[Math.floor(Math.random() * cells.length)];
  }

  // MEDIUM — try win/block, otherwise random
  if (diff === "normal") {
    // Win if possible
    let move = this.findBestFor("O");
    if (move) return move;

    // Block player
    move = this.findBestFor("X");
    if (move) return move;

    // Sometimes make mistake (30% random)
    if (Math.random() < 0.3) {
      const cells = this.board.emptyCells();
      return cells[Math.floor(Math.random() * cells.length)];
    }

    // Smart choice: center → corners → sides
    if (this.board.isEmpty(1,1)) return [1,1];
    const corners = [[0,0],[0,2],[2,0],[2,2]].filter(([r,c])=>this.board.isEmpty(r,c));
    if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
    const sides = [[0,1],[1,0],[1,2],[2,1]].filter(([r,c])=>this.board.isEmpty(r,c));
    return sides[Math.floor(Math.random()*sides.length)];
  }

  // HARD — MiniMax (unbeatable)
  return this.miniMaxMove();
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
