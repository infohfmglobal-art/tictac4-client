/* ----------------------------------------
   RuneXO – Phase 1.3 (Stable)
   - Clean intro → login → home → game (no peeking)
   - CPU Easy/Normal/Hard, 4 skins, unified glow
   - Music OFF by default (toggleable), SFX ON
   - Coins + local leaderboard
   - Cinematic Rune Alert (no window.alert)
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
// draw fallback
try {
  fetch('./sound/draw.mp3', {cache:'no-store'}).then(r=>{
    if(!r.ok) audio.draw = audio.win;
  }).catch(()=>{ audio.draw = audio.win; });
} catch { /* ignore */ }

let musicOn = false; // player choice
let sfxOn   = true;

function playSfx(a){ if(sfxOn){ a.currentTime=0; a.play().catch(()=>{}); } }
function ensureBg(){ if(musicOn && audio.bg.paused){ audio.bg.volume=.4; audio.bg.play().catch(()=>{}); } }
function stopBg(){ audio.bg.pause(); }

// ===== ELEMENTS =====
const introSplash = document.getElementById("introSplash");
const loginGate   = document.getElementById("loginGate");
const flashOverlay= document.getElementById("flashOverlay");
const homeScreen  = document.getElementById("homeScreen");
const gameArea    = document.getElementById("gameArea");
const installOrb  = document.getElementById("installOrb");

const guestBtn = document.getElementById("guestLoginGate");
const googleBtn= document.getElementById("googleLoginGate");
const logoutBtn= document.getElementById("logoutBtn");

const startBtn = document.getElementById("startBtn");
const homeBtn  = document.getElementById("homeBtn");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const resetBtn = document.getElementById("resetBtn");
const musicBtn = document.getElementById("musicBtn");
const sfxBtn   = document.getElementById("sfxBtn");

const boardEl  = document.getElementById("gameBoard");
const cells    = Array.from(boardEl.querySelectorAll(".cell"));

const themeSelect = document.getElementById("themeSelect");
const modeSel = document.getElementById("gameMode");
const diffSel = document.getElementById("difficulty");
const skinSel = document.getElementById("skin");
const coinsBadge = document.getElementById("playerCoins");

