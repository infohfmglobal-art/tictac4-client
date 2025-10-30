export class Board {
  constructor(size = 4) {
    this.size = size;
    this.cells = Array.from({ length: size }, () => Array(size).fill(""));
  }

  reset() {
    for (let r = 0; r < this.size; r++) {
      this.cells[r].fill("");
    }
  }

  makeMove(row, col, symbol) {
    if (this.cells[row][col] !== "") return false;
    this.cells[row][col] = symbol;
    return true;
  }

  isFull() {
    return this.cells.every(row => row.every(c => c !== ""));
  }

  /** Returns {winner, line} or {winner:null} */
  checkWinner() {
    const N = this.size;
    // rows / cols
    for (let i = 0; i < N; i++) {
      // row
      if (this.cells[i][0] && this.cells[i].every(c => c === this.cells[i][0])) {
        return { winner: this.cells[i][0], line: Array.from({length:N},(_,c)=>[i,c]) };
      }
      // col
      const col0 = this.cells[0][i];
      if (col0 && Array.from({length:N},(_,r)=>this.cells[r][i]).every(c => c === col0)) {
        return { winner: col0, line: Array.from({length:N},(_,r)=>[r,i]) };
      }
    }
    // diag \
    const d0 = this.cells[0][0];
    if (d0 && Array.from({length:N},(_,i)=>this.cells[i][i]).every(c => c === d0)) {
      return { winner: d0, line: Array.from({length:N},(_,i)=>[i,i]) };
    }
    // diag /
    const d1 = this.cells[0][N-1];
    if (d1 && Array.from({length:N},(_,i)=>this.cells[i][N-1-i]).every(c => c === d1)) {
      return { winner: d1, line: Array.from({length:N},(_,i)=>[i,N-1-i]) };
    }
    return { winner: null };
  }
}
