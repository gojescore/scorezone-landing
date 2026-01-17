(() => {
  // Opt-out: <body data-season="off">
  const body = document.body;
  if (!body) return;

  const off = (body.getAttribute("data-season") || "").toLowerCase();
  if (off === "off" || off === "0" || off === "false") return;

  // --- Helpers ---
  function dateKey(d) {
    // YYYY-MM-DD (local time)
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function isBetweenInclusive(d, start, end) {
    // Compare by YYYY-MM-DD strings to avoid time-of-day edge cases
    const k = dateKey(d);
    return k >= dateKey(start) && k <= dateKey(end);
  }

  // Anonymous Gregorian algorithm (Meeus/Jones/Butcher style)
  // Returns a Date for Easter Sunday in the given year (local time)
  function easterSunday(year) {
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

  function addDays(d, n) {
    const out = new Date(d);
    out.setDate(out.getDate() + n);
    return out;
  }

  // --- Season rules ---
  const now = new Date();
  const y = now.getFullYear();

  // Priority order matters:
  // Halloween > Xmas > Winter > Easter > Summer > Default
  // (Xmas is explicitly Dec 1–26, Winter is Dec 27–end Feb)

  // Halloween: Oct 25 – Nov 1 (inclusive)
  const halloweenStart = new Date(y, 9, 25);  // Oct (0-based month index 9)
  const halloweenEnd   = new Date(y, 10, 1);  // Nov 1

  // Xmas: Dec 1 – Dec 26 (inclusive)
  const xmasStart = new Date(y, 11, 1);       // Dec 1
  const xmasEnd   = new Date(y, 11, 26);      // Dec 26

  // Winter: Dec 27 – Feb 28/29
  const winterStartThisYear = new Date(y, 11, 27); // Dec 27 this year
  const winterEndThisYear   = new Date(y, 1, 28);  // Feb 28 this year
  // Note: If we're in Jan/Feb, winter started last year
  const winterStartLastYear = new Date(y - 1, 11, 27); // Dec 27 last year
  const winterEndNextYear   = new Date(y + 1, 1, 28);  // Feb 28 next year

  // Easter: Easter Sunday ± 7 days
  const easter = easterSunday(y);
  const easterStart = addDays(easter, -7);
  const easterEnd   = addDays(easter, 7);

  // Summer: Jun 1 – Aug 31
  const summerStart = new Date(y, 5, 1);      // Jun 1
  const summerEnd   = new Date(y, 7, 31);     // Aug 31

  let season = "default";

  if (isBetweenInclusive(now, halloweenStart, halloweenEnd)) {
    season = "halloween";
  } else if (isBetweenInclusive(now, xmasStart, xmasEnd)) {
    season = "xmas";
  } else {
    // Winter can span year boundary, so we handle two cases:
    // - Jan/Feb: winter started last year (Dec 27)
    // - Dec 27–Dec 31: winter started this year
    const inWinterJanFeb = isBetweenInclusive(now, winterStartLastYear, winterEndThisYear);
    const inWinterLateDec = isBetweenInclusive(now, winterStartThisYear, new Date(y, 11, 31));
    if (inWinterJanFeb || inWinterLateDec) {
      season = "winter";
    } else if (isBetweenInclusive(now, easterStart, easterEnd)) {
      season = "easter";
    } else if (isBetweenInclusive(now, summerStart, summerEnd)) {
      season = "summer";
    }
  }

  document.documentElement.dataset.season = season;

  // Optional: expose for debugging in console
  // window.__scorezoneSeason = season;
})();
