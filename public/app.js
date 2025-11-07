// === INTRO ===
window.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("introSplash");
  const bell = document.getElementById("introBell");
  const loginGate = document.getElementById("loginGate");
  setTimeout(() => { bell.volume = 0.8; bell.play().catch(()=>{}); }, 500);
  setTimeout(() => { splash.classList.add("hide"); setTimeout(()=>loginGate.classList.remove("hidden"),1000); }, 3000);
});

// === LOGIN FLOW ===
const flashOverlay = document.getElementById("flashOverlay");
const homeScreen = document.getElementById("homeScreen");
const installOrb = document.getElementById("installOrb");

function goldenFlashThen(cb){
  flashOverlay.classList.add("flash-show");
  setTimeout(()=>{ flashOverlay.classList.remove("flash-show"); if(cb) cb(); },700);
}

document.getElementById("guestLoginGate").addEventListener("click",()=>{
  alert("Guest mode activated! Coins are local only.");
  goldenFlashThen(()=>{ document.getElementById("loginGate").classList.add("hidden"); homeScreen.classList.remove("hidden"); setTimeout(()=>{installOrb.classList.remove("hidden");installOrb.classList.add("show");},1200); });
});

// === INSTALL ORB ===
installOrb.addEventListener("click",async()=>{
  const prompt = window.deferredPrompt;
  if(!prompt){alert("Already installed or not supported!");return;}
  prompt.prompt(); await prompt.userChoice; window.deferredPrompt=null;
});

// === AUDIO SYSTEM ===
let bgMusic = new Audio("./sound/bg.mp3");
bgMusic.loop=true; bgMusic.volume=0.25;

let sfxOn=true, musicOn=true;
function playMusic(){ if(musicOn) bgMusic.play().catch(()=>{}); }
function stopMusic(){ bgMusic.pause(); bgMusic.currentTime=0; }

function playSFX(file,vol=0.7){
  if(!sfxOn) return;
  const s=new Audio(file); s.volume=vol; s.play().catch(()=>{});
}

// === GAME LOGIC ===
const startBtn=document.getElementById("startBtn");
if(startBtn){startBtn.addEventListener("click",()=>{playSFX("./sound/click.mp3");startGame();});}

function startGame(){
  homeScreen.classList.add("fade-out");
  setTimeout(()=>{
    homeScreen.classList.add("hidden");
    document.getElementById("gameArea").classList.remove("hidden");
    playMusic();
    initBoard();
  },600);
}

function initBoard(){
  const cells=document.querySelectorAll(".cell");
  let current="🐉";
  cells.forEach(c=>c.textContent="");
  cells.forEach(cell=>{
    cell.onclick=()=>{
      if(cell.textContent!=="") return;
      playSFX("./sound/click.mp3");
      cell.textContent=current;
      if(checkWin()){ playSFX("./sound/win.mp3"); alert(`${current} Wins!`); return; }
      current=current==="🐉"?"🕊️":"🐉";
    };
  });

  document.getElementById("resetBtn").onclick=()=>{cells.forEach(c=>c.textContent="");current="🐉";playSFX("./sound/click.mp3");};
  document.getElementById("nextRoundBtn").onclick=()=>{cells.forEach(c=>c.textContent="");current="🐉";playSFX("./sound/click.mp3");};
  document.getElementById("homeBtn").onclick=()=>{
    stopMusic(); playSFX("./sound/click.mp3");
    document.getElementById("gameArea").classList.add("hidden");
    homeScreen.classList.remove("hidden");
  };
}

// === CHECK WIN ===
function checkWin(){
  const b=[...document.querySelectorAll(".cell")].map(c=>c.textContent);
  const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return wins.some(([a,b1,c])=>b[a] && b[a]===b[b1] && b[a]===b[c]);
}

// === TOGGLE BUTTONS ===
document.getElementById("musicToggle").onclick=()=>{
  musicOn=!musicOn;
  if(musicOn){ playMusic(); musicToggle.textContent="🎵 Music ON"; }
  else{ stopMusic(); musicToggle.textContent="🔇 Music OFF"; }
  playSFX("./sound/click.mp3");
};
document.getElementById("sfxToggle").onclick=()=>{
  sfxOn=!sfxOn;
  sfxToggle.textContent=sfxOn?"🔈 SFX ON":"🔇 SFX OFF";
  playSFX("./sound/click.mp3");
};
