// AUDIO (music OFF by default)
const clickSfx = new Audio('./sound/click.mp3');
const winSfx   = new Audio('./sound/win.mp3');
const music    = new Audio('./sound/bg.mp3');
music.loop = true;
let musicWanted = false; // user toggle

// IMPORTS
import { Game } from './game.js';
import { triggerRuneBurst, confettiBurst, screenShake } from './runes.js';

// GAME
const game = new Game();

// DOM helpers
const $ = (id)=>document.getElementById(id);

// Splash / gate / flash
const splash = $('introSplash');
const gate   = $('loginGate');
const flash  = $('flashOverlay');

// Home
const homeScreen = $('homeScreen');
const gameMode   = $('gameMode');
const difficulty = $('difficulty');
const skinSel    = $('skin');
const themeSel   = $('themeSelect');
const startBtn   = $('startBtn');
const leaderList = $('leaderList');

// In-game
const boardEl   = $('board');
const scoreEl   = $('score');
const msgEl     = $('msg');
const winnerTxt = $('winnerText');

const nextBtn   = $('nextBtn');
const resetBtn  = $('resetBtn');
const homeBtn   = $('homeBtn');
const sfxBtn    = $('sfxBtn');
const musicBtn  = $('musicBtn');
const installBtn= $('installBtn');

const modeBar   = $('modeBar');
const modeBadge = $('modeBadge');
const diffBadge = $('diffBadge');
const skinBadge = $('skinBadge');
const pX        = $('pX');
const pO        = $('pO');
const loginBar  = $('loginBar');

const gateGuest = $('guestLoginGate');
const quickGuest= $('guestLoginBtn');

const coinTop   = $('playerCoins');
const coinHome  = $('playerCoinsHome');

// COINS (local)
const COIN_KEY = 'rxo_coins';
function getCoins(){ return parseInt(localStorage.getItem(COIN_KEY)||'0',10); }
function setCoins(n){
  localStorage.setItem(COIN_KEY, String(n));
  if (coinTop)  coinTop.textContent  = `💰 ${n}`;
  if (coinHome) coinHome.textContent = `💰 ${n}`;
}
if (!localStorage.getItem(COIN_KEY)) setCoins(100); // welcome bonus once
else setCoins(getCoins());

let rewardGranted=false;

// LEADERBOARD (local)
const LEAD_KEY = 'rxo_leader';
function addLeaderboard(entry){
  const list = JSON.parse(localStorage.getItem(LEAD_KEY)||'[]');
  list.push(entry);
  list.sort((a,b)=> (parseFloat(a.time)-parseFloat(b.time)) || (a.moves-b.moves));
  localStorage.setItem(LEAD_KEY, JSON.stringify(list.slice(0,10)));
  loadLeaderboard();
}
function loadLeaderboard(){
  const list = JSON.parse(localStorage.getItem(LEAD_KEY)||'[]');
  if (!leaderList) return;
  leaderList.innerHTML='';
  list.forEach((e,i)=>{
    const li=document.createElement('li');
    li.textContent = `${i+1}. ${e.time}s · ${e.moves} moves · ${e.diff} · ${e.skin}`;
    leaderList.appendChild(li);
  });
}
loadLeaderboard();

// UTIL
function toggle(el, show){ if(el) el.classList.toggle('hidden', !show); }
function showFlash(cb){
  if (!flash) return cb && cb();
  flash.classList.add('flash-show');
  setTimeout(()=>{ flash.classList.remove('flash-show'); cb && cb(); }, 450);
}
function showGate(){
  toggle(splash,false); toggle(gate,true);
  toggle(homeScreen,false); hideGame();
}
function showHome(){
  toggle(gate,false); toggle(homeScreen,true); hideGame();
}
function hideHome(){ toggle(homeScreen,false); }
function showGame(){
  toggle(modeBar,true);
  const av = document.querySelector('.avatars'); if (av) av.classList.remove('hidden');
  toggle(scoreEl,true); toggle(msgEl,true); toggle(loginBar,true);
  toggle(boardEl,true); const bg=document.querySelector('.btngrp'); if (bg) bg.classList.remove('hidden');
}
function hideGame(){
  toggle(modeBar,false);
  const av = document.querySelector('.avatars'); if (av) av.classList.add('hidden');
  toggle(scoreEl,false); toggle(msgEl,false); toggle(loginBar,false);
  toggle(boardEl,false); const bg=document.querySelector('.btngrp'); if (bg) bg.classList.add('hidden');
}

