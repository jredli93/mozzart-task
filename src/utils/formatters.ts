export const safeScore = (score?: number) =>
  typeof score === 'number' ? score : '-';

export const formatMatchTime = (status?: string, iso?: string) => {
  if (!iso) return '';
  if (status && status.toLowerCase().includes('live')) return 'LIVE';
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

export const shortLastUpdated = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `upd ${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};
