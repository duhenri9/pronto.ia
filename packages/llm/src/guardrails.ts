// ============================================
// PRONTO.IA — Guardrails
// ============================================
// Input/output validation for LLM calls.
// Prevents prompt injection, limits length, checks content.

const MAX_INPUT_LENGTH = 4000;
const MAX_OUTPUT_LENGTH = 2000;
const BLOCKED_PATTERNS = [
  /ignore previous instructions/i,
  /ignore all previous/i,
  /disregard (all )?(previous|above)/i,
  /you are now/i,
  /pretend you are/i,
  /act as if/i,
  /jailbreak/i,
  /system prompt/i,
  /reveal (your|the) (system|prompt|instructions)/i,
];

export interface GuardrailResult {
  allowed: boolean;
  reason?: string;
  sanitized?: string;
}

export function validateInput(text: string): GuardrailResult {
  if (!text || text.trim().length === 0) {
    return { allowed: false, reason: 'Empty input' };
  }

  if (text.length > MAX_INPUT_LENGTH) {
    return {
      allowed: false,
      reason: `Input exceeds maximum length (${text.length} > ${MAX_INPUT_LENGTH})`,
    };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        allowed: false,
        reason: 'Input contains potentially harmful instruction',
      };
    }
  }

  return { allowed: true, sanitized: text.trim() };
}

export function validateOutput(text: string): GuardrailResult {
  if (!text || text.trim().length === 0) {
    return { allowed: false, reason: 'Empty output from LLM' };
  }

  if (text.length > MAX_OUTPUT_LENGTH) {
    // Truncate at last sentence boundary before limit
    const truncated = text.substring(0, MAX_OUTPUT_LENGTH);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastNewline = truncated.lastIndexOf('\n');
    const cutPoint = Math.max(lastPeriod, lastNewline, MAX_OUTPUT_LENGTH - 200);
    return {
      allowed: true,
      sanitized: text.substring(0, cutPoint + 1).trim(),
    };
  }

  return { allowed: true, sanitized: text.trim() };
}

export function sanitizeUserMessage(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/\0/g, '') // Remove null bytes
    .trim()
    .substring(0, MAX_INPUT_LENGTH);
}
