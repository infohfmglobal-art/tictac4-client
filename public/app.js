
// === RuneXO: Gold Edition (Offline Stable v1.0.6) ===

// === INTRO SPLASH ===
window.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("introSplash");
  const login = document.getElementById("loginGate");
  const bell  = document.getElementById("introBell");

  login.classList.add("hidden");

  setTimeout(() => { 
    if (bell) { bell.volume = 0.5; bell.play().catch(()=>{}); }
  }, 300);

  setTimeout(() => {
    intro.classList.add("fade-out");
    setTimeout(() => {
      intro.style.display = "none";
      login.classList.remove("hidden");
      login.style.display = "flex";
    }, 1000);
  }, 2000);
});


// === LOGIN → HOME ===
const flashOverlay = document.getElementById("flashOverlay");
const guestBtn = document.getElementById("guestLoginGate");
const googleBtn = document.getElementById("googleLoginGate");
const homeScreen = document.getElementById("homeScreen");
const logoutBtn = document.getElementById("logoutBtn");
const installOrb = document.getElementById("installOrb");

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
    homeScreen.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    setTimeout(()=>{
      installOrb.classList.remove("hidden");
      installOrb.classList.add("show");
    }, 1200);
  });
}

guestBtn.onclick = showHome;
googleBtn.onclick = showHome;
logoutBtn.onclick = () => {
  homeScreen.classList.add("hidden");
  document.getElementById("loginGate").classList.remove("hidden");
};


// === AUDIO ===
const audio = {
  bg: new Audio("./sound/bg.mp3"),
  click: new Audio("./sound/click.mp3"),
  win: new Audio("./sound/win.mp3"),
  lose: new Audio("./sound/lose.mp3"),
  draw: new Audio("./sound/draw.mp3")
};
audio.bg.loop = true;

let musicOn = false, sfxOn = true;
function playSfx(a){ if(sfxOn){ a.currentTime=0; a.play().catch(()=>{});} }
function ensureBg(){ if(musicOn && audio.bg.paused){ audio.bg.volume=0.4; audio.bg.play().catch(()=>{});} }
function stopBg(){ audio.bg.pause(); }


// === GAME LOGIC ===
const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");
const homeBtn = document.getElementById("homeBtn");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const resetBtn = document.getElementById("resetBtn");
const musicBtn = document.getElementById("musicBtn");
const sfxBtn = document.getElementById("sfxBtn");
const boardEl = document.getElementById("gameBoard");
const cells = Array.from(boardEl.querySelectorAll(".cell"));
const settingsBtn = document.getElementById("settingsBtn");

let board = Array(9).fill(null);
let current = "P1";
let running = false;
let againstCPU = true;

const SKINS = {
  "Runes": { P1: "🐉", P2: "🕊️" },
  "Classic X / O": { P1: "X", P2: "O" },
  "Fruit": { P1: "🍎", P2: "🍊" },
  "Emoji": { P1: "😎", P2: "🤖" }
};

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

musicBtn.onclick = () => {
  musicOn = !musicOn;
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
  if(musicOn) ensureBg(); else stopBg();
};

sfxBtn.onclick = () => {
  sfxOn = !sfxOn;
  sfxBtn.textContent = sfxOn ? "🔊 SFX ON" : "🔈 SFX OFF";
};

function initGame(){
  const skin = document.getElementById("skin").value;
  board = Array(9).fill(null);
  current = "P1";
  running = true;
  cells.forEach(c=>{
    c.textContent = "";
    c.style.textShadow = "";
    c.onclick = () => handleMove(c);
  });
  playSfx(audio.click);
}

function handleMove(cell){
  if(!running) return;
  const idx = Number(cell.dataset.index);
  if(board[idx]) return;
  const skin = document.getElementById("skin").value;
  const mark = current === "P1" ? SKINS[skin].P1 : SKINS[skin].P2;
  cell.textContent = mark;
  board[idx] = current;
  playSfx(audio.click);

  const res = checkWinner();
  if(res){ endRound(res); return; }

  current = current === "P1" ? "P2" : "P1";
  if(current === "P2" && document.getElementById("gameMode").value === "Player vs CPU"){
    setTimeout(cpuMove, 500);
  }
}

function cpuMove(){
  const empty = board.map((v,i)=>v?null:i).filter(v=>v!==null);
  if(!empty.length) return;
  const move = empty[Math.floor(Math.random()*empty.length)];
  const skin = document.getElementById("skin").value;
  const mark = SKINS[skin].P2;
  board[move] = "P2";
  cells[move].textContent = mark;
  playSfx(audio.click);
  const res = checkWinner();
  if(res){ endRound(res); return; }
  current = "P1";
}

function checkWinner(){
  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const [a,b,c] of LINES){
    if(board[a] && board[a]===board[b] && board[a]===board[c]){
      return {winner: board[a]};
    }
  }
  if(board.every(Boolean)) return {draw:true};
  return null;
}

function endRound(res){
  running = false;
  if(res.winner==="P1"){
    playSfx(audio.win);
    showRuneAlert("Victory!", "You won the match! 💰 +20 coins");
  } else if(res.winner==="P2"){
    playSfx(audio.lose);
    showRuneAlert("Defeat!", "CPU wins this round.");
  } else {
    playSfx(audio.draw);
    showRuneAlert("Draw", "Well played both sides!");
  }
}

nextRoundBtn.onclick = initGame;
resetBtn.onclick = initGame;


// === RUNE ALERT ===
function showRuneAlert(title, text){
  const alertBox = document.getElementById("runeAlert");
  document.getElementById("runeTitle").textContent = title;
  document.getElementById("runeText").textContent = text;
  alertBox.classList.remove("hidden");
  document.getElementById("runeOk").onclick = ()=>alertBox.classList.add("hidden");
}


// === SETTINGS MODAL ===
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
settingsBtn.onclick = ()=> settingsModal.classList.remove("hidden");
closeSettings.onclick = ()=> settingsModal.classList.add("hidden");


// === SERVICE WORKER REGISTRATION ===
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').then(()=>console.log("SW Registered ✅"));
  });
}
