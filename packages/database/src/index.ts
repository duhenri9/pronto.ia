// ============================================
// PRONTO.IA — Database Package Entry
// ============================================

export { db, type Database } from './db';
export * from './schema';

// Re-export commonly used Drizzle ORM helpers so consumers don't
// need to import drizzle-orm directly (avoids dual-package type conflicts)
export { eq, and, or, lte, gte, lt, gt, like, ilike, inArray, notInArray, isNull, isNotNull, sql, desc, asc, count } from 'drizzle-orm';
