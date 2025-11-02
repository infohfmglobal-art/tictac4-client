// runes.js - simple controlled burst on win

export function winBurstEffect(winner) {
  const container = document.body;

  for (let i = 0; i < 18; i++) {
    const el = document.createElement("div");
    el.className = "rune-burst";

    el.textContent = winner === "X" ? "🐉" : "🕊️";

    el.style.left = (50 + Math.random() * 25 - 12) + "%";
    el.style.top = (50 + Math.random() * 10 - 5) + "%";
    el.style.fontSize = (26 + Math.random() * 16) + "px";

    container.appendChild(el);

    setTimeout(() => el.remove(), 700);
  }
}
export { triggerRuneBurst };
