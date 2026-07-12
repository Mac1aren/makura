/* ================================================================
   ♡ makura's secret corner ♡
   floating particles + gentle desktop parallax
   vanilla js · no dependencies · transform-only (60fps friendly)
   ================================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------------
     1. floating background pieces
     ---------------------------------------------------------------- */

  var HEARTS   = ["♡", "♥"];
  var STARS    = ["✦", "✧", "⋆", "˖"];
  var SPARKS   = ["･ﾟ", "✩", "°"];
  var KAOMOJI  = [
    "(｡•ᴗ•｡)",
    "૮ ˶ᵔ ᵕ ᵔ˶ ა",
    "(≧◡≦)",
    "( ˶ˆᗜˆ˵ )",
    "૮₍ ˶• ˕ •˶ ₎ა",
    "(づ｡◕‿‿◕｡)づ"
  ];

  var layer = document.getElementById("floaties");

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  function makeFloaty(symbol, className, sizePx, opacity) {
    var el = document.createElement("span");
    el.className = "floaty " + className;
    el.style.left = rand(2, 94) + "vw";
    el.style.fontSize = sizePx + "px";
    el.style.setProperty("--fo", opacity.toFixed(2));

    /* very slow rise: 22–42s, negative delay so the sky is never empty */
    var duration = rand(22, 42);
    el.style.animationDuration = duration + "s";
    el.style.animationDelay = "-" + rand(0, duration).toFixed(1) + "s";

    /* inner span does the gentle side-to-side sway (transform-only) */
    var inner = document.createElement("span");
    inner.className = "floaty-inner";
    inner.textContent = symbol;
    inner.style.setProperty("--sway", rand(14, 42).toFixed(0) + "px");
    inner.style.animationDuration = rand(3.5, 7).toFixed(1) + "s";
    inner.style.animationDelay = "-" + rand(0, 7).toFixed(1) + "s";

    el.appendChild(inner);
    layer.appendChild(el);
  }

  function makeTwinkle() {
    var el = document.createElement("span");
    el.className = "twinkle";
    el.style.left = rand(1, 99) + "vw";
    el.style.top = rand(2, 96) + "vh";
    var s = rand(2, 5).toFixed(1);
    el.style.width = s + "px";
    el.style.height = s + "px";
    el.style.animationDuration = rand(1.8, 4).toFixed(2) + "s";
    el.style.animationDelay = "-" + rand(0, 4).toFixed(2) + "s";
    layer.appendChild(el);
  }

  /* lively but never busy — fewer, bigger pieces on small screens */
  var isSmall = Math.min(window.innerWidth, window.innerHeight) < 480;
  var counts = {
    deep:    isSmall ? 4  : 6,   /* big blurred hearts, far layer   */
    hearts:  isSmall ? 10 : 14,  /* main hearts                     */
    stars:   isSmall ? 8  : 12,
    sparks:  isSmall ? 5  : 8,
    kaomoji: isSmall ? 6  : 9,   /* the cute little faces           */
    twinkle: isSmall ? 12 : 18
  };

  var i;
  for (i = 0; i < counts.deep; i++)    makeFloaty("♡",           "floaty--deep",  rand(46, 84), rand(0.45, 0.7));
  for (i = 0; i < counts.hearts; i++)  makeFloaty(pick(HEARTS),  "floaty--heart", rand(16, 30), rand(0.55, 0.85));
  for (i = 0; i < counts.stars; i++)   makeFloaty(pick(STARS),   "floaty--star",  rand(13, 24), rand(0.5, 0.8));
  for (i = 0; i < counts.sparks; i++)  makeFloaty(pick(SPARKS),  "floaty--spark", rand(10, 16), rand(0.4, 0.65));
  for (i = 0; i < counts.kaomoji; i++) makeFloaty(pick(KAOMOJI), "floaty--kao",   rand(13, 19), rand(0.45, 0.7));
  for (i = 0; i < counts.twinkle; i++) makeTwinkle();

  /* ----------------------------------------------------------------
     2. soft parallax — desktop / fine pointers only
     ---------------------------------------------------------------- */

  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (finePointer && !reducedMotion) {
    var card = document.getElementById("card");
    var targetX = 0, targetY = 0;
    var currentX = 0, currentY = 0;
    var raf = null;

    function tick() {
      /* ease toward the target for a silky feel */
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      card.style.transform =
        "rotateY(" + currentX.toFixed(3) + "deg)" +
        " rotateX(" + (-currentY).toFixed(3) + "deg)";

      layer.style.transform =
        "translate(" + (currentX * -4).toFixed(2) + "px," +
        (currentY * -4).toFixed(2) + "px)";

      if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }

    window.addEventListener("mousemove", function (e) {
      var nx = e.clientX / window.innerWidth  - 0.5;  /* -0.5 … 0.5 */
      var ny = e.clientY / window.innerHeight - 0.5;
      targetX = nx * 5;   /* max ±2.5deg — subtle on purpose */
      targetY = ny * 5;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* ----------------------------------------------------------------
     3. tiny heart burst when the button is pressed
        (plays instantly, never delays navigation)
     ---------------------------------------------------------------- */

  var cta = document.getElementById("cta");

  /* ----------------------------------------------------------------
     3.5 escape from the Instagram / Facebook in-app browser.
     inside the IG webview fans are logged out of everything, so we
     bounce the tap out to the real system browser (Safari / Chrome).
     if the trick is blocked, a fallback opens the link normally.
     ---------------------------------------------------------------- */

  (function () {
    var ua = navigator.userAgent || "";
    var inApp = /Instagram|FBAN|FBAV|FB_IAB|FBIOS/i.test(ua);
    if (!inApp) return;

    var isIOS = /iPhone|iPad|iPod/i.test(ua);
    var isAndroid = /Android/i.test(ua);
    if (!isIOS && !isAndroid) return;

    cta.addEventListener("click", function (e) {
      e.preventDefault();
      var url = cta.href;

      /* fallback: if we're still here after 1.6s, the escape failed —
         open the link the normal way inside the webview */
      var fallback = setTimeout(function () {
        window.location.href = url;
      }, 1600);
      var cancel = function () { clearTimeout(fallback); };
      window.addEventListener("pagehide", cancel, { once: true });
      window.addEventListener("blur", cancel, { once: true });
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) cancel();
      }, { once: true });

      if (isIOS) {
        /* opens Safari from the IG in-app browser */
        window.location.href = "x-safari-" + url;
      } else {
        /* opens the default browser (Chrome) on Android */
        window.location.href =
          "intent://" + url.replace(/^https?:\/\//, "") +
          "#Intent;scheme=https;action=android.intent.action.VIEW;end";
      }
    });
  })();

  cta.addEventListener("pointerdown", function (e) {
    var burst = 6;
    for (var j = 0; j < burst; j++) {
      var h = document.createElement("span");
      h.textContent = "♡";
      h.style.cssText =
        "position:fixed;z-index:99;pointer-events:none;font-size:" + rand(12, 20) + "px;" +
        "color:#ff8fc0;left:" + e.clientX + "px;top:" + e.clientY + "px;" +
        "transition:transform .8s cubic-bezier(.2,.6,.3,1),opacity .8s ease;opacity:1;";
      document.body.appendChild(h);

      /* fling outward on the next frame */
      (function (el) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.style.transform =
              "translate(" + rand(-70, 70) + "px," + rand(-90, -30) + "px) scale(" + rand(0.6, 1.4) + ")";
            el.style.opacity = "0";
          });
        });
        setTimeout(function () { el.remove(); }, 900);
      })(h);
    }
  }, { passive: true });

})();
