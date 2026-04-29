// ============================================
// PRONTO.IA — Users Table + Relations
// ============================================

import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { userRoleEnum, verticalEnum, lifecycleStateEnum } from './enums';
import {
  enrollments,
  lessonProgress,
  certificates,
  dailyCheckins,
  payments,
  subscriptions,
  outcomeReports,
  auditLogs,
  whatsappSessions,
} from './index';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Identity — phone is primary
    email: text('email').unique(),
    phone: text('phone').unique().notNull(),
    name: text('name').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').default('STUDENT').notNull(),
    avatarUrl: text('avatar_url'),

    // Vertical
    vertical: verticalEnum('vertical'),

    // Business info for MEIs
    businessName: text('business_name'),
    businessType: text('business_type'),
    businessContext: jsonb('business_context'),
    city: text('city'),
    state: text('state'),

    // Display name (WhatsApp profile name or user-chosen)
    displayName: text('display_name'),

    // Preferences
    preferredTime: text('preferred_time'), // "manhã", "tarde", "noite"
    preferredContactWindow: text('preferred_contact_window'), // e.g. "09:00-18:00"

    // Opt-ins
    dailyLessonOptIn: boolean('daily_lesson_opt_in').default(false).notNull(),
    reengagementOptIn: boolean('reengagement_opt_in').default(false).notNull(),

    // Onboarding
    onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true }),
    onboardingStep: integer('onboarding_step'),
    onboardingData: jsonb('onboarding_data').default({}).notNull(),

    // Pro subscription
    isPro: boolean('is_pro').default(false).notNull(),
    proExpiresAt: timestamp('pro_expires_at', { withTimezone: true }),
    proOfferedAt: timestamp('pro_offered_at', { withTimezone: true }),
    proOfferBlockedUntil: timestamp('pro_offer_blocked_until', { withTimezone: true }),
    stripeCustomerId: text('stripe_customer_id'),

    // Lifecycle
    lifecycleState: lifecycleStateEnum('lifecycle_state').default('provisional').notNull(),
    pendingAction: text('pending_action'), // e.g. "awaiting_lgpd_confirmation", "pro_offer_pending"

    // LGPD compliance
    lgpdConsentAt: timestamp('lgpd_consent_at', { withTimezone: true }),
    lgpdConsentVersion: text('lgpd_consent_version'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }), // soft delete

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_users_phone').on(table.phone),
    index('idx_users_email').on(table.email),
    index('idx_users_vertical').on(table.vertical),
    index('idx_users_is_pro').on(table.isPro),
    index('idx_users_deleted_at').on(table.deletedAt),
    index('idx_users_lifecycle_state').on(table.lifecycleState),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  enrollments: many(enrollments),
  certificates: many(certificates),
  progress: many(lessonProgress),
  dailyCheckins: many(dailyCheckins),
  payments: many(payments),
  subscriptions: many(subscriptions),
  outcomeReports: many(outcomeReports),
  auditLogs: many(auditLogs),
  whatsappSession: one(whatsappSessions, {
    fields: [users.id],
    references: [whatsappSessions.userId],
  }),
}));
