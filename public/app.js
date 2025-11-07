/* ----------------------------------------
   RuneXO – Phase 1.2 (Final Pack)
   - 4 Skins uniform
   - Music OFF by default, SFX ON by default
   - Short intro, splash 3s
   - Confetti + coin rewards
   - Guest name prompt
   - Leaderboard modal (Top 5 by coins)
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

// Player preferences
let musicOn = false;  // OFF by default
let sfxOn = true;     // ON by default

function playSfx(a){ if(sfxOn){ a.currentTime = 0; a.play().catch(()=>{}); } }
function ensureBgPlaying(){
  if(musicOn && audio.bg.paused){
    audio.bg.volume = 0.42;
    audio.bg.play().catch(()=>{});
  }
}
function stopBg(){ audio.bg.pause(); }

// ---------- COINS + PLAYER ----------
let playerName = localStorage.getItem("rxo_player") || "Guest Player";
let coins = Number(localStorage.getItem("rxo_coins") || "0");
function setCoins(v){
  coins = Math.max(0, Number(v||0));
  localStorage.setItem("rxo_coins", String(coins));
  const badge = document.getElementById("playerCoins");
  if (badge) badge.textContent = `💰 ${coins}`;
}
function addCoins(delta){ setCoins(coins + delta); }
setCoins(coins);
updatePlayerInfo();

function updatePlayerInfo(){
  const nm = document.getElementById("playerName");
  if (nm) nm.textContent = playerName;
}

// ---------- CONFETTI CANVAS ----------
const fxCanvas = document.getElementById("fxCanvas");
const fxCtx = fxCanvas.getContext("2d");
let fxW, fxH, particles = [];
function resizeFx(){ fxW = fxCanvas.width = innerWidth; fxH = fxCanvas.height = innerHeight; }
resizeFx(); addEventListener("resize", resizeFx);

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
      hue: Math.floor(30 + Math.random()*60)
    });
  }
}
function tickParticles(){
  fxCtx.clearRect(0,0,fxW,fxH);
  particles.forEach(p=>{
    p.life--;
    p.x += p.vx; p.y += p.vy; p.vy += p.g;
    p.opacity = Math.max(0, p.life/90);
    fxCtx.fillStyle = `hsla(${p.hue},100%,60%,${p.opacity})`;
    fxCtx.beginPath(); fxCtx.arc(p.x, p.y, p.size, 0, Math.PI*2); fxCtx.fill();
  });
  particles = particles.filter(p => p.life>0 && p.y<fxH+40);
  requestAnimationFrame(tickParticles);
}
requestAnimationFrame(tickParticles);

function elementCenter(el){
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width/2, y: r.top + r.height/2 };
}
function confettiAt(elOrCenter){
  let x, y;
  if (!elOrCenter) { x = innerWidth/2; y = innerHeight/2; }
  else if (elOrCenter.x!=null) { x = elOrCenter.x; y = elOrCenter.y; }
  else { ({x,y} = elementCenter(elOrCenter)); }
  spawnConfetti(x, y, 140);
}

// ---------- SPLASH → LOGIN ----------
window.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("introSplash");
  const loginGate = document.getElementById("loginGate");
  const bell = document.getElementById("introBell");

  // gentle, short
  setTimeout(() => {
    if (bell) { bell.volume = 0.35; bell.play().catch(()=>{}); }
  }, 500);

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

function goldenFlashThen(cb){
  flashOverlay.classList.add("flash-show");
  setTimeout(() => {
    flashOverlay.classList.remove("flash-show");
    flashOverlay.classList.add("flash-hide");
    if(cb) cb();
  }, 600);
}

guestBtn.addEventListener("click", () => {
  // Ask guest name once
  const existing = localStorage.getItem("rxo_player");
  if (!existing) {
    const name = prompt("Enter your player name:", "Rune Warrior");
    playerName = (name && name.trim()) ? name.trim() : "Guest Player";
    localStorage.setItem("rxo_player", playerName);
  } else {
    playerName = existing;
  }
  updatePlayerInfo();
  if (coins === 0) setCoins(200); // welcome bonus
  showHome();
});

googleBtn.addEventListener("click", () => {
  alert("Google Login coming soon ✨ (Phase 2)");
  if (coins === 0) setCoins(200);
  showHome();
});

function showHome(){
  goldenFlashThen(() => {
    document.getElementById("loginGate").classList.add("hidden");
    homeScreen.classList.remove("hidden");
    updatePlayerInfo();
    setCoins(coins);
    // reveal orb after a moment
    setTimeout(() => {
      installOrb.classList.remove("hidden");
      installOrb.classList.add("show");
    }, 1000);
  });
  // music remains OFF until player turns ON
}

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
const leaderBtn = document.getElementById("leaderBtn");
const leaderModal = document.getElementById("leaderModal");
const closeLeader = document.getElementById("closeLeader");

const gameArea = document.getElementById("gameArea");
const themeSelect = document.getElementById("themeSelect");
const modeSel = document.getElementById("gameMode");
const diffSel = document.getElementById("difficulty");
const skinSel = document.getElementById("skin");

startBtn.addEventListener("click", () => {
  document.body.className = `theme-${themeSelect.value.toLowerCase()}`;
  homeScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  initGame();
});

leaderBtn.addEventListener("click", showLeaderboard);
closeLeader.addEventListener("click", () => leaderModal.classList.add("hidden"));

// ---------- LEADERBOARD (local Top 5 by coins) ----------
function showLeaderboard(){
  const listEl = document.getElementById("leaderList");
  const currentName = localStorage.getItem("rxo_player") || "Guest Player";
  const currentCoins = Number(localStorage.getItem("rxo_coins") || "0");

  // Read stored table
  const table = JSON.parse(localStorage.getItem("rxo_lb") || "[]");
  // Update/Insert current player row
  const existing = table.find(r => r.name === currentName);
  if (existing) existing.coins = currentCoins; else table.push({ name: currentName, coins: currentCoins });

  table.sort((a,b) => b.coins - a.coins);
  const top = table.slice(0,5);
  localStorage.setItem("rxo_lb", JSON.stringify(top));

  // Render
  listEl.innerHTML = "";
  top.forEach((r, i) => {
    const li = document.createElement("li");
    li.textContent = `${i+1}. ${r.name} — ${r.coins} coins`;
    listEl.appendChild(li);
  });

  leaderModal.classList.remove("hidden");
}

// ---------- GAME STATE ----------
const boardEl = document.getElementById("gameBoard");
const cells = Array.from(boardEl.querySelectorAll(".cell"));
const nextRoundBtn = document.getElementById("nextRoundBtn");
const resetBtn = document.getElementById("resetBtn");
const homeBtn = document.getElementById("homeBtn");
const musicBtn = document.getElementById("musicBtn");
const sfxBtn = document.getElementById("sfxBtn");
const logoutBtn = document.getElementById("logoutBtn");

let board, current, running, againstCPU;

const SKINS = {
  "Runes":         { P1: "🐉", P2: "🪽" },
  "Classic X / O": { P1: "X",  P2: "O"  },
  "Fruit":         { P1: "🍎", P2: "🍌" },
  "Emoji":         { P1: "😎", P2: "🤖" },
  "Phoenix":       { P1: "🔥", P2: "🕊️" } // NEW skin: fire + white bird
};

function initGame(){
  board = Array(9).fill(null);
  current = "P1";
  running = true;
  againstCPU = (modeSel.value === "Player vs CPU");

  cells.forEach(c=>{
    c.textContent = "";
    c.classList.remove("win");
    c.onclick = () => onCell(c);
  });

  // show current prefs
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔈 Music OFF";
  sfxBtn.textContent   = sfxOn   ? "🔊 SFX ON"   : "🔈 SFX OFF";
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
  // mark win
  if(res.winner){
    for(const [a,b,c] of LINES){
      if(board[a] && board[a]===board[b] && board[a]===board[c]){
        [a,b,c].forEach(i => cells[i].classList.add("win"));
      }
    }
    confettiAt(lastCell || null);

    if(res.winner === "P1"){
      playSfx(audio.win);
      addCoins(20);
      setTimeout(()=> alert("You win! +20 coins 🎉"), 50);
    } else {
      playSfx(audio.lose);
      setTimeout(()=> alert("CPU wins!"), 50);
    }
  } else {
    confettiAt(null);
    addCoins(5);
    setTimeout(()=> alert("Draw! +5 coins"), 50);
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
  stopBg(); // stop music when back home (player choice again)
};

musicBtn.onclick = () => {
  musicOn = !musicOn;
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔈 Music OFF";
  if (musicOn) ensureBgPlaying(); else stopBg();
};
sfxBtn.onclick = () => {
  sfxOn = !sfxOn;
  sfxBtn.textContent = sfxOn ? "🔊 SFX ON" : "🔈 SFX OFF";
};

logoutBtn.onclick = () => {
  localStorage.removeItem("rxo_player");
  playerName = "Guest Player";
  updatePlayerInfo();
  stopBg();
  // back to login
  homeScreen.classList.add("hidden");
  document.getElementById("loginGate").classList.remove("hidden");
};
