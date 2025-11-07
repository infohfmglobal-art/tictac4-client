/* ----------------------------------------
   RuneXO – Phase 1.3 (Gold Glow Edition)
   - Custom RuneGlow Alert (no browser alerts)
   - Proper HUD layout (bottom center + right)
   - Four skins (Runes, Classic XO, Fruit, Emoji, Phoenix)
   - Music/SFX toggles (player choice)
   - Short/soft music intro, looping bg
   - Simple local Leaderboard + Logout
   - CPU Easy/Normal/Hard (minimax)
-----------------------------------------*/

/* ========== AUDIO ========== */
const audio = {
  bg: new Audio("./sound/bg.mp3"),
  click: new Audio("./sound/click.mp3"),
  win: new Audio("./sound/win.mp3"),
  lose: new Audio("./sound/lose.mp3"),
  draw: new Audio("./sound/lose.mp3") // reuse or add ./sound/draw.mp3 if you have it
};
audio.bg.loop = true;
audio.bg.volume = 0.35; // softer
[audio.click, audio.win, audio.lose, audio.draw].forEach(a => (a.preload = "auto"));

let musicOn = true;
let sfxOn = true;
const musicBtn = el("musicBtn");
const sfxBtn   = el("sfxBtn");

function playSfx(a){ if(sfxOn){ a.currentTime = 0; a.play().catch(()=>{}); } }
function ensureBgPlaying(){
  if(musicOn && audio.bg.paused){
    // small fade-in
    audio.bg.volume = 0.0;
    audio.bg.play().then(()=> {
      let v = 0.0; const id = setInterval(()=>{ v += 0.07; audio.bg.volume = Math.min(0.35, v); if(v>=0.35) clearInterval(id); }, 60);
    }).catch(()=>{});
  }
}
function stopBg(){ audio.bg.pause(); }

/* ========== COINS + PROFILE (LOCAL) ========== */
let coins = Number(localStorage.getItem("rxo_coins") || "0");
let playerName = localStorage.getItem("rxo_name") || "Guest Player";

function setCoins(v){
  coins = Math.max(0, Number(v||0));
  localStorage.setItem("rxo_coins", String(coins));
  const badge = el("playerCoins");
  if (badge) badge.textContent = `💰 ${coins}`;
}
function addCoins(delta){ setCoins(coins + delta); }
function setName(name){
  playerName = name || "Guest Player";
  localStorage.setItem("rxo_name", playerName);
  const n = el("playerName"); if(n) n.textContent = playerName;
}

setCoins(coins);
setName(playerName);

/* ========== HELPERS ========== */
function el(id){ return document.getElementById(id); }
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

/* ========== SPLASH -> LOGIN ========== */
window.addEventListener("DOMContentLoaded", () => {
  const splash = el("introSplash");
  const loginGate = el("loginGate");
  setTimeout(() => {
    splash.classList.add("hidden");
    loginGate.classList.remove("hidden");
  }, 3000); // 3s splash as requested
});

/* ========== FLASH ========== */
const flashOverlay = el("flashOverlay");
function goldenFlashThen(callback){
  flashOverlay.classList.add("flash-show");
  setTimeout(() => {
    flashOverlay.classList.remove("flash-show");
    flashOverlay.classList.add("flash-hide");
    callback && callback();
  }, 650);
}

/* ========== LOGIN -> HOME ========== */
const homeScreen = el("homeScreen");
const gameArea = el("gameArea");
const guestBtn = el("guestLoginGate");
const googleBtn = el("googleLoginGate");

guestBtn.addEventListener("click", () => {
  if (coins === 0) setCoins(200); // welcome bonus once
  setName("Rune Warrior");
  goldenFlashThen(() => {
    el("loginGate").classList.add("hidden");
    homeScreen.classList.remove("hidden");
  });
  ensureBgPlaying();
});

googleBtn.addEventListener("click", () => {
  // Phase 2: replace with real Google Sign-In
  runeAlert("Coming Soon", "Google Login is planned for Phase 2. Enjoy Guest mode for now! ✨");
  if (coins === 0) setCoins(200);
  goldenFlashThen(() => {
    el("loginGate").classList.add("hidden");
    homeScreen.classList.remove("hidden");
  });
  ensureBgPlaying();
});

/* ========== MENU CONTROLS ========== */
const startBtn   = el("startBtn");
const themeSel   = el("themeSelect");
const modeSel    = el("gameMode");
const diffSel    = el("difficulty");
const skinSel    = el("skin");
const logoutBtn  = el("logoutBtn");
const leaderBtn  = el("leaderBtn");

startBtn.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  initGame();
  ensureBgPlaying();
});

logoutBtn.addEventListener("click", doLogout);

/* ========== LEADERBOARD (LOCAL) ========== */
const leaderModal = el("leaderModal");
const leaderList  = el("leaderList");
const leaderClose = el("leaderClose");
const leaderLogout= el("leaderLogout");

