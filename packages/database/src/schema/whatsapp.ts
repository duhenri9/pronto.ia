// ============================================
// PRONTO.IA — WhatsApp Tables + UserMemory + ScheduledMessages
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

import {
  messageDirectionEnum,
  messageTypeEnum,
  messageStatusEnum,
  memoryTypeEnum,
  scheduledMessageStatusEnum,
} from './enums';
import { users } from './users';

// ─── WhatsApp Session ───

export const whatsappSessions = pgTable(
  'whatsapp_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .unique()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    phoneNumber: text('phone_number').unique().notNull(),

    // Meta WhatsApp API identifiers
    waId: text('wa_id'),

    // Session state
    currentPersona: text('current_persona').default('maria').notNull(),
    currentFlow: text('current_flow'), // onboarding, lesson, exercise, chat, menu
    flowState: jsonb('flow_state').default({}).notNull(),

    // Context window management
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
    messageCount: integer('message_count').default(0).notNull(),

    // 24-hour session window tracking
    sessionWindowStart: timestamp('session_window_start', { withTimezone: true }),
    isInSessionWindow: boolean('is_in_session_window').default(false).notNull(),

    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_wa_sessions_phone').on(table.phoneNumber),
    index('idx_wa_sessions_last_message').on(table.lastMessageAt),
  ],
);

export const whatsappSessionsRelations = relations(whatsappSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [whatsappSessions.userId],
    references: [users.id],
  }),
  messages: many(whatsappMessages),
  scheduledMessages: many(scheduledMessages),
}));

// ─── WhatsApp Message ───

export const whatsappMessages = pgTable(
  'whatsapp_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => whatsappSessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(),

    // Message identifiers
    waMessageId: text('wa_message_id'),
    direction: messageDirectionEnum('direction').notNull(),
    messageType: messageTypeEnum('message_type').notNull(),

    // Content
    textContent: text('text_content'),
    mediaUrl: text('media_url'),
    mediaId: text('media_id'),
    templateName: text('template_name'),
    interactivePayload: jsonb('interactive_payload'),

    // Context
    personaUsed: text('persona_used'),
    lessonId: uuid('lesson_id'),
    enrollmentId: uuid('enrollment_id'),

    // LLM tracking
    llmCallId: uuid('llm_call_id'),
    tokensUsed: integer('tokens_used'),

    // Delivery status
    status: messageStatusEnum('status').default('pending').notNull(),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    readAt: timestamp('read_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_wa_messages_session').on(table.sessionId),
    index('idx_wa_messages_user').on(table.userId),
    index('idx_wa_messages_direction').on(table.direction),
    index('idx_wa_messages_created').on(table.createdAt),
  ],
);

export const whatsappMessagesRelations = relations(whatsappMessages, ({ one }) => ({
  session: one(whatsappSessions, {
    fields: [whatsappMessages.sessionId],
    references: [whatsappSessions.id],
  }),
}));

// ─── User Memory (NEW) ───
// Long-term memory per user — preferences, context, conversation summaries

export const userMemory = pgTable(
  'user_memory',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    memoryType: memoryTypeEnum('memory_type').notNull(),
    key: text('key').notNull(), // e.g. "preferred_greeting", "business_challenge", "last_topic"
    value: text('value').notNull(),
    source: text('source'), // "onboarding", "conversation", "admin", "inferred"

    // Confidence/relevance (for inferred memories)
    confidence: integer('confidence'), // 0-100

    // Auto-expire stale memories
    expiresAt: timestamp('expires_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_user_memory_user_type').on(table.userId, table.memoryType),
    index('idx_user_memory_user_key').on(table.userId, table.key),
    index('idx_user_memory_expires').on(table.expiresAt),
  ],
);

export const userMemoryRelations = relations(userMemory, ({ one }) => ({
  user: one(users, {
    fields: [userMemory.userId],
    references: [users.id],
  }),
}));

// ─── Scheduled Messages (NEW) ───
// Queued messages for daily check-ins, re-engagement, timed delivery

export const scheduledMessages = pgTable(
  'scheduled_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id')
      .references(() => whatsappSessions.id, { onDelete: 'set null' }),

    scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
    messageType: messageTypeEnum('message_type').default('text').notNull(),
    content: text('content').notNull(),
    metadata: jsonb('metadata'), // extra payload (interactive buttons, template params, etc.)

    // Processing
    status: scheduledMessageStatusEnum('status').default('pending').notNull(),
    attempts: integer('attempts').default(0).notNull(),
    maxAttempts: integer('max_attempts').default(3).notNull(),
    lastError: text('last_error'),
    sentAt: timestamp('sent_at', { withTimezone: true }),

    // Context
    enrollmentId: uuid('enrollment_id'),
    lessonId: uuid('lesson_id'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_scheduled_messages_for').on(table.scheduledFor),
    index('idx_scheduled_messages_status').on(table.status),
    index('idx_scheduled_messages_user').on(table.userId),
  ],
);

export const scheduledMessagesRelations = relations(scheduledMessages, ({ one }) => ({
  user: one(users, {
    fields: [scheduledMessages.userId],
    references: [users.id],
  }),
  session: one(whatsappSessions, {
    fields: [scheduledMessages.sessionId],
    references: [whatsappSessions.id],
  }),
}));
