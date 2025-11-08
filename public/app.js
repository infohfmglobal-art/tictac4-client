/* ----------------------------------------
   RuneXO – Phase 1.2 Final
   - Intro bell (short) + splash 3s
   - Login gate → home with golden flash
   - 4 skins unified size & glow (Runes, Classic X/O 2 colors, Fruit, Emoji)
   - Music OFF by default (player choice); SFX ON by default
   - Custom Rune Alert (no window.alert)
   - Confetti + coin +X burst
   - Local coins + leaderboard
   - Proper controls layout, logout → login gate
-----------------------------------------*/

// ===== AUDIO =====
const audio = {
  intro: document.getElementById("introBell"),
  bg: new Audio("./sound/bg.mp3"),
  click: new Audio("./sound/click.mp3"),
  win: new Audio("./sound/win.mp3"),
  lose: new Audio("./sound/lose.mp3"),
  draw: new Audio("./sound/draw.mp3")
};
audio.bg.loop = true;
[audio.click, audio.win, audio.lose, audio.draw].forEach(a => (a.preload = "auto"));

// ✅ Fallback if draw sound is missing
fetch('./sound/draw.mp3', { cache: 'no-store' })
  .then(r => { if (!r.ok) audio.draw = audio.win; })
  .catch(() => { audio.draw = audio.win; });

// default: player choice — OFF at start
let musicOn = false;
let sfxOn = true;

function playSfx(a) {
  if (sfxOn) { a.currentTime = 0; a.play().catch(() => {}); }
}
function ensureBg() {
  if (musicOn && audio.bg.paused) {
    audio.bg.volume = 0.4;
    audio.bg.play().catch(() => {});
  }
}
function stopBg() { audio.bg.pause(); }

// ===== COINS (LOCAL) =====
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
setCoins(coins);

// ===== CONFETTI CANVAS =====
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
  resize(); window.addEventListener("resize", resize);
  requestAnimationFrame(tickParticles);
}
function spawnConfetti(x, y, count=120){
  for(let i=0;i<count;i++){
    particles.push({
      x, y,
      vx:(Math.random()*2-1)*6,
      vy:-Math.random()*8-3,
      g:0.18+Math.random()*0.12,
      life:60+Math.random()*30,
      size:4+Math.random()*4,
      opacity:1,
      hue:Math.floor(30+Math.random()*60)
    });
  }
}
function tickParticles(){
  if(!fxCtx){ requestAnimationFrame(tickParticles); return; }
  fxCtx.clearRect(0,0,fxW,fxH);
  particles.forEach(p=>{
    p.life--; p.x+=p.vx; p.y+=p.vy; p.vy+=p.g;
    p.opacity = Math.max(0, p.life/90);
    fxCtx.fillStyle = `hsla(${p.hue},100%,60%,${p.opacity})`;
    fxCtx.beginPath(); fxCtx.arc(p.x,p.y,p.size,0,Math.PI*2); fxCtx.fill();
  });
  particles = particles.filter(p=> p.life>0 && p.y<fxH+40);
  requestAnimationFrame(tickParticles);
}
function centerXY(){ return { x: window.innerWidth/2, y: window.innerHeight/2 }; }
function elementCenter(el){ const r = el.getBoundingClientRect(); return { x:r.left+r.width/2, y:r.top+r.height/2 }; }
function confettiBurstAt(elOrXY){ let x,y; if(!elOrXY){({x,y}=centerXY());} else if(elOrXY.x!=null){x=elOrXY.x;y=elOrXY.y;} else {({x,y}=elementCenter(elOrXY));} spawnConfetti(x,y,140); }

// ===== COIN FLOAT =====
function coinFloat(text="+20"){
  const badge = document.getElementById("playerCoins");
  if(!badge) return;
  const r = badge.getBoundingClientRect();
  const fx = document.createElement("div");
  fx.textContent = `💰 ${text}`;
  fx.style.position="fixed";
  fx.style.left = (r.left + r.width/2 - 18) + "px";
  fx.style.top  = (r.top - 6) + "px";
  fx.style.color = "gold";
  fx.style.textShadow = "0 0 12px #ffcc33";
  fx.style.fontWeight = "700";
  fx.style.transition = "transform 1s ease, opacity 1s ease";
  fx.style.zIndex = "60";
  document.body.appendChild(fx);
  requestAnimationFrame(()=>{ fx.style.transform = "translateY(-40px)"; fx.style.opacity = "0"; });
  setTimeout(()=> fx.remove(), 1000);
}

