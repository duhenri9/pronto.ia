// ============================================
// PRONTO.IA — Trilhas, Lessons, ContentVersions
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

import { verticalEnum, trilhaLevelEnum } from './enums';
import { enrollments, lessonProgress } from './index';

// ─── Trilha ───

export const trilhas = pgTable(
  'trilhas',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').unique().notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    vertical: verticalEnum('vertical').notNull(),
    level: trilhaLevelEnum('level').default('BASIC').notNull(),

    // Access control
    isPro: boolean('is_pro').default(false).notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    order: integer('order').default(0).notNull(),

    // Structure
    estimatedDays: integer('estimated_days').default(30).notNull(),
    totalLessons: integer('total_lessons').default(0).notNull(),

    // Persona that delivers this trilha
    personaName: text('persona_name').default('Bia').notNull(),
    personaSlug: text('persona_slug').default('bia').notNull(),

    // Media
    iconUrl: text('icon_url'),
    bannerUrl: text('banner_url'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_trilhas_vertical_level').on(table.vertical, table.level),
    index('idx_trilhas_slug').on(table.slug),
    index('idx_trilhas_published').on(table.isPublished),
  ],
);

export const trilhasRelations = relations(trilhas, ({ many }) => ({
  lessons: many(lessons),
  enrollments: many(enrollments),
}));

// ─── Lesson ───

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    trilhaId: uuid('trilha_id')
      .notNull()
      .references(() => trilhas.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').unique().notNull(),
    dayNumber: integer('day_number').notNull(),

    // Content — actual content lives in ContentVersion
    activeVersionId: uuid('active_version_id'), // plain FK, no relation (avoids ambiguity)

    // Delivery config
    durationMin: integer('duration_min').default(5).notNull(),
    hasExercise: boolean('has_exercise').default(true).notNull(),
    exercisePrompt: text('exercise_prompt'),

    // Audio (pre-generated TTS or human-recorded)
    audioUrl: text('audio_url'),
    audioDurationSec: integer('audio_duration_sec'),

    // Multimedia
    imageUrl: text('image_url'),
    documentUrl: text('document_url'),

    // Ordering & publishing
    order: integer('order').default(0).notNull(),
    isPublished: boolean('is_published').default(false).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_lessons_trilha_day').on(table.trilhaId, table.dayNumber),
    index('idx_lessons_trilha_order').on(table.trilhaId, table.order),
    index('idx_lessons_published').on(table.isPublished),
  ],
);

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  trilha: one(trilhas, {
    fields: [lessons.trilhaId],
    references: [trilhas.id],
  }),
  versions: many(contentVersions),
  progress: many(lessonProgress),
}));

// ─── ContentVersion ───

export const contentVersions = pgTable(
  'content_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    version: integer('version').default(1).notNull(),

    // Lesson content broken into delivery chunks
    introText: text('intro_text').notNull(),
    bodyText: text('body_text').notNull(),
    tipText: text('tip_text'),
    closingText: text('closing_text').notNull(),

    // Persona-specific variants
    personaVariant: text('persona_variant'), // null = generic, "bia", "leo", "tiao"

    // Metadata
    editedBy: text('edited_by'),
    changeNote: text('change_note'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_content_version_unique').on(
      table.lessonId,
      table.version,
      table.personaVariant,
    ),
    index('idx_content_versions_lesson').on(table.lessonId),
  ],
);

export const contentVersionsRelations = relations(contentVersions, ({ one }) => ({
  lesson: one(lessons, {
    fields: [contentVersions.lessonId],
    references: [lessons.id],
  }),
}));
