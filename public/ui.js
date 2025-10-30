export class UI {
  constructor(onClick) {
    this.onClick = onClick;
    this.board = document.getElementById("board");
    this.score = document.getElementById("score");
    this.msg = document.getElementById("msg");

    this.clickSfx = new Audio("click.mp3");
    this.winSfx = new Audio("win.mp3");

    this.sfxOn = true;
    this.renderBoard();
  }

  renderBoard() {
    this.board.innerHTML = "";
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        let div = document.createElement("div");
        div.className = "cell";
        div.dataset.r = r;
        div.dataset.c = c;
        div.onclick = () => this.onClick(r, c);
        this.board.appendChild(div);
      }
    }
  }

  updateBoard(cells) {
    document.querySelectorAll(".cell").forEach(cell => {
      const r = cell.dataset.r, c = cell.dataset.c;
      cell.textContent = cells[r][c];
    });
  }

  playClick() {
    if (!this.sfxOn) return;
    this.clickSfx.cloneNode().play();
  }

  playWin() {
    if (!this.sfxOn) return;
    this.winSfx.cloneNode().play();
  }
}
