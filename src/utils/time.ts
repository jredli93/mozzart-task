// utils/time.ts

function normalizeStatus(raw: string | undefined): string {
  if (!raw) return '';
  return raw.toLowerCase().trim();
}

export function getMatchElapsedInfo(
  matchTime: string,
  status: string | undefined
): {
  label: string;
  hasStarted: boolean;
} {
  const st = normalizeStatus(status);

  // 1. Explicitly not started yet
  // adjust these keywords if your API uses different wording
  const notStartedWords = [
    'upcoming',
    'scheduled',
    'pregame',
    'not started',
    'ns',
  ];
  if (notStartedWords.some(w => st.includes(w))) {
    return { label: '—', hasStarted: false };
  }

  // 2. Explicitly finished
  const finishedWords = ['finished', 'ended', 'ft', 'full time', 'final'];
  if (finishedWords.some(w => st.includes(w))) {
    return { label: 'FT', hasStarted: false };
  }

  // 3. Everything else: we *think* it's running / in play / live-ish
  // fallback to time math
  const startMs = new Date(matchTime).getTime();
  const nowMs = Date.now();
  const diffMs = nowMs - startMs;

  // if kickoff is in the future, don't pretend it's live
  if (diffMs < 0) {
    return { label: '—', hasStarted: false };
  }

  const mins = Math.floor(diffMs / 60000);

  // if it's been running an absurdly long time ( > 200min ), assume data is junk
  // and don't show 90+', show FT instead
  if (mins > 200) {
    return { label: 'FT', hasStarted: false };
  }

  // normal football logic
  if (mins >= 90) {
    return { label: '90+′', hasStarted: true };
  }

  return { label: `${mins}′`, hasStarted: true };
}
