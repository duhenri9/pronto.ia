// ============================================
// PRONTO.IA — Cancellation + LGPD Flow (1.6)
// ============================================
// Handles voluntary Pro cancellation and
// LGPD right-to-erasure (anonymization).

import { db, eq, users, subscriptions, auditLogs } from '@pronto-ia/database';
import { outboundQueue } from '../queues';
import type { OutboundJobData } from '../queues';
import { TEMPLATE } from './templates';
import { scheduledQueue } from '../queues';

// ---- 1.6A Voluntary Cancellation ----

export async function handleCancellationRequest(userId: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || !user.isPro) return;

  await outboundQueue.add('cancellation_ask', {
    userId,
    phone: user.phone,
    messageText: TEMPLATE.CAN_01,
    messageType: 'text',
    persona: 'maria',
    sessionId: '',
  } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

  await db.update(users).set({
    pendingAction: 'awaiting_cancellation_confirmation',
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
}

export async function handleCancellationConfirmation(
  userId: string,
  message: string,
): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;

  const confirmed = /^(sim|quero|confirmo|isso|exato|com\s+certeza)/i.test(message.trim());

  if (confirmed) {
    await outboundQueue.add('cancellation_ask_reason', {
      userId,
      phone: user.phone,
      messageText: TEMPLATE.CAN_01,
      messageType: 'text',
      persona: 'maria',
      sessionId: '',
    } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

    await db.update(users).set({
      pendingAction: 'awaiting_cancellation_reason',
      updatedAt: new Date(),
    }).where(eq(users.id, userId));
  } else {
    await outboundQueue.add('cancellation_aborted', {
      userId,
      phone: user.phone,
      messageText: TEMPLATE.CAN_04,
      messageType: 'text',
      persona: 'maria',
      sessionId: '',
    } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

    await db.update(users).set({
      pendingAction: null,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));
  }
}

export async function handleCancellationReason(
  userId: string,
  message: string,
): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;

  const isOptOut = /prefiro\s+não|não\s+quero\s+falar/i.test(message.trim());
  const reason = isOptOut ? null : message;

  // Mark subscription as cancelled
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active'),
      ),
    )
    .limit(1);

  if (sub) {
    await db.update(subscriptions).set({
      status: 'canceled',
      canceledAt: new Date(),
      cancellationReason: reason,
    }).where(eq(subscriptions.id, sub.id));
  }

  // IMPORTANT: lifecycle_state stays "active_pro" until subscription period ends
  // Bia remains accessible for the remaining paid period
  await db.update(users).set({
    pendingAction: null,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));

  // Calculate expiry date for the message
  const expiryDate = sub?.currentPeriodEnd
    ? sub.currentPeriodEnd.toLocaleDateString('pt-BR')
    : 'em breve';

  await outboundQueue.add('cancellation_done', {
    userId,
    phone: user.phone,
    messageText: TEMPLATE.CAN_03(expiryDate),
    messageType: 'text',
    persona: 'maria',
    sessionId: '',
  } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });
}

// ---- 1.6B LGPD Right to Erasure ----

export async function handleLgpdDeleteRequest(userId: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;

  await outboundQueue.add('lgpd_confirm_ask', {
    userId,
    phone: user.phone,
    messageText: TEMPLATE.LGPD_01,
    messageType: 'text',
    persona: 'maria',
    sessionId: '',
  } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

  await db.update(users).set({
    pendingAction: 'awaiting_lgpd_confirmation',
    lifecycleState: 'awaiting_lgpd_confirmation',
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
}

export async function handleLgpdConfirmation(
  userId: string,
  message: string,
): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return false;

  const confirmed = /^(sim|quero|confirmo|apagar|excluir|deletar)/i.test(message.trim());

  if (!confirmed) {
    // Aborted
    await outboundQueue.add('lgpd_aborted', {
      userId,
      phone: user.phone,
      messageText: TEMPLATE.LGPD_03,
      messageType: 'text',
      persona: 'maria',
      sessionId: '',
    } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

    await db.update(users).set({
      pendingAction: null,
      lifecycleState: user.isPro ? 'active_pro' : 'active',
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    return false;
  }

  // Send goodbye BEFORE anonymizing (we need the phone to send)
  await outboundQueue.add('lgpd_done', {
    userId,
    phone: user.phone,
    messageText: TEMPLATE.LGPD_02,
    messageType: 'text',
    persona: 'maria',
    sessionId: '',
  } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

  // Enqueue anonymization job (must complete within 24h)
  await scheduledQueue.add('lgpd_anonymize', {
    userId,
    phone: user.phone,
    messageType: 'text',
    content: 'LGPD anonymization job',
    scheduledFor: new Date().toISOString(),
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    jobId: `lgpd-${userId}`,
  });

  return true;
}

// ---- LGPD Anonymization Worker ----

export async function lgpdAnonymizeWorker(userId: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;

  const crypto = require('crypto');
  const hashedPhone = crypto.createHash('sha256').update(user.phone).digest('hex');

  // Anonymize user record
  await db.update(users).set({
    name: '[deleted]',
    displayName: null,
    email: null,
    phone: hashedPhone,
    businessName: null,
    businessType: null,
    businessContext: null,
    onboardingData: {},
    dailyLessonOptIn: false,
    reengagementOptIn: false,
    deletedAt: new Date(),
    lifecycleState: 'cancelled',
    pendingAction: null,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));

  // Audit log
  await db.insert(auditLogs).values({
    action: 'lgpd_anonymize',
    actorId: userId,
    actorType: 'system',
    resourceType: 'user',
    resourceId: userId,
    details: { hashed_phone: hashedPhone },
  });

  console.log(`[LGPD] User ${userId} anonymized. Hashed phone: ${hashedPhone.substring(0, 16)}...`);
}

// Need to import `and` for the cancellation query
import { and } from '@pronto-ia/database';
