// =========================
// RuneXO Phase-1 (Stable)
// Splash → Login → Home → Game (CPU works)
// =========================

// ---- ELEMENTS ----
const splash      = document.getElementById("introSplash");
const loginGate   = document.getElementById("loginGate");
const flash       = document.getElementById("flashOverlay");
const homeScreen  = document.getElementById("homeScreen");
const gameArea    = document.getElementById("gameArea");
const bell        = document.getElementById("introBell");

const guestBtn    = document.getElementById("guestLoginGate");
const googleBtn   = document.getElementById("googleLoginGate");
const startBtn    = document.getElementById("startBtn");
const logoutBtn   = document.getElementById("logoutBtn");
const homeBtn     = document.getElementById("homeBtn");
const nextRoundBtn= document.getElementById("nextRoundBtn");
const resetBtn    = document.getElementById("resetBtn");
const sfxBtn      = document.getElementById("sfxBtn");
const musicBtn    = document.getElementById("musicBtn");

const boardEl     = document.getElementById("gameBoard");
const cells       = Array.from(boardEl.querySelectorAll(".cell"));
const modeSel     = document.getElementById("gameMode");
const diffSel     = document.getElementById("difficulty");
const skinSel     = document.getElementById("skin");
const themeSel    = document.getElementById("themeSelect");

// ---- AUDIO (light) ----
const audio = {
  intro: bell,
  click: new Audio("./sound/click.mp3"),
  win  : new Audio("./sound/win.mp3"),
  lose : new Audio("./sound/lose.mp3"),
  draw : new Audio("./sound/draw.mp3"),
  bg   : new Audio("./sound/bg.mp3")
};
audio.bg.loop = true;
let sfxOn = true, musicOn = false;
function playSfx(a){ if(sfxOn){ a.currentTime = 0; a.play().catch(()=>{}); } }
function ensureBg(){ if(musicOn && audio.bg.paused){ audio.bg.volume = .35; audio.bg.play().catch(()=>{}); } }
function stopBg(){ audio.bg.pause(); }

// ---- SPLASH → LOGIN (no grid flash) ----
window.addEventListener("DOMContentLoaded", () => {
  // Only splash visible at start
  loginGate.classList.add("hidden");
  homeScreen.classList.add("hidden");
  gameArea.classList.add("hidden");

  setTimeout(() => {
    if (audio.intro) { audio.intro.volume = 0.45; audio.intro.currentTime = 0; audio.intro.play().catch(()=>{}); }
  }, 200);

  setTimeout(() => {
    splash.classList.add("fade-out");
    splash.style.pointerEvents = "none";
    setTimeout(() => {
      splash.style.display = "none";
      loginGate.classList.remove("hidden");
      loginGate.style.display = "flex";
    }, 900);
  }, 2500);
});

// ---- LOGIN → HOME ----
function flashOnce(cb){
  flash.classList.add("show");
  setTimeout(()=>{ flash.classList.remove("show"); cb && cb(); }, 550);
}
function showHome(){
  flashOnce(()=>{
    loginGate.classList.add("hidden");
    homeScreen.classList.remove("hidden");
    gameArea.classList.add("hidden");
  });
}
guestBtn.onclick  = showHome;
googleBtn.onclick = showHome;
logoutBtn.onclick = () => {
  homeScreen.classList.add("hidden");
  gameArea.classList.add("hidden");
  loginGate.classList.remove("hidden");
};

// ---- HOME → GAME ----
startBtn.onclick = () => {
  homeScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  initGame();
};
homeBtn.onclick = () => {
  gameArea.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  stopBg();
};

// toggles
musicBtn.onclick = () => {
  musicOn = !musicOn;
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
  if (musicOn) ensureBg(); else stopBg();
};
sfxBtn.onclick = () => {
  sfxOn = !sfxOn;
  sfxBtn.textContent = sfxOn ? "🔊 SFX ON" : "🔈 SFX OFF";
};

// ---- GAME LOGIC ----
let board, running, current, againstCPU;

