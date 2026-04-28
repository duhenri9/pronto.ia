// ============================================
// PRONTO.IA — BullMQ Queue Definitions
// ============================================
// Defines the three queues that power Pronto.IA:
// 1. inbound:  WhatsApp messages received → process with LLM
// 2. outbound: Formatted responses → send via WhatsApp provider
// 3. scheduled: Timed messages (daily check-ins, re-engagement)

import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Shared Redis connection for BullMQ
const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null, // BullMQ requirement
});

export const inboundQueue = new Queue('whatsapp.inbound', { connection });
export const outboundQueue = new Queue('whatsapp.outbound', { connection });
export const scheduledQueue = new Queue('whatsapp.scheduled', { connection });

// ---- Job Data Types ----

export interface InboundJobData {
  phone: string;
  messageText: string;
  messageId: string;
  messageType: 'text' | 'audio' | 'image' | 'document';
  profileName?: string;
  waId?: string;
  timestamp: string;
}

export interface OutboundJobData {
  userId: string;
  phone: string;
  messageText: string;
  messageType: 'text' | 'interactive';
  persona: string;
  sessionId: string;
  lessonId?: string;
  llmCallId?: string;
  buttons?: Array<{ id: string; title: string }>;
}

export interface ScheduledJobData {
  userId: string;
  phone: string;
  messageType: 'text' | 'interactive';
  content: string;
  scheduledFor: string;
  enrollmentId?: string;
  lessonId?: string;
  buttons?: Array<{ id: string; title: string }>;
}

// ---- Helper: close connections ----

export async function closeQueues(): Promise<void> {
  await inboundQueue.close();
  await outboundQueue.close();
  await scheduledQueue.close();
  connection.disconnect();
}