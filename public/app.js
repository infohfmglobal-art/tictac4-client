// RuneXO — Stable Core (no Service Worker)

// ===== STARTUP (splash -> login) =====
window.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("introSplash");
  const login  = document.getElementById("loginGate");
  const home   = document.getElementById("homeScreen");
  const game   = document.getElementById("gameArea");
  const bell   = document.getElementById("introBell");

  // Ensure home & game are hidden at boot
  home.classList.add("hidden");
  game.classList.add("hidden");
  login.classList.add("hidden");

  // play the intro bell softly
  setTimeout(() => {
    if (bell) { bell.volume = 0.45; bell.play().catch(()=>{}); }
  }, 200);

  // after ~2.5s fade splash, then show login
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.style.display = "none";
      login.classList.remove("hidden");
      login.style.display = "flex";
    }, 900);
  }, 2500);
});

// ===== LOGIN -> HOME =====
const flashOverlay = document.getElementById("flashOverlay");
const guestBtn     = document.getElementById("guestLoginGate");
const googleBtn    = document.getElementById("googleLoginGate");
const homeScreen   = document.getElementById("homeScreen");
const logoutBtn    = document.getElementById("logoutBtn");

function goldenFlashThen(cb){
  if(!flashOverlay) return cb && cb();
  flashOverlay.classList.add("flash-show");
  setTimeout(() => {
    flashOverlay.classList.remove("flash-show");
    cb && cb();
  }, 650);
}

function showHome(){
  goldenFlashThen(() => {
    document.getElementById("loginGate").classList.add("hidden");
    homeScreen.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
  });
}
guestBtn && (guestBtn.onclick  = showHome);
googleBtn && (googleBtn.onclick = showHome);

logoutBtn && (logoutBtn.onclick = () => {
  homeScreen.classList.add("hidden");
  document.getElementById("loginGate").classList.remove("hidden");
});

// ===== HOME -> GAME =====
const startBtn     = document.getElementById("startBtn");
const gameArea     = document.getElementById("gameArea");
const homeBtn      = document.getElementById("homeBtn");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const resetBtn     = document.getElementById("resetBtn");
const musicBtn     = document.getElementById("musicBtn");
const sfxBtn       = document.getElementById("sfxBtn");
const boardEl      = document.getElementById("gameBoard");
const cells        = Array.from(boardEl.querySelectorAll(".cell"));
const modeSelect   = document.getElementById("gameMode");
const skinSelect   = document.getElementById("skin");
const themeSelect  = document.getElementById("themeSelect");

let musicOn=false, sfxOn=true, running=false, board, current, mode="pvc";

const audio = {
  bg:   new Audio("./sound/bg.mp3"),
  click:new Audio("./sound/click.mp3"),
  win:  new Audio("./sound/win.mp3"),
  lose: new Audio("./sound/lose.mp3"),
  draw: new Audio("./sound/draw.mp3"),
};
audio.bg.loop = true;

function ensureBg(){ if(musicOn && audio.bg.paused){ audio.bg.volume=0.35; audio.bg.play().catch(()=>{}); } }
function stopBg(){ audio.bg.pause(); }
function playSfx(a){ if(sfxOn) { try{ a.currentTime=0; a.play(); }catch(_){} } }

modeSelect && (modeSelect.onchange = (e)=>{ mode = e.target.value; });
themeSelect && (themeSelect.onchange = (e)=>{
  document.body.className = "theme-"+e.target.value;
});

startBtn && (startBtn.onclick = () => {
  // hide home, show game
  document.getElementById("homeScreen").classList.add("hidden");
  gameArea.classList.remove("hidden");
  initGame();
});

homeBtn && (homeBtn.onclick = () => {
  gameArea.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  stopBg();
});

musicBtn && (musicBtn.onclick = () => {
  musicOn = !musicOn;
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
  musicOn ? ensureBg() : stopBg();
});

sfxBtn && (sfxBtn.onclick = () => {
  sfxOn = !sfxOn;
  sfxBtn.textContent = sfxOn ? "🔊 SFX ON" : "🔈 SFX OFF";
});

// ===== GAME LOGIC =====
function initGame(){
  ensureBg();
  running = true;
  current = "X";
  board   = Array(9).fill(null);
  cells.forEach(c=>{
    c.textContent = "";
    c.classList.remove("win");
    c.onclick = () => handleMove(c);
  });
}

// Simple win-check
function checkWinner(){
  const L = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return L.some(([a,b,c]) => board[a] && board[a]===board[b] && board[a]===board[c]);
}

function showRuneAlert(title, text){
  const alertBox = document.getElementById("runeAlert");
  const t1 = document.getElementById("runeTitle");
  const t2 = document.getElementById("runeText");
  const ok = document.getElementById("runeOk");
  t1.textContent = title;
  t2.textContent = text;
  alertBox.classList.remove("hidden");
  ok.onclick = () => {
    alertBox.classList.add("hidden");
    initGame();
  };
}

function handleMove(cell){
  if(!running) return;
  const idx = Number(cell.dataset.index);
  if(board[idx]) return;

  board[idx] = current;
  cell.textContent = current;
  playSfx(audio.click);

  if(checkWinner()){
    running=false;
    if(current==="X"){ playSfx(audio.win); showRuneAlert("Victory!", "🌀 You win!"); }
    else { playSfx(audio.lose); showRuneAlert("Defeat", "🧠 CPU wins!"); }
    return;
  }
  if(board.every(v=>v!==null)){
    running=false;
    playSfx(audio.draw);
    showRuneAlert("Draw", "No more moves.");
    return;
  }

  // switch turn
  current = (current==="X") ? "O" : "X";

  // CPU move when mode is pvc and it's CPU's turn
  if(mode==="pvc" && current==="O"){
    setTimeout(cpuMove, 350);
  }
}

function cpuMove(){
  if(!running) return;
  const empties = board.map((v,i)=>v===null?i:null).filter(i=>i!==null);
  if(empties.length===0) return;

  // basic CPU: random empty
  const pick = empties[Math.floor(Math.random()*empties.length)];
  board[pick] = "O";
  const cell = cells[pick];
  cell.textContent = "O";
  playSfx(audio.click);

  if(checkWinner()){
    running=false;
    playSfx(audio.lose);
    showRuneAlert("Defeat", "🧠 CPU wins!");
    return;
  }
  if(board.every(v=>v!==null)){
    running=false;
    playSfx(audio.draw);
    showRuneAlert("Draw", "No more moves.");
    return;
  }

  current = "X";
}

// top buttons
nextRoundBtn && (nextRoundBtn.onclick = initGame);
resetBtn     && (resetBtn.onclick     = initGame);
