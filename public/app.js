// app.js
import { Game } from "./game.js";
import { triggerRuneBurst, confettiBurst, screenShake } from "./runes.js";

const game = new Game();

/* ---------- Grab elements (all optional-safe) ---------- */
const $ = (id)=>document.getElementById(id);
const boardEl   = $("board");
const scoreEl   = $("score");
const msgEl     = $("msg");
const winnerTxt = $("winnerText");
const nextBtn   = $("nextBtn");
const resetBtn  = $("resetBtn");
const homeBtn   = $("homeBtn");
const sfxBtn    = $("sfxBtn");
const musicBtn  = $("musicBtn");
const installBtn= $("installBtn");
const installBtn2= $("installBtn2");

const modeBar   = $("modeBar");
const modeBadge = $("modeBadge");
const diffBadge = $("diffBadge");
const skinBadge = $("skinBadge");
const pX        = $("pX");
const pO        = $("pO");

// Home screen controls (if present)
const homeScreen= $("homeScreen");
const startBtn  = $("startBtn");
const gameMode  = $("gameMode");
const difficulty= $("difficulty");
const skinSel   = $("skin");
const themeSel  = $("themeSelect");
const leaderList= $("leaderList");

/* ---------- Audio ---------- */
const clickSfx = new Audio("sound/click.mp3");
const winSfx   = new Audio("sound/win.mp3");
const music    = new Audio("sound/bg.mp3");
music.loop = true;
let musicWanted = false;

/* ---------- Build board ---------- */
function renderBoard(){
  if (!boardEl) return;
  boardEl.innerHTML = "";
  for (let r=0;r<3;r++){
    for (let c=0;c<3;c++){
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.r=r; cell.dataset.c=c;
      cell.addEventListener("click", ()=>handleMove(r,c));
      boardEl.appendChild(cell);
    }
  }
}
renderBoard();

/* ---------- Handle move ---------- */
function handleMove(r,c){
  // start music after first tap
  if (musicWanted && music.paused) music.play().catch(()=>{});

  // player move
  const ok = game.move(r,c);
  if (!ok) return;

  haptic(15);
  if (game.sfxOn){ clickSfx.currentTime=0; clickSfx.play().catch(()=>{}); }
  updateBoard();

  if (game.winner || game.board.full()) return;

  // CPU turn with a small delay
  if (game.mode==="Player vs CPU" && game.turn==="O"){
    setTimeout(()=>{
      const didCpu = game.performCpuMove();
      if (didCpu){
        haptic(15);
        if (game.sfxOn){ clickSfx.currentTime=0; clickSfx.play().catch(()=>{}); }
        updateBoard();
      }
    }, 600);
  }
}

/* ---------- Update UI ---------- */
function updateBoard(){
  const cells = boardEl ? boardEl.children : [];
  for (let i=0;i<cells.length;i++){
    const r=Math.floor(i/3), c=i%3;
    const val = game.board.grid[r][c];
    const cell = cells[i];
    cell.className = "cell";
    if (!val){ cell.textContent=""; continue; }

    if (game.skin.startsWith("Classic")){
      cell.textContent = val;
      cell.classList.add(val==="X" ? "classicX" : "classicO");
    } else if (game.skin === "Fruit"){
      cell.textContent = (val==="X") ? "🍎" : "🍊";
      cell.classList.add(val==="X" ? "fruitX" : "fruitO");
    } else {
      cell.textContent = (val==="X") ? "🐉" : "🕊️";
      cell.classList.add(val==="X" ? "dragon" : "phoenix");
    }
  }

  // avatars/turn
  pX?.classList.toggle("active", game.turn==="X");
  pO?.classList.toggle("active", game.turn==="O");

  // winner/draw
  if (game.winner && game.winner!=="Draw"){
    if (winnerTxt) winnerTxt.textContent = (game.winner==="X") ? "Dragon Wins!" : "Phoenix Wins!";
    msgEl?.classList.add("show-winner");

    // highlight win cells
    for (const [r,c] of game.getWinningCells()){
      const idx = r*3+c;
      cells[idx]?.classList.add("win-cell");
    }

    triggerRuneBurst(game.winner);
    confettiBurst();
    screenShake();
    haptic([40,40,80]);
    if (game.sfxOn){ winSfx.currentTime=0; winSfx.play().catch(()=>{}); }

    // leaderboard (PvC + player is X)
    if (game.mode==="Player vs CPU" && game.winner==="X") {
      const elapsed = ((performance.now()-game.roundStart)/1000).toFixed(2);
      const moves = 9 - game.board.emptyCells().length;
      addLeaderboard({ time: elapsed, moves, diff: game.difficulty.toLowerCase(), skin: game.skin.toLowerCase() });
    }
  } else if (game.winner === "Draw"){
    if (winnerTxt) winnerTxt.textContent = "Draw!";
    msgEl?.classList.add("show-winner");
  } else {
    msgEl?.classList.remove("show-winner");
    if (winnerTxt) winnerTxt.textContent = "";
  }

  if (scoreEl) scoreEl.textContent = `Score – X: ${game.scoreX} | O: ${game.scoreO} | D: ${game.scoreD}`;
}

