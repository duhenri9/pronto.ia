// ============================================
// PRONTO.IA — LLM Call Tracking + Exercise Evaluation
// ============================================

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { users } from './users';
import { lessons } from './trilhas';

// ─── LLM Call ───

export const llmCalls = pgTable(
  'llm_calls',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Model info
    model: text('model').notNull(), // e.g. "claude-haiku-4-5-20251001"
    persona: text('persona').notNull(), // maria, bia, leo, tiao, evaluator

    // Input
    systemPromptHash: text('system_prompt_hash'),
    inputTokens: integer('input_tokens').notNull(),

    // Output
    outputTokens: integer('output_tokens').notNull(),
    finishReason: text('finish_reason'),

    // Cost (in cents BRL)
    estimatedCostCents: integer('estimated_cost_cents').notNull(),

    // Performance
    latencyMs: integer('latency_ms').notNull(),

    // Context snapshot
    lessonId: uuid('lesson_id'),
    sessionId: uuid('session_id'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_llm_calls_user').on(table.userId),
    index('idx_llm_calls_persona').on(table.persona),
    index('idx_llm_calls_model').on(table.model),
    index('idx_llm_calls_created').on(table.createdAt),
  ],
);

export const llmCallsRelations = relations(llmCalls, ({ one }) => ({
  user: one(users, {
    fields: [llmCalls.userId],
    references: [users.id],
  }),
}));

// ─── Exercise Evaluation ───

export const exerciseEvaluations = pgTable(
  'exercise_evaluations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    lessonProgressId: uuid('lesson_progress_id').unique().notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),

    // Input
    studentResponse: text('student_response').notNull(),
    evaluationModel: text('evaluation_model').notNull(),

    // Output
    score: integer('score').notNull(), // 0-100
    passed: boolean('passed').notNull(), // score >= 60
    feedbackText: text('feedback_text').notNull(),
    improvementTips: text('improvement_tips'), // JSON array of tips

    // Criteria breakdown
    relevanceScore: integer('relevance_score'),
    completenessScore: integer('completeness_score'),
    practicalityScore: integer('practicality_score'),

    // LLM tracking
    llmCallId: uuid('llm_call_id'),
    tokensUsed: integer('tokens_used').notNull(),
    estimatedCostCents: integer('estimated_cost_cents').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_evaluations_user').on(table.userId),
    index('idx_evaluations_lesson').on(table.lessonId),
    index('idx_evaluations_passed').on(table.passed),
  ],
);

export const exerciseEvaluationsRelations = relations(exerciseEvaluations, ({ one }) => ({
  user: one(users, {
    fields: [exerciseEvaluations.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [exerciseEvaluations.lessonId],
    references: [lessons.id],
  }),
}));