// ===== RUNE ALERT (cinematic) =====
const runeAlert = document.getElementById("runeAlert");
const runeTitle = document.getElementById("runeTitle");
const runeText  = document.getElementById("runeText");
const runeOk    = document.getElementById("runeOk");
function showAlert(title, text, onOk){
  runeTitle.textContent = title;
  runeText.textContent = text;
  runeAlert.classList.remove("hidden");
  runeOk.onclick = ()=>{ runeAlert.classList.add("hidden"); onOk && onOk(); };
}

// ===== SPLASH → LOGIN =====
window.addEventListener("DOMContentLoaded", () => {
  setupFxCanvas();
  const splash = document.getElementById("introSplash");
  const loginGate = document.getElementById("loginGate");

  // short bell (2s file recommended)
  setTimeout(()=>{ audio.intro && audio.intro.play().catch(()=>{}); }, 500);

  setTimeout(()=>{
    splash.classList.add("hide");
    setTimeout(()=> loginGate.classList.remove("hidden"), 900);
  }, 3000);
});

// ===== LOGIN → HOME =====
const flashOverlay = document.getElementById("flashOverlay");
const guestBtn = document.getElementById("guestLoginGate");
const googleBtn = document.getElementById("googleLoginGate");
const homeScreen = document.getElementById("homeScreen");
const installOrb = document.getElementById("installOrb");
const logoutBtn = document.getElementById("logoutBtn");

function goldenFlashThen(cb){
  flashOverlay.classList.add("flash-show");
  setTimeout(()=>{ flashOverlay.classList.remove("flash-show"); flashOverlay.classList.add("flash-hide"); cb && cb(); }, 650);
}
function showHome(){
  goldenFlashThen(()=>{
    document.getElementById("loginGate").classList.add("hidden");
    homeScreen.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    setTimeout(()=>{ installOrb.classList.remove("hidden"); installOrb.classList.add("show"); }, 1000);
  });
}

guestBtn.addEventListener("click", () => {
  if (coins === 0) setCoins(200); // welcome bonus once
  showHome();
});
googleBtn.addEventListener("click", () => {
  // Phase 2: replace with real Google login
  if (coins === 0) setCoins(200);
  showHome();
});
logoutBtn.addEventListener("click", () => {
  // back to login gate
  homeScreen.classList.add("hidden");
  document.getElementById("loginGate").classList.remove("hidden");
});

// INSTALL ORB
installOrb.addEventListener("click", async ()=>{
  const p = window.deferredPrompt;
  if(!p){ showAlert("Install", "Already installed or not supported yet."); return; }
  p.prompt(); await p.userChoice; window.deferredPrompt = null;
});

// ===== HOME → GAME =====
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
  // music OFF by default — player toggles
});

// ===== GAME STATE =====
const boardEl = document.getElementById("gameBoard");
const cells = Array.from(boardEl.querySelectorAll(".cell"));
const nextRoundBtn = document.getElementById("nextRoundBtn");
const resetBtn = document.getElementById("resetBtn");
const homeBtn = document.getElementById("homeBtn");
const musicBtn = document.getElementById("musicBtn");
const sfxBtn = document.getElementById("sfxBtn");

let board, current, running, againstCPU;

// unified skins (same size look)
const SKINS = {
  "Runes":       { P1: "🐉", P2: "🕊️" },   // full phoenix bird
  "Classic X / O": { P1: "X",  P2: "O"  },
  "Fruit":       { P1: "🍎", P2: "🍊" },
  "Emoji":       { P1: "😎", P2: "🤖" }
};

function paintCellStyle(el, mark){
  // glow styles per mark type
  el.style.textShadow = "0 0 14px #ffcc33, 0 0 28px #ff9900";
  el.style.color = "gold";
  if(mark === "X"){ el.style.color="#00ffff"; el.style.textShadow="0 0 12px #00ffff,0 0 24px #00cccc"; }
  if(mark === "O"){ el.style.color="#ff66cc"; el.style.textShadow="0 0 12px #ff66cc,0 0 24px #ff3399"; }
}

