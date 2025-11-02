// Rune Burst Effects (only on win)

const canvas = document.getElementById("runeParticles");
const ctx = canvas.getContext("2d");

let particles = [];
const symbols = ["🐉", "🕊️", "⭐"];
const colors = ["#ff00ff", "#00eaff", "#ffd54f", "#ffffff"];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createParticle(x, y, type) {
  return {
    x,
    y,
    size: 18 + Math.random() * 20,
    speedX: (Math.random() - 0.5) * 4,
    speedY: -Math.random() * 4 - 2,
    opacity: 1,
    symbol: type
  };
}

export function triggerRuneBurst(winnerSymbol) {
  let centerX = window.innerWidth / 2;
  let centerY = window.innerHeight / 2;

  for (let i = 0; i < 40; i++) {
    particles.push(createParticle(centerX, centerY, winnerSymbol === "X" ? "🐉" : "🕊️"));
    if (i % 5 === 0) particles.push(createParticle(centerX, centerY, "⭐"));
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles = particles.filter(p => p.opacity > 0);

  particles.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.opacity -= 0.015;

    ctx.globalAlpha = Math.max(p.opacity, 0);
    ctx.font = `${p.size}px Segoe UI Emoji`;
    ctx.fillText(p.symbol, p.x, p.y);
  });

  requestAnimationFrame(animate);
}
animate();
