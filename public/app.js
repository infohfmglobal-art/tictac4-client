/* ----------------------------------------
   RuneXO – Phase 1.1
   Adds:
   - Confetti burst (canvas overlay)
   - Coin +X floating animation
   - Local coins (guest mode) + badge update
   - CPU Easy/Normal/Hard (minimax already)
-----------------------------------------*/

// ---------- AUDIO ----------
const audio = {
  bg: new Audio("./sound/bg.mp3"),
  click: new Audio("./sound/click.mp3"),
  win: new Audio("./sound/win.mp3"),
  lose: new Audio("./sound/lose.mp3"),
};
audio.bg.loop = true;
[audio.click, audio.win, audio.lose].forEach(a => (a.preload = "auto"));

let musicOn = true;
let sfxOn = true;

function playSfx(a){ if(sfxOn){ a.currentTime = 0; a.play().catch(()=>{}); } }
function ensureBgPlaying(){
  if(musicOn && audio.bg.paused){
    audio.bg.volume = 0.45;
    audio.bg.play().catch(()=>{});
  }
}
function stopBg(){ audio.bg.pause(); }

// ---------- COINS (LOCAL) ----------
let coins = Number(localStorage.getItem("rxo_coins") || "0");
function setCoins(v){
  coins = Math.max(0, Number(v||0));
  localStorage.setItem("rxo_coins", String(coins));
  const badge = document.getElementById("playerCoins");
  if (badge) badge.textContent = `💰 ${coins}`;
}
function addCoins(delta){
  setCoins(coins + delta);
  coinFloat(`+${delta}`);
}
setCoins(coins); // paint badge if present

// ---------- CONFETTI CANVAS + COIN FLOAT FX ----------
let fxCanvas, fxCtx, fxW, fxH, particles = [];

