// === RuneXO – Final Stable Version (Phase 1 Completed) ===

window.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("introSplash");
  const login = document.getElementById("loginGate");
  const home = document.getElementById("homeScreen");
  const game = document.getElementById("gameArea");
  const bell = document.getElementById("introBell");

  // hide all except splash
  login.classList.add("hidden");
  home.classList.add("hidden");
  game.classList.add("hidden");

  // play intro bell
  setTimeout(() => { bell && bell.play().catch(()=>{}); }, 250);

  // fade out splash → show login
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.style.display = "none";
      login.classList.remove("hidden");
      login.style.display = "flex";
    }, 900);
  }, 2500);
});


// === LOGIN → HOME ===
const flash = document.getElementById("flashOverlay");
const guestBtn = document.getElementById("guestLoginGate");
const googleBtn = document.getElementById("googleLoginGate");
const homeScreen = document.getElementById("homeScreen");
const logoutBtn = document.getElementById("logoutBtn");

function goldenFlash(cb){
  flash.classList.add("flash-show");
  setTimeout(()=>{ flash.classList.remove("flash-show"); cb&&cb(); },700);
}
function showHome(){
  goldenFlash(()=>{
    document.getElementById("loginGate").classList.add("hidden");
    homeScreen.classList.remove("hidden");
  });
}
guestBtn.onclick = showHome;
googleBtn.onclick = showHome;
logoutBtn.onclick = ()=>{
  homeScreen.classList.add("hidden");
  document.getElementById("loginGate").classList.remove("hidden");
};


// === AUDIO ===
let musicOn=false,sfxOn=true;
const audio={
  bg:new Audio("./sound/bg.mp3"),
  click:new Audio("./sound/click.mp3"),
  win:new Audio("./sound/win.mp3"),
  lose:new Audio("./sound/lose.mp3"),
  draw:new Audio("./sound/draw.mp3")
};
audio.bg.loop=true;
function playSfx(a){if(sfxOn){a.currentTime=0;a.play().catch(()=>{});}}
function ensureBg(){if(musicOn&&!audio.bg.playing){audio.bg.volume=0.4;audio.bg.play().catch(()=>{});}}
function stopBg(){audio.bg.pause();}


// === GAME ===
const startBtn=document.getElementById("startBtn");
const gameArea=document.getElementById("gameArea");
const homeBtn=document.getElementById("homeBtn");
const nextBtn=document.getElementById("nextRoundBtn");
const resetBtn=document.getElementById("resetBtn");
const musicBtn=document.getElementById("musicBtn");
const sfxBtn=document.getElementById("sfxBtn");
const boardEl=document.getElementById("gameBoard");
const cells=Array.from(boardEl.querySelectorAll(".cell"));
const diffSel=document.getElementById("difficulty");

let board=[],current="P1",running=false;

function initGame(){
  board=Array(9).fill("");
  current="P1"; running=true;
  cells.forEach(c=>{
    c.textContent="";
    c.onclick=()=>onCell(c);
  });
}

function onCell(c){
  if(!running)return;
  const i=Number(c.dataset.index);
  if(board[i])return;
  board[i]="X"; c.textContent="X"; playSfx(audio.click);
  if(checkWin())return endGame("P1");
  if(board.every(Boolean))return drawGame();
  cpuMove();
}

function cpuMove(){
  const empty=board.map((v,i)=>v?null:i).filter(i=>i!==null);
  if(!empty.length)return;
  const move=empty[Math.floor(Math.random()*empty.length)];
  board[move]="O"; cells[move].textContent="O";
  playSfx(audio.click);
  if(checkWin())return endGame("P2");
  if(board.every(Boolean))drawGame();
}

function checkWin(){
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const [a,b,c] of L)
    if(board[a]&&board[a]===board[b]&&board[a]===board[c])return true;
  return false;
}
function endGame(p){
  running=false;
  playSfx(p==="P1"?audio.win:audio.lose);
  alert(p==="P1"?"🏆 You win!":"💀 CPU wins!");
}
function drawGame(){running=false;playSfx(audio.draw);alert("😎 Draw!");}


// === BUTTONS ===
document.addEventListener("DOMContentLoaded",()=>{
  startBtn.onclick=()=>{homeScreen.classList.add("hidden");gameArea.classList.remove("hidden");initGame();};
  homeBtn.onclick=()=>{gameArea.classList.add("hidden");homeScreen.classList.remove("hidden");stopBg();};
  nextBtn.onclick=initGame; resetBtn.onclick=initGame;
  musicBtn.onclick=()=>{musicOn=!musicOn;musicBtn.textContent=musicOn?"🔈 Music ON":"🔇 Music OFF";musicOn?ensureBg():stopBg();};
  sfxBtn.onclick=()=>{sfxOn=!sfxOn;sfxBtn.textContent=sfxOn?"🔊 SFX ON":"🔈 SFX OFF";};
});