function initGame(){
  document.body.className = `theme-${themeSelect.value.toLowerCase()}`;

  board  = Array(9).fill(null);
  current= "P1";
  running= true;
  againstCPU = (modeSel.value === "Player vs CPU");

  cells.forEach(c=>{
    c.textContent=""; c.classList.remove("win");
    c.style.color=""; c.style.textShadow="";
    c.onclick = ()=> onCell(c);
  });

  // keep toggles reflecting state
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
  sfxBtn.textContent   = sfxOn   ? "🔊 SFX ON"   : "🔈 SFX OFF";
}

function onCell(cell){
  if(!running) return;
  const idx = Number(cell.dataset.index);
  if(board[idx]) return;

  const mark = current === "P1" ? SKINS[skinSel.value].P1 : SKINS[skinSel.value].P2;
  cell.textContent = mark;
  paintCellStyle(cell, mark);
  board[idx] = current;
  playSfx(audio.click);

  const result = checkResult();
  if(result) return endRound(result, cell);

  current = (current === "P1") ? "P2" : "P1";

  if(running && againstCPU && current === "P2"){
    setTimeout(cpuMove, 350);
  }
}

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function staticWinner(arr){
  for(const [a,b,c] of LINES){ if(arr[a] && arr[a]===arr[b] && arr[a]===arr[c]) return arr[a]; }
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
  cells.forEach(c=> c.onclick = null);

  if(res.winner){
    // highlight win line
    for(const [a,b,c] of LINES){ if(board[a] && board[a]===board[b] && board[a]===board[c]){ [a,b,c].forEach(i=>cells[i].classList.add("win")); } }
    confettiBurstAt(lastCell || undefined);

    const winnerText = (res.winner==="P1") ? "You Win!" : (againstCPU ? "CPU Wins!" : "Player 2 Wins!");
    if(res.winner==="P1"){ playSfx(audio.win); addCoins(20); addToLeaderboard(); showAlert("Victory", `${winnerText}  (+20 coins)`); }
    else{ playSfx(audio.lose); showAlert("Defeat", `${winnerText}`); }
  } else {
    confettiBurstAt(); playSfx(audio.draw); addCoins(5); showAlert("Draw", "Well fought! (+5 coins)");
  }
}

function addToLeaderboard(){
  // simple “fastest” proxy: # of filled cells (fewer is better)
  const moves = board.filter(Boolean).length;
  const entry = { t: Date.now(), moves, skin: skinSel.value, diff: diffSel.value };
  const key="rxo_leader";
  const list = JSON.parse(localStorage.getItem(key)||"[]");
  list.push(entry);
  list.sort((a,b)=> a.moves - b.moves);
  localStorage.setItem(key, JSON.stringify(list.slice(0,10)));
  paintLeaderboard();
}
function paintLeaderboard(){
  const key="rxo_leader";
  const list = JSON.parse(localStorage.getItem(key)||"[]");
  const ul = document.getElementById("leaderList");
  if(!ul) return;
  ul.innerHTML = "";
  list.forEach((e,i)=>{
    const li = document.createElement("li");
    const d  = new Date(e.t).toLocaleDateString();
    li.textContent = `${i+1}. ${e.moves} moves · ${e.diff} · ${e.skin} · ${d}`;
    ul.appendChild(li);
  });
}
paintLeaderboard();

// ===== CPU (Easy/Normal/Hard) =====
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
  paintCellStyle(cell, mark);
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
    const next = (player==="P2") ? minimax(state, "P1") : minimax(state, "P2");
    move.score = next.score;
    state[i] = null;
    moves.push(move);
  }
  let best=null;
  if(player==="P2"){ let mx=-Infinity; moves.forEach(m=>{ if(m.score>mx){mx=m.score;best=m;} }); }
  else{ let mn= Infinity; moves.forEach(m=>{ if(m.score<mn){mn=m.score;best=m;} }); }
  return best;
}

// ===== CONTROLS =====
nextRoundBtn.onclick = () => { initGame(); };
resetBtn.onclick     = () => { initGame(); };
homeBtn.onclick      = () => {
  gameArea.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  stopBg(); // optional stop when returning home
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
