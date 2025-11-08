/* ----------------------------------------
   RuneXO – Phase 1 (Stable)
   - Splash → Login → Home → Game
   - PvCPU & PvP working
   - 4 skins
   - Coins + Top-10 leaderboard
   - Music/SFX toggles
-----------------------------------------*/

// ====== AUDIO ======
const audio = {
  bg:    new Audio("./sound/bg.mp3"),
  click: new Audio("./sound/click.mp3"),
  win:   new Audio("./sound/win.mp3"),
  lose:  new Audio("./sound/lose.mp3"),
  draw:  new Audio("./sound/draw.mp3"),
  intro: document.getElementById("introBell"),
};
audio.bg.loop = true;
[audio.click, audio.win, audio.lose, audio.draw].forEach(a => a.preload = "auto");

let musicOn = false, sfxOn = true;
function playSfx(a){ if(sfxOn){ a.currentTime = 0; a.play().catch(()=>{});} }
function ensureBg(){ if(musicOn && audio.bg.paused){ audio.bg.volume = 0.35; audio.bg.play().catch(()=>{});} }
function stopBg(){ audio.bg.pause(); }

// ====== COINS & LEADERBOARD ======
let coins = Number(localStorage.getItem("rxo_coins") || "0");
function setCoins(v){
  coins = Math.max(0, Number(v||0));
  localStorage.setItem("rxo_coins", String(coins));
  const badge = document.getElementById("playerCoins");
  if (badge) badge.textContent = `💰 ${coins}`;
}
function addCoins(delta){ setCoins(coins + delta); }
setCoins(coins);

const LEADER_KEY = "rxo_leader";
function addLeaderEntry(moves, skin, diff){
  const list = JSON.parse(localStorage.getItem(LEADER_KEY)||"[]");
  list.push({ t: Date.now(), moves, skin, diff });
  list.sort((a,b)=> a.moves - b.moves);
  localStorage.setItem(LEADER_KEY, JSON.stringify(list.slice(0,10)));
  paintLeaderboard();
}
function paintLeaderboard(){
  const ul = document.getElementById("leaderList");
  if(!ul) return;
  ul.innerHTML = "";
  const list = JSON.parse(localStorage.getItem(LEADER_KEY)||"[]");
  list.forEach((e,i)=>{
    const li = document.createElement("li");
    const d = new Date(e.t).toLocaleDateString();
    li.textContent = `${i+1}. ${e.moves} moves · ${e.diff} · ${e.skin} · ${d}`;
    ul.appendChild(li);
  });
}
paintLeaderboard();

// ====== GLOBAL EL REFS ======
const splash     = document.getElementById("introSplash");
const loginGate  = document.getElementById("loginGate");
const homeScreen = document.getElementById("homeScreen");
const gameArea   = document.getElementById("gameArea");

const flashOverlay = document.getElementById("flashOverlay");
const guestBtn = document.getElementById("guestLoginGate");
const googleBtn= document.getElementById("googleLoginGate");
const logoutBtn= document.getElementById("logoutBtn");

const startBtn  = document.getElementById("startBtn");
const homeBtn   = document.getElementById("homeBtn");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const resetBtn  = document.getElementById("resetBtn");
const musicBtn  = document.getElementById("musicBtn");
const sfxBtn    = document.getElementById("sfxBtn");

const themeSelect = document.getElementById("themeSelect");
const modeSel  = document.getElementById("gameMode");
const diffSel  = document.getElementById("difficulty");
const skinSel  = document.getElementById("skin");

const boardEl  = document.getElementById("gameBoard");
const cells    = Array.from(boardEl.querySelectorAll(".cell"));