function setupFxCanvas(){
  fxCanvas = document.createElement("canvas");
  fxCanvas.id = "fxCanvas";
  fxCanvas.style.position = "fixed";
  fxCanvas.style.inset = "0";
  fxCanvas.style.pointerEvents = "none";
  fxCanvas.style.zIndex = "50";
  document.body.appendChild(fxCanvas);
  fxCtx = fxCanvas.getContext("2d");
  const resize = ()=>{ fxW = fxCanvas.width = window.innerWidth; fxH = fxCanvas.height = window.innerHeight; };
  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(tickParticles);
}
function spawnConfetti(x, y, count=120){
  for(let i=0;i<count;i++){
    particles.push({
      x, y,
      vx: (Math.random()*2-1)*6,
      vy: -Math.random()*8 - 3,
      g: 0.18 + Math.random()*0.12,
      life: 60 + Math.random()*30,
      size: 4 + Math.random()*4,
      opacity: 1,
      hue: Math.floor(30 + Math.random()*60) // warm palette
    });
  }
}
function tickParticles(){
  if(!fxCtx){ requestAnimationFrame(tickParticles); return; }
  fxCtx.clearRect(0,0,fxW,fxH);
  particles.forEach(p=>{
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.opacity = Math.max(0, p.life/90);
    fxCtx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.opacity})`;
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    fxCtx.fill();
  });
  particles = particles.filter(p=> p.life>0 && p.y<fxH+40);
  requestAnimationFrame(tickParticles);
}
function centerXY(){
  return { x: window.innerWidth/2, y: window.innerHeight/2 };
}
function elementCenter(el){
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width/2, y: r.top + r.height/2 };
}
function confettiBurstAt(elOrXY){
  let x, y;
  if(!elOrXY){ ({x,y} = centerXY()); }
  else if(elOrXY.x!=null){ x = elOrXY.x; y = elOrXY.y; }
  else { ({x,y} = elementCenter(elOrXY)); }
  spawnConfetti(x, y, 140);
}
function coinFloat(text="+20"){
  const badge = document.getElementById("playerCoins");
  const fx = document.createElement("div");
  fx.className = "coin-fx";
  fx.textContent = `💰 ${text}`;
  document.body.appendChild(fx);
  const target = badge ? elementCenter(badge) : centerXY();
  fx.style.left = (target.x - 18) + "px";
  fx.style.top  = (target.y - 8) + "px";
  // animate then remove
  setTimeout(()=> fx.classList.add("rise"), 10);
  setTimeout(()=> fx.remove(), 1000);
}

// ---------- SPLASH → LOGIN ----------
window.addEventListener("DOMContentLoaded", () => {
  setupFxCanvas();

  const splash = document.getElementById("introSplash");
  const loginGate = document.getElementById("loginGate");

  setTimeout(() => {
    splash.classList.add("hide");
    setTimeout(() => loginGate.classList.remove("hidden"), 900);
  }, 3000);
});

// ---------- LOGIN → HOME ----------
const flashOverlay = document.getElementById("flashOverlay");
const guestBtn = document.getElementById("guestLoginGate");
const googleBtn = document.getElementById("googleLoginGate");
const homeScreen = document.getElementById("homeScreen");
const installOrb = document.getElementById("installOrb");

function goldenFlashThen(callback){
  flashOverlay.classList.add("flash-show");
  setTimeout(() => {
    flashOverlay.classList.remove("flash-show");
    flashOverlay.classList.add("flash-hide");
    if(callback) callback();
  }, 650);
}
function showHome(){
  goldenFlashThen(() => {
    document.getElementById("loginGate").classList.add("hidden");
    homeScreen.classList.remove("hidden");

    setTimeout(() => {
      installOrb.classList.remove("hidden");
      installOrb.classList.add("show");
    }, 1000);
  });
  ensureBgPlaying();
}

guestBtn.addEventListener("click", () => {
  if (coins === 0) setCoins(200); // welcome bonus once
  alert("Guest mode activated! 🪄 Coins are saved locally.");
  showHome();
});
googleBtn.addEventListener("click", () => {
  alert("Google Login coming soon ✨ (Phase 2)");
  if (coins === 0) setCoins(200);
  showHome();
});

// ---------- INSTALL ORB ----------
installOrb.addEventListener("click", async () => {
  const prompt = window.deferredPrompt;
  if(!prompt){ alert("Already installed or not supported yet!"); return; }
  prompt.prompt();
  await prompt.userChoice;
  window.deferredPrompt = null;
});

// ---------- HOME → GAME ----------
const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");
const themeSelect = document.getElementById("themeSelect");
const modeSel = document.getElementById("gameMode");
const diffSel = document.getElementById("difficulty");
const skinSel = document.getElementById("skin");

startBtn.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  initGame();
  ensureBgPlaying();
});

// ---------- GAME STATE ----------
const boardEl = document.getElementById("gameBoard");
const cells = Array.from(boardEl.querySelectorAll(".cell"));
const nextRoundBtn = document.getElementById("nextRoundBtn");
const resetBtn = document.getElementById("resetBtn");
const homeBtn = document.getElementById("homeBtn");
const musicBtn = document.getElementById("musicBtn");
const sfxBtn = document.getElementById("sfxBtn");

let board, current, running, againstCPU;

// Skins
const SKINS = {
  "Runes": { P1: "🐉", P2: "🪽" },
  "Classic X / O": { P1: "X", P2: "O" },
  "Fruit": { P1: "🍎", P2: "🍌" },
  "Emoji": { P1: "😎", P2: "🤖" }
};

function initGame(){
  // Theme swap hook (future palette switch)
  document.body.className = `theme-${themeSelect.value.toLowerCase()}`;

  board = Array(9).fill(null);
  current = "P1";
  running = true;
  againstCPU = (modeSel.value === "Player vs CPU");

  cells.forEach(c=>{
    c.textContent = "";
    c.classList.remove("win");
    c.disabled = false;
  });

  // attach once idempotently
  cells.forEach((cell) => { cell.onclick = () => onCell(cell); });
}

function onCell(cell){
  if(!running) return;
  const idx = Number(cell.dataset.index);
  if(board[idx]) return;

  const mark = current === "P1" ? SKINS[skinSel.value].P1 : SKINS[skinSel.value].P2;
  cell.textContent = mark;
  board[idx] = current;
  playSfx(audio.click);

  const result = checkResult();
  if(result) return endRound(result, cell);

  current = (current === "P1") ? "P2" : "P1";

  if(running && againstCPU && current === "P2"){
    setTimeout(cpuMove, 350);
  }
}

function cpuMove(){
  const diff = diffSel.value;
  const empty = board.map((v,i)=> v? null : i).filter(v=>v!==null);
  if(empty.length === 0) return;

  let move = null;
  if(diff === "Easy"){
    move = empty[Math.floor(Math.random()*empty.length)];
  } else if (diff === "Normal"){
    move = findBest("P2") ?? findBest("P1") ?? empty[Math.floor(Math.random()*empty.length)];
  } else {
    move = minimax(board.slice(), "P2").index;
  }

  const cell = cells[move];
  const mark = SKINS[skinSel.value].P2;
  cell.textContent = mark;
  board[move] = "P2";

  const result = checkResult();
  if(result) return endRound(result, cell);

  current = "P1";
}

function findBest(player){
  const empty = board.map((v,i)=> v? null : i).filter(v=>v!==null);
  for(const i of empty){
    board[i] = player;
    const r = checkResult();
    board[i] = null;
    if(r && r.winner) return i;
  }
  return null;
}

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];
function staticWinner(arr){
  for(const [a,b,c] of LINES){
    if(arr[a] && arr[a]===arr[b] && arr[a]===arr[c]) return arr[a];
  }
  return null;
}
function checkResult(){
  const w = staticWinner(board);
  if(w){ return { winner:w }; }
  if(board.every(Boolean)) return { draw:true };
  return null;
}
function endRound(res, lastCell){
  running = false;
  cells.forEach(c=>c.onclick = null);

  if(res.winner){
    // highlight win line
    for(const line of LINES){
      const [a,b,c] = line;
      if(board[a] && board[a]===board[b] && board[a]===board[c]){
        [a,b,c].forEach(i=> cells[i].classList.add("win"));
      }
    }
    // confetti at winning cell (fallback center)
    confettiBurstAt(lastCell || undefined);

    if(res.winner === "P1"){
      playSfx(audio.win);
      addCoins(20); // reward
      alert("You win! +20 coins 🎉");
    } else {
      playSfx(audio.lose);
      alert("CPU wins!");
    }
  } else {
    // draw: small confetti in center + small coin
    confettiBurstAt();
    addCoins(5);
    alert("Draw! +5 coins");
  }
}

// ---------- MINIMAX ----------
function minimax(state, player){
  const avail = state.map((v,i)=> v? null : i).filter(v=>v!==null);
  const w = staticWinner(state);
  if(w === "P1") return { score:-10 };
  if(w === "P2") return { score:10 };
  if(avail.length === 0) return { score:0 };

  const moves = [];
  for(const i of avail){
    const move = { index:i };
    state[i] = player;
    const next = (player === "P2") ? minimax(state,"P1") : minimax(state,"P2");
    move.score = next.score;
    state[i] = null;
    moves.push(move);
  }
  let best=null;
  if(player === "P2"){
    let max=-Infinity; moves.forEach(m=>{ if(m.score>max){ max=m.score; best=m; } });
  } else {
    let min= Infinity; moves.forEach(m=>{ if(m.score<min){ min=m.score; best=m; } });
  }
  return best;
}

// ---------- CONTROLS ----------
nextRoundBtn.onclick = () => initGame();
resetBtn.onclick = () => initGame();
homeBtn.onclick = () => {
  gameArea.classList.add("hidden");
  homeScreen.classList.remove("hidden");
};

musicBtn.onclick = () => {
  musicOn = !musicOn;
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
  if(musicOn) ensureBgPlaying(); else stopBg();
};
sfxBtn.onclick = () => {
  sfxOn = !sfxOn;
  sfxBtn.textContent = sfxOn ? "🔊 SFX ON" : "🔈 SFX OFF";
};
