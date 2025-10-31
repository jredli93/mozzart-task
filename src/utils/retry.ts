// src/utils/retry.ts
type RetryOpts = {
  retries?: number; // total attempts (including the first)
  baseDelayMs?: number; // base backoff (2^attempt * baseDelayMs)
  maxDelayMs?: number; // cap for backoff
  timeoutMs?: number; // per-attempt timeout
  // which status codes should *not* be retried
  noRetryStatuses?: number[];
  // optional: called after each failed attempt
  onAttemptError?: (info: {
    attempt: number; // 1-based
    error: unknown;
    delayMs: number;
  }) => void;
};

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    if (signal) {
      const onAbort = () => {
        clearTimeout(id);
        reject(new DOMException('Aborted', 'AbortError'));
      };
      if (signal.aborted) onAbort();
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });

/**
 * Full-jitter exponential backoff (AWS style):
 * delay = random(0, min(maxDelay, baseDelay * 2^attempt))
 */
const computeDelay = (attempt: number, base: number, max: number) => {
  const exp = Math.min(max, base * Math.pow(2, attempt));
  return Math.floor(Math.random() * exp); // full jitter
};

export async function fetchJsonWithRetry<T = unknown>(
  url: string,
  init: RequestInit = {},
  opts: RetryOpts = {}
): Promise<T> {
  const {
    retries = 5,
    baseDelayMs = 400,
    maxDelayMs = 5000,
    timeoutMs = 8000,
    noRetryStatuses = [400, 401, 403, 404, 422],
    onAttemptError,
  } = opts;

  // We’ll do up to `retries` attempts (attempts are 1..retries)
  for (let attempt = 1; attempt <= retries; attempt++) {
    // Per-attempt timeout via AbortController
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...init, signal: ac.signal });

      if (!res.ok) {
        // Don’t retry on known client errors
        if (noRetryStatuses.includes(res.status) || attempt === retries) {
          throw new Error(`HTTP ${res.status}`);
        }
        const delay = computeDelay(attempt, baseDelayMs, maxDelayMs);
        onAttemptError?.({
          attempt,
          error: `HTTP ${res.status}`,
          delayMs: delay,
        });
        await sleep(delay, undefined);
        continue;
      }

      // Try to parse JSON safely
      const text = await res.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        // If non-JSON but 2xx, return as any/string
        return text as unknown as T;
      }
    } catch (err) {
      // AbortError or network error
      if (attempt === retries) throw err;
      const delay = computeDelay(attempt, baseDelayMs, maxDelayMs);
      onAttemptError?.({ attempt, error: err, delayMs: delay });
      await sleep(delay, undefined);
      continue;
    } finally {
      clearTimeout(t);
    }
  }

  // Type-wise unreachable
  throw new Error('fetchJsonWithRetry: exhausted retries');
}
