// === RuneXO – Final Polished Sequence ===

// === INTRO SPLASH ===
window.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("introSplash");
  const login = document.getElementById("loginGate");
  const bell  = document.getElementById("introBell");
  const home  = document.getElementById("homeScreen");
  const game  = document.getElementById("gameArea");

  // Ensure all other sections are hidden initially
  login.classList.add("hidden");
  home.classList.add("hidden");
  game.classList.add("hidden");

  // Play bell softly
  setTimeout(() => { if (bell) { bell.volume = 0.4; bell.play().catch(()=>{}); }}, 200);

  // Fade out intro after 2.5s, show login only
  setTimeout(() => {
    intro.classList.add("fade-out");
    setTimeout(() => {
      intro.style.display = "none";
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


// === SIMPLE GAME ===
function initGame(){
  cells.forEach(c=>{
    c.textContent = "";
    c.onclick = ()=>{
      if(!c.textContent){
        c.textContent = "X";
        playSfx(audio.click);
      }
    };
  });
}
