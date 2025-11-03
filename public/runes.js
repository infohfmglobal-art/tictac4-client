// runes.js – lightweight, safe effects
export function triggerRuneBurst(winner){
  // small crown pulse – safe no-op if missing CSS
  const el = document.getElementById("msg");
  if (!el) return;
  el.classList.add("show-winner");
  setTimeout(()=>el.classList.remove("show-winner"), 900);
}

export function confettiBurst(){
  // tiny inline confetti: add 12 dots then fade
  const root = document.body;
  for (let i=0;i<12;i++){
    const d = document.createElement("i");
    d.style.position="fixed";
    d.style.left = (50 + (Math.random()*40-20)) + "vw";
    d.style.top  = (10 + Math.random()*10) + "vh";
    d.style.width=d.style.height="8px";
    d.style.background="gold";
    d.style.borderRadius="50%";
    d.style.opacity="1";
    d.style.transition="transform 1s ease, opacity 1s ease";
    root.appendChild(d);
    setTimeout(()=>{ d.style.transform=`translate(${(Math.random()*2-1)*200}px, 400px)`; d.style.opacity="0"; },10);
    setTimeout(()=>d.remove(),1100);
  }
}

export function screenShake(){
  const el = document.documentElement;
  el.style.transition="transform 0.15s";
  el.style.transform="translateX(6px)";
  setTimeout(()=>{ el.style.transform="translateX(-6px)"; },75);
  setTimeout(()=>{ el.style.transform=""; el.style.transition=""; },150);
}
