// runes.js
export function triggerRuneBurst(winner) {
  const container = document.body;
  for (let i=0;i<20;i++){
    const el=document.createElement("div");
    el.className="rune-burst";
    el.textContent = winner==="X" ? "🐉" : "🕊️";
    el.style.left = (50 + (Math.random()*30-15)) + "%";
    el.style.top  = (50 + (Math.random()*12-6)) + "%";
    el.style.fontSize = (24 + Math.random()*20) + "px";
    container.appendChild(el);
    setTimeout(()=>el.remove(), 900);
  }
}

export function confettiBurst() {
  const colors = ["#ffdd57","#7ce3ff","#ff7ab6","#b388ff","#7dff9e"];
  for (let i=0;i<40;i++){
    const s = document.createElement("div");
    s.className = "confetti";
    s.style.left = (10 + Math.random()*80) + "%";
    s.style.top = (45 + Math.random()*10) + "%";
    s.style.width = s.style.height = (6 + Math.random()*6) + "px";
    s.style.background = colors[(Math.random()*colors.length)|0];
    s.style.transform = `rotate(${Math.random()*360}deg)`;
    document.body.appendChild(s);
    setTimeout(()=>s.remove(), 900);
  }
}

export function screenShake() {
  document.body.classList.add("shake");
  setTimeout(()=>document.body.classList.remove("shake"), 400);
}
