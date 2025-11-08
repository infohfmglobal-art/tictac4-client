/* RuneXO v1.0.6 — FrameWeave Studio LLC
   - Correct sequencing (no pre-login grid)
   - CPU Easy/Normal/Hard (minimax on Hard)
   - 4 skins, music/sfx toggles, coins + leaderboard
   - Custom Rune Alert
*/

// ---------- AUDIO ----------
const audio = {
  intro: document.getElementById("introBell"),
  bg: new Audio("./sound/bg.mp3"),
  click: new Audio("./sound/click.mp3"),
  win: new Audio("./sound/win.mp3"),
  lose: new Audio("./sound/lose.mp3"),
  draw: new Audio("./sound/draw.mp3"),
};
audio.bg.loop = true;
[audio.click, audio.win, audio.lose, audio.draw].forEach(a => (a.preload = "auto"));

let musicOn = false; // OFF by default — player choice
let sfxOn   = true;

// sfx helpers
function playSfx(a){ if(sfxOn){ a.currentTime=0; a.play().catch(()=>{}); } }
function ensureBg(){ if(musicOn && audio.bg.paused){ audio.bg.volume=0.4; audio.bg.play().catch(()=>{}); } }
function stopBg(){ audio.bg.pause(); }

// ---------- COINS + LEADERBOARD ----------
let coins = Number(localStorage.getItem("rxo_coins") || "0");
function setCoins(n){
  coins = Math.max(0, Number(n||0));
  localStorage.setItem("rxo_coins", String(coins));
  const b = document.getElementById("playerCoins");
  if (b) b.textContent = `💰 ${coins}`;
}
function addCoins(d){ setCoins(coins + d); }
setCoins(coins);

function addToLeaderboard(moves, diff, skin){
  const key="rxo_leader";
  const list = JSON.parse(localStorage.getItem(key)||"[]");
  list.push({t:Date.now(), moves, diff, skin});
  list.sort((a,b)=> a.moves - b.moves);
  localStorage.setItem(key, JSON.stringify(list.slice(0,10)));
  paintLeaderboard();
}
function paintLeaderboard(){
  const ul = document.getElementById("leaderList");
  if(!ul) return;
  const list = JSON.parse(localStorage.getItem("rxo_leader")||"[]");
  ul.innerHTML = "";
  list.forEach((e,i)=>{
    const li = document.createElement("li");
    const d = new Date(e.t).toLocaleDateString();
    li.textContent = `${i+1}. ${e.moves} moves · ${e.diff} · ${e.skin} · ${d}`;
    ul.appendChild(li);
  });
}
paintLeaderboard();

// ---------- RUNE ALERT ----------
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

// ---------- DOM ----------
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

const boardEl   = document.getElementById("gameBoard");
const cells     = Array.from(boardEl.querySelectorAll(".cell"));
const nextRoundBtn = document.getElementById("nextRoundBtn");
const resetBtn     = document.getElementById("resetBtn");
const homeBtn      = document.getElementById("homeBtn");
const musicBtn     = document.getElementById("musicBtn");
const sfxBtn       = document.getElementById("sfxBtn");

const modeSel  = document.getElementById("gameMode");
const diffSel  = document.getElementById("difficulty");
const skinSel  = document.getElementById("skin");
const themeSel = document.getElementById("themeSelect");

// ---------- STATE ----------
let board = Array(9).fill(null);
let current = "P1";
let running = false;
let againstCPU = true;

const SKINS = {
  "Runes":         { P1:"🐉", P2:"🕊️" },
  "Classic X / O": { P1:"X",  P2:"O"  },
  "Fruit":         { P1:"🍎", P2:"🍊" },
  "Emoji":         { P1:"😎", P2:"🤖" }
};
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

// ---------- SEQUENCE (Intro → Login) ----------
window.addEventListener("DOMContentLoaded", () => {
  // hide everything except intro
  loginGate.classList.add("hidden");
  homeScreen.classList.add("hidden");
  gameArea.classList.add("hidden");

  // play intro bell
  setTimeout(()=>{ if(audio.intro){ audio.intro.volume=0.5; audio.intro.play().catch(()=>{}); } }, 200);

  // fade intro after 2.5s → show login ONLY
  setTimeout(()=>{
    introSplash.classList.add("fade-out");
    setTimeout(()=>{
      introSplash.style.display = "none";
      loginGate.classList.remove("hidden");
    }, 900);
  }, 2500);
});

// ---------- LOGIN → HOME ----------
function goldenFlashThen(cb){
  flashOverlay.classList.add("flash-show");
  setTimeout(()=>{
    flashOverlay.classList.remove("flash-show");
    cb && cb();
  }, 650);
}
function showHome(){
  goldenFlashThen(()=>{
    loginGate.classList.add("hidden");
    homeScreen.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    setTimeout(()=>{
      installOrb.classList.remove("hidden");
      installOrb.classList.add("show");
    }, 800);
  });
}

guestBtn.onclick = () => { if (coins === 0) setCoins(200); showHome(); };
googleBtn.onclick= () => { if (coins === 0) setCoins(200); showHome(); };
logoutBtn.onclick= () => { homeScreen.classList.add("hidden"); loginGate.classList.remove("hidden"); };

