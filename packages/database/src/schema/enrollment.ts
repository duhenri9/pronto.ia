// ============================================
// PRONTO.IA — Enrollment, LessonProgress, DailyCheckin
// ============================================

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { enrollmentStatusEnum, enrollmentSourceEnum, lessonStateEnum } from './enums';
import { users } from './users';
import { trilhas, lessons } from './trilhas';

// ─── Enrollment ───

export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    trilhaId: uuid('trilha_id')
      .notNull()
      .references(() => trilhas.id, { onDelete: 'cascade' }),
    status: enrollmentStatusEnum('status').default('ACTIVE').notNull(),
    source: enrollmentSourceEnum('source').default('ORGANIC').notNull(),

    // Progress tracking
    currentDay: integer('current_day').default(1).notNull(),
    currentLessonId: uuid('current_lesson_id'),
    completedLessons: integer('completed_lessons').default(0).notNull(),
    totalLessons: integer('total_lessons').default(0).notNull(),

    // Timestamps
    enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).defaultNow().notNull(),
    pausedAt: timestamp('paused_at', { withTimezone: true }),

    // Outcome tracking — the core metric
    reportedRevenueBeforeCents: integer('reported_revenue_before_cents'),
    reportedRevenueAfterCents: integer('reported_revenue_after_cents'),
    reportedOutcomeAt: timestamp('reported_outcome_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_enrollments_user_trilha').on(table.userId, table.trilhaId),
    index('idx_enrollments_user').on(table.userId),
    index('idx_enrollments_trilha').on(table.trilhaId),
    index('idx_enrollments_status').on(table.status),
    index('idx_enrollments_last_activity').on(table.lastActivityAt),
  ],
);

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  trilha: one(trilhas, {
    fields: [enrollments.trilhaId],
    references: [trilhas.id],
  }),
  progress: many(lessonProgress),
}));

// ─── Lesson Progress ───

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    enrollmentId: uuid('enrollment_id')
      .notNull()
      .references(() => enrollments.id, { onDelete: 'cascade' }),
    state: lessonStateEnum('state').default('NOT_STARTED').notNull(),

    // Lesson delivery tracking
    lessonDeliveredAt: timestamp('lesson_delivered_at', { withTimezone: true }),
    audioDeliveredAt: timestamp('audio_delivered_at', { withTimezone: true }),

    // Exercise
    exercisePromptSentAt: timestamp('exercise_prompt_sent_at', { withTimezone: true }),
    exerciseResponseText: text('exercise_response_text'),
    exerciseResponseMediaUrl: text('exercise_response_media_url'),
    exerciseSubmittedAt: timestamp('exercise_submitted_at', { withTimezone: true }),
    exerciseRetries: integer('exercise_retries').default(0).notNull(),

    // Evaluation
    score: integer('score'),
    feedbackText: text('feedback_text'),
    evaluatedAt: timestamp('evaluated_at', { withTimezone: true }),

    // Timing
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    timeSpentSec: integer('time_spent_sec'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_progress_enrollment_lesson').on(table.enrollmentId, table.lessonId),
    index('idx_progress_user').on(table.userId),
    index('idx_progress_lesson').on(table.lessonId),
    index('idx_progress_state').on(table.state),
  ],
);

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
  enrollment: one(enrollments, {
    fields: [lessonProgress.enrollmentId],
    references: [enrollments.id],
  }),
}));

// ─── Daily Check-in ───

export const dailyCheckins = pgTable(
  'daily_checkins',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    enrollmentId: uuid('enrollment_id')
      .notNull()
      .references(() => enrollments.id, { onDelete: 'cascade' }),
    dayNumber: integer('day_number').notNull(),

    mood: text('mood'), // great, good, neutral, bad
    reflection: text('reflection'),
    actionPlan: text('action_plan'),

    // Revenue micro-tracking
    dailyRevenueCents: integer('daily_revenue_cents'),

    responded: boolean('responded').default(false).notNull(),
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }).defaultNow().notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_checkins_user_enrollment_day').on(
      table.userId,
      table.enrollmentId,
      table.dayNumber,
    ),
    index('idx_checkins_user').on(table.userId),
    index('idx_checkins_enrollment').on(table.enrollmentId),
  ],
);

export const dailyCheckinsRelations = relations(dailyCheckins, ({ one }) => ({
  user: one(users, {
    fields: [dailyCheckins.userId],
    references: [users.id],
  }),
}));
