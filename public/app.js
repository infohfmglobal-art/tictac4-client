// === SPLASH → LOGIN ===
window.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("introSplash");
  const bell = document.getElementById("introBell");
  const loginGate = document.getElementById("loginGate");

  // soft bell
  setTimeout(() => { if (bell) { bell.volume = 0.8; bell.play().catch(()=>{}); } }, 600);

  // hide splash after 3s, show login
  setTimeout(() => {
    if (splash) splash.classList.add("hide");
    setTimeout(() => loginGate && loginGate.classList.remove("hidden"), 900);
  }, 3000);
});

// === GOLD FLASH OVERLAY ===
const flashOverlay = document.getElementById("flashOverlay");
function goldenFlashThen(cb){
  if (!flashOverlay){ cb && cb(); return; }
  flashOverlay.classList.add("flash-show");
  setTimeout(()=>{
    flashOverlay.classList.remove("flash-show");
    flashOverlay.classList.add("flash-hide");
    cb && cb();
  }, 700);
}

// === LOGIN → HOME ===
const guestBtn   = document.getElementById("guestLoginGate");
const googleBtn  = document.getElementById("googleLoginGate");
const homeScreen = document.getElementById("homeScreen");
const loginGate  = document.getElementById("loginGate");
const installOrb = document.getElementById("installOrb");

function goHome(){
  goldenFlashThen(()=>{
    loginGate && loginGate.classList.add("hidden");
    homeScreen && homeScreen.classList.remove("hidden");
    // show install orb a bit later
    setTimeout(() => {
      installOrb && installOrb.classList.remove("hidden");
      installOrb && installOrb.classList.add("show");
    }, 1200);
  });
}

guestBtn && guestBtn.addEventListener("click", ()=>{
  alert("Guest mode activated! 🪄 Coins are local only.");
  goHome();
});
googleBtn && googleBtn.addEventListener("click", ()=>{
  alert("Google Login coming soon ✨ (Phase 2)");
  goHome();
});

// === INSTALL ORB ===
installOrb && installOrb.addEventListener("click", async ()=>{
  const p = window.deferredPrompt;
  if (!p){ alert("Already installed or not supported yet."); return; }
  p.prompt(); await p.userChoice; window.deferredPrompt = null;
});

// === GAME STATE ===
const gameArea   = document.getElementById("gameArea");
const boardEl    = document.getElementById("gameBoard");
const startBtn   = document.getElementById("startBtn");

// controls
const nextBtn = document.getElementById("nextRoundBtn");
const resetBtn= document.getElementById("resetBtn");
const homeBtn = document.getElementById("homeBtn");

// menu selects
const modeSel  = document.getElementById("gameMode");      // Player vs CPU | Player vs Player
const diffSel  = document.getElementById("difficulty");     // Easy|Normal|Hard (phase 1: use Normal)
const skinSel  = document.getElementById("skin");           // Runes | Classic X / O | Fruit

// sounds (optional bg)
const clickSfx = new Audio("./sound/click.mp3");
let bgMusic = null;
try { bgMusic = new Audio("./sound/bg.mp3"); bgMusic.loop = true; } catch(e){ /* ignore if missing */ }

// engine
let state = {
  board: Array(9).fill(""),
  turn: "X",
  running: false,
  mode: "Player vs CPU",
  skin: "Runes"
};

// === RENDER A CELL BASED ON SKIN ===
function renderCell(cellEl, val){
  cellEl.textContent = "";
  cellEl.style.color = "";
  cellEl.style.textShadow = "";
  if (!val) return;

  if (state.skin === "Runes"){
    cellEl.textContent = (val === "X") ? "🐉" : "🕊️";
    cellEl.style.color = (val === "X") ? "#00ffff" : "#ff66cc";
    cellEl.style.textShadow = (val === "X")
      ? "0 0 15px #00ffff, 0 0 30px #00cccc"
      : "0 0 15px #ff66cc, 0 0 30px #ff3399";
  } else if (state.skin.startsWith("Classic")){
    cellEl.textContent = val;
    cellEl.style.color = (val === "X") ? "#00ffff" : "#ff66cc";
    cellEl.style.textShadow = (val === "X")
      ? "0 0 12px #00ffff, 0 0 25px #00cccc"
      : "0 0 12px #ff66cc, 0 0 25px #ff3399";
  } else { // Fruit
    cellEl.textContent = (val === "X") ? "🍎" : "🍊";
    cellEl.style.textShadow = (val === "X")
      ? "0 0 15px #ff3366, 0 0 25px #ff0033"
      : "0 0 15px #ffaa00, 0 0 25px #ff7700";
  }
}

