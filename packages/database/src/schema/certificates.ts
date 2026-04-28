// ============================================
// PRONTO.IA — Certificates
// ============================================

import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { users } from './users';
import { trilhas } from './trilhas';

export const certificates = pgTable(
  'certificates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    enrollmentId: uuid('enrollment_id').unique().notNull(),
    trilhaId: uuid('trilha_id')
      .notNull()
      .references(() => trilhas.id, { onDelete: 'cascade' }),

    // Certificate content
    verificationCode: text('verification_code').unique().notNull(),
    recipientName: text('recipient_name').notNull(),
    trilhaTitle: text('trilha_title').notNull(),

    // Outcome — "Ana ganhou +R$1.240 em 60 dias"
    revenueBeforeCents: integer('revenue_before_cents'),
    revenueAfterCents: integer('revenue_after_cents'),
    revenueLiftCents: integer('revenue_lift_cents'),
    revenueLiftPercent: integer('revenue_lift_percent'),
    outcomeHeadline: text('outcome_headline'),

    // PDF
    pdfUrl: text('pdf_url'),

    issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_certificates_code').on(table.verificationCode),
    index('idx_certificates_user').on(table.userId),
  ],
);

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
}));
