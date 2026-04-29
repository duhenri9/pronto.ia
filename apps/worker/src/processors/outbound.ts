// ============================================
// PRONTO.IA — Worker: Outbound Message Processor
// ============================================
// Receives a formatted response from the outbound queue,
// sends it via the WhatsApp provider, saves to DB,
// and emits the outbound event.

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import * as Sentry from '@sentry/node';
import { recordFailure } from './failure-tracker';
import { db, eq, whatsappMessages } from '@pronto-ia/database';
import { createWhatsAppProvider } from '@pronto-ia/whatsapp';
import type { SendMessageResult } from '@pronto-ia/whatsapp';
import { eventBus } from '@pronto-ia/events';

import type { OutboundJobData } from '../queues';

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

const whatsapp = createWhatsAppProvider();

export const outboundWorker = new Worker<OutboundJobData>(
  'whatsapp.outbound',
  async (job: Job<OutboundJobData>) => {
    const {
      userId,
      phone,
      messageText,
      messageType,
      persona,
      sessionId,
      lessonId,
      llmCallId,
      buttons,
    } = job.data;

    console.log(`[OUTBOUND] Sending to ${phone}: "${messageText?.substring(0, 50)}..."`);

    // ---- Step 1: Send via WhatsApp provider ----

    let sendResult: SendMessageResult;

    if (messageType === 'interactive' && buttons && buttons.length > 0) {
      sendResult = await whatsapp.sendInteractive({
        to: phone,
        body: messageText,
        buttons,
      });
    } else {
      sendResult = await whatsapp.sendMessage({
        to: phone,
        text: messageText,
      });
    }

    if (sendResult.status === 'failed') {
      console.error(`[OUTBOUND] Failed to send to ${phone}: ${sendResult.error}`);
      // Job will be retried by BullMQ based on attempts config
      throw new Error(`WhatsApp send failed: ${sendResult.error}`);
    }

    // ---- Step 2: Save outbound message to DB ----

    const messageStatus = sendResult.status === 'sent' ? 'sent' : 'failed';

    await db.insert(whatsappMessages).values({
      sessionId,
      userId,
      waMessageId: sendResult.whatsappMessageId ?? sendResult.messageId,
      direction: 'outbound',
      messageType: messageType,
      textContent: messageText,
      personaUsed: persona,
      lessonId,
      llmCallId,
      status: messageStatus,
    });

    // ---- Step 3: Update session window ----

    // After sending, we're within the 24-hour session window
    await db
      .update(whatsappMessages)
      .set({
        deliveredAt: messageStatus === 'sent' ? new Date() : undefined,
      })
      .where(eq(whatsappMessages.sessionId, sessionId));

    // ---- Step 4: Emit event ----

    eventBus.emit({
      type: 'whatsapp.outbound',
      timestamp: new Date(),
      payload: {
        userId,
        phone,
        messageText,
        messageType,
        persona,
        sessionId,
        lessonId,
        llmCallId,
      },
    });

    console.log(`[OUTBOUND] Delivered to ${phone} (messageId: ${sendResult.messageId})`);
  },
  { connection, concurrency: 10 },
);

// ---- Events ----

outboundWorker.on('failed', (job, err) => {
  console.error(`[OUTBOUND] Job ${job?.id} failed:`, err.message);
  Sentry.captureException(err, {
    extra: { jobId: job?.id, jobData: job?.data },
  });
  recordFailure('whatsapp.outbound', job?.id, err.message);
});

outboundWorker.on('completed', (job) => {
  console.log(`[OUTBOUND] Job ${job.id} completed`);
});

export async function closeOutboundWorker(): Promise<void> {
  await outboundWorker.close();
}