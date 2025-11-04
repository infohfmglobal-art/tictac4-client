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
