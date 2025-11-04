// runes.js
// Simple visual effects: rune burst, confetti, and screen shake.

export function triggerRuneBurst(winner){
  const el = document.createElement("div");
  el.className = "rune-burst";
  el.textContent = winner === "X" ? "🐉" : "🕊️";
  Object.assign(el.style,{
    position:"fixed",left:"50%",top:"40%",transform:"translate(-50%,-50%) scale(1)",
    fontSize:"72px",pointerEvents:"none",filter:"drop-shadow(0 0 8px gold)",
    zIndex:9999,opacity:1,transition:"transform .7s ease, opacity .7s ease"
  });
  document.body.appendChild(el);
  requestAnimationFrame(()=>{ el.style.transform="translate(-50%,-50%) scale(1.6)"; el.style.opacity="0"; });
  setTimeout(()=>el.remove(),750);
}

export function confettiBurst(){
  const canvas = document.getElementById("fxLayer");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  resize(); draw();

  const parts = Array.from({length:80}).map(()=>({
    x: Math.random()*canvas.width,
    y: -10-Math.random()*200,
    s: 2+Math.random()*3,
    v: 2+Math.random()*3,
    a: Math.random()*Math.PI*2
  }));

  let t = 0;
  function draw(){
    t++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    parts.forEach(p=>{
      p.y += p.v; p.x += Math.sin((t+p.a)/10);
      ctx.fillStyle = `hsl(${(p.x+p.y)%360},100%,70%)`;
      ctx.fillRect(p.x,p.y,p.s,p.s);
    });
    if (t<90) requestAnimationFrame(draw); else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  window.addEventListener("resize", resize, {once:true});
}

export function screenShake(){
  document.body.animate(
    [{transform:"translate(0,0)"},{transform:"translate(4px,0)"},{transform:"translate(-4px,0)"},{transform:"translate(0,0)"}],
    {duration:250,iterations:1}
  );
}
