// ============================================
// PRONTO.IA — Analytics + Processed Events
// ============================================

import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// ─── Daily Metric ───

export const dailyMetrics = pgTable(
  'daily_metrics',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    date: timestamp('date', { withTimezone: true }).notNull(),
    vertical: text('vertical'),

    // Engagement
    activeUsers: integer('active_users').default(0).notNull(),
    lessonsCompleted: integer('lessons_completed').default(0).notNull(),
    exercisesPassed: integer('exercises_passed').default(0).notNull(),
    exercisesFailed: integer('exercises_failed').default(0).notNull(),
    dailyCheckins: integer('daily_checkins').default(0).notNull(),

    // Revenue outcomes
    totalRevenueLiftCents: integer('total_revenue_lift_cents').default(0).notNull(),
    avgRevenueLiftPercent: real('avg_revenue_lift_percent').default(0).notNull(),

    // Business
    newEnrollments: integer('new_enrollments').default(0).notNull(),
    newProSubscriptions: integer('new_pro_subscriptions').default(0).notNull(),

    // LLM costs
    llmCostCents: integer('llm_cost_cents').default(0).notNull(),
    llmCallsCount: integer('llm_calls_count').default(0).notNull(),

    // WhatsApp costs
    whatsappCostCents: integer('whatsapp_cost_cents').default(0).notNull(),
    whatsappMessagesSent: integer('whatsapp_messages_sent').default(0).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_daily_metrics_date_vertical').on(table.date, table.vertical),
    index('idx_daily_metrics_date').on(table.date),
  ],
);

// ─── Processed Events (Webhook Dedup) ───

export const processedEvents = pgTable(
  'processed_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    provider: text('provider').notNull(),
    eventId: text('event_id').notNull(),
    eventType: text('event_type').notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_processed_events_provider_id').on(table.provider, table.eventId),
    index('idx_processed_events_at').on(table.processedAt),
  ],
);
