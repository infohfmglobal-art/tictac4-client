// runes.js
export function triggerRuneBurst(winner="X"){
  // lightweight glow; safe no-op if not needed
  document.body.classList.add("burst");
  setTimeout(()=>document.body.classList.remove("burst"), 400);
}
export function confettiBurst(){
  // simple emoji confetti
  const n = 24;
  for(let i=0;i<n;i++){
    const s=document.createElement("div");
    s.textContent = ["✨","🎉","💫","⭐"][i%4];
    s.style.position="fixed";
    s.style.left = (Math.random()*100)+"vw";
    s.style.top  = "-40px";
    s.style.fontSize = (18+Math.random()*12)+"px";
    s.style.transition="transform 1s linear, opacity 1s linear";
    document.body.appendChild(s);
    requestAnimationFrame(()=>{
      s.style.transform = `translateY(${window.innerHeight+80}px) rotate(${(Math.random()*360)|0}deg)`;
      s.style.opacity="0";
    });
    setTimeout(()=>s.remove(), 1100);
  }
}
export function screenShake(){
  const b=document.body;
  b.style.transition="transform 0.12s";
  b.style.transform="translateX(6px)";
  setTimeout(()=>{ b.style.transform="translateX(-6px)"; }, 120);
  setTimeout(()=>{ b.style.transform="none"; }, 240);
}
