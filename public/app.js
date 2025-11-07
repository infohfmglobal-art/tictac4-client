// ======= RUNE-XO — PHASE 1 CLEAN BUILD =======

// ---------- splash -> login ----------
window.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("introSplash");
  const loginGate = document.getElementById("loginGate");

  // show login after brief brand moment
  setTimeout(() => {
    splash.classList.add("hide");
    setTimeout(() => loginGate.classList.remove("hidden"), 900);
  }, 1600);
});

// ---------- elements ----------
const flashOverlay = document.getElementById("flashOverlay");
const guestBtn     = document.getElementById("guestLoginGate");
const googleBtn    = document.getElementById("googleLoginGate");
const homeScreen   = document.getElementById("homeScreen");
const loginGate    = document.getElementById("loginGate");
const installOrb   = document.getElementById("installOrb");

const startBtn   = document.getElementById("startBtn");
const gameArea   = document.getElementById("gameArea");
const gameBoard  = document.getElementById("gameBoard");
const cells      = [...document.querySelectorAll(".cell")];
const nextRoundBtn = document.getElementById("nextRoundBtn");
const resetBtn     = document.getElementById("resetBtn");
const homeBtn      = document.getElementById("homeBtn");
const musicBtn     = document.getElementById("musicBtn");
const sfxBtn       = document.getElementById("sfxBtn");

// Settings
const modeSel   = document.getElementById("gameMode");
const diffSel   = document.getElementById("difficulty");
const skinSel   = document.getElementById("skin");
const themeSel  = document.getElementById("themeSelect");

// audio
const bgMusic  = document.getElementById("bgMusic");
const clickSfx = document.getElementById("clickSfx");
const winSfx   = document.getElementById("winSfx");
const loseSfx  = document.getElementById("loseSfx");

// confetti canvas
const fxCanvas = document.getElementById("fxCanvas");
const ctx = fxCanvas.getContext("2d");

// ---------- small helpers ----------
const ls = {
  get(key, fallback){ try{ const v = localStorage.getItem(key); return v==null ? fallback : JSON.parse(v); } catch{ return fallback; } },
  set(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); } catch{} }
};

function goldenFlashThen(cb){
  flashOverlay.classList.add("flash-show");
  setTimeout(() => {
    flashOverlay.classList.remove("flash-show");
    flashOverlay.classList.add("flash-hide");
    if (cb) cb();
  }, 450);
}

function setTheme(name){
  // Simple theme hook if you want to expand later
  document.body.className = `theme-${name}`;
}

function applySkinToEmptyCells(){
  const skin = skinSel.value;
  cells.forEach(c=>{
    c.classList.remove("skin-runes","skin-classic","skin-fruit","skin-emoji","x","o");
    c.textContent="";
    c.dataset.mark="";
    c.classList.add(`skin-${skin}`);
  });
}

// ---------- login -> home ----------
function showHome(){
  goldenFlashThen(() => {
    loginGate.classList.add("hidden");
    homeScreen.classList.remove("hidden");
    setTimeout(()=>{
      installOrb.classList.remove("hidden");
      installOrb.classList.add("show");
    }, 800);
  });
}

guestBtn.addEventListener("click", () => {
  alert("Guest mode activated! 🪄 Coins will be local only.");
  showHome();
});
googleBtn.addEventListener("click", () => {
  alert("Google Login coming soon ✨");
});

// ---------- PWA orb ----------
installOrb.addEventListener("click", async () => {
  const prompt = window.deferredPrompt;
  if (!prompt){ alert("Already installed or not supported yet!"); return; }
  prompt.prompt();
  await prompt.userChoice;
  window.deferredPrompt = null;
});

// ---------- game state ----------
let board = Array(9).fill(null); // 'x' | 'o' | null
let player = 'x';
let locked = false;
let vsCPU = true;
let sfxOn = ls.get("sfxOn", true);
let musicOn = ls.get("musicOn", true);

// init toggles
updateAudioButtons();
bgMusic.volume = 0.35;

// ---------- start game ----------
startBtn.addEventListener("click", () => {
  clickSfxPlay();
  vsCPU = (modeSel.value === "cpu");
  setTheme(themeSel.value);

  homeScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  resizeCanvas();
  newRound(true);

  // start/continue music per preference
  if (musicOn) bgMusic.play().catch(()=>{});
});

function newRound(fromStart=false){
  board = Array(9).fill(null);
  player = 'x';
  locked = false;
  applySkinToEmptyCells();

  // CPU can optionally start at hard difficulty (not in this build)
  if (vsCPU && !fromStart && Math.random()<0.0){ cpuMove(); }
}

// ---------- click handlers ----------
cells.forEach((cell, idx)=>{
  cell.addEventListener("click", ()=>{
    if (locked || board[idx] !== null) return;

    makeMove(idx, player);
    if (checkEnd()) return;

    if (vsCPU){
      setTimeout(()=>{ cpuMove(); checkEnd(); }, 150);
    } else {
      player = (player === 'x') ? 'o' : 'x';
    }
  });
});

