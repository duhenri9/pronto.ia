// ============================================
// PRONTO.IA — PostgreSQL Enums (Drizzle)
// ============================================

import { pgEnum } from 'drizzle-orm/pg-core';

// ─── User ───
export const userRoleEnum = pgEnum('user_role', [
  'ADMIN',
  'STUDENT',
  'COMPANY_ADMIN',
  'COMPANY_USER',
]);

export const verticalEnum = pgEnum('vertical', [
  'SALAO',
  'FOOD_SERVICE',
  'HOME_SERVICE',
  'TECH_SERVICE',
]);

// ─── Trilha ───
export const trilhaLevelEnum = pgEnum('trilha_level', [
  'BASIC',
  'INTERMEDIATE',
  'ADVANCED',
]);

// ─── Enrollment ───
export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'ACTIVE',
  'COMPLETED',
  'PAUSED',
  'CANCELLED',
]);

export const enrollmentSourceEnum = pgEnum('enrollment_source', [
  'ORGANIC',
  'B2G_CONTRACT',
  'B2B_PARTNER',
  'AFFILIATE',
  'REFERRAL',
]);

// ─── Lesson Progress ───
export const lessonStateEnum = pgEnum('lesson_state', [
  'NOT_STARTED',
  'IN_PROGRESS',
  'EXERCISE_PENDING',
  'EXERCISE_SUBMITTED',
  'EVALUATED',
  'COMPLETED',
  'SKIPPED',
]);

// ─── Payment ───
export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
]);

export const paymentTypeEnum = pgEnum('payment_type', [
  'B2C_PRO_MONTHLY',
  'B2G_CONTRACT',
  'B2B_CONTRACT',
]);

export const paymentProviderEnum = pgEnum('payment_provider', [
  'STRIPE',
  'ABACATE',
  'PIX',
  'BANK_TRANSFER',
]);

// ─── Partner ───
export const partnerTypeEnum = pgEnum('partner_type', [
  'GOVERNMENT_STATE',
  'GOVERNMENT_MUNICIPAL',
  'SEBRAE',
  'SENAC',
  'SENAI',
  'SINDICATE',
  'ASSOCIATION',
  'ENTERPRISE',
]);

// ─── WhatsApp ───
export const messageDirectionEnum = pgEnum('message_direction', [
  'inbound',
  'outbound',
]);

export const messageTypeEnum = pgEnum('message_type', [
  'text',
  'audio',
  'image',
  'document',
  'template',
  'interactive',
]);

export const messageStatusEnum = pgEnum('message_status', [
  'pending',
  'sent',
  'delivered',
  'read',
  'failed',
]);

// ─── User Memory ───
export const memoryTypeEnum = pgEnum('memory_type', [
  'preference',
  'context',
  'conversation_summary',
  'business_info',
  'onboarding_data',
]);

// ─── Scheduled Message ───
export const scheduledMessageStatusEnum = pgEnum('scheduled_message_status', [
  'pending',
  'processing',
  'sent',
  'failed',
  'cancelled',
]);
