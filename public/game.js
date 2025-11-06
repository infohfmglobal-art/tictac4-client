// game.js
import { Board } from "./board.js";

export class Game {
  constructor(){
    this.board = new Board();
    this.turn = "X";
    this.winner = null;

    this.scoreX = 0;
    this.scoreO = 0;
    this.scoreD = 0;

    // settings
    this.mode = "Player vs CPU";     // or "Player vs Player"
    this.difficulty = "Easy";        // Easy / Normal / Hard
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

  nextRound(){
    this.resetAll();
  }

  toggleSfx(){
    this.sfxOn = !this.sfxOn;
  }

  /**
   Player move API
   returns:
   false → invalid move
   "ok" → move done (PvP or CPU turn already processed)
   "cpuPending" → UI must trigger CPU with delay
  */
  move(r, c, fromPlayer = false){
    if (this.winner || !this.board.isEmpty(r, c)) return false;

    this.board.set(r, c, this.turn);
    this._updateWinner();

    // switch turn if game not over
    if (!this.winner){
      this.turn = (this.turn === "X") ? "O" : "X";

      // Player vs CPU — tell UI to wait and trigger CPU move
      if (this.mode === "Player vs CPU" && this.turn === "O" && fromPlayer){
        return "cpuPending";
      }
    }

    return "ok";
  }

  /** Called by UI after small delay */
  performCpuMove(){
    if (this.winner || this.mode !== "Player vs CPU" || this.turn !== "O") return;

    const [r,c] = this._cpuPick();
    this.board.set(r, c, "O");
    this._updateWinner();

    if (!this.winner){
      this.turn = "X";
    }
  }

  /** Update score & winner */
  _updateWinner(){
    const w = this.board.checkWin();
    if (!w) return;

    this.winner = w;
    if (w === "X") this.scoreX++;
    else if (w === "O") this.scoreO++;
    else this.scoreD++;
  }

  /** UI reads winning cells for highlight */
  getWinningCells(){
    return this.board.getWinningCells();
  }

  // ---------------- CPU logic ----------------
  _cpuPick(){
    // 1) Win if possible
    let m = this._finishingMove("O");
    if (m) return m;

    // 2) Block opponent
    m = this._finishingMove("X");
    if (m) return m;

    const empties = this.board.emptyCells();

    // EASY → totally random
    if (this.difficulty === "Easy"){
      return empties[Math.floor(Math.random()*empties.length)];
    }

    // Try center first
    if (this.board.isEmpty(1,1)) return [1,1];

    const corners = [[0,0],[0,2],[2,0],[2,2]].filter(([r,c]) => this.board.isEmpty(r,c));
    const sides   = [[0,1],[1,0],[1,2],[2,1]].filter(([r,c]) => this.board.isEmpty(r,c));

    if (this.difficulty === "Normal"){
      if (Math.random() < 0.7 && corners.length){
        return corners[Math.floor(Math.random()*corners.length)];
      }
      const pool = corners.concat(sides);
      return pool[Math.floor(Math.random()*pool.length)];
    }

    // HARD → corners > sides > random
    if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
    if (sides.length)   return sides[Math.floor(Math.random()*sides.length)];

    return empties[Math.floor(Math.random()*empties.length)];
  }

  /** Simulate a move to check instant win/block */
  _finishingMove(player){
    for (const [r,c] of this.board.emptyCells()){
      this.board.set(r,c,player);
      const w = this.board.checkWin();
      this.board.set(r,c,"");
      if (w === player) return [r,c];
    }
    return null;
  }
}
