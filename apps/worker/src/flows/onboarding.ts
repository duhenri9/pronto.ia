// ============================================
// PRONTO.IA — Onboarding Flow (1.1)
// ============================================
// Handles name extraction with fallback,
// vertical detection, and preference collection.

import { db, eq, users } from '@pronto-ia/database';
import { outboundQueue } from '../queues';
import type { OutboundJobData } from '../queues';
import { TEMPLATE } from './templates';

// ---- Name Extraction (Gap 1 fix) ----

// Phrases that indicate the user didn't give a real name
const VAGUE_RESPONSES = /^(sei\s+lá|não\s+sei|qualquer\s+uma|tanto\s+faz|você\s+sabe|não\s+importa|bbb|aaa|teste)$/i;

// Words that are likely sarcastic/joke names but usable as fallback
const UNLIKELY_BUT_USABLE = /^(rainha|rei|deus|princesa|príncipe|chefona|chefão|brother|mano)$/i;

/**
 * Extracts a display name from the user's response.
 * Returns { name, confidence } where confidence is 0-1.
 *
 * Rules (per spec Gap 1):
 * - If confidence < 0.8, Maria asks again with reinforcement (OB_12).
 * - After 2 failed attempts, use first word as fallback.
 */
export function extractName(message: string): { name: string | null; confidence: number } {
  const trimmed = message.trim();

  // Empty or too short
  if (!trimmed || trimmed.length < 2) {
    return { name: null, confidence: 0 };
  }

  // Vague response — clearly not a name
  if (VAGUE_RESPONSES.test(trimmed)) {
    return { name: null, confidence: 0.1 };
  }

  // Very long response (likely a sentence, not a name)
  const words = trimmed.split(/\s+/);
  if (words.length > 4) {
    // Take the first capitalized word if any, else first word
    const firstCap = words.find(w => /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]/.test(w));
    if (firstCap) {
      return { name: firstCap, confidence: 0.5 };
    }
    return { name: words[0], confidence: 0.3 };
  }

  // Single word that looks like a name
  if (words.length === 1) {
    const word = words[0];

    // All lowercase or numbers — probably not a name
    if (/^[a-z]+$/.test(word) && word.length < 3) {
      return { name: null, confidence: 0.2 };
    }

    // Unlikely but usable (sarcastic names)
    if (UNLIKELY_BUT_USABLE.test(word)) {
      return { name: word, confidence: 0.6 };
    }

    // Normal name pattern — starts with capital or has accents
    if (/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]/.test(word)) {
      return { name: word, confidence: 0.95 };
    }

    // Lowercase but reasonable length — could be a nickname
    if (word.length >= 2 && word.length <= 20) {
      return { name: word, confidence: 0.7 };
    }

    return { name: null, confidence: 0.2 };
  }

  // 2-4 words — likely a full name, use first word
  const firstName = words[0];
  if (/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]/.test(firstName)) {
    return { name: firstName, confidence: 0.9 };
  }

  // Lowercase first word but reasonable
  return { name: firstName, confidence: 0.65 };
}

// ---- Onboarding Step Handler ----

const MAX_NAME_ATTEMPTS = 2;

/**
 * Handles the name extraction step of onboarding.
 * Returns true if name was set, false if we need another attempt.
 */
export async function handleOnboardingName(
  userId: string,
  message: string,
  attemptCount: number = 0,
): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return false;

  const { name, confidence } = extractName(message);

  // Confidence >= 0.8 — accept the name
  if (name && confidence >= 0.8) {
    await db.update(users).set({
      displayName: name,
      onboardingStep: 3, // move to "what do you do"
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    await outboundQueue.add('onboarding_name_accepted', {
      userId,
      phone: user.phone,
      messageText: TEMPLATE.OB_05(name),
      messageType: 'text',
      persona: 'maria',
      sessionId: '',
    } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

    return true;
  }

  // Below threshold — ask again with reinforcement
  if (attemptCount < MAX_NAME_ATTEMPTS - 1) {
    await outboundQueue.add('onboarding_name_retry', {
      userId,
      phone: user.phone,
      messageText: TEMPLATE.OB_12,
      messageType: 'text',
      persona: 'maria',
      sessionId: '',
    } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

    await db.update(users).set({
      onboardingStep: 2, // stay on name step
      onboardingData: { ...((user.onboardingData as Record<string, unknown>) ?? {}), name_attempts: attemptCount + 1 },
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    return false;
  }

  // After 2 failed attempts — use first word as fallback (avoid blocking onboarding)
  const fallbackName = name ?? message.trim().split(/\s+/)[0] ?? 'amiga';

  await db.update(users).set({
    displayName: fallbackName,
    onboardingStep: 3,
    onboardingData: { ...((user.onboardingData as Record<string, unknown>) ?? {}), name_fallback: true },
    updatedAt: new Date(),
  }).where(eq(users.id, userId));

  await outboundQueue.add('onboarding_name_fallback', {
    userId,
    phone: user.phone,
    messageText: TEMPLATE.OB_13(fallbackName),
    messageType: 'text',
    persona: 'maria',
    sessionId: '',
  } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

  return true;
}