// ===== RUNE ALERT =====
const runeAlert = document.getElementById("runeAlert");
const runeTitle = document.getElementById("runeTitle");
const runeText  = document.getElementById("runeText");
const runeOk    = document.getElementById("runeOk");
function showAlert(title, text, onOk){
  runeTitle.textContent = title;
  runeText.textContent  = text;
  runeAlert.classList.remove("hidden");
  runeOk.onclick = ()=>{ runeAlert.classList.add("hidden"); onOk && onOk(); };
}

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
function spawnConfetti(x,y,count=120){
  for(let i=0;i<count;i++){
    particles.push({x,y,vx:(Math.random()*2-1)*6,vy:-Math.random()*8-3,g:0.18+Math.random()*0.12,life:60+Math.random()*30,size:4+Math.random()*4,opacity:1,hue:Math.floor(30+Math.random()*60)});
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
function elementCenter(el){ const r = el.getBoundingClientRect(); return { x: r.left+r.width/2, y: r.top+r.height/2 }; }
function confettiBurstAt(el){ const {x,y}= el? elementCenter(el) : {x:innerWidth/2,y:innerHeight/2}; spawnConfetti(x,y,140); }

// ===== COINS / LEADERBOARD =====
let coins = Number(localStorage.getItem("rxo_coins")||"0");
function setCoins(v){ coins=Math.max(0,Number(v||0)); localStorage.setItem("rxo_coins",String(coins)); if(coinsBadge) coinsBadge.textContent=`💰 ${coins}`; }
function addCoins(delta){ setCoins(coins+delta); coinFloat("+"+delta); }
function coinFloat(text="+20"){
  if(!coinsBadge) return;
  const r = coinsBadge.getBoundingClientRect();
  const fx = document.createElement("div");
  fx.textContent = `💰 ${text}`;
  fx.style.position="fixed"; fx.style.left=(r.left+r.width/2-18)+"px"; fx.style.top=(r.top-6)+"px";
  fx.style.color="gold"; fx.style.textShadow="0 0 12px #ffcc33"; fx.style.fontWeight="700"; fx.style.transition="transform 1s, opacity 1s"; fx.style.zIndex="60";
  document.body.appendChild(fx);
  requestAnimationFrame(()=>{ fx.style.transform="translateY(-40px)"; fx.style.opacity="0"; });
  setTimeout(()=> fx.remove(), 1000);
}
setCoins(coins);

function addToLeaderboard(){
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

// ===== INTRO → LOGIN (no peeking) =====
window.addEventListener("DOMContentLoaded", ()=>{
  // Hard hide everything except splash
  loginGate.classList.add("hidden");
  homeScreen.classList.add("hidden");
  gameArea.classList.add("hidden");

  setupFxCanvas();

  // Soft bell
  setTimeout(()=>{ if(audio.intro){ audio.intro.volume=.45; audio.intro.currentTime=0; audio.intro.play().catch(()=>{}); }}, 200);

  // After 3s show login only
  setTimeout(()=>{
    introSplash.classList.add("fade-out");
    setTimeout(()=>{
      introSplash.style.display="none";
      loginGate.classList.remove("hidden");
    }, 900);
  }, 3000);
});

// ===== LOGIN → HOME =====
function goldenFlashThen(cb){
  flashOverlay.classList.add("flash-show");
  setTimeout(()=>{ flashOverlay.classList.remove("flash-show"); cb && cb(); }, 650);
}
function showHome(){
  goldenFlashThen(()=>{
    loginGate.classList.add("hidden");
    homeScreen.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    setTimeout(()=>{ installOrb.classList.remove("hidden"); installOrb.classList.add("show"); }, 900);
  });
}

guestBtn.onclick = ()=>{
  if(coins===0) setCoins(200); // welcome once
  showHome();
};
googleBtn.onclick = ()=>{
  if(coins===0) setCoins(200);
  showHome();
};
logoutBtn.onclick = ()=>{
  homeScreen.classList.add("hidden");
  gameArea.classList.add("hidden");
  loginGate.classList.remove("hidden");
  stopBg();
};

// ===== INSTALL ORB =====
installOrb.onclick = async ()=>{
  const p = window.deferredPrompt;
  if(!p){ showAlert("Install", "Already installed or not supported."); return; }
  p.prompt(); await p.userChoice; window.deferredPrompt = null;
};

// ===== GAME STATE & LOGIC =====
let board, current, running, againstCPU;

const SKINS = {
  "Runes":            { P1:"🐉", P2:"🕊️" },
  "Classic X / O":    { P1:"X",  P2:"O"  },
  "Fruit":            { P1:"🍎", P2:"🍊" },
  "Emoji":            { P1:"😎", P2:"🤖" }
};
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function paintCellStyle(el, mark){
  el.style.color="gold"; el.style.textShadow="0 0 14px #ffcc33, 0 0 28px #ff9900";
  if(mark==="X"){ el.style.color="#00ffff"; el.style.textShadow="0 0 12px #00ffff,0 0 24px #00cccc"; }
  if(mark==="O"){ el.style.color="#ff66cc"; el.style.textShadow="0 0 12px #ff66cc,0 0 24px #ff3399"; }
}

function initGame(){
  // theme
  document.body.className = `theme-${themeSelect.value.toLowerCase()}`;

  // state
  board = Array(9).fill(null);
  current = "P1";
  running = true;
  againstCPU = (modeSel.value === "Player vs CPU");

  // grid
  cells.forEach(c=>{
    c.textContent=""; c.classList.remove("win"); c.style.color=""; c.style.textShadow="";
    c.onclick = ()=> handleMove(c);
  });

  // toggle labels
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
  sfxBtn.textContent   = sfxOn   ? "🔊 SFX ON"   : "🔈 SFX OFF";
}

function handleMove(cell){
  if(!running) return;
  const idx = Number(cell.dataset.index);
  if(board[idx]) return;

  const mark = current==="P1" ? SKINS[skinSel.value].P1 : SKINS[skinSel.value].P2;
  cell.textContent = mark;
  paintCellStyle(cell, mark);
  board[idx] = current;
  playSfx(audio.click);

  const result = checkResult();
  if(result) return endRound(result, cell);

  current = (current==="P1") ? "P2" : "P1";

  if(running && againstCPU && current==="P2"){
    setTimeout(cpuMove, 350);
  }
}

function cpuMove(){
  const diff = diffSel.value;
  const empty = board.map((v,i)=> v? null : i).filter(v=>v!==null);
  if(empty.length===0) return;

  let move=null;
  if(diff==="Easy"){
    move = empty[Math.floor(Math.random()*empty.length)];
  } else if(diff==="Normal"){
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
    board[i]=player;
    const r = checkResult();
    board[i]=null;
    if(r && r.winner) return i;
  }
  return null;
}

function staticWinner(arr){
  for(const [a,b,c] of LINES){ if(arr[a] && arr[a]===arr[b] && arr[a]===arr[c]) return arr[a]; }
  return null;
}
function checkResult(){
  const w = staticWinner(board);
  if(w) return { winner:w };
  if(board.every(Boolean)) return { draw:true };
  return null;
}

function endRound(res, lastCell){
  running = false;
  cells.forEach(c=> c.onclick=null);

  if(res.winner){
    // highlight win line
    for(const [a,b,c] of LINES){ if(board[a] && board[a]===board[b] && board[a]===board[c]){ [a,b,c].forEach(i=>cells[i].classList.add("win")); } }
    confettiBurstAt(lastCell || null);

    const winnerText = (res.winner==="P1") ? "You Win!" : (againstCPU ? "CPU Wins!" : "Player 2 Wins!");
    if(res.winner==="P1"){
      playSfx(audio.win); addCoins(20); addToLeaderboard();
      showAlert("Victory", `${winnerText} (+20 coins)`);
    } else {
      playSfx(audio.lose);
      showAlert("Defeat", `${winnerText}`);
    }
  } else {
    confettiBurstAt(null); playSfx(audio.draw); addCoins(5);
    showAlert("Draw", "Well fought! (+5 coins)");
  }
}

// minimax
function minimax(state, player){
  const avail = state.map((v,i)=> v? null : i).filter(v=>v!==null);
  const w = staticWinner(state);
  if(w==="P1") return { score:-10 };
  if(w==="P2") return { score:10 };
  if(avail.length===0) return { score:0 };

  const moves=[];
  for(const i of avail){
    const move={ index:i };
    state[i]=player;
    const next = (player==="P2") ? minimax(state,"P1") : minimax(state,"P2");
    move.score=next.score; state[i]=null; moves.push(move);
  }
  let best=null;
  if(player==="P2"){ let mx=-Infinity; moves.forEach(m=>{ if(m.score>mx){mx=m.score;best=m;} }); }
  else{ let mn= Infinity; moves.forEach(m=>{ if(m.score<mn){mn=m.score;best=m;} }); }
  return best;
}

// ===== BUTTONS / NAV =====
startBtn.onclick = ()=>{
  homeScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  initGame();
};
homeBtn.onclick = ()=>{
  gameArea.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  stopBg();
};
nextRoundBtn.onclick = ()=> initGame();
resetBtn.onclick     = ()=> initGame();

musicBtn.onclick = ()=>{
  musicOn = !musicOn;
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
  if(musicOn) ensureBg(); else stopBg();
};
sfxBtn.onclick = ()=>{
  sfxOn = !sfxOn;
  sfxBtn.textContent = sfxOn ? "🔊 SFX ON" : "🔈 SFX OFF";
};
