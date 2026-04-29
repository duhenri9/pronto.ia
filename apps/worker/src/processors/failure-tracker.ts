// ============================================
// PRONTO.IA — Failure Rate Tracker
// ============================================
// Tracks failed jobs per queue and alerts when
// the failure rate exceeds 10 failures/hour.

import * as Sentry from '@sentry/node';

const FAILURE_WINDOWS = new Map<string, number[]>();
const ALERT_THRESHOLD = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Record a failure for the given queue name.
 * If failures in the last hour exceed ALERT_THRESHOLD,
 * logs a structured alert and sends to Sentry.
 */
export function recordFailure(queueName: string, jobId?: string, error?: string): void {
  const now = Date.now();
  const window = FAILURE_WINDOWS.get(queueName) ?? [];

  // Prune entries older than 1 hour
  const recent = window.filter((ts) => now - ts < WINDOW_MS);
  recent.push(now);
  FAILURE_WINDOWS.set(queueName, recent);

  if (recent.length >= ALERT_THRESHOLD) {
    const message = `[ALERT] ${queueName}: ${recent.length} failures in the last hour (threshold: ${ALERT_THRESHOLD})`;
    console.error(message);

    Sentry.captureMessage(message, {
      level: 'warning',
      extra: {
        queue: queueName,
        failuresInWindow: recent.length,
        threshold: ALERT_THRESHOLD,
        jobId,
        error,
      },
    });

    // Reset window to avoid alert spam
    FAILURE_WINDOWS.set(queueName, []);
  }
}
