// runes.js – effects (confetti + shake + small rune burst)
export function triggerRuneBurst(winner){
  const container=document.body;
  for(let i=0;i<16;i++){
    const el=document.createElement("div");
    el.className="rune-burst";
    el.textContent=(winner==="X")?"🐉":"🕊️";
    el.style.left=(50 + (Math.random()*40-20))+"vw";
    el.style.top=(30 + (Math.random()*20-10))+"vh";
    el.style.fontSize=(26+Math.random()*16)+"px";
    el.style.opacity="0";
    el.style.transition="transform .7s ease, opacity .7s ease";
    container.appendChild(el);
    requestAnimationFrame(()=>{
      el.style.opacity="1";
      el.style.transform=`translate(${(Math.random()*140-70)}px, ${(Math.random()*-160)-40}px) scale(1.2)`;
    });
    setTimeout(()=>el.remove(),800);
  }
}
export function confettiBurst(){
  for(let i=0;i<60;i++){
    const c=document.createElement("div");
    c.className="confetti";
    c.style.left=(50+Math.random()*20-10)+"vw";
    c.style.top="40vh";
    c.style.setProperty("--dx",(Math.random()*300-150)+"px");
    c.style.setProperty("--dy",(Math.random()*-240-80)+"px");
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),900);
  }
}
export function screenShake(){
  document.body.classList.add("shake");
  setTimeout(()=>document.body.classList.remove("shake"),400);
}

/* quick styles injected */
const style=document.createElement("style");
style.textContent=`
.rune-burst{position:fixed; pointer-events:none; z-index:5}
.confetti{
 position:fixed; width:6px; height:6px; background:#ffd86e; box-shadow:0 0 6px #ffd86e;
 transform:translate(0,0); animation:fly .9s ease forwards; pointer-events:none; z-index:6;
}
@keyframes fly{
  to{ transform: translate(var(--dx),var(--dy)) rotate(180deg); opacity:0 }
}
.shake{animation:shake .4s linear}
@keyframes shake{
  0%,100%{transform:translateX(0)}
  25%{transform:translateX(-6px)}
  50%{transform:translateX(6px)}
  75%{transform:translateX(-4px)}
}
`;
document.head.appendChild(style);
