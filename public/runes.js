export function triggerRuneBurst(winner) {
  const container = document.body;

  for (let i = 0; i < 25; i++) { // controlled particles
    const el = document.createElement("div");
    el.className = "rune-burst";

    el.textContent = winner === "X" ? "🐉" : "🕊️";

    el.style.left = (50 + (Math.random() * 30 - 15)) + "%";
    el.style.top  = (50 + (Math.random() * 10 - 5)) + "%";
    el.style.fontSize = (24 + Math.random() * 20) + "px";

    container.appendChild(el);

    setTimeout(() => el.remove(), 900); // clean after animation
  }
}
