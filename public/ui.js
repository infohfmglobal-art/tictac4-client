export class UI {
    constructor(onCellClick) {
        this.onCellClick = onCellClick;
        this.boardEl = document.getElementById("board");
        this.statusEl = document.getElementById("status");

        this.renderBoard();
    }

    renderBoard() {
        this.boardEl.innerHTML = "";
        for (let r = 0; r < 4; r++) {
            const row = document.createElement("div");
            row.classList.add("row");
            for (let c = 0; c < 4; c++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener("click", () => this.onCellClick(r, c));
                row.appendChild(cell);
            }
            this.boardEl.appendChild(row);
        }
    }

    updateBoard(cells) {
        const allCells = this.boardEl.querySelectorAll(".cell");
        allCells.forEach(cell => {
            const r = cell.dataset.row;
            const c = cell.dataset.col;
            cell.textContent = cells[r][c];
        });
    }

    updateStatus(text) {
        this.statusEl.textContent = text;
    }
}
