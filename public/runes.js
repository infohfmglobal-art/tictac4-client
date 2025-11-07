// Lightweight FX helpers (no external libs)

export function triggerRuneBurst(winner){
  // Make 12 glowing particles that fade
  for (let i=0;i<12;i++){
    const p=document.createElement('div');
    p.textContent = winner==='X' ? '✨' : '💫';
    p.style.position='fixed';
    p.style.left = (window.innerWidth/2 + (Math.random()*120-60))+'px';
    p.style.top  = (window.innerHeight/2 + (Math.random()*80-40))+'px';
    p.style.pointerEvents='none';
    p.style.opacity='1';
    p.style.transition='transform .8s ease, opacity .8s ease';
    document.body.appendChild(p);
    requestAnimationFrame(()=>{
      p.style.transform = `translate(${(Math.random()*300-150)}px, ${(Math.random()*240-120)}px) scale(1.6)`;
      p.style.opacity='0';
    });
    setTimeout(()=>p.remove(),850);
  }
}

export function confettiBurst(){
  for (let i=0;i<18;i++){
    const c=document.createElement('div');
    c.style.position='fixed';
    c.style.width='6px'; c.style.height='10px';
    c.style.left = (window.innerWidth/2)+'px';
    c.style.top  = (window.innerHeight/2)+'px';
    c.style.background = `hsl(${Math.floor(Math.random()*360)}, 90%, 60%)`;
    c.style.transform = 'translate(-50%, -50%)';
    c.style.pointerEvents='none';
    c.style.opacity='1';
    c.style.transition='transform .9s cubic-bezier(.1,.8,.2,1), opacity .9s';
    document.body.appendChild(c);
    const dx=(Math.random()*500-250), dy=(Math.random()*400-180);
    requestAnimationFrame(()=>{
      c.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random()*360}deg)`;
      c.style.opacity='0';
    });
    setTimeout(()=>c.remove(),950);
  }
}

export function screenShake(){
  const dur=300;
  const el=document.body;
  el.style.transition='transform .05s';
  let n=0;
  const id=setInterval(()=>{
    el.style.transform=`translate(${(Math.random()*6-3)}px, ${(Math.random()*6-3)}px)`;
    if (n++>dur/50){ clearInterval(id); el.style.transform=''; }
  },50);
}
