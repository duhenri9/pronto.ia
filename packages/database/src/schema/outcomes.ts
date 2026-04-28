// ============================================
// PRONTO.IA — Outcome Reports
// ============================================

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  real,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { users } from './users';

export const outcomeReports = pgTable(
  'outcome_reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    enrollmentId: uuid('enrollment_id').notNull(),

    // Survey period
    periodDays: integer('period_days').notNull(), // 30, 60, 90

    // Revenue
    revenueBeforeCents: integer('revenue_before_cents').notNull(),
    revenueAfterCents: integer('revenue_after_cents').notNull(),
    revenueLiftCents: integer('revenue_lift_cents').notNull(),
    revenueLiftPercent: real('revenue_lift_percent').notNull(),

    // Qualitative
    topTakeaway: text('top_takeaway'),
    wouldRecommend: boolean('would_recommend').default(true).notNull(),
    testimonialText: text('testimonial_text'),

    reportedAt: timestamp('reported_at', { withTimezone: true }).defaultNow().notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_outcomes_user_enrollment_period').on(
      table.userId,
      table.enrollmentId,
      table.periodDays,
    ),
    index('idx_outcomes_enrollment').on(table.enrollmentId),
    index('idx_outcomes_reported').on(table.reportedAt),
  ],
);

export const outcomeReportsRelations = relations(outcomeReports, ({ one }) => ({
  user: one(users, {
    fields: [outcomeReports.userId],
    references: [users.id],
  }),
}));
