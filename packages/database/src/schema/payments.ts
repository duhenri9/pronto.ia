// ============================================
// PRONTO.IA — Payments
// ============================================

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { paymentStatusEnum, paymentTypeEnum, paymentProviderEnum } from './enums';
import { users } from './users';

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id),
    amountCents: integer('amount_cents').notNull(),
    status: paymentStatusEnum('status').default('PENDING').notNull(),
    type: paymentTypeEnum('type').notNull(),
    provider: paymentProviderEnum('provider').default('STRIPE').notNull(),
    providerId: text('provider_id'),
    metadata: jsonb('metadata'),

    // Subscription
    isSubscription: boolean('is_subscription').default(false).notNull(),
    planType: text('plan_type'), // pro_monthly, pro_annual
    paidAt: timestamp('paid_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_payments_user').on(table.userId),
    index('idx_payments_status').on(table.status),
    index('idx_payments_provider_id').on(table.provider, table.providerId),
  ],
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));
