// === RuneXO – Final Stable Edition ===

// === INTRO SPLASH ===
window.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("introSplash");
  const login = document.getElementById("loginGate");
  const bell  = document.getElementById("introBell");
  const home  = document.getElementById("homeScreen");
  const game  = document.getElementById("gameArea");

  login.classList.add("hidden");
  home.classList.add("hidden");
  game.classList.add("hidden");

  // Play short intro bell
  setTimeout(() => { if (bell) { bell.volume = 0.4; bell.play().catch(()=>{}); }}, 200);

  // Fade out splash and show login
  setTimeout(() => {
    intro.classList.add("fade-out");
    setTimeout(() => {
      intro.style.display = "none";
      login.classList.remove("hidden");
      login.style.display = "flex";
    }, 800);
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
    homeScreen.classList.remove("hidden");
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
  document.getElementById("loginGate").classList.remove("hidden");
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

let musicOn = false, sfxOn = true;
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
  gameArea.classList.remove("hidden");
  initGame();
  stopBg();
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


 === Home === SIMPLE GAME GRID ===
let board = Array(9).fill(null);
let current = "X";

function initGame(){
  board = Array(9).fill(null);
  current = "X";
  cells.forEach(c=>{
    c.textContent = "";
    c.style.color = "gold";
    c.onclick = ()=> handleMove(c);
  });
}

function handleMove(cell){
  const idx = Number(cell.dataset.index);
  if(board[idx]) return;
  board[idx] = current;
  cell.textContent = current;
  playSfx(audio.click);

  if(checkWinner()){
    playSfx(audio.win);
    alert(`🎉 ${current} Wins!`);
    initGame();
    return;
  }

  if(board.every(v=>v)) {
    playSfx(audio.draw);
    alert("😎 It's a draw!");
    initGame();
    return;
  }

  current = current === "X" ? "O" : "X";
}

function checkWinner(){
  const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return L.some(([a,b,c]) => board[a] && board[a]===board[b] && board[a]===board[c]);
}
// === HOME → GAME (Final guaranteed load with DOMContentLoaded) ===
document.addEventListener("DOMContentLoaded", () => {

  function safeInitGame(){
    const boardEl = document.getElementById("gameBoard");
    if (!boardEl || boardEl.offsetParent === null) {
      console.warn("Waiting for game board to render...");
      setTimeout(safeInitGame, 300);
      return;
    }
    initGame();
    console.log("✅ Game initialized");
  }

  const startBtn = document.getElementById("startBtn");
  const homeBtn = document.getElementById("homeBtn");
  const nextRoundBtn = document.getElementById("nextRoundBtn");
  const resetBtn = document.getElementById("resetBtn");
  const musicBtn = document.getElementById("musicBtn");
  const sfxBtn = document.getElementById("sfxBtn");

  startBtn.addEventListener("click", () => {
    console.log("🎮 Play button clicked");
    homeScreen.classList.add("hidden");
    gameArea.classList.remove("hidden");
    setTimeout(() => safeInitGame(), 400);
  });

  homeBtn.addEventListener("click", () => {
    gameArea.classList.add("hidden");
    homeScreen.classList.remove("hidden");
    stopBg();
  });

  nextRoundBtn.addEventListener("click", initGame);
  resetBtn.addEventListener("click", initGame);

  musicBtn.addEventListener("click", () => {
    musicOn = !musicOn;
    musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
    if (musicOn) ensureBg(); else stopBg();
  });

  sfxBtn.addEventListener("click", () => {
    sfxOn = !sfxOn;
    sfxBtn.textContent = sfxOn ? "🔊 SFX ON" : "🔈 SFX OFF";
  });

}); // ← Make sure this closing bracket and semicolon exist!
