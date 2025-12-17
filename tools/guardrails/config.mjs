import fs from 'node:fs';
import path from 'node:path';
import { repoRoot, normalizeSlashes } from './shared.mjs';

const DEFAULT_CONFIG = {
  version: 1,
  defaults: {
    scope: {
      includePathPrefixes: ['src/'],
      excludePathPrefixes: ['cursor-dev-healer-extension/', 'build/', 'test-results/', 'node_modules/'],
    },
    mode: 'ratchet',
    srp: {
      newFileMaxLines: 300,
      warnOverLines: 200,
      ratchetBlockOverLines: 350,
      ratchetBlockIfGrowsBy: 10,
      exemptPaths: [],
      exemptPathPrefixes: [],
    },
    checks: {
      forbiddenImports: 'error',
      hexColors: 'error',
      tailwindPalette: 'warn',
      console: 'warn',
      supabaseCreateClient: {
        level: 'error',
        allowImportPaths: ['src/utils/supabase/client.ts', 'src/utils/api/supabase.ts'],
        allowPathPrefixes: ['src/supabase/functions/server/', 'src/docs/'],
      },
    },
  },
  overrides: [],
};

export function loadGuardrailsConfig() {
  const root = repoRoot();
  const configPath = path.join(root, 'guardrails.config.json');
  if (!fs.existsSync(configPath)) return DEFAULT_CONFIG;
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function configForFile(config, filePath) {
  const p = normalizeSlashes(filePath);
  const defaults = config.defaults || DEFAULT_CONFIG.defaults;
  const overrides = Array.isArray(config.overrides) ? config.overrides : [];

  const match = overrides.find((o) => Array.isArray(o.prefixes) && o.prefixes.some((pref) => p.startsWith(normalizeSlashes(pref))));
  if (!match) return { ...defaults, overrideName: null };

  return {
    ...defaults,
    ...match,
    srp: { ...(defaults.srp || {}), ...(match.srp || {}) },
    checks: { ...(defaults.checks || {}), ...(match.checks || {}) },
    overrideName: match.name || 'override',
  };
}


