export default class UI {
  constructor(onCellClick) {
    this.onCellClick = onCellClick;
    this.boardEl  = document.getElementById("board");
    this.statusEl = document.getElementById("status");
    this.click    = document.getElementById("clickSound");

    const themeSelect = document.getElementById("themeSelect");
    if (themeSelect) {
      themeSelect.addEventListener("change", (e) => {
        document.body.classList.remove("theme-gold","theme-ocean","theme-forest");
        document.body.classList.add(e.target.value);
      });
    }
  }

  renderBoard(size = 4) {
    this.boardEl.innerHTML = "";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener("click", () => this.onCellClick(r, c));
        this.boardEl.appendChild(cell);
      }
    }
  }

  updateBoard(cells) {
    const all = this.boardEl.querySelectorAll(".cell");
    all.forEach((cell) => {
      const r = +cell.dataset.row, c = +cell.dataset.col;
      cell.textContent = cells[r][c] || "";
      cell.classList.toggle("taken", !!cells[r][c]);
    });
  }

  updateStatus(text) { this.statusEl.textContent = text; }
  playClick() { try { this.click.currentTime = 0; this.click.play(); } catch(_){} }
}
