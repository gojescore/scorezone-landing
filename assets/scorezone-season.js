/* scorezone-season.js
   Shared seasonal behavior for ScoreZone
   - Auto season detection by date (Europe/Copenhagen assumed via browser locale)
   - Opt-out: <body data-season="off">
   - Optional force: <body data-season="winter|spring|summer|autumn|xmas">
   - Snow only in winter/xmas, non-interactive, lightweight
*/
(() => {
  const body = document.body;
  if (!body) return;

  // Opt-out
  if ((body.dataset.season || "").toLowerCase() === "off") return;

  const now = new Date();
  const month = now.getMonth() + 1; // 1-12

  // If user forced a season in HTML, respect it
  const forced = (body.dataset.season || "").trim().toLowerCase();
  let season = forced || "";

  // Auto-detect if not forced
  if (!season){
    if (month === 12) season = "xmas";
    else if (month === 1 || month === 2) season = "winter";
    else if (month >= 3 && month <= 5) season = "spring";
    else if (month >= 6 && month <= 8) season = "summer";
    else season = "autumn";
    body.dataset.season = season;
  }

  // Snow only for winter/xmas
  const wantsSnow = (season === "winter" || season === "xmas");

  // Respect reduced motion
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!wantsSnow || reduceMotion) return;

  // Create snow container
  const snow = document.createElement("div");
  snow.id = "sz-snow";
  body.appendChild(snow);
  body.classList.add("sz-has-snow");

  // Configuration: intentionally subtle
  const FLAKES = 42;            // light load
  const MAX_SIZE = 9;           // px
  const MIN_SIZE = 3;           // px
  const MIN_DUR = 10;           // seconds
  const MAX_DUR = 18;           // seconds

  // Create flakes
  for (let i = 0; i < FLAKES; i++){
    const flake = document.createElement("div");
    flake.className = "sz-flake";

    // Randomize per flake
    const size = rand(MIN_SIZE, MAX_SIZE);
    const x = rand(0, window.innerWidth);
    const dx = rand(-30, 30);

    const dur = rand(MIN_DUR, MAX_DUR);
    const driftDur = rand(3, 6);

    const op = rand(0.45, 0.98);

    // Stagger start so it's already falling
    const delay = rand(-MAX_DUR, 0);

    flake.style.setProperty("--sz", `${size}px`);
    flake.style.setProperty("--x", `${x}px`);
    flake.style.setProperty("--dx", `${dx}px`);
    flake.style.setProperty("--dur", `${dur}s`);
    flake.style.setProperty("--driftDur", `${driftDur}s`);
    flake.style.setProperty("--op", `${op}`);

    flake.style.animationDelay = `${delay}s, ${rand(-6, 0)}s`;

    snow.appendChild(flake);
  }

  // Keep snow width aligned if the user resizes the window
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Re-randomize X positions only (fast)
      const w = window.innerWidth;
      snow.querySelectorAll(".sz-flake").forEach(flake => {
        flake.style.setProperty("--x", `${rand(0, w)}px`);
      });
    }, 150);
  });

  function rand(min, max){
    return Math.random() * (max - min) + min;
  }
})();
