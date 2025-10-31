const pad2 = (n: number) => n.toString().padStart(2, '0');

const formatDateTime = (d: Date) =>
  `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;

const parseIso = (iso?: string) => {
  if (!iso || typeof iso !== 'string') return NaN;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? NaN : t;
};

const isLiveStatus = (s?: string) => (s || '').toLowerCase().includes('live');
const isFinishedStatus = (s?: string) =>
  /\b(ft|finished|final|ended|full)\b/i.test(s || '');

// ---------- Generic defaults (non-basketball) ----------
const GENERIC_LIVE_WINDOW_MIN = 150; // time-driven "live" window
const GENERIC_DISPLAY_CAP_MIN = 150; // cap minutes shown
// -------------------------------------------------------

function isBasketball(sport?: string) {
  return (sport || '').toLowerCase().includes('basket');
}
function isNBA(league?: string) {
  return (league || '').toLowerCase().includes('nba');
}

/** Live window in minutes, considering basketball specifics */
function liveWindowMinutes(sport?: string, league?: string): number {
  if (isBasketball(sport)) {
    // breaks: 2 mins (Q1-Q2) + 15 mins halftime + 2 mins (Q3-Q4) = 19
    const breaks = 19;
    const basePlay = isNBA(league) ? 48 : 40; // 12-min quarters vs 10-min
    const baseline = basePlay + breaks; // 67 (NBA) or 59 (others)
    const buffer = 60; // timeouts/reviews/OTs
    return baseline + buffer; // 127 (NBA) or 119 (others)
  }
  return GENERIC_LIVE_WINDOW_MIN;
}

/** Cap the displayed elapsed minutes to a reasonable upper bound */
function displayCapMinutes(sport?: string, league?: string): number {
  if (isBasketball(sport)) return liveWindowMinutes(sport, league);
  return GENERIC_DISPLAY_CAP_MIN;
}

/** Right label: time-driven with basketball awareness */
export const statusLabel = (
  status?: string,
  iso?: string,
  sport?: string,
  league?: string
) => {
  const t = parseIso(iso);
  const now = Date.now();

  if (!Number.isNaN(t)) {
    if (t > now) return 'UPCOMING'; // future always wins over 'live'
    const elapsed = Math.floor((now - t) / 60000);
    if (elapsed >= 0 && elapsed <= liveWindowMinutes(sport, league))
      return 'LIVE';
    return 'FINISHED';
  }

  // Fallback if time is invalid/missing
  if (isLiveStatus(status)) return 'LIVE';
  if (isFinishedStatus(status)) return 'FINISHED';
  return 'UPCOMING';
};

/** Left label: upcoming date/time, live elapsed minutes, or "-" for finished */
export const formatBottomLeft = (
  status?: string,
  iso?: string,
  sport?: string,
  league?: string
) => {
  const t = parseIso(iso);
  const now = Date.now();

  if (!Number.isNaN(t)) {
    if (t > now) return formatDateTime(new Date(t)); // UPCOMING
    const elapsed = Math.floor((now - t) / 60000);
    if (elapsed >= 0 && elapsed <= liveWindowMinutes(sport, league)) {
      return `${Math.min(elapsed, displayCapMinutes(sport, league))}’`;
    }
    return '-'; // FINISHED
  }

  // invalid time fallback
  if (isLiveStatus(status)) return 'LIVE';
  if (isFinishedStatus(status)) return '-';
  return '';
};

/** Optional helper */
export const safeScore = (score?: number) =>
  typeof score === 'number' ? score : '-';
