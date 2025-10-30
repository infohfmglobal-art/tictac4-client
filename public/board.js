export class Board {
    constructor(size = 4) {
        this.size = size;
        this.cells = Array.from({ length: size }, () => Array(size).fill(""));
    }

    makeMove(row, col, symbol) {
        if (this.cells[row][col] !== "") return false;
        this.cells[row][col] = symbol;
        return true;
    }

    checkWinner() {
        const lines = [];

        // Rows & Columns
        for (let i = 0; i < this.size; i++) {
            lines.push(this.cells[i]); // row
            lines.push(this.cells.map(r => r[i])); // column
        }

        // Diagonals
        lines.push(this.cells.map((r, i) => r[i]));
        lines.push(this.cells.map((r, i) => r[this.size - 1 - i]));

        for (let line of lines) {
            if (line.every(c => c === "X")) return "X";
            if (line.every(c => c === "O")) return "O";
        }

        return null;
    }
}
