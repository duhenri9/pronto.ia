// ============================================
// PRONTO.IA — Worker: Scheduled Message Processor
// ============================================
// Processes timed messages: daily check-ins,
// re-engagement prompts, lesson reminders.
// Also handles retry logic for failed scheduled messages.

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import * as Sentry from '@sentry/node';
import { recordFailure } from './failure-tracker';
import { db, eq, and, lte, scheduledMessages, whatsappSessions } from '@pronto-ia/database';
import { createWhatsAppProvider } from '@pronto-ia/whatsapp';
import type { SendMessageResult } from '@pronto-ia/whatsapp';

import type { ScheduledJobData } from '../queues';

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

const whatsapp = createWhatsAppProvider();

export const scheduledWorker = new Worker<ScheduledJobData>(
  'whatsapp.scheduled',
  async (job: Job<ScheduledJobData>) => {
    const {
      userId,
      phone,
      messageType,
      content,
      buttons,
    } = job.data;

    console.log(`[SCHEDULED] Sending scheduled message to ${phone}: "${content?.substring(0, 50)}..."`);

    // ---- Step 1: Send via WhatsApp provider ----

    let sendResult: SendMessageResult;

    if (messageType === 'interactive' && buttons && buttons.length > 0) {
      sendResult = await whatsapp.sendInteractive({
        to: phone,
        body: content,
        buttons,
      });
    } else {
      sendResult = await whatsapp.sendMessage({
        to: phone,
        text: content,
      });
    }

    if (sendResult.status === 'failed') {
      console.error(`[SCHEDULED] Failed to send to ${phone}: ${sendResult.error}`);
      throw new Error(`Scheduled message send failed: ${sendResult.error}`);
    }

    // ---- Step 2: Mark scheduled message as sent in DB ----

    // Find the pending scheduled message for this user that's due
    const pending = await db
      .select()
      .from(scheduledMessages)
      .where(
        and(
          eq(scheduledMessages.userId, userId),
          eq(scheduledMessages.status, 'pending'),
        ),
      )
      .limit(1);

    if (pending.length > 0) {
      await db
        .update(scheduledMessages)
        .set({
          status: 'sent',
          sentAt: new Date(),
          attempts: pending[0].attempts + 1,
        })
        .where(eq(scheduledMessages.id, pending[0].id));
    }

    // ---- Step 3: Update session window ----

    await db
      .update(whatsappSessions)
      .set({
        isInSessionWindow: true,
        sessionWindowStart: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(whatsappSessions.userId, userId));

    console.log(`[SCHEDULED] Delivered to ${phone}`);
  },
  { connection, concurrency: 3 },
);

// ---- Events ----

scheduledWorker.on('failed', (job, err) => {
  console.error(`[SCHEDULED] Job ${job?.id} failed:`, err.message);
  Sentry.captureException(err, {
    extra: { jobId: job?.id, jobData: job?.data },
  });
  recordFailure('whatsapp.scheduled', job?.id, err.message);

  // Increment attempts on the scheduled message record
  if (job?.data) {
    markScheduledAttemptFailed(job.data.userId, err.message).catch(() => {});
  }
});

scheduledWorker.on('completed', (job) => {
  console.log(`[SCHEDULED] Job ${job.id} completed`);
});

export async function closeScheduledWorker(): Promise<void> {
  await scheduledWorker.close();
}

// ---- Helpers ----

async function markScheduledAttemptFailed(userId: string, errorMessage: string): Promise<void> {
  const pending = await db
    .select()
    .from(scheduledMessages)
    .where(
      and(
        eq(scheduledMessages.userId, userId),
        eq(scheduledMessages.status, 'pending'),
      ),
    )
    .limit(1);

  if (pending.length > 0) {
    const current = pending[0];

    if (current.attempts + 1 >= current.maxAttempts) {
      // Max attempts reached — mark as permanently failed
      await db
        .update(scheduledMessages)
        .set({
          status: 'failed',
          attempts: current.maxAttempts,
          lastError: errorMessage,
        })
        .where(eq(scheduledMessages.id, current.id));
    } else {
      // Still has retries — increment attempts
      await db
        .update(scheduledMessages)
        .set({
          attempts: current.attempts + 1,
          lastError: errorMessage,
        })
        .where(eq(scheduledMessages.id, current.id));
    }
  }
}