// ====== SKINS ======
const SKINS = {
  "Runes":            { P1: "ᚱ",  P2: "ᛟ" },        // nordic runes
  "Classic X / O":    { P1: "X",  P2: "O"  },
  "Emoji":            { P1: "😎", P2: "🤖" },
  "Phoenix":          { P1: "🐉", P2: "🕊️" }
};
function paintCellStyle(el, mark){
  // subtle glow per type
  el.style.color = "gold";
  el.style.textShadow = "0 0 14px #ffcc33, 0 0 28px #ff9900";
  if(mark === "X"){ el.style.color="#00ffff"; el.style.textShadow="0 0 12px #00ffff,0 0 24px #00cccc"; }
  if(mark === "O"){ el.style.color="#ff66cc"; el.style.textShadow="0 0 12px #ff66cc,0 0 24px #ff3399"; }
}

// ====== GAME STATE ======
let board   = Array(9).fill(null);
let current = "P1";
let running = false;
let againstCPU = true;

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function staticWinner(arr){
  for(const [a,b,c] of LINES) if(arr[a] && arr[a]===arr[b] && arr[a]===arr[c]) return arr[a];
  return null;
}

// ====== SPLASH → LOGIN (FIXED SEQUENCE) ======
window.addEventListener("DOMContentLoaded", () => {
  // Step 1: hide everything except splash
  loginGate.classList.add("hidden");
  homeScreen.classList.add("hidden");
  gameArea.classList.add("hidden");

  // Step 2: small delay + intro bell
  setTimeout(() => {
    if (audio.intro) {
      audio.intro.currentTime = 0;
      audio.intro.volume = 0.4;
      audio.intro.play().catch(() => {});
    }
  }, 250);

  // Step 3: fade out splash after 2.5s, then show only login
  setTimeout(() => {
    splash.classList.add("fade-out");
    splash.style.pointerEvents = "none";
    setTimeout(() => {
      splash.style.display = "none";
      loginGate.classList.remove("hidden");
      loginGate.style.display = "flex";
      homeScreen.classList.add("hidden");
      gameArea.classList.add("hidden");
    }, 900);
  }, 2500);
});


// ====== LOGIN → HOME ======
function goldenFlashThen(cb){
  flashOverlay.classList.add("flash-show");
  setTimeout(()=>{ flashOverlay.classList.remove("flash-show"); cb && cb(); }, 650);
}
function showHome(){
  goldenFlashThen(()=>{
    loginGate.classList.add("hidden");
    homeScreen.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    setCoins(localStorage.getItem("rxo_coins") || 0);
  });
}
guestBtn.onclick  = showHome;
googleBtn.onclick = showHome;

logoutBtn.onclick = () => {
  homeScreen.classList.add("hidden");
  loginGate.classList.remove("hidden");
};

