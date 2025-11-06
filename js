{
  "name": "tictac4-client",
  "version": "1.0.0",
  "scripts": {
    "build": "mkdir -p dist && cp -r * dist && rm -rf dist/server.js dist/package.json dist/*.md dist/.git dist/node_modules dist/.gitignore",
    "start": "echo 'Static site - nothing to start'"
  }
}
document.getElementById("googleLoginBtn").addEventListener("click", loginGoogle);
document.getElementById("guestLoginBtn").addEventListener("click", () => {
  alert("Guest mode: coins not saved!");
  window.currentCoins = 100;
  document.getElementById("playerCoins").textContent = `💰 ${window.currentCoins}`;
});
function renderMove(cell, mark, skin) {
    if (skin === "Classic X / O") {
        if (mark === "X") cell.style.color = "#00ffff";
        else if (mark === "O") cell.style.color = "#ff66cc";
    } else if (skin === "Runes") {
        // your rune emoji logic
    }
    cell.textContent = mark;
}