/* ---------- Buttons ---------- */
nextBtn?.addEventListener("click", ()=>{ game.nextRound(); renderBoard(); updateBoard(); game.roundStart=performance.now(); });
resetBtn?.addEventListener("click", ()=>{ game.scoreX=game.scoreO=game.scoreD=0; game.resetAll(); renderBoard(); updateBoard(); });
homeBtn?.addEventListener("click", ()=>showHome(true));
sfxBtn?.addEventListener("click", ()=>{ game.toggleSfx(); sfxBtn.textContent = `SFX: ${game.sfxOn ? "On" : "Off"}`; });
musicBtn?.addEventListener("click", ()=>{ musicWanted=!musicWanted; musicBtn.textContent=`Music: ${musicWanted?"On":"Off"}`; if (musicWanted) music.play().catch(()=>{}); else music.pause(); });

[installBtn,installBtn2].forEach(btn=>{
  btn?.addEventListener("click", async ()=>{
    const prompt = window.deferredPrompt; if (!prompt) return;
    prompt.prompt(); await prompt.userChoice; window.deferredPrompt=null;
  });
});

/* ---------- Home screen (optional) ---------- */
function showHome(show){
  if (!homeScreen) return;
  homeScreen.classList.toggle("hidden", !show);
  if (boardEl) boardEl.style.display = show ? "none":"grid";
  document.querySelector(".btngrp")?.classList.toggle("hidden", show);
  modeBar?.classList.toggle("hidden", show);
  document.querySelector(".avatars")?.classList.toggle("hidden", show);
}
startBtn?.addEventListener("click", ()=>{
  if (gameMode) game.mode = gameMode.value;
  if (difficulty) game.difficulty = difficulty.value;
  if (skinSel) game.skin = skinSel.value;
  if (themeSel) document.body.className = `theme-${themeSel.value.toLowerCase()}`;
  modeBadge && (modeBadge.textContent = `Mode: ${game.mode==="Player vs CPU"?"PvC":"PvP"}`);
  diffBadge && (diffBadge.textContent = `Difficulty: ${game.difficulty}`);
  skinBadge && (skinBadge.textContent = `Skin: ${game.skin}`);
  if (musicWanted) music.play().catch(()=>{});
  game.resetAll(); renderBoard(); updateBoard(); showHome(false);
});

// initial state
showHome(Boolean(homeScreen)); // show home if present
loadLeaderboard();
updateBoard();

/* ---------- Haptics ---------- */
function haptic(pattern){ if ("vibrate" in navigator) navigator.vibrate(pattern); }

/* ---------- Leaderboard (localStorage) ---------- */
function addLeaderboard(entry){
  const key="rxo_leader";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push(entry);
  list.sort((a,b)=> (parseFloat(a.time)-parseFloat(b.time)) || (a.moves-b.moves));
  localStorage.setItem(key, JSON.stringify(list.slice(0,10)));
  loadLeaderboard();
}
function loadLeaderboard(){
  if (!leaderList) return;
  const key="rxo_leader";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  leaderList.innerHTML = "";
  list.forEach((e,i)=>{
    const li = document.createElement("li");
    li.textContent = `${i+1}. ${e.time}s · ${e.moves} moves · ${e.diff} · ${e.skin}`;
    leaderList.appendChild(li);
  });
}
