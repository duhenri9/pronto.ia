// ============================================
// PRONTO.IA — Partners (B2G/B2B)
// ============================================

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

import { partnerTypeEnum, verticalEnum } from './enums';

export const partners = pgTable(
  'partners',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    type: partnerTypeEnum('type').notNull(),
    cnpj: text('cnpj').unique(),
    contactName: text('contact_name'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),

    // Contract
    contractValueCents: integer('contract_value_cents'),
    contractStart: timestamp('contract_start', { withTimezone: true }),
    contractEnd: timestamp('contract_end', { withTimezone: true }),
    maxStudents: integer('max_students').default(0).notNull(),
    seatsUsed: integer('seats_used').default(0).notNull(),
    verticalFocus: verticalEnum('vertical_focus'),
    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_partners_type').on(table.type),
    index('idx_partners_active').on(table.isActive),
  ],
);
