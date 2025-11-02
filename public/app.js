import { Game } from "./game.js";
import { triggerRuneBurst } from "./runes.js";

/* ================== DOM ================== */
const home      = document.getElementById("home");
const gameScr   = document.getElementById("game");

const modeSelect       = document.getElementById("modeSelect");
const difficultySelect = document.getElementById("difficultySelect");
const skinSelect       = document.getElementById("skinSelect");
const themeSelect      = document.getElementById("themeSelect");
const playBtn          = document.getElementById("playBtn");
const installBtn       = document.getElementById("installBtn");
const leaderboardEl    = document.getElementById("leaderboard");

const modeLabel  = document.getElementById("modeLabel");
const diffLabel  = document.getElementById("diffLabel");
const skinLabel  = document.getElementById("skinLabel");

const boardElement = document.getElementById("board");
const scoreText    = document.getElementById("score");
const msgDiv       = document.getElementById("msg");
const winnerText   = document.getElementById("winnerText");

const homeBtn      = document.getElementById("homeBtn");
const nextBtn      = document.getElementById("nextBtn");
const resetBtn     = document.getElementById("resetBtn");
const sfxBtn       = document.getElementById("sfxBtn");

/* ================== STATE ================== */
let vsCPU = true;
let difficulty = "medium"; // easy | medium | hard
let skin = "runes";        // runes | classic | fruit
let game = null;

const clickSound = new Audio("./sound/click.mp3");
const winSound   = new Audio("./sound/win.mp3");
const loseSound  = new Audio("./sound/lose.mp3");

/* ================== UTILS ================== */
function playSFX(snd) {
  if (!game?.sfxOn) return;
  try { snd.currentTime = 0; snd.play(); } catch {}
}

function setThemeClass() {
  const v = themeSelect.value.toLowerCase();
  document.body.className = `theme-${v}`;
}

function symbolFor(val) {
  if (skin === "classic") return val;                 // "X" / "O"
  if (skin === "fruit")   return val === "X" ? "🍎" : "🍊";
  return val === "X" ? "🐉" : "🕊️";                    // runes
}

function saveSettings() {
  localStorage.setItem("runexo.settings", JSON.stringify({vsCPU, difficulty, skin, theme: themeSelect.value}));
}
function loadSettings() {
  const raw = localStorage.getItem("runexo.settings");
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    vsCPU = !!s.vsCPU;
    difficulty = s.difficulty || "medium";
    skin = s.skin || "runes";
    if (s.theme) themeSelect.value = s.theme;
    modeSelect.value = vsCPU ? "pvc" : "pvp";
    difficultySelect.value = difficulty;
    skinSelect.value = skin;
  } catch {}
}

/* ================== LEADERBOARD ================== */
function getBoard() {
  const raw = localStorage.getItem("runexo.leaderboard");
  return raw ? JSON.parse(raw) : [];
}
function setBoard(arr) {
  localStorage.setItem("runexo.leaderboard", JSON.stringify(arr));
}
function addLeaderboardEntry(ms, moves, diff, skinUsed) {
  // Only record human (X) wins vs CPU
  const list = getBoard();
  list.push({ timeMs: ms, moves, diff, skin: skinUsed, date: Date.now() });
  list.sort((a,b)=> a.timeMs - b.timeMs);
  setBoard(list.slice(0,10));
  renderLeaderboard();
}
function renderLeaderboard() {
  const list = getBoard();
  leaderboardEl.innerHTML = "";
  if (!list.length) {
    leaderboardEl.innerHTML = `<li>No records yet. Beat the CPU fast!</li>`;
    return;
  }
  for (const r of list) {
    const li = document.createElement("li");
    const sec = (r.timeMs/1000).toFixed(2);
    li.textContent = `${sec}s • ${r.moves} moves • ${r.diff} • ${r.skin}`;
    leaderboardEl.appendChild(li);
  }
}

/* ================== GAME RENDER ================== */
function renderBoard() {
  boardElement.innerHTML = "";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.r = r; cell.dataset.c = c;
      cell.addEventListener("click", () => handleMove(r, c));
      boardElement.appendChild(cell);
    }
  }
  updateBoard();
}

function updateBoard() {
  const cells = boardElement.children;
  for (let i = 0; i < cells.length; i++) {
    const r = Math.floor(i / 3), c = i % 3;
    const val = game.grid[r][c];
    if (val) {
      cells[i].innerHTML = symbolFor(val);
      if (skin === "runes") {
        cells[i].classList.toggle("dragon", val === "X");
        cells[i].classList.toggle("phoenix", val === "O");
      } else {
        cells[i].classList.remove("dragon","phoenix");
      }
    } else {
      cells[i].innerHTML = "";
      cells[i].classList.remove("dragon","phoenix","win-cell");
    }
  }

  // winner UI
  if (game.winner && game.winner !== "Draw") {
    winnerText.textContent = game.winner === "X" ? "Dragon Wins!" : "Phoenix Wins!";
    msgDiv.classList.add("show-winner");
    for (const [r,c] of game.getWinningCells()) {
      const idx = r*3 + c;
      cells[idx].classList.add("win-cell");
    }
    triggerRuneBurst(game.winner);
  } else if (game.winner === "Draw") {
    winnerText.textContent = "Draw!";
    msgDiv.classList.add("show-winner");
  } else {
    msgDiv.classList.remove("show-winner");
    const who = game.currentPlayer === "X" ? (skin === "classic" ? "X" : "Dragon") :
                                         (skin === "classic" ? "O" : "Phoenix");
    winnerText.textContent = `Turn: ${who}`;
  }

  scoreText.textContent = `Score – X: ${game.scoreX} | O: ${game.scoreO} | D: ${game.scoreD}`;

  // Disable board if game over
  [...cells].forEach(c => c.classList.toggle("disabled", !!game.winner));
}

