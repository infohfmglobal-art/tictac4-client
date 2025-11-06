// game.js
import { Board } from "./board.js";

export class Game {
  constructor(){
    this.board = new Board();
    this.turn = "X";
    this.winner = null;

    this.scoreX=0; this.scoreO=0; this.scoreD=0;

    this.mode = "Player vs CPU";       // or "Player vs Player"
    this.difficulty = "Easy";          // Easy / Normal / Hard
    this.skin = "Runes";
    this.theme = "Rune";
    this.sfxOn = true;

    this.roundStart = performance.now();
  }

  resetAll(){
    this.board.reset();
    this.turn = "X";
    this.winner = null;
    this.roundStart = performance.now();
  }
  nextRound(){ this.resetAll(); }
  toggleSfx(){ this.sfxOn = !this.sfxOn; }

  /** Player click -> returns:
   *  false (invalid), "ok" (PvP), or "cpuPending" (PvC and CPU must move)
   */
  move(r,c, fromPlayer=false){
    if (this.winner || !this.board.isEmpty(r,c)) return false;

    // place current player's mark
    this.board.set(r,c,this.turn);
    this._updateWinner();

    if (!this.winner){
      this.turn = (this.turn==="X") ? "O" : "X";

      if (this.mode==="Player vs CPU" && this.turn==="O" && fromPlayer){
        // Let UI schedule CPU after small delay
        return "cpuPending";
      }
    }
    return "ok";
  }

  performCpuMove(){
    if (this.winner || this.mode!=="Player vs CPU" || this.turn!=="O") return;

    const [r,c] = this._cpuPick();
    this.board.set(r,c,"O");
    this._updateWinner();
    if (!this.winner) this.turn = "X";
  }

  _updateWinner(){
    const w = this.board.checkWin();
    if (!w) return;
    this.winner = w;
    if (w==="X") this.scoreX++;
    else if (w==="O") this.scoreO++;
    else this.scoreD++;
  }

  getWinningCells(){ return this.board.getWinningCells(); }

  // ---------- CPU ----------
  _cpuPick(){
    // 1) Win if possible
    let m = this._finishingMove("O"); if (m) return m;
    // 2) Block player
    m = this._finishingMove("X"); if (m) return m;

    // 3) Heuristics by difficulty
    const empties = this.board.emptyCells();
    if (this.difficulty==="Easy"){
      return empties[Math.floor(Math.random()*empties.length)];
    }

    // prefer center, then corners, then sides
    if (this.board.isEmpty(1,1)) return [1,1];
    const corners = [[0,0],[0,2],[2,0],[2,2]].filter(([r,c])=>this.board.isEmpty(r,c));
    const sides   = [[0,1],[1,0],[1,2],[2,1]].filter(([r,c])=>this.board.isEmpty(r,c));

    if (this.difficulty==="Normal"){
      if (Math.random()<0.7 && corners.length) return corners[Math.floor(Math.random()*corners.length)];
      const pool = corners.concat(sides);
      return pool[Math.floor(Math.random()*pool.length)];
    }

    // Hard
    if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
    if (sides.length)   return sides[Math.floor(Math.random()*sides.length)];
    return empties[Math.floor(Math.random()*empties.length)];
  }

  _finishingMove(player){
    for (const [r,c] of this.board.emptyCells()){
      this.board.set(r,c,player);
      const w = this.board.checkWin();
      this.board.set(r,c,"");
      if (w===player) return [r,c];
    }
    return null;
  }
}
