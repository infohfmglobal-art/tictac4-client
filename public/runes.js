// runes.js
export function triggerRuneBurst(winner){
  const container=document.body;
  for(let i=0;i<16;i++){
    const d=document.createElement("div");
    d.className="rune-burst";
    d.textContent = winner==="X" ? "🐉" : "🕊️";
    d.style.position="fixed";
    d.style.left=(50+Math.random()*20-10)+"vw";
    d.style.top =(40+Math.random()*20-10)+"vh";
    d.style.fontSize=(16+Math.random()*12)+"px";
    d.style.pointerEvents="none";
    d.style.filter="drop-shadow(0 0 6px gold)";
    container.appendChild(d);
    setTimeout(()=>d.remove(),700);
  }
}

export function confettiBurst(){
  for(let i=0;i<35;i++){
    const s=document.createElement("span");
    s.className="confetti";
    s.style.position="fixed";
    s.style.left=Math.random()*100+"vw";
    s.style.top="-4vh";
    s.style.fontSize=(10+Math.random()*10)+"px";
    s.textContent="✨";
    document.body.appendChild(s);
    const t=800+Math.random()*600;
    s.animate([{transform:"translateY(0)"},{transform:"translateY(110vh)"}],{duration:t,easing:"ease-in"});
    setTimeout(()=>s.remove(),t);
  }
}

export function screenShake(){
  document.body.animate(
    [{transform:"translateX(0)"},{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"translateX(0)"}],
    {duration:250}
  );
}
