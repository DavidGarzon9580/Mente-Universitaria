import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ENV_LINE_PATTERN = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/;

function removeOptionalQuotes(value) {
  const trimmed = value.trim();
  const beginsAndEndsWithQuotes =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));

  return beginsAndEndsWithQuotes ? trimmed.slice(1, -1) : trimmed;
}

export function loadEnvironment(filePath = resolve(process.cwd(), '.env')) {
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const normalized = line.trim();
    if (!normalized || normalized.startsWith('#')) continue;

    const match = normalized.match(ENV_LINE_PATTERN);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] === undefined) {
      process.env[key] = removeOptionalQuotes(rawValue);
    }
  }
}

function readPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getEnvironment() {
  return Object.freeze({
    port: readPositiveInteger(process.env.PORT, 3000),
    nodeEnv: process.env.NODE_ENV || 'development',
    groqApiKey: process.env.GROQ_API_KEY?.trim() || '',
    groqModel: process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-20b',
    groqTimeoutMs: readPositiveInteger(process.env.GROQ_TIMEOUT_MS, 30000)
  });
}
