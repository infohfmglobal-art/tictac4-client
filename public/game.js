// game.js
import { Board } from "./board.js";

export class Game {
  constructor() {
    this.board = new Board();
    this.turn = "X";
    this.winner = null;

    // scores
    this.scoreX = 0; this.scoreO = 0; this.scoreD = 0;

    // settings (home screen can change these)
    this.mode = "Player vs CPU";   // or "Player vs Player"
    this.difficulty = "Easy";      // Easy / Normal / Hard
    this.skin = "Runes";           // Runes / Classic X / O / Fruit
    this.sfxOn = true;

    this.roundStart = performance.now();
  }

  resetAll(){ this.board.reset(); this.turn="X"; this.winner=null; this.roundStart=performance.now(); }
  nextRound(){ this.resetAll(); }
  toggleSfx(){ this.sfxOn = !this.sfxOn; }
  getWinningCells(){ return this.board.winCells.slice(); }

  /** Player/CPU move – returns true if placed */
  move(r,c){
    if (this.winner || !this.board.isEmpty(r,c)) return false;
    this.board.set(r,c,this.turn);
    this._finishTurn();
    return true;
  }

  /** Called after any placement */
  _finishTurn(){
    const res = this.board.checkWin();
    if (res){
      this.winner = res;
      if (res==="X") this.scoreX++; else if (res==="O") this.scoreO++; else this.scoreD++;
      return;
    }
    this.turn = (this.turn === "X") ? "O" : "X";
  }

  /** Optional helper if you want app.js to trigger CPU explicitly */
  performCpuMove(){
    if (this.mode !== "Player vs CPU" || this.turn !== "O" || this.winner) return false;
    const [r,c] = this.cpuMove();
    this.board.set(r,c,"O");
    this._finishTurn();
    return true;
  }

  // ===== CPU AI =====
  cpuMove(){
    // 1) Win if possible
    let mv = this._findBestFor("O"); if (mv) return mv;
    // 2) Block if needed
    mv = this._findBestFor("X"); if (mv) return mv;
    // 3) Heuristic by difficulty
    if (this.board.isEmpty(1,1)) return [1,1];
    const corners = [[0,0],[0,2],[2,0],[2,2]].filter(([r,c])=>this.board.isEmpty(r,c));
    const sides   = [[0,1],[1,0],[1,2],[2,1]].filter(([r,c])=>this.board.isEmpty(r,c));
    const empties = this.board.emptyCells();

    const d = this.difficulty.toLowerCase();
    if (d === "hard"){
      if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
      if (sides.length)   return sides[Math.floor(Math.random()*sides.length)];
      return empties[Math.floor(Math.random()*empties.length)];
    }
    if (d === "normal"){
      if (Math.random() < 0.7 && corners.length) return corners[Math.floor(Math.random()*corners.length)];
      const pool = corners.concat(sides);
      if (pool.length) return pool[Math.floor(Math.random()*pool.length)];
      return empties[Math.floor(Math.random()*empties.length)];
    }
    // easy
    return empties[Math.floor(Math.random()*empties.length)];
  }

  _findBestFor(p){
    for (const [r,c] of this.board.emptyCells()){
      this.board.set(r,c,p);
      const w = this.board.checkWin();
      this.board.set(r,c,"");
      if (w === p) return [r,c];
    }
    return null;
  }
}
