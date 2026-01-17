// scorezone-season.js
(() => {
  const body = document.body;
  const root = document.documentElement;

  // Opt-out: <body data-season="off">
  if (body && body.dataset && body.dataset.season === "off") return;

  // Manual override (optional): <body data-season="winter"> etc.
  // If you set any value other than "off", it wins.
  const manual = body?.dataset?.season;
  if (manual && manual !== "off") {
    root.dataset.season = manual;
    return;
  }

  const now = new Date();
  const m = now.getMonth() + 1; // 1-12
  const d = now.getDate();      // 1-31

  function easterSunday(year) {
    // Meeus/Jones/Butcher algorithm (Gregorian calendar)
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function inRange(date, start, end) {
    return date >= start && date <= end;
  }

  // Season rules (simple + predictable)
  // - Xmas: Dec 1–Dec 31
  // - Halloween: Oct 20–Oct 31
  // - Easter: Easter Sunday +/- 10 days (subtle spring theme)
  // - Winter: Jan–Feb (plus early Dec handled by Xmas)
  // - Summer: Jun–Aug
  // Everything else: default
  const year = now.getFullYear();
  const easter = easterSunday(year);
  const easterStart = new Date(easter); easterStart.setDate(easterStart.getDate() - 10);
  const easterEnd   = new Date(easter); easterEnd.setDate(easterEnd.getDate() + 10);

  let season = "default";

  if (m === 12) {
    season = "xmas";
  } else if (m === 10 && d >= 20) {
    season = "halloween";
  } else if (inRange(now, easterStart, easterEnd)) {
    season = "easter";
  } else if (m === 1 || m === 2) {
    season = "winter";
  } else if (m >= 6 && m <= 8) {
    season = "summer";
  }

  root.dataset.season = season;
})();
