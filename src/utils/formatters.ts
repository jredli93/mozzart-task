const pad2 = (n: number) => n.toString().padStart(2, '0');

export const formatBottomLeft = (status?: string, iso?: string) => {
  if (!iso) return '';
  const s = (status ?? '').toLowerCase();

  const matchTime = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - matchTime.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  // --- LIVE: show elapsed minutes since kickoff ---
  if (s.includes('live')) {
    // If the matchTime is in the future (bad data), fallback to LIVE
    if (diffMin < 0) return 'LIVE';
    // Cap absurd durations (e.g. > 300 min)
    if (diffMin > 300) return 'LIVE';
    return `${diffMin}'`;
  }

  // --- UPCOMING: future matches show date/time ---
  if (now.getTime() < matchTime.getTime()) {
    return `${pad2(matchTime.getDate())}.${pad2(
      matchTime.getMonth() + 1
    )}.${matchTime.getFullYear()} ${pad2(matchTime.getHours())}:${pad2(
      matchTime.getMinutes()
    )}`;
  }

  // --- FINISHED: past matches show '-' ---
  return '-';
};

export const statusLabel = (status?: string, iso?: string) => {
  const s = (status ?? '').toLowerCase();

  if (s.includes('live')) return 'LIVE';

  if (iso) {
    const matchTime = new Date(iso);
    const now = new Date();

    if (now.getTime() < matchTime.getTime()) return 'UPCOMING';
    if (now.getTime() > matchTime.getTime()) return 'FINISHED';
  }

  return 'UPCOMING';
};