nextRoundBtn.addEventListener("click", ()=>{ clickSfxPlay(); newRound(); });
resetBtn.addEventListener("click", ()=>{ clickSfxPlay(); newRound(true); });
homeBtn.addEventListener("click", ()=>{
  clickSfxPlay();
  gameArea.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  stopFX();
});

musicBtn.addEventListener("click", ()=>{
  musicOn = !musicOn;
  ls.set("musicOn", musicOn);
  updateAudioButtons();
  if (musicOn) { bgMusic.play().catch(()=>{}); } else { bgMusic.pause(); }
});
sfxBtn.addEventListener("click", ()=>{
  sfxOn = !sfxOn;
  ls.set("sfxOn", sfxOn);
  updateAudioButtons();
});

// ---------- moves / win check ----------
function makeMove(i, who){
  board[i] = who;
  const c = cells[i];
  c.dataset.mark = who;
  c.classList.add(who); // adds .x or .o (skin CSS uses :after)
  clickSfxPlay();
}

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(){
  for (const [a,b,c] of LINES){
    if (board[a] && board[a]===board[b] && board[b]===board[c]) return board[a];
  }
  if (board.every(Boolean)) return "draw";
  return null;
}

function checkEnd(){
  const res = checkWinner();
  if (!res) return false;

  locked = true;
  if (res === "draw"){
    playLoseWin(null);
    setTimeout(()=>alert("Draw!"), 50);
  } else {
    // winner sparkles
    playLoseWin(res);
    const skinWord = (skinSel.value==="runes")? (res==='x'?'🐉 Dragon':'🪽 Angel'): (res==='x'?'X':'O');
    setTimeout(()=>alert(`${skinWord} Wins!`), 50);
  }
  return true;
}

// ---------- CPU (simple block/win + center/corner) ----------
function cpuMove(){
  if (locked) return;

  const me = 'o', you = 'x';
  const diff = diffSel.value; // easy/normal/hard

  // Try to win
  let move = findLineMove(me);
  // Block player
  if (move == null) move = findLineMove(you);
  // Take center
  if (move == null && board[4] == null) move = 4;
  // Take a corner
  if (move == null){
    const corners = [0,2,6,8].filter(i=>board[i]==null);
    if (corners.length) move = choose(corners);
  }
  // Otherwise random
  if (move == null){
    const empty = board.map((v,i)=>v==null?i:null).filter(v=>v!=null);
    move = choose(empty);
  }

  // Difficulty spice (easy sometimes plays random)
  if (diff === "easy" && Math.random()<0.35){
    const empty = board.map((v,i)=>v==null?i:null).filter(v=>v!=null);
    move = choose(empty);
  } else if (diff === "normal" && Math.random()<0.12){
    const empty = board.map((v,i)=>v==null?i:null).filter(v=>v!=null);
    move = choose(empty);
  }

  makeMove(move, me);
  player = 'x';
}

function findLineMove(target){
  for (const [a,b,c] of LINES){
    const line = [board[a],board[b],board[c]];
    const countT = line.filter(v=>v===target).length;
    const emptyI = [a,b,c].find(i=>board[i]==null);
    if (countT===2 && emptyI!=null) return emptyI;
  }
  return null;
}
function choose(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// ---------- audio helpers ----------
function updateAudioButtons(){
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
  sfxBtn.textContent   = sfxOn ? "🔊 SFX ON" : "🔕 SFX OFF";
}
function clickSfxPlay(){ if (sfxOn) clickSfx.currentTime=0, clickSfx.play().catch(()=>{}); }
function playLoseWin(who){
  if (!sfxOn) return;
  if (who==='x' || who==='o') { winSfx.currentTime=0; winSfx.play().catch(()=>{}); }
  else { loseSfx.currentTime=0; loseSfx.play().catch(()=>{}); }
}

// ---------- win confetti ----------
let particles = [];
function spawnConfetti(){
  particles = [];
  const N = 140;
  for (let i=0;i<N;i++){
    particles.push({
      x: Math.random()*fxCanvas.width,
      y: -10 - Math.random()*100,
      vx: (Math.random()-0.5)*2,
      vy: 1+Math.random()*2.8,
      r: 2+Math.random()*3,
      life: 120+Math.random()*60
    });
  }
}
function stepFX(){
  ctx.clearRect(0,0,fxCanvas.width,fxCanvas.height);
  particles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy; p.vy += 0.02; p.life--;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = `hsl(${(p.x/4)%360}deg,90%,60%)`;
    ctx.fill();
  });
  particles = particles.filter(p=>p.life>0 && p.y<fxCanvas.height+20);
  if (particles.length) requestAnimationFrame(stepFX);
}
function stopFX(){ particles=[]; ctx.clearRect(0,0,fxCanvas.width,fxCanvas.height); }
function resizeCanvas(){ fxCanvas.width = innerWidth; fxCanvas.height = innerHeight; }
window.addEventListener("resize", resizeCanvas);

// hook into playLoseWin to show confetti on win
const _playLoseWin = playLoseWin;
playLoseWin = function(who){
  _playLoseWin(who);
  if (who==='x' || who==='o'){ spawnConfetti(); stepFX(); }
};

// ---------- init defaults on first load ----------
applySkinToEmptyCells();
updateAudioButtons();
