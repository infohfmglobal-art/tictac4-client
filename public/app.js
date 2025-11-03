// app.js
import { Game } from "./game.js";
import { triggerRuneBurst, confettiBurst, screenShake } from "./runes.js";

const game = new Game();

// DOM
const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const msgEl = document.getElementById("msg");
const winnerTxt = document.getElementById("winnerText");
const pX = document.getElementById("pX");
const pO = document.getElementById("pO");

const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const homeBtn = document.getElementById("homeBtn");
const sfxBtn = document.getElementById("sfxBtn");
const musicBtn = document.getElementById("musicBtn");
const installBtn = document.getElementById("installBtn");
const installBtn2 = document.getElementById("installBtn2");

const homeScreen = document.getElementById("homeScreen");
const startBtn = document.getElementById("startBtn");
const gameMode = document.getElementById("gameMode");
const difficulty = document.getElementById("difficulty");
const skinSel = document.getElementById("skin");
const themeSel = document.getElementById("themeSelect");
const leaderList = document.getElementById("leaderList");

const modeBadge = document.getElementById("modeBadge");
const diffBadge = document.getElementById("diffBadge");
const skinBadge = document.getElementById("skinBadge");

// AUDIO
const clickSfx = new Audio("sound/click.mp3");
const winSfx = new Audio("sound/win.mp3");
const music = new Audio("sound/bg.mp3");
music.loop = true;
let musicWanted = false;

// BOARD BUILD
function renderBoard() {
  boardEl.innerHTML = "";
  for (let r=0;r<3;r++){
    for (let c=0;c<3;c++){
      const cell=document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.r=r;cell.dataset.c=c;
      cell.addEventListener("click",()=>handleMove(r,c));
      boardEl.appendChild(cell);
    }
  }
}
renderBoard();

// HANDLE MOVE
function handleMove(r,c){

  if (musicWanted && music.paused) music.play().catch(()=>{});

  const result = game.move(r,c,true);
  if (!result) return;

  vibrate(20);
  if (game.sfxOn) clickSfx.currentTime=0, clickSfx.play().catch(()=>{});
  updateBoard();

  if (result === "cpuPending") {
    setTimeout(()=>{
      game.performCpuMove();
      vibrate(15);
      if (game.sfxOn) clickSfx.currentTime=0, clickSfx.play().catch(()=>{});
      updateBoard();
    }, 550);
  }
}

// UPDATE UI
function updateBoard(){
  const cells = boardEl.children;
  for(let i=0;i<cells.length;i++){
    const r=Math.floor(i/3), c=i%3;
    const val = game.board.grid[r][c];
    const cell = cells[i];
    cell.className="cell";

    if (!val){cell.textContent="";continue;}

    if (game.skin.startsWith("Classic")){
      cell.textContent=val;
      cell.classList.add(val==="X"?"classicX":"classicO");
    } else if (game.skin==="Fruit"){
      cell.textContent=(val==="X")?"🍎":"🍊";
      cell.classList.add(val==="X"?"fruitX":"fruitO");
    } else {
      cell.textContent=(val==="X")?"🐉":"🕊️";
      cell.classList.add(val==="X"?"dragon":"phoenix");
    }
  }

  pX.classList.toggle("active", game.turn==="X");
  pO.classList.toggle("active", game.turn==="O");

  if (game.winner){
    if (game.winner==="Draw"){
      winnerTxt.textContent="Draw!";
    } else {
      winnerTxt.textContent=(game.winner==="X")?"Dragon Wins!":"Phoenix Wins!";
      triggerRuneBurst(game.winner);
      confettiBurst();
      screenShake();
      vibrate([30,40,80]);
      if (game.sfxOn) winSfx.currentTime=0, winSfx.play().catch(()=>{});
    }

    if (game.mode==="Player vs CPU" && game.winner==="X"){
      const t=((performance.now()-game.roundStart)/1000).toFixed(2);
      const mv=9-game.board.emptyCells().length;
      addLeaderboard({time:t, moves:mv, diff:game.difficulty.toLowerCase(), skin:game.skin.toLowerCase()});
    }
  }

  scoreEl.textContent=`Score – X: ${game.scoreX} | O: ${game.scoreO} | D: ${game.scoreD}`;
}

// BUTTONS
nextBtn.onclick=()=>{game.nextRound();renderBoard();updateBoard();}
resetBtn.onclick=()=>{game.scoreX=game.scoreO=game.scoreD=0;game.resetAll();renderBoard();updateBoard();}
homeBtn.onclick=()=>showHome(true);
sfxBtn.onclick=()=>{game.toggleSfx();sfxBtn.textContent=`SFX: ${game.sfxOn?"On":"Off"}`;}
musicBtn.onclick=()=>{musicWanted=!musicWanted;musicBtn.textContent=`Music: ${musicWanted?"On":"Off"}`;musicWanted?music.play().catch(()=>{}):music.pause();}

startBtn.onclick=()=>{
  game.mode=gameMode.value;
  game.difficulty=difficulty.value;
  game.skin=skinSel.value;
  document.body.className=`theme-${themeSel.value.toLowerCase()}`;
  modeBadge.textContent=`Mode: ${game.mode==="Player vs CPU"?"PvC":"PvP"}`;
  diffBadge.textContent=`Difficulty: ${game.difficulty}`;
  skinBadge.textContent=`Skin: ${game.skin}`;
  game.resetAll();renderBoard();updateBoard();
  showHome(false);
}

// HOME VISIBILITY
function showHome(show){
  homeScreen.classList.toggle("hidden",!show);
  boardEl.style.display=show?"none":"grid";
  document.querySelector(".btngrp").style.display=show?"none":"flex";
  document.querySelector(".avatars").style.display=show?"none":"flex";
}

// INIT
showHome(true);
loadLeaderboard();

// HAPTIC
function vibrate(p){
  if ("vibrate" in navigator) navigator.vibrate(p);
}

// LEADERBOARD
function addLeaderboard(e){
  const k="rxo_leader";
  const list=JSON.parse(localStorage.getItem(k)||"[]");
  list.push(e);
  list.sort((a,b)=>(a.time-b.time)||(a.moves-b.moves));
  localStorage.setItem(k,JSON.stringify(list.slice(0,10)));
  loadLeaderboard();
}

function loadLeaderboard(){
  const k="rxo_leader";
  const list=JSON.parse(localStorage.getItem(k)||"[]");
  leaderList.innerHTML="";
  list.forEach((e,i)=>{
    const li=document.createElement("li");
    li.textContent=`${i+1}. ${e.time}s · ${e.moves} moves · ${e.diff} · ${e.skin}`;
    leaderList.appendChild(li);
  });
}
