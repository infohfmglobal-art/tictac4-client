// splash.js
const splash = document.getElementById("splash-screen");
window.addEventListener("load", ()=> {
  setTimeout(()=> splash?.classList.add("hide"), 700);
});
