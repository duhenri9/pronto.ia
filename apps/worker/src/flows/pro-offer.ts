// ============================================
// PRONTO.IA — Pro Offer Flow (1.3)
// ============================================
// Handles eligibility, offer delivery, and
// response classification for Pro plan upsell.

import { db, eq, and, lt, gt, isNull, users, subscriptions } from '@pronto-ia/database';
import { outboundQueue } from '../queues';
import type { OutboundJobData } from '../queues';
import { TEMPLATE } from './templates';

// ---- Eligibility ----

const PRO_OFFER_COOLDOWN_DAYS = 30;
const PRO_OFFER_BLOCK_HOURS = 4;

interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

export async function isEligibleForProOffer(user: typeof users.$inferSelect): Promise<EligibilityResult> {
  // Already Pro
  if (user.isPro) {
    return { eligible: false, reason: 'already_pro' };
  }

  // Onboarding not completed
  if (!user.onboardingCompletedAt) {
    return { eligible: false, reason: 'onboarding_incomplete' };
  }

  // Blocked due to negative event
  if (user.proOfferBlockedUntil && new Date(user.proOfferBlockedUntil) > new Date()) {
    return { eligible: false, reason: 'blocked' };
  }

  // Offered recently (30-day cooldown)
  if (user.proOfferedAt) {
    const daysSinceOffer = (Date.now() - user.proOfferedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceOffer < PRO_OFFER_COOLDOWN_DAYS) {
      return { eligible: false, reason: 'cooldown' };
    }
  }

  // Pending action already set
  if (user.pendingAction && user.pendingAction !== 'awaiting_pro_response') {
    return { eligible: false, reason: 'pending_action' };
  }

  // Deleted account
  if (user.deletedAt) {
    return { eligible: false, reason: 'deleted' };
  }

  return { eligible: true };
}

// ---- Offer Pro ----

export async function offerPro(
  userId: string,
  triggerContext?: string,
): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;

  const eligibility = await isEligibleForProOffer(user);
  if (!eligibility.eligible) return;

  const displayName = user.displayName ?? user.name;

  // Message 1: setup
  await outboundQueue.add('pro_offer_setup', {
    userId: user.id,
    phone: user.phone,
    messageText: TEMPLATE.pro_offer_setup(displayName),
    messageType: 'text',
    persona: 'maria',
    sessionId: '', // filled by outbound processor from session
  } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

  // Message 2: pitch + CTA (1.5s delay — seems human)
  await outboundQueue.add(
    'pro_offer_pitch',
    {
      userId: user.id,
      phone: user.phone,
      messageText: TEMPLATE.pro_offer_pitch,
      messageType: 'text',
      persona: 'maria',
      sessionId: '',
    } as OutboundJobData,
    {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
      delay: 1500, // BullMQ delayed job — 1.5s
    },
  );

  // Update state
  await db
    .update(users)
    .set({
      pendingAction: 'awaiting_pro_response',
      proOfferedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// ---- Response Classification ----

type ProResponseIntent = 'accepted' | 'declined' | 'unclear';

function classifyProResponse(message: string): ProResponseIntent {
  const lower = message.toLowerCase().trim();

  // Accepted patterns
  const acceptedPatterns = [
    /^(sim|quero|bora|pode\s+ser|com\s+certeza|claro|fechou|vamos\s+nisso)[\s!.,]*$/i,
    /quero\s+conhecer/i,
    /quero\s+o\s+pro/i,
    /me\s+mostra/i,
    /assin/i,
    /pagar/i,
    /como\s+funciona/i,
  ];

  for (const pattern of acceptedPatterns) {
    if (pattern.test(lower)) return 'accepted';
  }

  // Declined patterns
  const declinedPatterns = [
    /^(não|nao|depois|agora\s+não|nao\s+agora|talvez\s+depois|obrigad[oa]|não\s+precisa)[\s!.,]*$/i,
    /não\s+(quero|preciso|tenho\s+interesse)/i,
    /sem\s+pressão/i,
    /estou\s+bem\s+assim/i,
  ];

  for (const pattern of declinedPatterns) {
    if (pattern.test(lower)) return 'declined';
  }

  return 'unclear';
}

// ---- Handle Pro Response ----

export async function handleProResponse(
  userId: string,
  message: string,
): Promise<'accepted' | 'declined' | 'unclear'> {
  const intent = classifyProResponse(message);

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return intent;

  let replyText: string;
  let pendingAction: string | null = null;

  switch (intent) {
    case 'accepted':
      replyText = TEMPLATE.pro_accepted_acknowledge;
      pendingAction = 'awaiting_payment';
      break;
    case 'declined':
      replyText = TEMPLATE.pro_declined_graceful;
      pendingAction = null;
      break;
    case 'unclear':
      replyText = TEMPLATE.pro_unclear_ask_again;
      // Keep pending_action as awaiting_pro_response
      pendingAction = 'awaiting_pro_response';
      break;
  }

  await outboundQueue.add('pro_response', {
    userId: user.id,
    phone: user.phone,
    messageText: replyText,
    messageType: 'text',
    persona: 'maria',
    sessionId: '',
  } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

  await db
    .update(users)
    .set({
      pendingAction,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // If accepted, initiate checkout (flow 1.4)
  if (intent === 'accepted') {
    const { initiateCheckout } = await import('./payment');
    await initiateCheckout(userId);
  }

  return intent;
}

// ---- Block Pro Offer ----

export async function blockProOffer(userId: string, hours: number = PRO_OFFER_BLOCK_HOURS): Promise<void> {
  const blockedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);

  await db
    .update(users)
    .set({
      proOfferBlockedUntil: blockedUntil,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
