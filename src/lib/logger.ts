import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

function logsDir(): string {
  // Works both in dev (cwd = project root) and in Node standalone (dist/server/)
  const base = process.env.LOGS_DIR ?? join(process.cwd(), 'logs');
  if (!existsSync(base)) mkdirSync(base, { recursive: true });
  return base;
}

export function logFormSubmission(formType: string, data: Record<string, unknown>): void {
  const date = new Date().toISOString().slice(0, 10);
  const file = join(logsDir(), `forms-${date}.jsonl`);
  const entry = JSON.stringify({ ts: new Date().toISOString(), form: formType, ...data });
  try {
    appendFileSync(file, entry + '\n', 'utf-8');
  } catch (e) {
    console.error('[logger] Failed to write log:', e);
  }
}
