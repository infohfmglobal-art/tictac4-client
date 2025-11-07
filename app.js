// === OPTIONAL FIREBASE (SAFE FALLBACK) ===
let firebase = { auth:null, db:null };
async function tryLoadFirebase(){
  try {
    const mod = await import('./firebaseSetup.js');
    firebase = mod;
  } catch (e) {
    // No firebase connected; keep graceful no-op.
  }
}
tryLoadFirebase();

// === AUDIO (Music OFF by default) ===
const clickSfx = new Audio('./sound/click.mp3');
const winSfx   = new Audio('./sound/win.mp3');
const music    = new Audio('./sound/bg.mp3');
music.loop = true;
let musicWanted = false; // user can turn it on

// === IMPORT GAME/RUNES ===
import { Game } from './game.js';
import { triggerRuneBurst, confettiBurst, screenShake } from './runes.js';

// === GAME INSTANCE ===
const game = new Game();

// === DOM GETTERS (defensive) ===
const $ = (id) => document.getElementById(id);

// Gate + flash
const splash = $('introSplash');
const gate   = $('loginGate');
const flash  = $('flashOverlay');

// Home menu
const homeScreen = $('homeScreen');
const gameMode   = $('gameMode');
const difficulty = $('difficulty');
const skinSel    = $('skin');
const themeSel   = $('themeSelect');
const startBtn   = $('startBtn');

// In-game UI
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

// Login buttons
const gateGoogle = $('googleLoginGate');
const gateGuest  = $('guestLoginGate');
const quickGoogle= $('googleLoginBtn');
const quickGuest = $('guestLoginBtn');

const coinTop   = $('playerCoins');
const coinHome  = $('playerCoinsHome');

// === SIMPLE STATE ===
let rewardGranted = false;
function setCoins(val){
  if (coinTop)  coinTop.textContent  = `💰 ${val}`;
  if (coinHome) coinHome.textContent = `💰 ${val}`;
}
window.currentCoins = 0;
setCoins(0);

// === UTILITIES ===
function toggle(el, show){ if (el) el.classList.toggle('hidden', !show); }
function showFlash(cb){
  if (!flash) return cb && cb();
  flash.classList.add('flash-show');
  setTimeout(()=>{
    flash.classList.remove('flash-show');
    cb && cb();
  }, 450);
}
function showGate(){
  toggle(splash, false);
  toggle(gate, true);
  toggle(homeScreen, false);
  hideGame();
}
function showHome(){
  toggle(gate, false);
  toggle(homeScreen, true);
  hideGame();
}
function hideHome(){
  toggle(homeScreen, false);
}
function showGame(){
  toggle(modeBar, true);
  toggle(document.querySelector('.avatars'), true);
  toggle(scoreEl, true);
  toggle(msgEl, true);
  toggle(loginBar, true);
  toggle(boardEl, true);
  toggle(document.querySelector('.btngrp'), true);
}
function hideGame(){
  toggle(modeBar, false);
  const av = document.querySelector('.avatars'); if (av) av.classList.add('hidden');
  toggle(scoreEl, false);
  toggle(msgEl, false);
  toggle(loginBar, false);
  toggle(boardEl, false);
  const bg = document.querySelector('.btngrp'); if (bg) bg.classList.add('hidden');
}

// === SPLASH FLOW ===
window.addEventListener('load', () => {
  // fade splash then show gate
  setTimeout(() => {
    if (splash) splash.classList.add('hide');
    setTimeout(showGate, 700);
  }, 1700);
});

// === LOGIN FLOW ===
function startGuest(){
  window.currentCoins = 100;
  setCoins(100);
  showFlash(() => showHome());
}
// Google disabled if firebase not present
async function startGoogle(){
  if (!('auth' in firebase) || !firebase.auth) {
    alert('Google login will be enabled after Firebase is connected.');
    return;
  }
  try {
    const { GoogleAuthProvider, signInWithPopup, auth, db, doc, getDoc, setDoc } = firebase;
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    const ref = doc(db, 'players', res.user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { name: res.user.displayName, email: res.user.email, coins: 200, wins: 0, createdAt: Date.now() });
      window.currentCoins = 200;
    } else {
      window.currentCoins = snap.data().coins || 0;
    }
    setCoins(window.currentCoins);
    showFlash(() => showHome());
  } catch (e) {
    console.warn('Google login error:', e);
    alert('Login error. Please try guest for now.');
  }
}
if (gateGuest)  gateGuest.addEventListener('click', startGuest);
if (quickGuest) quickGuest.addEventListener('click', startGuest);
if (gateGoogle) gateGoogle.addEventListener('click', startGoogle);
if (quickGoogle) quickGoogle.addEventListener('click', startGoogle);

// === RENDER BOARD ===
function renderBoard(){
  if (!boardEl) return;
  boardEl.innerHTML = '';
  for (let r=0;r<3;r++){
    for (let c=0;c<3;c++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r=r; cell.dataset.c=c;
      cell.addEventListener('click', () => handleMove(r,c));
      boardEl.appendChild(cell);
    }
  }
}

// === MOVES ===
function handleMove(r,c){
  if (musicWanted && music.paused) music.play().catch(()=>{});
  const result = game.move(r,c,true);
  if (!result) return;
  if (game.sfxOn){ clickSfx.currentTime=0; clickSfx.play().catch(()=>{}); }
  updateBoard();
  if (result === 'cpuPending'){
    setTimeout(()=>{
      game.performCpuMove();
      if (game.sfxOn){ clickSfx.currentTime=0; clickSfx.play().catch(()=>{}); }
      updateBoard();
    }, 450);
  }
}

