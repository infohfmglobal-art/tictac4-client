// === RuneXO – Stable Final (Intro → Login → Home → Play Grid) ===

// === SPLASH SEQUENCE ===
window.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("introSplash");
  const login = document.getElementById("loginGate");
  const home = document.getElementById("homeScreen");
  const game = document.getElementById("gameArea");
  const bell = document.getElementById("introBell");

  // Step 1: Only splash visible (hide all others)
  [login, home, game].forEach(el => {
    el.classList.add("hidden");
    el.style.display = "none";
  });

  // Step 2: Play intro bell
  setTimeout(() => {
    if (bell) {
      bell.volume = 0.4;
      bell.play().catch(() => {});
    }
  }, 250);

  // Step 3: Fade to login after intro
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.style.display = "none";
      login.classList.remove("hidden");
      login.style.display = "flex";
    }, 900);
  }, 2500);
});


// === LOGIN → HOME ===
const flashOverlay = document.getElementById("flashOverlay");
const guestBtn = document.getElementById("guestLoginGate");
const googleBtn = document.getElementById("googleLoginGate");
const homeScreen = document.getElementById("homeScreen");
const installOrb = document.getElementById("installOrb");
const logoutBtn = document.getElementById("logoutBtn");

function goldenFlashThen(cb){
  flashOverlay.classList.add("flash-show");
  setTimeout(()=>{
    flashOverlay.classList.remove("flash-show");
    cb && cb();
  }, 700);
}

function showHome(){
  goldenFlashThen(()=>{
    document.getElementById("loginGate").classList.add("hidden");
    document.getElementById("loginGate").style.display = "none";
    homeScreen.classList.remove("hidden");
    homeScreen.style.display = "flex";
    logoutBtn.classList.remove("hidden");
    setTimeout(()=>{
      installOrb.classList.remove("hidden");
      installOrb.classList.add("show");
    }, 1000);
  });
}

guestBtn.onclick = () => showHome();
googleBtn.onclick = () => showHome();
logoutBtn.onclick = () => {
  homeScreen.classList.add("hidden");
  homeScreen.style.display = "none";
  document.getElementById("loginGate").classList.remove("hidden");
  document.getElementById("loginGate").style.display = "flex";
};


// === HOME → GAME ===
const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");
const homeBtn = document.getElementById("homeBtn");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const resetBtn = document.getElementById("resetBtn");
const musicBtn = document.getElementById("musicBtn");
const sfxBtn = document.getElementById("sfxBtn");
const boardEl = document.getElementById("gameBoard");
const cells = Array.from(boardEl.querySelectorAll(".cell"));

let board = Array(9).fill(null);
let current = "X";
let running = false;
let musicOn = false;
let sfxOn = true;

const audio = {
  bg: new Audio("./sound/bg.mp3"),
  click: new Audio("./sound/click.mp3"),
  win: new Audio("./sound/win.mp3"),
  lose: new Audio("./sound/lose.mp3"),
  draw: new Audio("./sound/draw.mp3")
};
audio.bg.loop = true;

function playSfx(a){ if(sfxOn){ a.currentTime=0; a.play().catch(()=>{}); }}
function ensureBg(){ if(musicOn && audio.bg.paused){ audio.bg.volume=0.4; audio.bg.play().catch(()=>{});} }
function stopBg(){ audio.bg.pause(); }

startBtn.onclick = () => {
  homeScreen.classList.add("hidden");
  homeScreen.style.display = "none";
  gameArea.classList.remove("hidden");
  gameArea.style.display = "flex";
  initGame();
};

homeBtn.onclick = () => {
  gameArea.classList.add("hidden");
  gameArea.style.display = "none";
  homeScreen.classList.remove("hidden");
  homeScreen.style.display = "flex";
  stopBg();
};

musicBtn.onclick = () => {
  musicOn = !musicOn;
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
  if(musicOn) ensureBg(); else stopBg();
};

sfxBtn.onclick = () => {
  sfxOn = !sfxOn;
  sfxBtn.textContent = sfxOn ? "🔊 SFX ON" : "🔈 SFX OFF";
};


// === GAME LOGIC ===
function initGame(){
  board = Array(9).fill(null);
  current = "X";
  running = true;
  cells.forEach(c=>{
    c.textContent = "";
    c.onclick = ()=>handleMove(c);
  });
}

function handleMove(cell){
  if(!running) return;
  const idx = Number(cell.dataset.index);
  if(board[idx]) return;
  board[idx] = current;
  cell.textContent = current;
  playSfx(audio.click);
  if(checkWinner()){
    playSfx(audio.win);
    alert(`🏆 ${current} wins!`);
    running = false;
    return;
  }
  if(board.every(v=>v)){
    playSfx(audio.draw);
    alert(`🤝 Draw!`);
    running = false;
    return;
  }
  current = current === "X" ? "O" : "X";
}

function checkWinner(){
  const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return L.some(([a,b,c])=> board[a] && board[a]===board[b] && board[a]===board[c]);
}

nextRoundBtn.onclick = initGame;
resetBtn.onclick = initGame;
