// ============================================
// PRONTO.IA — Audit Log
// ============================================

import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { users } from './users';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    action: text('action').notNull(),
    actorId: text('actor_id').notNull(),
    actorType: text('actor_type').notNull(), // user, system, admin
    resourceType: text('resource_type').notNull(),
    resourceId: text('resource_id').notNull(),
    details: jsonb('details'),
    ipAddress: text('ip_address'),

    // LGPD: link to user for "esquecer tudo" wipe
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_audit_action').on(table.action),
    index('idx_audit_resource').on(table.resourceType, table.resourceId),
    index('idx_audit_created').on(table.createdAt),
    index('idx_audit_user').on(table.userId),
  ],
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
