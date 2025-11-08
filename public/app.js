// === RuneXO – FINAL FIXED EDITION (Splash → Login → Home → Game CPU) ===

// === INTRO SPLASH ===
window.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("introSplash");
  const login = document.getElementById("loginGate");
  const home = document.getElementById("homeScreen");
  const game = document.getElementById("gameArea");
  const bell = document.getElementById("introBell");

  // Hide everything except splash
  login.classList.add("hidden");
  home.classList.add("hidden");
  game.classList.add("hidden");

  // Play intro bell
  setTimeout(() => { if (bell) { bell.volume = 0.4; bell.play().catch(()=>{}); }}, 200);

  // Fade to login after 2.5s
  setTimeout(() => {
    intro.classList.add("fade-out");
    setTimeout(() => {
      intro.style.display = "none";
      login.classList.remove("hidden");
      login.style.display = "flex";
    }, 900);
  }, 2500);
});


// === LOGIN → HOME ===
const flashOverlay = document.getElementById("flashOverlay");
const guestBtn = document.getElementById("guestLoginGate");
const googleBtn = document.getElementById("googleLoginGate");
const homeScreen = document.getElementById("homeScreen");
const installOrb = document.getElementById("installOrb");
const logoutBtn = document.getElementById("logoutBtn");

function goldenFlashThen(cb){
  flashOverlay.classList.add("flash-show");
  setTimeout(()=>{
    flashOverlay.classList.remove("flash-show");
    cb && cb();
  },700);
}

function showHome(){
  goldenFlashThen(()=>{
    document.getElementById("loginGate").classList.add("hidden");
    homeScreen.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    setTimeout(()=>{
      installOrb.classList.remove("hidden");
      installOrb.classList.add("show");
    },1000);
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
function ensureBg(){if(musicOn && audio.bg.paused){audio.bg.volume=0.4;audio.bg.play().catch(()=>{});}}
function stopBg(){audio.bg.pause();}


// === GAME LOGIC ===
const startBtn=document.getElementById("startBtn");
const gameArea=document.getElementById("gameArea");
const homeBtn=document.getElementById("homeBtn");
const nextRoundBtn=document.getElementById("nextRoundBtn");
const resetBtn=document.getElementById("resetBtn");
const musicBtn=document.getElementById("musicBtn");
const sfxBtn=document.getElementById("sfxBtn");
const boardEl=document.getElementById("gameBoard");
const cells=Array.from(boardEl.querySelectorAll(".cell"));
const modeSel=document.getElementById("gameMode");
const diffSel=document.getElementById("difficulty");

let board=[],current="P1",running=false,againstCPU=true;

function initGame(){
  board=Array(9).fill("");
  current="P1";
  running=true;
  againstCPU=(modeSel.value==="Player vs CPU");
  cells.forEach(c=>{
    c.textContent="";
    c.onclick=()=>handleCell(c);
  });
}

function handleCell(c){
  if(!running) return;
  const idx=Number(c.dataset.index);
  if(board[idx]) return;
  board[idx]=current;
  c.textContent=current==="P1"?"X":"O";
  playSfx(audio.click);

  const w=checkWinner();
  if(w){endGame(w);return;}
  if(board.every(Boolean)){drawGame();return;}
  current=current==="P1"?"P2":"P1";
  if(againstCPU && current==="P2"){setTimeout(cpuMove,400);}
}

function drawGame(){playSfx(audio.draw);alert("😎 It's a draw!");running=false;}
function endGame(winner){
  running=false;
  if(winner==="P1"){playSfx(audio.win);alert("🏆 You Win!");}
  else{playSfx(audio.lose);alert("💀 CPU Wins!");}
}

function checkWinner(){
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const [a,b,c] of L){
    if(board[a] && board[a]===board[b] && board[a]===board[c]) return board[a];
  }
  return null;
}

function cpuMove(){
  const diff=diffSel.value;
  const empty=board.map((v,i)=>v?null:i).filter(v=>v!==null);
  if(!empty.length) return;
  let move;
  if(diff==="Easy"){move=empty[Math.floor(Math.random()*empty.length)];}
  else if(diff==="Normal"){move=findBest("P2")??findBest("P1")??empty[Math.floor(Math.random()*empty.length)];}
  else{move=minimax(board.slice(),"P2").index;}
  board[move]="P2";
  cells[move].textContent="O";
  playSfx(audio.click);
  const w=checkWinner();
  if(w){endGame(w);return;}
  if(board.every(Boolean)){drawGame();return;}
  current="P1";
}

function findBest(player){
  const empty=board.map((v,i)=>v?null:i).filter(v=>v!==null);
  for(const i of empty){
    board[i]=player;
    if(checkWinner()){board[i]="";return i;}
    board[i]="";
  }
  return null;
}

function minimax(state,player){
  const empty=state.map((v,i)=>v?null:i).filter(v=>v!==null);
  const w=staticWinner(state);
  if(w==="P1") return{score:-10};
  if(w==="P2") return{score:10};
  if(!empty.length) return{score:0};
  const moves=[];
  for(const i of empty){
    const move={index:i};
    state[i]=player;
    const res=minimax(state,player==="P2"?"P1":"P2");
    move.score=res.score;
    state[i]="";
    moves.push(move);
  }
  return player==="P2"
    ?moves.reduce((a,b)=>a.score>b.score?a:b)
    :moves.reduce((a,b)=>a.score<b.score?a:b);
}

function staticWinner(arr){
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const [a,b,c] of L) if(arr[a]&&arr[a]===arr[b]&&arr[a]===arr[c]) return arr[a];
  return null;
}


// === BUTTON EVENTS ===
document.addEventListener("DOMContentLoaded",()=>{
  startBtn.onclick=()=>{
    homeScreen.classList.add("hidden");
    gameArea.classList.remove("hidden");
    initGame();
  };
  homeBtn.onclick=()=>{
    gameArea.classList.add("hidden");
    homeScreen.classList.remove("hidden");
    stopBg();
  };
  nextRoundBtn.onclick=initGame;
  resetBtn.onclick=initGame;
  musicBtn.onclick=()=>{
    musicOn=!musicOn;
    musicBtn.textContent=musicOn?"🔈 Music ON":"🔇 Music OFF";
    if(musicOn)ensureBg();else stopBg();
  };
  sfxBtn.onclick=()=>{
    sfxOn=!sfxOn;
    sfxBtn.textContent=sfxOn?"🔊 SFX ON":"🔈 SFX OFF";
  };
});