// === UPDATE UI ===
function updateBoard(){
  if (!boardEl) return;
  const cells = boardEl.children;
  for (let i=0;i<cells.length;i++){
    const r = Math.floor(i/3), c = i%3;
    const val = game.board.grid[r][c];
    const cell = cells[i];
    cell.className = 'cell';
    cell.style.color = ''; cell.style.textShadow=''; cell.textContent='';
    if (!val) continue;

    if (game.skin.startsWith('Classic')){
      cell.textContent = val;
      if (val === 'X'){ cell.style.color='#00ffff'; cell.style.textShadow='0 0 12px #00ffff,0 0 25px #00cccc'; }
      else { cell.style.color='#ff66cc'; cell.style.textShadow='0 0 12px #ff66cc,0 0 25px #ff3399'; }
    } else if (game.skin === 'Fruit'){
      cell.textContent = (val==='X') ? '🍎' : '🍊';
      cell.style.textShadow = (val==='X') ? '0 0 15px #ff3366,0 0 25px #ff0033' : '0 0 15px #ffaa00,0 0 25px #ff7700';
    } else if (game.skin === 'Runes'){
      cell.textContent = (val==='X') ? '🐉' : '🕊️';
      cell.style.color = (val==='X') ? '#00ffff' : '#ff66cc';
      cell.style.textShadow = (val==='X') ? '0 0 15px #00ffff,0 0 30px #00cccc' : '0 0 15px #ff66cc,0 0 30px #ff3399';
    }
  }

  // Active badges
  if (pX) pX.classList.toggle('active', game.turn==='X');
  if (pO) pO.classList.toggle('active', game.turn==='O');

  // Winner / Draw
  if (game.winner && game.winner !== 'Draw'){
    let winnerName = '';
    if (game.skin === 'Classic X / O'){ winnerName = (game.winner==='X') ? '❌ X Wins!' : '🟣 O Wins!'; }
    else if (game.skin === 'Fruit'){ winnerName = (game.winner==='X') ? '🍎 Apple Wins!' : '🍊 Orange Wins!'; }
    else if (game.skin === 'Runes'){ winnerName = (game.winner==='X') ? '🐉 Dragon Wins!' : '🕊️ Phoenix Wins!'; }
    else { winnerName = `${game.winner} Wins!`; }
    if (winnerTxt) winnerTxt.textContent = winnerName;
    if (msgEl){ msgEl.classList.remove('draw'); msgEl.classList.remove('hidden'); }

    for (const [r,c] of game.getWinningCells()){
      const idx = r*3+c;
      if (boardEl.children[idx]) boardEl.children[idx].classList.add('win-cell');
    }

    triggerRuneBurst(game.winner);
    confettiBurst(); screenShake();
    if (game.sfxOn){ winSfx.currentTime=0; winSfx.play().catch(()=>{}); }

  } else if (game.winner === 'Draw'){
    if (winnerTxt) winnerTxt.textContent = 'Draw!';
    if (msgEl){ msgEl.classList.add('draw'); msgEl.classList.remove('hidden'); }
  } else {
    if (msgEl) msgEl.classList.add('hidden');
    if (winnerTxt) winnerTxt.textContent = '';
  }

  if (scoreEl) scoreEl.textContent = `Score – X: ${game.scoreX} | O: ${game.scoreO} | D: ${game.scoreD}`;
}

// === BUTTONS ===
if (nextBtn) nextBtn.onclick = ()=>{ game.nextRound(); renderBoard(); updateBoard(); game.roundStart=performance.now(); rewardGranted=false; };
if (resetBtn) resetBtn.onclick= ()=>{ game.scoreX=game.scoreO=game.scoreD=0; game.resetAll(); renderBoard(); updateBoard(); rewardGranted=false; };
if (homeBtn)  homeBtn.onclick = ()=>{ showHome(); hideGame(); };

if (sfxBtn) sfxBtn.onclick = ()=>{ game.toggleSfx(); sfxBtn.textContent = `SFX: ${game.sfxOn ? 'On' : 'Off'}`; };
if (musicBtn) musicBtn.onclick = ()=>{
  musicWanted = !musicWanted;
  musicBtn.textContent = `Music: ${musicWanted ? 'On' : 'Off'}`;
  if (musicWanted) music.play().catch(()=>{}); else music.pause();
};
if (installBtn) installBtn.onclick = async ()=>{
  const p = window.deferredPrompt; if (!p) return; p.prompt(); await p.userChoice; window.deferredPrompt=null;
};

// === HOME START ===
if (startBtn) startBtn.onclick = ()=>{
  hideHome();
  // Apply selections
  game.mode = gameMode?.value || 'Player vs CPU';
  game.difficulty = difficulty?.value || 'Easy';
  game.skin = skinSel?.value || 'Runes';
  document.body.className = `theme-${(themeSel?.value || 'Rune').toLowerCase()}`;

  if (modeBadge) modeBadge.textContent = `Mode: ${game.mode==='Player vs CPU' ? 'PvC' : 'PvP'}`;
  if (diffBadge) diffBadge.textContent = `Difficulty: ${game.difficulty}`;
  if (skinBadge) skinBadge.textContent = `Skin: ${game.skin}`;

  // prepare round
  game.resetAll(); renderBoard(); updateBoard(); showGame();
};

// Safety: if any fatal error blocked earlier UI, ensure gate is visible
setTimeout(() => { if (document.body && !gate.classList.contains('hidden') && splash && splash.classList.contains('hide')) { /* ok */ } }, 3000);