// ====== HOME → GAME ======
startBtn.onclick = () => {
  homeScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  initGame();
};
homeBtn.onclick = () => {
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

// ====== GAME SETUP ======
function initGame(){
  document.body.className = `theme-${themeSelect.value.toLowerCase()}`;

  board   = Array(9).fill(null);
  current = "P1";
  running = true;
  againstCPU = (modeSel.value === "Player vs CPU");

  cells.forEach(c=>{
    c.textContent = "";
    c.classList.remove("win");
    c.style.color = ""; c.style.textShadow = "";
    c.onclick = ()=> handleMove(c);
  });

  // buttons state
  musicBtn.textContent = musicOn ? "🔈 Music ON" : "🔇 Music OFF";
  sfxBtn.textContent   = sfxOn   ? "🔊 SFX ON"   : "🔈 SFX OFF";
}
nextRoundBtn.onclick = initGame;
resetBtn.onclick = () => {
  localStorage.removeItem(LEADER_KEY);
  paintLeaderboard();
  initGame();
};

// ====== MOVE HANDLERS ======
function handleMove(cell){
  if(!running) return;
  const idx = Number(cell.dataset.index);
  if(board[idx]) return;

  const mark = current === "P1" ? SKINS[skinSel.value].P1 : SKINS[skinSel.value].P2;
  cell.textContent = mark;
  paintCellStyle(cell, mark);
  board[idx] = current;
  playSfx(audio.click);

  // check player result
  const res = checkResult();
  if(res) return endRound(res, idx);

  // switch
  current = (current === "P1") ? "P2" : "P1";

  // CPU turn?
  if(running && againstCPU && current === "P2"){
    setTimeout(cpuMove, 350);
  }
}

function cpuMove(){
  // difficulty
  const choice = diffSel.value;
  const empty = board.map((v,i)=> v? null : i).filter(v=>v!==null);
  if(empty.length === 0) return;

  let move = null;

  const tryWinOrBlock = (who)=>{
    for(const i of empty){
      board[i] = who;
      const w = staticWinner(board);
      board[i] = null;
      if(w === who) return i;
    }
    return null;
  };

  if(choice === "Easy"){
    move = empty[Math.floor(Math.random()*empty.length)];
  } else if(choice === "Normal"){
    move = tryWinOrBlock("P2") ?? tryWinOrBlock("P1") ?? empty[Math.floor(Math.random()*empty.length)];
  } else {
    // Hard: simple minimax (depth-limited)
    move = (function minimaxPick(){
      function scoreState(state){
        const w = staticWinner(state);
        if(w==="P2") return 10;
        if(w==="P1") return -10;
        if(state.every(Boolean)) return 0;
        return null;
      }
      function best(state, turn, depth){
        const s = scoreState(state);
        if(s!==null || depth>6) return {score: s ?? 0};
        const avail = state.map((v,i)=> v? null : i).filter(v=>v!==null);
        let bestMove=null;
        if(turn==="P2"){
          let mx=-Infinity;
          for(const i of avail){
            state[i]="P2";
            const r=best(state,"P1",depth+1).score;
            state[i]=null;
            if(r>mx){mx=r; bestMove={index:i,score:r};}
          }
          return bestMove;
        } else {
          let mn=Infinity;
          for(const i of avail){
            state[i]="P1";
            const r=best(state,"P2",depth+1).score;
            state[i]=null;
            if(r<mn){mn=r; bestMove={index:i,score:r};}
          }
          return bestMove;
        }
      }
      return best(board.slice(),"P2",0).index ?? empty[0];
    })();
  }

  const cell = cells[move];
  const mark = SKINS[skinSel.value].P2;
  cell.textContent = mark;
  paintCellStyle(cell, mark);
  board[move] = "P2";

  const res = checkResult();
  if(res) return endRound(res, move);

  current = "P1";
}

function checkResult(){
  const w = staticWinner(board);
  if(w){ return { winner:w }; }
  if(board.every(Boolean)) return { draw:true };
  return null;
}

function endRound(result, lastIndex){
  running = false;

  // highlight line
  if(result.winner){
    for(const [a,b,c] of LINES){
      if(board[a] && board[a]===board[b] && board[a]===board[c]){
        [a,b,c].forEach(i=> cells[i].classList.add("win"));
      }
    }
  }

  // coins + leaderboard + alert
  if(result.winner){
    const winnerText = (result.winner==="P1") ? "You Win!" : (againstCPU ? "CPU Wins!" : "Player 2 Wins!");
    if(result.winner==="P1"){ playSfx(audio.win); addCoins(10); addLeaderEntry(board.filter(Boolean).length, skinSel.value, diffSel.value); showAlert("Victory", `${winnerText} (+10 coins)`); }
    else{ playSfx(audio.lose); showAlert("Defeat", winnerText); }
  } else {
    playSfx(audio.draw);
    showAlert("Draw", "Well fought!");
  }
}

// ====== RUNE ALERT ======
function showAlert(title, text){
  const box = document.getElementById("runeAlert");
  document.getElementById("runeTitle").textContent = title;
  document.getElementById("runeText").textContent  = text;
  box.classList.remove("hidden");
  document.getElementById("runeOk").onclick = ()=> box.classList.add("hidden");
}
