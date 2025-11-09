/* ----------------------------------------
   RuneXO – v1.0.6 (FrameWeave Classic)
   Stable flow: Splash → Login → Home → Game
   Features: 4 skins, CPU, SFX/Music toggles, coins, leaderboard, player name
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
fetch("./sound/draw.mp3", {cache:"no-store"})
  .then(r=>{ if(!r.ok) audio.draw = audio.win; })
  .catch(()=>{ audio.draw = audio.win; });

let musicOn = false; // player choice
let sfxOn   = true;

// ===== COINS & NAME =====
let coins = Number(localStorage.getItem("rxo_coins") || "0");
function setCoins(v){
  coins = Math.max(0, Number(v||0));
  localStorage.setItem("rxo_coins", String(coins));
  const badge = document.getElementById("playerCoins");
  if (badge) badge.textContent = `💰 ${coins}`;
}
setCoins(coins);

let playerName = localStorage.getItem("rxo_name") || "Guest Player";
function setPlayerName(name){
  playerName = name || "Guest Player";
  localStorage.setItem("rxo_name", playerName);
  const n1 = document.getElementById("playerNameHome");
  const n2 = document.getElementById("playerNameGame");
  if(n1) n1.textContent = playerName;
  if(n2) n2.textContent = playerName;
}
setPlayerName(playerName);

// ===== CONFETTI (simple) =====
let fxCanvas, fxCtx, fxW, fxH, particles=[];
function setupFx(){
  fxCanvas = document.createElement("canvas");
  fxCanvas.style.position="fixed"; fxCanvas.style.inset="0";
  fxCanvas.style.pointerEvents="none"; fxCanvas.style.zIndex="50";
  document.body.appendChild(fxCanvas);
  fxCtx = fxCanvas.getContext("2d");
  const resize=()=>{ fxW=fxCanvas.width=innerWidth; fxH=fxCanvas.height=innerHeight; };
  resize(); addEventListener("resize", resize);
  requestAnimationFrame(tick);
}
function spawn(x,y,count=120){
  for(let i=0;i<count;i++){
    particles.push({x,y,vx:(Math.random()*2-1)*6,vy:-Math.random()*8-3,g:0.18+Math.random()*0.12,life:60+Math.random()*30,size:4+Math.random()*4,h:30+Math.random()*60,o:1});
  }
}
function tick(){
  fxCtx.clearRect(0,0,fxW,fxH);
  particles.forEach(p=>{p.life--;p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.o=Math.max(0,p.life/90);
    fxCtx.fillStyle=`hsla(${p.h},100%,60%,${p.o})`;fxCtx.beginPath();fxCtx.arc(p.x,p.y,p.size,0,Math.PI*2);fxCtx.fill();
  });
  particles=particles.filter(p=>p.life>0 && p.y<fxH+40);
  requestAnimationFrame(tick);
}
function confettiCenter(){ spawn(innerWidth/2, innerHeight/2, 140); }

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

// ===== ELEMENTS =====
const splash = document.getElementById("introSplash");
const loginGate = document.getElementById("loginGate");
const flashOverlay = document.getElementById("flashOverlay");
const guestBtn = document.getElementById("guestLoginGate");
const googleBtn = document.getElementById("googleLoginGate");
const homeScreen = document.getElementById("homeScreen");
const installOrb = document.getElementById("installOrb");
const logoutBtn = document.getElementById("logoutBtn");

const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");
const boardEl  = document.getElementById("gameBoard");
const cells    = Array.from(boardEl.querySelectorAll(".cell"));
const nextRoundBtn = document.getElementById("nextRoundBtn");
const resetBtn     = document.getElementById("resetBtn");
const homeBtn      = document.getElementById("homeBtn");
const musicBtn     = document.getElementById("musicBtn");
const sfxBtn       = document.getElementById("sfxBtn");

const modeSel  = document.getElementById("gameMode");
const diffSel  = document.getElementById("difficulty");
const skinSel  = document.getElementById("skin");
const themeSel = document.getElementById("themeSelect");

// ===== SAFE INITIAL STATE =====
window.addEventListener("DOMContentLoaded", () => {
  setupFx();

  // always start with: splash visible, ONLY login hidden (others hidden)
  loginGate.classList.add("hidden");
  homeScreen.classList.add("hidden");
  gameArea.classList.add("hidden");

  // small intro bell
  setTimeout(()=>{ if(audio.intro){ audio.intro.volume=0.5; audio.intro.currentTime=0; audio.intro.play().catch(()=>{});} }, 200);

  // splash → login
  setTimeout(()=>{
    splash.classList.add("fade-out");
    setTimeout(()=>{
      splash.style.display="none";
      loginGate.classList.remove("hidden");
    }, 900);
  }, 2500);
});

// ===== LOGIN → HOME =====
function goldenFlash(cb){
  flashOverlay.classList.add("flash-show");
  setTimeout(()=>{ flashOverlay.classList.remove("flash-show"); cb && cb(); }, 650);
}

guestBtn.addEventListener("click", () => {
  if (!localStorage.getItem("rxo_name")) setPlayerName("Guest Player");
  if (Number(localStorage.getItem("rxo_coins")||"0") === 0) setCoins(200);
  goldenFlash(()=>{
    loginGate.classList.add("hidden");
    homeScreen.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    // show install orb a bit later
    setTimeout(()=>{ installOrb.classList.remove("hidden"); installOrb.classList.add("show"); }, 800);
  });
});

googleBtn.addEventListener("click", () => {
  // Phase 2: real Google login; for now, let user type a name
  const name = prompt("Enter your name (Phase 2 will use Google):", playerName) || "Guest Player";
  setPlayerName(name);
  if (Number(localStorage.getItem("rxo_coins")||"0") === 0) setCoins(200);
  goldenFlash(()=>{
    loginGate.classList.add("hidden");
    homeScreen.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    setTimeout(()=>{ installOrb.classList.remove("hidden"); installOrb.classList.add("show"); }, 800);
  });
});

logoutBtn.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  gameArea.classList.add("hidden");
  loginGate.classList.remove("hidden");
});

// Install orb
document.getElementById("installOrb").addEventListener("click", async ()=>{
  const p = window.deferredPrompt;
  if(!p){ showAlert("Install", "Already installed or not supported yet."); return; }
  p.prompt(); await p.userChoice; window.deferredPrompt = null;
});

// ===== HOME → GAME =====
startBtn.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  initGame();
});

// ===== GAME LOGIC =====
const SKINS = {
  "Runes":           { P1: "🐉", P2: "🕊️" },    // dragon vs phoenix
  "Classic X / O":   { P1: "X",   P2: "O"   },
  "Fruit":           { P1: "🍎", P2: "🍊" },
  "Emoji":           { P1: "😎", P2: "🤖" }
};

let board = Array(9).fill(null);
let current = "P1";
let running = false;
let vsCPU   = true;

function paintCellStyle(el, mark){
  el.style.textShadow = "0 0 14px #ffcc33, 0 0 28px #ff9900";
  el.style.color = "gold";
  if(mark === "X"){ el.style.color="#00ffff"; el.style.textShadow="0 0 12px #00ffff,0 0 24px #00cccc"; }
  if(mark === "O"){ el.style.color="#ff66cc"; el.style.textShadow="0 0 12px #ff66cc,0 0 24px #ff3399"; }
}

function initGame(){
  // theme hook
  document.body.className = `theme-${themeSel.value.toLowerCase()}`;

  board = Array(9).fill(null);
  current = "P1";
  running = true;
  vsCPU = (modeSel.value === "Player vs CPU");

  // keep names visible
  document.getElementById("playerNameHome").textContent = playerName;
  document.getElementById("playerNameGame").textContent = playerName;

  // reset cells
  cells.forEach(c=>{
    c.textContent=""; c.classList.remove("win");
    c.style.color=""; c.style.textShadow="";
    c.onclick = ()=>handleMove(c);
  });

  // reflect toggle states
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
  sfxBtn.textContent   = sfxOn   ? "🔊 SFX ON"   : "🔈 SFX OFF";
}

function playSfx(a){ if(sfxOn){ a.currentTime=0; a.play().catch(()=>{});} }
function ensureBg(){ if(musicOn && audio.bg.paused){ audio.bg.volume=0.4; audio.bg.play().catch(()=>{});} }
function stopBg(){ audio.bg.pause(); }

function handleMove(cell){
  if(!running) return;
  const idx = Number(cell.dataset.index);
  if(board[idx]) return;

  const mark = current==="P1" ? SKINS[skinSel.value].P1 : SKINS[skinSel.value].P2;
  cell.textContent = mark; paintCellStyle(cell, mark);
  board[idx] = current;
  playSfx(audio.click);

  const res = checkWinner();
  if(res) return endRound(res, cell);

  current = (current==="P1") ? "P2" : "P1";

  if(running && vsCPU && current==="P2"){
    setTimeout(cpuMove, 350);
  }
}

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function staticWinner(arr){
  for(const [a,b,c] of LINES){ if(arr[a] && arr[a]===arr[b] && arr[a]===arr[c]) return arr[a]; }
  return null;
}
function checkWinner(){
  const w = staticWinner(board);
  if(w) return { winner:w };
  if(board.every(Boolean)) return { draw:true };
  return null;
}

function cpuMove(){
  const diff = diffSel.value;
  const empty = board.map((v,i)=> v? null : i).filter(v=>v!==null);
  if(empty.length===0) return;

  let move=null;
  if(diff==="Easy"){
    move = empty[Math.floor(Math.random()*empty.length)];
  } else if (diff==="Normal"){
    move = findBest("P2") ?? findBest("P1") ?? empty[Math.floor(Math.random()*empty.length)];
  } else {
    move = minimax(board.slice(), "P2").index;
  }

  const cell = cells[move];
  const mark = SKINS[skinSel.value].P2;
  cell.textContent = mark; paintCellStyle(cell, mark);
  board[move] = "P2";

  const res = checkWinner();
  if(res) return endRound(res, cell);

  current = "P1";
}
function findBest(player){
  const empty = board.map((v,i)=> v? null : i).filter(v=>v!==null);
  for(const i of empty){
    board[i]=player;
    const r=checkWinner();
    board[i]=null;
    if(r && r.winner) return i;
  }
  return null;
}
function minimax(state, player){
  const avail = state.map((v,i)=> v? null : i).filter(v=>v!==null);
  const w = staticWinner(state);
  if(w==="P1") return {score:-10};
  if(w==="P2") return {score:10};
  if(avail.length===0) return {score:0};
  const moves=[];
  for(const i of avail){
    const mv={index:i};
    state[i]=player;
    const next=(player==="P2")?minimax(state,"P1"):minimax(state,"P2");
    mv.score=next.score; state[i]=null; moves.push(mv);
  }
  let best=null;
  if(player==="P2"){ let mx=-Infinity; moves.forEach(m=>{if(m.score>mx){mx=m.score;best=m;}}); }
  else{ let mn= Infinity; moves.forEach(m=>{if(m.score<mn){mn=m.score;best=m;}}); }
  return best;
}

function endRound(res, lastCell){
  running=false;
  cells.forEach(c=> c.onclick=null);

  if(res.winner){
    // highlight win line
    for(const [a,b,c] of LINES){ if(board[a] && board[a]===board[b] && board[a]===board[c]){ [a,b,c].forEach(i=>cells[i].classList.add("win")); } }
    confettiCenter();
    if(res.winner==="P1"){
      playSfx(audio.win);
      addCoins(20);
      addToLeaderboard();
      showAlert("Victory", `${playerName} wins! (+20 coins)`);
    } else {
      playSfx(audio.lose);
      showAlert("Defeat", `${vsCPU ? "CPU" : "Player 2"} wins!`);
    }
  } else {
    confettiCenter();
    playSfx(audio.draw);
    addCoins(5);
    showAlert("Draw", "Well fought! (+5 coins)");
  }
}
function addCoins(delta){
  const v = coins + delta;
  setCoins(v);
}

function addToLeaderboard(){
  const moves = board.filter(Boolean).length;
  const entry = { t: Date.now(), moves, diff: diffSel.value, skin: skinSel.value, name: playerName };
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
    const li=document.createElement("li");
    const d=new Date(e.t).toLocaleDateString();
    li.textContent = `${i+1}. ${e.name} · ${e.moves} moves · ${e.diff} · ${e.skin} · ${d}`;
    ul.appendChild(li);
  });
}
paintLeaderboard();

// ===== CONTROLS =====
nextRoundBtn.onclick = initGame;
resetBtn.onclick     = initGame;
homeBtn.onclick      = () => {
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
