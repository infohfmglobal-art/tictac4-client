// runes.js — WIN FX

// ===== Rune Burst (emoji burst on win) =====
export function triggerRuneBurst(winner) {
  const container = document.body;
  const emoji = winner === "X" ? "🐉" : "🕊️";

  for (let i = 0; i < 15; i++) {
    const el = document.createElement("div");
    el.className = "rune-burst";
    el.textContent = emoji;
    el.style.left = (50 + Math.random()*30 - 15) + "%";
    el.style.top  = (50 + Math.random()*30 - 15) + "%";
    el.style.fontSize = (30 + Math.random()*25) + "px";
    el.style.transform = `rotate(${Math.random()*360}deg)`;

    container.appendChild(el);
    setTimeout(()=>el.remove(),800);
  }
}

// ===== Confetti =====
export function confettiBurst(){
  for (let i=0; i<25; i++){
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random()*100 + "%";
    c.style.background = `hsl(${Math.random()*360},80%,60%)`;
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),1200);
  }
}

// ===== Screen Shake =====
export function screenShake(){
  document.body.classList.add("shake");
  setTimeout(()=>document.body.classList.remove("shake"),600);
}
// Better win glow burst
  const emoji = (player === "X") ? "🐉" : "🕊️";
  const burst = document.createElement("div");
  burst.className = "burst";
  burst.textContent = emoji;
  document.body.appendChild(burst);

  setTimeout(() => burst.remove(), 1200);
}

// Confetti burst
export function confettiBurst() {
  for (let i = 0; i < 40; i++) {
    const c = document.createElement("div");
    c.className = "conf";
    document.body.appendChild(c);

    const size = (Math.random()*8)+4;
    c.style.width = size+"px";
    c.style.height = size+"px";
    c.style.left = Math.random()*100 + "vw";
    c.style.top = "-10px";

    const endX = (Math.random()*100-50)+"vw";
    c.animate([
      { transform:`translate(0,0)` },
      { transform:`translate(${endX},100vh)` }
    ], { duration: 1200 + Math.random()*500 });

    setTimeout(()=>c.remove(),1500);
  }
}

// Screen shake
export function screenShake() {
  document.body.style.animation = "shakeAnim 0.3s";
  setTimeout(()=>document.body.style.animation="", 350);
}
