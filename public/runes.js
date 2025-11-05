// runes.js
// Visual FX for RuneXO: rune burst, confetti, screen shake

// ===== RUNE BURST =====
export function triggerRuneBurst(winner){
  const el = document.createElement("div");
  el.className = "rune-burst";
  el.textContent = winner === "X" ? "🐉" : "🕊️";

  Object.assign(el.style,{
    position:"fixed",
    left:"50%", top:"35%",
    transform:"translate(-50%,-50%) scale(0.8)",
    fontSize:"80px",
    pointerEvents:"none",
    filter:"drop-shadow(0 0 10px gold)",
    zIndex:9999,
    opacity:"1",
    transition:"transform .6s ease-out, opacity .6s ease-out"
  });

  document.body.appendChild(el);

  requestAnimationFrame(()=>{
    el.style.transform = "translate(-50%,-50%) scale(1.7)";
    el.style.opacity = "0";
  });

  setTimeout(()=>el.remove(),650);
}

// ===== CONFETTI =====
export function confettiBurst(){
  const canvas = document.getElementById("fxLayer");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  resize();
  
  const pieces = Array.from({ length: 90 }).map(()=>({
    x: Math.random()*canvas.width,
    y: -20 - Math.random()*200,
    size: 2 + Math.random()*4,
    speed: 2 + Math.random()*3,
    angle: Math.random()*Math.PI*2,
    color: `hsl(${Math.random()*360},100%,65%)`
  }));

  let t = 0;
  function draw(){
    t++;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    for(const p of pieces){
      p.y += p.speed;
      p.x += Math.sin((t+p.angle)/12) * 2;

      ctx.fillStyle = p.color;
      ctx.fillRect(p.x,p.y,p.size,p.size);
    }

    if (t<90) requestAnimationFrame(draw);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  draw();

  function resize(){
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  window.addEventListener("resize",resize,{once:true});
}

// ===== SCREEN SHAKE =====
export function screenShake(){
  document.body.animate(
    [
      { transform:"translate(0,0)" },
      { transform:"translate(4px,0)" },
      { transform:"translate(-4px,0)" },
      { transform:"translate(0,0)" }
    ],
    { duration:220, iterations:1 }
  );
}
