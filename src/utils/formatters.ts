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

const GENERIC_LIVE_WINDOW_MIN = 150; 
const GENERIC_DISPLAY_CAP_MIN = 150; 
function isBasketball(sport?: string) {
  return (sport || '').toLowerCase().includes('basket');
}
function isNBA(league?: string) {
  return (league || '').toLowerCase().includes('nba');
}

function liveWindowMinutes(sport?: string, league?: string): number {
  if (isBasketball(sport)) {
    const breaks = 19;
    const basePlay = isNBA(league) ? 48 : 40;
    const baseline = basePlay + breaks; 
    const buffer = 60; 
    return baseline + buffer;
  }
  return GENERIC_LIVE_WINDOW_MIN;
}

function displayCapMinutes(sport?: string, league?: string): number {
  if (isBasketball(sport)) return liveWindowMinutes(sport, league);
  return GENERIC_DISPLAY_CAP_MIN;
}

export const statusLabel = (
  status?: string,
  iso?: string,
  sport?: string,
  league?: string
) => {
  const t = parseIso(iso);
  const now = Date.now();

  if (!Number.isNaN(t)) {
    if (t > now) return 'UPCOMING';
    const elapsed = Math.floor((now - t) / 60000);
    if (elapsed >= 0 && elapsed <= liveWindowMinutes(sport, league))
      return 'LIVE';
    return 'FINISHED';
  }

  if (isLiveStatus(status)) return 'LIVE';
  if (isFinishedStatus(status)) return 'FINISHED';
  return 'UPCOMING';
};

export const formatBottomLeft = (
  status?: string,
  iso?: string,
  sport?: string,
  league?: string
) => {
  const t = parseIso(iso);
  const now = Date.now();

  if (!Number.isNaN(t)) {
    if (t > now) return formatDateTime(new Date(t));
    const elapsed = Math.floor((now - t) / 60000);
    if (elapsed >= 0 && elapsed <= liveWindowMinutes(sport, league)) {
      return `${Math.min(elapsed, displayCapMinutes(sport, league))}’`;
    }
    return '-';
  }

  if (isLiveStatus(status)) return 'LIVE';
  if (isFinishedStatus(status)) return '-';
  return '';
};

export const safeScore = (score?: number) =>
  typeof score === 'number' ? score : '-';