// Install orb
installOrb.addEventListener("click", async ()=>{
  const p = window.deferredPrompt;
  if(!p){ showAlert("Install", "Already installed or not supported yet."); return; }
  p.prompt(); await p.userChoice; window.deferredPrompt = null;
});

// ---------- HOME → GAME ----------
startBtn.onclick = () => {
  homeScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  initGame();     // init fresh board
  // music OFF by default — player can turn ON
};

// ---------- GAME LOGIC ----------
function paintCellStyle(el, mark){
  el.style.textShadow = "0 0 14px #ffcc33, 0 0 28px #ff9900";
  el.style.color = "gold";
  if(mark === "X"){ el.style.color="#00ffff"; el.style.textShadow="0 0 12px #00ffff,0 0 24px #00cccc"; }
  if(mark === "O"){ el.style.color="#ff66cc"; el.style.textShadow="0 0 12px #ff66cc,0 0 24px #ff3399"; }
}

function initGame(){
  document.body.className = `theme-${themeSel.value.toLowerCase()}`;
  board   = Array(9).fill(null);
  current = "P1";
  running = true;
  againstCPU = (modeSel.value === "Player vs CPU");

  cells.forEach(c=>{
    c.textContent=""; c.className="cell";
    c.style.color=""; c.style.textShadow="";
    c.onclick = () => onCell(c);
  });

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

  const res = checkResult(board);
  if(res) return endRound(res, cell);

  current = (current === "P1") ? "P2" : "P1";

  if(running && againstCPU && current==="P2"){
    setTimeout(cpuMove, 300);
  }
}

function checkResult(arr){
  const w = winnerOf(arr);
  if(w) return { winner:w };
  if(arr.every(Boolean)) return { draw:true };
  return null;
}
function winnerOf(arr){
  for(const [a,b,c] of LINES){
    if(arr[a] && arr[a]===arr[b] && arr[a]===arr[c]) return arr[a];
  }
  return null;
}

function endRound(res, lastCell){
  running = false;
  cells.forEach(c => c.onclick = null);

  if(res.winner){
    // highlight winning line
    for(const [a,b,c] of LINES){
      if(board[a] && board[a]===board[b] && board[a]===board[c]){
        [a,b,c].forEach(i=> cells[i].classList.add("win"));
      }
    }
    const winnerText = (res.winner==="P1") ? "You Win!" : (againstCPU ? "CPU Wins!" : "Player 2 Wins!");
    if(res.winner === "P1"){
      playSfx(audio.win);
      addCoins(20);
      addToLeaderboard(board.filter(Boolean).length, diffSel.value, skinSel.value);
      showAlert("Victory", `${winnerText}  (+20 coins)`);
    } else {
      playSfx(audio.lose);
      showAlert("Defeat", `${winnerText}`);
    }
  } else {
    playSfx(audio.draw);
    addCoins(5);
    showAlert("Draw", "Well fought! (+5 coins)");
  }
}

// CPU
function cpuMove(){
  const diff  = diffSel.value;
  const empty = board.map((v,i)=> v? null : i).filter(v=>v!==null);
  if(empty.length===0) return;

  let move;
  if (diff === "Easy"){
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

  const res = checkResult(board);
  if(res) return endRound(res, cell);

  current = "P1";
}
function findBest(player){
  const empty = board.map((v,i)=> v? null : i).filter(v=>v!==null);
  for(const i of empty){
    board[i] = player;
    const r = checkResult(board);
    board[i] = null;
    if(r && r.winner) return i;
  }
  return null;
}
function minimax(state, player){
  const avail = state.map((v,i)=> v? null : i).filter(v=>v!==null);
  const w = winnerOf(state);
  if(w === "P1") return { score:-10 };
  if(w === "P2") return { score:10 };
  if(avail.length === 0) return { score:0 };

  const moves = [];
  for(const i of avail){
    const move = { index:i };
    state[i] = player;
    const next = (player==="P2") ? minimax(state,"P1") : minimax(state,"P2");
    move.score = next.score;
    state[i] = null;
    moves.push(move);
  }
  let best=null;
  if(player==="P2"){ let mx=-Infinity; moves.forEach(m=>{ if(m.score>mx){mx=m.score;best=m;} }); }
  else{ let mn= Infinity; moves.forEach(m=>{ if(m.score<mn){mn=m.score;best=m;} }); }
  return best;
}

// Controls
nextRoundBtn.onclick = () => initGame();
resetBtn.onclick     = () => initGame();
homeBtn.onclick      = () => { gameArea.classList.add("hidden"); homeScreen.classList.remove("hidden"); stopBg(); };
musicBtn.onclick     = () => { musicOn=!musicOn; musicBtn.textContent = musicOn?"🔈 Music ON":"🔇 Music OFF"; musicOn?ensureBg():stopBg(); };
sfxBtn.onclick       = () => { sfxOn=!sfxOn; sfxBtn.textContent = sfxOn?"🔊 SFX ON":"🔈 SFX OFF"; };
