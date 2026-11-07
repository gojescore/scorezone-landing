/* ScoreZone shared seasonal behavior.
   November-February: winter (December: Christmas theme).
   Respect body[data-season="off"] and reduced-motion settings.
*/
(() => {
  const body = document.body;
  if (!body) return;
  if ((body.dataset.season || "").toLowerCase() === "off") return;

  const month = new Date().getMonth() + 1;
  const forced = (body.dataset.season || "").trim().toLowerCase();
  let season = forced || "";
  if (!season) {
    if (month === 12) season = "xmas";
    else if (month === 11 || month === 1 || month === 2) season = "winter";
    else if (month >= 3 && month <= 5) season = "spring";
    else if (month >= 6 && month <= 8) season = "summer";
    else season = "autumn";
    body.dataset.season = season;
  }

  const wantsSnow = season === "winter" || season === "xmas";
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!wantsSnow || reduceMotion || document.getElementById("sz-snow")) return;

  const snow = document.createElement("div");
  snow.id = "sz-snow";
  snow.setAttribute("aria-hidden", "true");
  body.appendChild(snow);
  body.classList.add("sz-has-snow");

  const FLAKES = 64;
  const MAX_SIZE = 8;
  const MIN_SIZE = 2.5;
  const MIN_DUR = 11;
  const MAX_DUR = 23;

  for (let i = 0; i < FLAKES; i++) {
    const flake = document.createElement("div");
    flake.className = "sz-flake";
    const size = rand(MIN_SIZE, MAX_SIZE);
    const x = rand(0, window.innerWidth);
    flake.style.setProperty("--sz", `${size}px`);
    flake.style.setProperty("--x", `${x}px`);
    flake.style.setProperty("--dx", `${rand(-40, 40)}px`);
    flake.style.setProperty("--dur", `${rand(MIN_DUR, MAX_DUR)}s`);
    flake.style.setProperty("--driftDur", `${rand(4, 8)}s`);
    flake.style.setProperty("--op", `${rand(0.5, 0.95)}`);
    flake.style.animationDelay = `${rand(-MAX_DUR, 0)}s, ${rand(-8, 0)}s`;
    snow.appendChild(flake);
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = window.innerWidth;
      snow.querySelectorAll(".sz-flake").forEach(flake => {
        flake.style.setProperty("--x", `${rand(0, w)}px`);
      });
    }, 150);
  });

  function rand(min, max) { return Math.random() * (max - min) + min; }
})();
