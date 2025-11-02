// ===== RUNE PARTICLE SYSTEM (Premium FX) =====
const canvas = document.getElementById("runeParticles");
const ctx = canvas.getContext("2d");

let particles = [];
const symbols = ["🐉", "🕊️", "⭐", "⚡", "✨"];
const colors = ["#ff00ff", "#00eaff", "#ffd54f", "#ff6b6b", "#ffffff"];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.onresize = resize;

function newParticle() {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + 20,
    speed: 0.2 + Math.random() * 0.7,
    size: 18 + Math.random() * 12,
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: 0.4 + Math.random() * 0.4,
    drift: (Math.random() - 0.5) * 0.5
  };
}

// Ambient particle spawn
setInterval(() => {
  if (particles.length < 120) particles.push(newParticle());
}, 80);

// WIN BURST EFFECT
export function winBurstEffect() {
  for (let i = 0; i < 35; i++) {
    const p = newParticle();
    p.x = canvas.width / 2;
    p.y = canvas.height / 2;
    p.speed = 2 + Math.random() * 3;
    p.size = 22 + Math.random() * 20;
    particles.push(p);
  }
}

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    ctx.globalAlpha = p.opacity;
    ctx.font = `${p.size}px serif`;
    ctx.fillStyle = p.color;
    ctx.fillText(p.symbol, p.x, p.y);

    p.y -= p.speed;
    p.x += p.drift;

    if (p.y < -30 || p.opacity <= 0) {
      particles.splice(i, 1);
    }
  });

  requestAnimationFrame(animate);
}
animate();