leaderBtn.addEventListener("click", showLeaders);
leaderClose.addEventListener("click", hideLeaders);
leaderLogout.addEventListener("click", doLogout);

function showLeaders(){
  renderLeaders();
  leaderModal.classList.remove("hidden");
}
function hideLeaders(){ leaderModal.classList.add("hidden"); }
function doLogout(){
  localStorage.removeItem("rxo_name");
  localStorage.removeItem("rxo_coins");
  setName("Guest Player"); setCoins(0);
  gameArea.classList.add("hidden");
  homeScreen.classList.add("hidden");
  el("loginGate").classList.remove("hidden");
  stopBg();
}
function renderLeaders(){
  const raw = JSON.parse(localStorage.getItem("rxo_leaders") || "[]");
  const rows = raw.slice(0, 20).map((r,i)=>(
    `<div class="leader-item"><span>${i+1}. ${r.name}</span><b>💰 ${r.coins}</b></div>`
  )).join("") || `<div class="leader-item"><i>No entries yet. Win coins to appear here!</i></div>`;
  leaderList.innerHTML = rows;
}
function pushLeader(name, coins){
  const raw = JSON.parse(localStorage.getItem("rxo_leaders") || "[]");
  raw.push({name, coins, t: Date.now()});
  raw.sort((a,b)=> b.coins - a.coins);
  localStorage.setItem("rxo_leaders", JSON.stringify(raw.slice(0,100)));
}

/* ========== GAME STATE ========== */
const boardEl = el("gameBoard");
const cells   = $$(".cell", boardEl);
const nextRoundBtn = el("nextRoundBtn");
const resetBtn     = el("resetBtn");
const homeBtn      = el("homeBtn");

let board, current, running, againstCPU;

const SKINS = {
  "Runes":       { P1: "🐉", P2: "🪽" },               // Dragon vs Wing
  "Classic X / O": { P1: "✖", P2: "◯" },              // Bold-ish XO
  "Fruit":       { P1: "🍎", P2: "🍊" },               // Apple vs Orange
  "Emoji":       { P1: "😎", P2: "🤖" },               // Cool vs Bot
  "Phoenix":     { P1: "🐉", P2: "🕊️" }               // Dragon vs Phoenix-like dove (placeholder)
};

function initGame(){
  document.body.className = `theme-${themeSel.value.toLowerCase()}`;

  board   = Array(9).fill(null);
  current = "P1";
  running = true;
  againstCPU = (modeSel.value === "Player vs CPU");

  cells.forEach(c=>{
    c.textContent = "";
    c.classList.remove("win");
    c.disabled = false;
    c.onclick = () => onCell(c);
  });
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
  if(result) return endRound(result);

  current = (current === "P1") ? "P2" : "P1";

  if(running && againstCPU && current === "P2"){
    setTimeout(cpuMove, 300);
  }
}

/* CPU */
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
  if(result) return endRound(result);

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
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function staticWinner(arr){ for(const [a,b,c] of LINES){ if(arr[a] && arr[a]===arr[b] && arr[a]===arr[c]) return arr[a]; } return null; }
function checkResult(){
  const w = staticWinner(board);
  if(w) return { winner:w };
  if(board.every(Boolean)) return { draw:true };
  return null;
}
function endRound(res){
  running = false;
  cells.forEach(c=> c.onclick = null);

  if(res.winner){
    for(const [a,b,c] of LINES){
      if(board[a] && board[a]===board[b] && board[a]===board[c]){
        [a,b,c].forEach(i=> cells[i].classList.add("win"));
      }
    }
    if(res.winner === "P1"){
      playSfx(audio.win);
      addCoins(20);
      pushLeader(playerName, coins);
      runeAlert("Victory!", `You win! +20 coins 🎉`);
    }else{
      playSfx(audio.lose);
      runeAlert("Defeat", `CPU wins! Try again.`);
    }
  }else{
    playSfx(audio.draw);
    addCoins(5);
    pushLeader(playerName, coins);
    runeAlert("Draw", `It's a tie! +5 coins`);
  }
}

/* Minimax */
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

/* Controls */
nextRoundBtn.onclick = () => initGame();
resetBtn.onclick     = () => initGame();
homeBtn.onclick      = () => {
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

/* ========== RuneGlow Alert ========== */
const runeAlertEl   = el("runeAlert");
const runeAlertOk   = el("runeAlertOk");
const runeAlertTitle= el("runeAlertTitle");
const runeAlertMsg  = el("runeAlertMsg");

function runeAlert(title, msg){
  runeAlertTitle.textContent = title || "RuneXO";
  runeAlertMsg.textContent   = msg   || "";
  runeAlertEl.classList.remove("hidden");
  return new Promise((resolve)=>{
    const close = ()=>{ runeAlertEl.classList.add("hidden"); runeAlertOk.removeEventListener("click", close); resolve(); };
    runeAlertOk.addEventListener("click", close);
  });
}
