// ============================================
// PRONTO.IA — Worker: Prompts Loader
// ============================================
// Resolves the prompts directory for the worker.
// In dev: uses PROMPTS_DIR env var or resolves relative to monorepo root.
// In production (Railway): uses PROMPTS_DIR env var set by deployment config.

// This file exists to explicitly set PROMPTS_DIR before the LLM package
// loads its prompts. The LLM package (packages/llm/src/prompts.ts) reads
// PROMPTS_DIR from process.env, so we set it here before any LLM call.

import { existsSync } from 'fs';
import { join } from 'path';

function resolvePromptsDir(): string {
  // If PROMPTS_DIR is explicitly set (e.g. in Railway), use it
  if (process.env.PROMPTS_DIR) {
    const dir = process.env.PROMPTS_DIR;
    if (!existsSync(dir)) {
      console.error(`[PROMPTS] PROMPTS_DIR set but directory does not exist: ${dir}`);
      throw new Error(`Prompts directory not found: ${dir}`);
    }
    console.log(`[PROMPTS] Using PROMPTS_DIR from env: ${dir}`);
    return dir;
  }

  // In dev (tsx), resolve relative to this file:
  // apps/worker/src/prompts-loader.ts → ../../../../prompts/personas
  const monorepoRoot = join(__dirname, '..', '..', '..', '..');
  const devDir = join(monorepoRoot, 'prompts', 'personas');

  if (existsSync(devDir)) {
    console.log(`[PROMPTS] Using dev prompts dir: ${devDir}`);
    return devDir;
  }

  // In built mode (node dist/src/), prompts are copied alongside:
  // dist/src/prompts/personas/
  const builtDir = join(__dirname, 'prompts', 'personas');
  if (existsSync(builtDir)) {
    console.log(`[PROMPTS] Using built-in prompts dir: ${builtDir}`);
    return builtDir;
  }

  console.error(`[PROMPTS] Could not find prompts directory`);
  throw new Error('Prompts directory not found. Set PROMPTS_DIR env var.');
}

// Set PROMPTS_DIR on process.env before LLM package reads it
export function initPromptsDir(): string {
  const dir = resolvePromptsDir();
  process.env.PROMPTS_DIR = dir;
  return dir;
}