/* ================== MOVES ================== */
function handleMove(r, c) {
  if (game.winner) return;
  const ok = game.makeMove(r, c);
  if (!ok) return;
  playSFX(clickSound);
  updateBoard();

  if (game.winner) {
    if (game.winner !== "Draw") playSFX(winSound); else playSFX(loseSound);

    // record leaderboard if human (X) beats CPU
    if (vsCPU && game.winner === "X") {
      const elapsed = performance.now() - game.roundStart;
      addLeaderboardEntry(elapsed, game.roundMoves, difficulty, skin);
    }
    return;
  }

  // CPU turn?
  if (vsCPU && game.currentPlayer === "O") cpuMove();
}

/* ================== CPU AI ================== */
function cpuMove() {
  setTimeout(() => {
    if (game.winner || game.currentPlayer !== "O") return;

    let move;
    if (difficulty === "easy") {
      move = randomMove();
    } else if (difficulty === "medium") {
      move = bestMoveHeuristic("O") || bestMoveHeuristic("X") || randomMove();
    } else { // hard
      move = minimaxBestMove();
    }
    if (move) handleMove(move.r, move.c);
  }, 420);
}

function randomMove() {
  const empty = game.getEmptyCells();
  if (!empty.length) return null;
  return empty[Math.floor(Math.random()*empty.length)];
}

function bestMoveHeuristic(player) {
  // Try win for player, or block opponent
  // 1) win
  for (const {r,c} of game.getEmptyCells()) {
    game.grid[r][c] = player;
    const w = game.checkWinner();
    game.grid[r][c] = "";
    game.winner = null; game.winningCells = [];
    if (w === player) return {r,c};
  }
  return null;
}

/* ===== Minimax (Hard) ===== */
function minimaxBestMove() {
  const maxPlayer = "O";
  const minPlayer = "X";

  let bestScore = -Infinity;
  let best = null;

  for (const {r,c} of game.getEmptyCells()) {
    game.grid[r][c] = maxPlayer;
    const score = minimax(false, 0, -Infinity, Infinity);
    game.grid[r][c] = "";
    if (score > bestScore) { bestScore = score; best = {r,c}; }
  }
  return best || randomMove();

  function minimax(isMax, depth, alpha, beta) {
    const res = game.checkWinner();
    // revert ephemeral winner flags
    game.winner = null; game.winningCells = [];

    if (res === maxPlayer) return 10 - depth;
    if (res === minPlayer) return depth - 10;
    if (res === "Draw") return 0;

    if (isMax) {
      let best = -Infinity;
      for (const {r,c} of game.getEmptyCells()) {
        game.grid[r][c] = maxPlayer;
        best = Math.max(best, minimax(false, depth+1, alpha, beta));
        game.grid[r][c] = "";
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    } else {
      let best = Infinity;
      for (const {r,c} of game.getEmptyCells()) {
        game.grid[r][c] = minPlayer;
        best = Math.min(best, minimax(true, depth+1, alpha, beta));
        game.grid[r][c] = "";
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
      return best;
    }
  }
}

/* ================== NAV / CONTROL ================== */
function startGame() {
  // settings from home
  vsCPU = (modeSelect.value === "pvc");
  difficulty = difficultySelect.value;
  skin = skinSelect.value;

  saveSettings();
  setThemeClass();

  modeLabel.textContent = vsCPU ? "PvC" : "PvP";
  diffLabel.textContent = difficulty[0].toUpperCase() + difficulty.slice(1);
  skinLabel.textContent = skin[0].toUpperCase() + skin.slice(1);

  game = new Game(skin);
  renderBoard();

  home.classList.add("hidden");
  gameScr.classList.remove("hidden");
}

function goHome() {
  home.classList.remove("hidden");
  gameScr.classList.add("hidden");
  renderLeaderboard();
}

function nextRound() {
  game.nextRound();
  renderBoard();
  updateBoard();
}

function resetAll() {
  game.resetAll();
  renderBoard();
  updateBoard();
}

/* ================== EVENTS ================== */
playBtn.addEventListener("click", startGame);
homeBtn.addEventListener("click", goHome);
nextBtn.addEventListener("click", nextRound);
resetBtn.addEventListener("click", resetAll);

sfxBtn.addEventListener("click", () => {
  game.sfxOn = !game.sfxOn;
  sfxBtn.textContent = `SFX: ${game.sfxOn ? "On" : "Off"}`;
});

themeSelect.addEventListener("change", () => {
  setThemeClass(); saveSettings();
});

installBtn.addEventListener("click", async () => {
  const prompt = window.deferredPrompt;
  if (!prompt) return;
  prompt.prompt();
  await prompt.userChoice;
  window.deferredPrompt = null;
});

/* ================== INIT ================== */
loadSettings();
setThemeClass();
renderLeaderboard();