const SKINS = {
  "Runes":            { X:"🐉", O:"🕊️" },
  "Classic X / O":    { X:"X",  O:"O"  },
  "Fruit":            { X:"🍎", O:"🍊" },
  "Emoji":            { X:"😎", O:"🤖" }
};

function markFor(player){
  const set = SKINS[skinSel.value] || SKINS["Classic X / O"];
  return player === "X" ? set.X : set.O;
}

function initGame(){
  // theme hook (keep your CSS themes)
  document.body.className = `theme-${(themeSel.value||"rune").toLowerCase()}`;

  board   = Array(9).fill(null);
  running = true;
  current = "X";
  againstCPU = (modeSel.value === "Player vs CPU");

  cells.forEach(c => {
    c.textContent = "";
    c.classList.remove("win");
    c.onclick = () => handleMove(c);
  });

  // reflect toggles
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
  sfxBtn.textContent   = sfxOn   ? "🔊 SFX ON"   : "🔈 SFX OFF";
}

function handleMove(cell){
  if(!running) return;
  const idx = Number(cell.dataset.index);
  if(board[idx]) return;

  cell.textContent = markFor(current);
  board[idx] = current;
  playSfx(audio.click);

  const w = winner(board);
  if(w){ endRound(w); return; }
  if(board.every(Boolean)){ endRound("draw"); return; }

  current = (current === "X") ? "O" : "X";

  if(running && againstCPU && current === "O"){
    setTimeout(cpuMove, 350);
  }
}

function cpuMove(){
  if(!running) return;
  const diff = diffSel.value;
  const empty = board.map((v,i)=> v? null : i).filter(v=>v!==null);
  if(empty.length===0) return;

  let move = null;

  if(diff === "Easy"){
    move = empty[Math.floor(Math.random()*empty.length)];
  } else if (diff === "Normal"){
    move = findBest(board, "O") ?? findBest(board, "X") ?? empty[Math.floor(Math.random()*empty.length)];
  } else { // Hard
    move = minimax(board.slice(), "O").index;
  }

  const cell = cells[move];
  cell.textContent = markFor("O");
  board[move] = "O";

  const w = winner(board);
  if(w){ endRound(w); return; }
  if(board.every(Boolean)){ endRound("draw"); return; }

  current = "X";
}

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function winner(b){
  for(const [a,b1,c] of LINES){
    if(b[a] && b[a]===b[b1] && b[a]===b[c]) return b[a];
  }
  return null;
}
function endRound(result){
  running = false;

  // highlight winning line if any
  if(result==="X" || result==="O"){
    for(const [a,b1,c] of LINES){
      if(board[a] && board[a]===board[b1] && board[a]===board[c]){
        [a,b1,c].forEach(i=> cells[i].classList.add("win"));
      }
    }
    playSfx(result==="X" ? audio.win : audio.lose);
    alert(result==="X" ? "You Win!" : (againstCPU ? "CPU Wins!" : "Player 2 Wins!"));
  } else {
    playSfx(audio.draw);
    alert("It's a draw!");
  }
}

function findBest(b, player){
  const empty = b.map((v,i)=> v? null : i).filter(v=>v!==null);
  for(const i of empty){
    b[i] = player;
    const w = winner(b);
    b[i] = null;
    if(w === player) return i;
  }
  return null;
}
function minimax(state, player){
  const avail = state.map((v,i)=> v? null : i).filter(v=>v!==null);
  const w = winner(state);
  if(w === "X") return { score:-10 };
  if(w === "O") return { score:10 };
  if(avail.length === 0) return { score:0 };

  const moves = [];
  for(const i of avail){
    const move = { index:i };
    state[i] = player;
    const res = (player==="O") ? minimax(state, "X") : minimax(state, "O");
    move.score = res.score;
    state[i] = null;
    moves.push(move);
  }
  let best = null;
  if(player==="O"){ // maximize
    let mx = -Infinity;
    for(const m of moves){ if(m.score>mx){ mx=m.score; best=m; } }
  } else {
    let mn = Infinity;
    for(const m of moves){ if(m.score<mn){ mn=m.score; best=m; } }
  }
  return best;
}

// buttons
nextRoundBtn.onclick = initGame;
resetBtn.onclick     = initGame;
