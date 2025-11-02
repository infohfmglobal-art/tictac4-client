// Simple, controlled burst on win (no continuous flying)
export function triggerRuneBurst(winner) {
  const container = document.body;
  for (let i = 0; i < 18; i++) {
    const el = document.createElement("div");
    el.className = "rune-burst";
    el.textContent = winner === "X" ? "🐉" : "🕊️";
    el.style.position = "fixed";
    el.style.left = (50 + (Math.random()*25 - 12)) + "%";
    el.style.top = (40 + (Math.random()*10 - 5)) + "%";
    el.style.fontSize = (22 + Math.random()*18) + "px";
    el.style.pointerEvents = "none";
    el.style.transition = "transform .7s ease, opacity .7s ease";
    el.style.opacity = "1";
    container.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translate(${Math.random()*100-50}px, ${- (30 + Math.random()*60)}px) rotate(${Math.random()*90-45}deg)`;
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 800);
  }
}
