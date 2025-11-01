export class Game {
  constructor() {
    this.board = {
      cells: Array.from({ length: 3 }, () => Array(3).fill(""))
    };

    this.score = { X: 0, O: 0 };
    this.turn = "X";
    this.winner = "";
    this.sfxOn = true;
  }

  move(r, c) {
    if (this.board.cells[r][c] || this.winner) return false;

    this.board.cells[r][c] = this.turn;
    this.checkWinner();

    if (!this.winner) {
      this.turn = this.turn === "X" ? "O" : "X";
    }

    return true;
  }

  checkWinner() {
    const b = this.board.cells;

    const lines = [
      // Rows
      [b[0][0], b[0][1], b[0][2]],
      [b[1][0], b[1][1], b[1][2]],
      [b[2][0], b[2][1], b[2][2]],
      // Columns
      [b[0][0], b[1][0], b[2][0]],
      [b[0][1], b[1][1], b[2][1]],
      [b[0][2], b[1][2], b[2][2]],
      // Diagonals
      [b[0][0], b[1][1], b[2][2]],
      [b[0][2], b[1][1], b[2][0]]
    ];

    for (let line of lines) {
      if (line[0] && line[0] === line[1] && line[1] === line[2]) {
        this.winner = line[0];
        this.score[this.winner]++;
        return;
      }
    }
  }

  nextRound() {
    this.board.cells = Array.from({ length: 3 }, () => Array(3).fill(""));
    this.winner = "";
    this.turn = "X";
  }

  resetAll() {
    this.score = { X: 0, O: 0 };
    this.nextRound();
  }

  toggleSfx() {
    this.sfxOn = !this.sfxOn;
  }
}
