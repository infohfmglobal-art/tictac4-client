const canvas = document.getElementById("runeParticles");
const ctx = canvas.getContext("2d");

let particles = [];
const symbols = ["🐉", "🕊️", "✨", "⭐"];
const colors = ["#ff00ff", "#00eaff", "#ffd54f", "#ffffff"];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.onresize = resize;

function newParticle() {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + 10,
    speed: 0.5 + Math.random() * 1,
    size: 20 + Math.random() * 18,
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: 0.5 + Math.random() * 0.5
  };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    ctx.globalAlpha = p.opacity;
    ctx.font = `${p.size}px sans-serif`;
    ctx.fillStyle = p.color;
    ctx.fillText(p.symbol, p.x, p.y);

    p.y -= p.speed;
    if (p.y < -40) particles[i] = newParticle();
  });

  requestAnimationFrame(draw);
}

for (let i = 0; i < 25; i++) particles.push(newParticle());
draw();