function renderBoard(){
  const cells = boardEl.querySelectorAll(".cell");
  state.board.forEach((v,i)=> renderCell(cells[i], v));
}

// === GAME HELPERS ===
const lines = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function winnerOf(board){
  for (const [a,b,c] of lines){
    if (board[a] && board[a]===board[b] && board[a]===board[c]) return board[a];
  }
  return null;
}
function emptyIndices(board){
  const arr=[]; for (let i=0;i<9;i++) if (!board[i]) arr.push(i); return arr;
}
function bestCpuMove(){
  const me = "O", opp="X";
  const b = state.board.slice();

  // 1) win
  for (const i of emptyIndices(b)){
    b[i]=me; if (winnerOf(b)===me) return i; b[i]="";
  }
  // 2) block
  for (const i of emptyIndices(b)){
    b[i]=opp; if (winnerOf(b)===opp) return i; b[i]="";
  }
  // 3) center
  if (!b[4]) return 4;
  // 4) corners
  const corners=[0,2,6,8].filter(i=>!b[i]);
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
  // 5) sides
  const sides=[1,3,5,7].filter(i=>!b[i]);
  if (sides.length) return sides[Math.floor(Math.random()*sides.length)];
  return -1;
}

function makeMove(i, player){
  if (state.board[i] || !state.running) return false;
  state.board[i] = player;
  renderBoard();

  const w = winnerOf(state.board);
  if (w){
    state.running = false;
    setTimeout(()=> alert((state.skin==="Runes"?(w==="X"?"🐉 Dragon":"🕊️ Phoenix"):w)+" Wins!"), 10);
    return true;
  }
  if (emptyIndices(state.board).length===0){
    state.running=false;
    setTimeout(()=> alert("Draw!"), 10);
    return true;
  }
  return true;
}

// === INPUT HANDLERS ===
function bindBoard(){
  const cells = boardEl.querySelectorAll(".cell");
  cells.forEach((cell, idx)=>{
    cell.onclick = ()=>{
      if (!state.running) return;
      if (state.board[idx]) return;
      // player X always human; O is CPU if PvC
      clickSfx.currentTime=0; clickSfx.play().catch(()=>{});
      makeMove(idx, state.turn);
      if (!state.running) return;

      // swap turn
      state.turn = (state.turn==="X") ? "O" : "X";

      // CPU turn
      if (state.mode === "Player vs CPU" && state.turn==="O" && state.running){
        setTimeout(()=>{
          const mv = bestCpuMove();
          if (mv>=0) makeMove(mv, "O");
          if (state.running){
            state.turn = "X";
          }
        }, 400);
      }
    };
  });
}

// === CONTROLS ===
nextBtn && (nextBtn.onclick = ()=> resetRound());
resetBtn && (resetBtn.onclick = ()=> fullReset());
homeBtn && (homeBtn.onclick = ()=>{
  gameArea.classList.add("hidden");
  homeScreen.classList.remove("hidden");
});

function resetRound(){
  state.board = Array(9).fill("");
  state.turn = "X";
  state.running = true;
  renderBoard();
}
function fullReset(){
  resetRound();
  alert("Scores cleared (Phase 1 demo).");
}

// === START GAME ===
startBtn && startBtn.addEventListener("click", startGame);

function startGame(){
  try{ clickSfx.currentTime=0; clickSfx.play().catch(()=>{}); }catch(e){}
  // read menu selections
  state.mode = (modeSel && modeSel.value) || "Player vs CPU";
  state.skin = (skinSel && skinSel.value) || "Runes";

  // transition
  homeScreen.classList.add("fade-out");
  setTimeout(()=>{
    homeScreen.classList.add("hidden");
    gameArea.classList.remove("hidden");

    // start bg music if available
    if (bgMusic){ bgMusic.volume = 0.25; bgMusic.play().catch(()=>{}); }

    // init board only once
    bindBoard();
    resetRound();
  }, 600);
}
