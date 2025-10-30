import { Board } from "./board.js";

export class Game {
    constructor(size = 4) {
        this.board = new Board(size);
        this.currentPlayer = "X";
        this.isGameOver = false;
        this.winner = null;
    }

    makeMove(row, col) {
        if (this.isGameOver) return false;

        const moved = this.board.makeMove(row, col, this.currentPlayer);
        if (!moved) return false;

        const winner = this.board.checkWinner();
        if (winner) {
            this.isGameOver = true;
            this.winner = winner;
            return true;
        }

        this.togglePlayer();
        return true;
    }

    togglePlayer() {
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    }

    reset() {
        this.board = new Board(this.board.size);
        this.currentPlayer = "X";
        this.isGameOver = false;
        this.winner = null;
    }
}
