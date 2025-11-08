// === RuneXO Phase 1.2 Final Stable ===
window.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("introSplash");
  const login = document.getElementById("loginGate");
  const bell  = document.getElementById("introBell");

  // play short bell then fade splash
  setTimeout(() => { bell.volume=0.5; bell.play().catch(()=>{}); }, 200);
  setTimeout(() => {
    intro.classList.add("fade-out");
    setTimeout(() => {
      intro.style.display="none";
      login.classList.remove("hidden");
    }, 800);
  }, 2000);
});

const flashOverlay=document.getElementById("flashOverlay"),
      guestBtn=document.getElementById("guestLoginGate"),
      googleBtn=document.getElementById("googleLoginGate"),
      homeScreen=document.getElementById("homeScreen"),
      installOrb=document.getElementById("installOrb"),
      logoutBtn=document.getElementById("logoutBtn");

function goldenFlashThen(cb){
  flashOverlay.classList.add("flash-show");
  setTimeout(()=>{flashOverlay.classList.remove("flash-show");cb&&cb();},700);
}
function showHome(){
  goldenFlashThen(()=>{
    document.getElementById("loginGate").classList.add("hidden");
    homeScreen.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
  });
}
guestBtn.onclick=()=>{showHome();};
googleBtn.onclick=()=>{showHome();};
logoutBtn.onclick=()=>{
  homeScreen.classList.add("hidden");
  document.getElementById("loginGate").classList.remove("hidden");
};

// === GAME basic controls ===
const homeBtn=document.getElementById("homeBtn"),
      nextRoundBtn=document.getElementById("nextRoundBtn"),
      resetBtn=document.getElementById("resetBtn"),
      sfxBtn=document.getElementById("sfxBtn"),
      musicBtn=document.getElementById("musicBtn"),
      gameArea=document.getElementById("gameArea"),
      startBtn=document.getElementById("startBtn"),
      boardEl=document.getElementById("gameBoard"),
      cells=Array.from(boardEl.querySelectorAll(".cell"));

let musicOn=false,sfxOn=true;
const audio={bg:new Audio("./sound/bg.mp3"),click:new Audio("./sound/click.mp3"),
win:new Audio("./sound/win.mp3"),lose:new Audio("./sound/lose.mp3"),draw:new Audio("./sound/draw.mp3")};
audio.bg.loop=true;
function playSfx(a){if(sfxOn){a.currentTime=0;a.play().catch(()=>{});}}
function ensureBg(){if(musicOn&&audio.bg.paused){audio.bg.volume=0.4;audio.bg.play().catch(()=>{});}}
function stopBg(){audio.bg.pause();}

startBtn.onclick=()=>{
  homeScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  initGame();
};
homeBtn.onclick=()=>{
  gameArea.classList.add("hidden");
  homeScreen.classList.remove("hidden");
};

musicBtn.onclick=()=>{
  musicOn=!musicOn;
  musicBtn.textContent=musicOn?"🔈 Music ON":"🔇 Music OFF";
  if(musicOn)ensureBg();else stopBg();
};
sfxBtn.onclick=()=>{
  sfxOn=!sfxOn;
  sfxBtn.textContent=sfxOn?"🔊 SFX ON":"🔈 SFX OFF";
};

function initGame(){
  cells.forEach(c=>{
    c.textContent="";
    c.onclick=()=>{ if(!c.textContent){c.textContent="X"; playSfx(audio.click);} };
  });
}