// SPLASH FLOW
window.addEventListener('load', ()=>{
  setTimeout(()=>{ if (splash) splash.classList.add('hide'); setTimeout(showGate, 700); }, 1400);
});

// LOGIN (Guest only)
function startGuest(){
  if (!localStorage.getItem(COIN_KEY)) setCoins(100);
  showFlash(()=> showHome());
}
if (gateGuest)  gateGuest.addEventListener('click', startGuest);
if (quickGuest) quickGuest.addEventListener('click', startGuest);

// BOARD RENDER
function renderBoard(){
  if (!boardEl) return;
  boardEl.innerHTML='';
  for (let r=0;r<3;r++){
    for (let c=0;c<3;c++){
      const cell=document.createElement('div');
      cell.className='cell';
      cell.dataset.r=r; cell.dataset.c=c;
      cell.addEventListener('click', ()=> handleMove(r,c));
      boardEl.appendChild(cell);
    }
  }
}

// MOVE
function handleMove(r,c){
  if (musicWanted && music.paused) music.play().catch(()=>{});
  const result = game.move(r,c,true);
  if (!result) return;

  if (game.sfxOn){ clickSfx.currentTime=0; clickSfx.play().catch(()=>{}); }
  updateBoard();

  if (result==='cpuPending'){
    setTimeout(()=>{
      game.performCpuMove();
      if (game.sfxOn){ clickSfx.currentTime=0; clickSfx.play().catch(()=>{}); }
      updateBoard();
    }, 450);
  }
}

