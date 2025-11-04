#splash-screen{
  position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:rgba(0,0,0,.55);backdrop-filter:blur(2px);z-index:5;animation:fadeOut .6s 1.2s forwards
}
.splash-logo{width:96px;height:96px;opacity:.95;margin-bottom:8px}
.splash-title{font-size:28px;letter-spacing:2px;color:#ffd86e;text-shadow:0 0 12px gold}
@keyframes fadeOut{to{opacity:0;visibility:hidden}}
