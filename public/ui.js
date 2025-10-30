export class UI {
  constructor(onCellClick) {
    this.onCellClick = onCellClick;
    this.boardEl = document.getElementById("board");
    this.statusEl = document.getElementById("status");
    this.scoreEl  = document.getElementById("score");
    this.nextBtn  = document.getElementById("nextRound");
    this.resetBtn = document.getElementById("resetAll");
    this.sfxBtn   = document.getElementById("sfxToggle");
    this.themeSel = document.getElementById("themeSel");
    this.clickSfx = document.getElementById("clickSound");
    this.winSfx   = document.getElementById("winSound");

    this.sfxOn = true;

    this.sfxBtn.addEventListener("click", () => {
      this.sfxOn = !this.sfxOn;
      this.sfxBtn.textContent = `SFX: ${this.sfxOn ? "On" : "Off"}`;
    });

    this.themeSel.addEventListener("change", () => {
      document.body.classList.remove("theme-blue","theme-green");
      const v = this.themeSel.value;
      if (v === "blue") document.body.classList.add("theme-blue");
      if (v === "green") document.body.classList.add("theme-green");
    });
  }

  renderBoard(cells) {
    this.boardEl.innerHTML = "";
    for (let r = 0; r < cells.length; r++) {
      for (let c = 0; c < cells.length; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.textContent = cells[r][c];
        if (cells[r][c]) cell.classList.add("filled");
        cell.addEventListener("click", () => this.onCellClick(r, c));
        this.boardEl.appendChild(cell);
      }
    }
  }

  updateBoard(cells) {
    const nodes = this.boardEl.querySelectorAll(".cell");
    for (const el of nodes) {
      const r = +el.dataset.row;
      const c = +el.dataset.col;
      el.textContent = cells[r][c];
      el.classList.toggle("filled", !!cells[r][c]);
    }
  }

  highlightWin(line) {
    if (!line) return;
    for (const [r,c] of line) {
      const q = this.boardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
      if (q) q.classList.add("win");
    }
    if (this.sfxOn) this.winSfx.play().catch(()=>{});
  }

  setStatus(text) {
    this.statusEl.textContent = text;
  }

  setScore(x, o) {
    this.scoreEl.textContent = `Score — X: ${x} | O: ${o}`;
  }

  enableNextRound(enable) {
    this.nextBtn.disabled = !enable;
  }

  clickSnd() {
    if (this.sfxOn) this.clickSfx.play().catch(()=>{});
  }
}
