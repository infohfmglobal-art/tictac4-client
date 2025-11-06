// optional: make home screen buttons call the same login functions
const glHome = document.getElementById("googleLoginBtnHome");
const gsHome = document.getElementById("guestLoginBtnHome");
if (glHome) glHome.addEventListener("click", () =>
  document.getElementById("googleLoginBtn").click()
);
if (gsHome) gsHome.addEventListener("click", () =>
  document.getElementById("guestLoginBtn").click()
);

// keep coins in sync on home:
const coinsHome = document.getElementById("playerCoinsHome");
const coinsTop = document.getElementById("playerCoins");
const syncCoins = () => {
  const v = `💰 ${window.currentCoins || 0}`;
  if (coinsHome) coinsHome.textContent = v;
  if (coinsTop) coinsTop.textContent = v;
};
// call syncCoins() whenever you change coins