// UPDATE UI
function updateBoard(){
  if (!boardEl) return;
  const cells = boardEl.children;
  for (let i=0;i<cells.length;i++){
    const r=Math.floor(i/3), c=i%3;
    const val=game.board.grid[r][c];
    const cell=cells[i];
    cell.className='cell';
    cell.style.color=''; cell.style.textShadow=''; cell.textContent='';

    if (!val) continue;

    if (game.skin.startsWith('Classic')){
      cell.textContent = val;
      if (val==='X'){ cell.style.color='#00ffff'; cell.style.textShadow='0 0 12px #00ffff,0 0 25px #00cccc'; }
      else { cell.style.color='#ff66cc'; cell.style.textShadow='0 0 12px #ff66cc,0 0 25px #ff3399'; }
    } else if (game.skin==='Fruit'){
      cell.textContent = (val==='X') ? '🍎' : '🍊';
      cell.style.textShadow = (val==='X') ? '0 0 15px #ff3366, 0 0 25px #ff0033' : '0 0 15px #ffaa00, 0 0 25px #ff7700';
    } else { // Runes
      cell.textContent = (val==='X') ? '🐉' : '🕊️';
      cell.style.color = (val==='X') ? '#00ffff' : '#ff66cc';
      cell.style.textShadow = (val==='X') ? '0 0 15px #00ffff,0 0 30px #00cccc' : '0 0 15px #ff66cc,0 0 30px #ff3399';
    }
  }

  if (pX) pX.classList.toggle('active', game.turn==='X');
  if (pO) pO.classList.toggle('active', game.turn==='O');

  if (game.winner && game.winner!=='Draw'){
    let winnerName='';
    if (game.skin==='Classic X / O'){ winnerName=(game.winner==='X')?'❌ X Wins!':'🟣 O Wins!'; }
    else if (game.skin==='Fruit'){ winnerName=(game.winner==='X')?'🍎 Apple Wins!':'🍊 Orange Wins!'; }
    else { winnerName=(game.winner==='X')?'🐉 Dragon Wins!':'🕊️ Phoenix Wins!'; }

    if (winnerTxt) winnerTxt.textContent=winnerName;
    if (msgEl){ msgEl.classList.remove('hidden'); msgEl.classList.add('show-winner'); }

    for (const [r,c] of game.getWinningCells()){
      const idx=r*3+c; if (boardEl.children[idx]) boardEl.children[idx].classList.add('win-cell');
    }
    triggerRuneBurst(game.winner); confettiBurst(); screenShake();
    if (game.sfxOn){ winSfx.currentTime=0; winSfx.play().catch(()=>{}); }

    // PvC leaderboard + coins (local)
    if (game.mode==='Player vs CPU' && game.winner==='X'){
      const elapsed=((performance.now()-game.roundStart)/1000).toFixed(2);
      const moves = 9 - game.board.emptyCells().length;
      addLeaderboard({ time:elapsed, moves, diff:game.difficulty.toLowerCase(), skin:game.skin.toLowerCase() });
    }
    if (!rewardGranted){ rewardGranted=true; setCoins(getCoins()+20); }

  } else if (game.winner==='Draw'){
    if (winnerTxt) winnerTxt.textContent='Draw!';
    if (msgEl){ msgEl.classList.remove('hidden'); msgEl.classList.add('show-winner'); }
    if (!rewardGranted){ rewardGranted=true; setCoins(getCoins()+5); }

  } else {
    if (msgEl) msgEl.classList.add('hidden');
    if (winnerTxt) winnerTxt.textContent='';
  }

  if (scoreEl) scoreEl.textContent = `Score – X: ${game.scoreX} | O: ${game.scoreO} | D: ${game.scoreD}`;
}

// BUTTONS
if (nextBtn) nextBtn.onclick=()=>{ rewardGranted=false; game.nextRound(); renderBoard(); updateBoard(); game.roundStart=performance.now(); };
if (resetBtn) resetBtn.onclick=()=>{ rewardGranted=false; game.scoreX=game.scoreO=game.scoreD=0; game.resetAll(); renderBoard(); updateBoard(); };
if (homeBtn)  homeBtn.onclick =()=>{ showHome(); hideGame(); };
if (sfxBtn)   sfxBtn.onclick  =()=>{ game.toggleSfx(); sfxBtn.textContent=`SFX: ${game.sfxOn?'On':'Off'}`; };
if (musicBtn) musicBtn.onclick=()=>{ musicWanted=!musicWanted; musicBtn.textContent=`Music: ${musicWanted?'On':'Off'}`; if(musicWanted) music.play().catch(()=>{}); else music.pause(); };
if (installBtn) installBtn.onclick=async()=>{ const p=window.deferredPrompt; if(!p) return; p.prompt(); await p.userChoice; window.deferredPrompt=null; };

// HOME START
if (startBtn) startBtn.onclick = ()=>{
  hideHome();
  game.mode = gameMode?.value || 'Player vs CPU';
  game.difficulty = difficulty?.value || 'Easy';
  game.skin = skinSel?.value || 'Runes';
  document.body.className = `theme-${(themeSel?.value || 'Rune').toLowerCase()}`;

  if (modeBadge) modeBadge.textContent = `Mode: ${game.mode==='Player vs CPU'?'PvC':'PvP'}`;
  if (diffBadge) diffBadge.textContent = `Difficulty: ${game.difficulty}`;
  if (skinBadge) skinBadge.textContent = `Skin: ${game.skin}`;

  game.resetAll(); renderBoard(); updateBoard(); showGame();
};

// safety: ensure Gate appears after splash
setTimeout(()=>{ if (splash && splash.classList.contains('hide')) { /* ok */ } }, 3000);
