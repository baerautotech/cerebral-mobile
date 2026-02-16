import path from 'node:path';
import {
  countLines,
  execOrEmpty,
  isInIgnoredDir,
  isTsLike,
  normalizeSlashes,
  readHeadFile,
  readStagedFile,
  repoRoot,
  stripLikelyComments,
} from './shared.mjs';
import { configForFile, loadGuardrailsConfig } from './config.mjs';

function getStagedFiles() {
  const raw = execOrEmpty('git diff --cached --name-only --diff-filter=ACMR');
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeSlashes)
    .filter((f) => !isInIgnoredDir(f))
    .filter((f) => isTsLike(f));
}

function getDiffAddedLines(filePath) {
  const diff = execOrEmpty(`git diff --cached -U0 -- ${filePath}`);
  const lines = diff.split('\n');
  const added = [];
  for (const line of lines) {
    if (line.startsWith('+++ ') || line.startsWith('@@') || line.startsWith('diff ') || line.startsWith('index ')) continue;
    if (!line.startsWith('+')) continue;
    // Remove leading '+'
    added.push(line.slice(1));
  }
  return added;
}

const FORBIDDEN_IMPORTS = [
  { pattern: /\bfrom\s+['"]lucide-react['"]/g, message: "Icons must come from '@phosphor-icons/react' (no 'lucide-react')." },
  { pattern: /\bfrom\s+['"]react-icons\/?/g, message: "Icons must come from '@phosphor-icons/react' (no 'react-icons')." },
  { pattern: /\bfrom\s+['"]@heroicons\//g, message: "Icons must come from '@phosphor-icons/react' (no heroicons)." },
  { pattern: /\bfrom\s+['"]redux['"]/g, message: "State must use 'zustand' (no redux)." },
  { pattern: /\bfrom\s+['"]react-redux['"]/g, message: "State must use 'zustand' (no react-redux)." },
  { pattern: /\bfrom\s+['"]recoil['"]/g, message: "State must use 'zustand' (no recoil)." },
  { pattern: /\bfrom\s+['"]mobx['"]/g, message: "State must use 'zustand' (no mobx)." },
  { pattern: /\bfrom\s+['"]lodash['"]/g, message: 'Prefer local helpers in `src/utils/helpers/*` (no lodash).' },
  { pattern: /\bfrom\s+['"]underscore['"]/g, message: 'Prefer local helpers in `src/utils/helpers/*` (no underscore).' },
  { pattern: /\bfrom\s+['"]ramda['"]/g, message: 'Prefer local helpers in `src/utils/helpers/*` (no ramda).' },
  { pattern: /\bfrom\s+['"]moment['"]/g, message: 'Prefer local date helpers in `src/utils/helpers/date.ts` (no moment).' },
  { pattern: /\bfrom\s+['"]date-fns['"]/g, message: 'Prefer local date helpers in `src/utils/helpers/date.ts` (no date-fns).' },
  { pattern: /\bfrom\s+['"]dayjs['"]/g, message: 'Prefer local date helpers in `src/utils/helpers/date.ts` (no dayjs).' },
];

const HEX_COLOR = /#[0-9A-Fa-f]{3,8}\b/;

function levelEnabled(level) {
  return level !== 'off' && level !== 'disable' && level !== false && level !== 0;
}

function pushByLevel(target, level, message) {
  if (!levelEnabled(level)) return;
  if (level === 'warn' || level === 'warning') target.warnings.push(message);
  else target.errors.push(message);
}

function isAllowedByPrefix(filePath, prefixes = []) {
  const p = normalizeSlashes(filePath);
  return prefixes.some((pref) => p.startsWith(normalizeSlashes(pref)));
}

function isAllowedSupabaseCreateClient(filePath, cfg) {
  const allowImportPaths = cfg?.checks?.supabaseCreateClient?.allowImportPaths || [];
  const allowPathPrefixes = cfg?.checks?.supabaseCreateClient?.allowPathPrefixes || [];
  const p = normalizeSlashes(filePath);
  if (allowImportPaths.includes(p)) return true;
  return isAllowedByPrefix(p, allowPathPrefixes);
}

function isSrpExempt(filePath, srp) {
  const p = normalizeSlashes(filePath);
  const exemptPaths = Array.isArray(srp?.exemptPaths) ? srp.exemptPaths.map(normalizeSlashes) : [];
  const exemptPrefixes = Array.isArray(srp?.exemptPathPrefixes) ? srp.exemptPathPrefixes.map(normalizeSlashes) : [];
  if (exemptPaths.includes(p)) return true;
  return exemptPrefixes.some((pref) => p.startsWith(pref));
}

function checkAddedLines(filePath, addedLines) {
  const cfg = configForFile(loadGuardrailsConfig(), filePath);
  const errors = [];
  const warnings = [];

  const addedNoComments = stripLikelyComments(addedLines.join('\n'));

  for (const rule of FORBIDDEN_IMPORTS) {
    if (rule.pattern.test(addedNoComments)) {
      pushByLevel({ errors, warnings }, cfg.checks?.forbiddenImports ?? 'error', rule.message);
    }
  }

  if (HEX_COLOR.test(addedNoComments)) {
    pushByLevel(
      { errors, warnings },
      cfg.checks?.hexColors ?? 'error',
      'Hardcoded hex colors detected. Use CSS variables / tokens (Half-pipe design system).',
    );
  }

  // If you add a tailwind palette color, it’s very likely a token violation.
  // Keep as warning for now (can be promoted to error per-module).
  if (/\bbg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(addedNoComments)) {
    pushByLevel(
      { errors, warnings },
      cfg.checks?.tailwindPalette ?? 'warn',
      'Detected Tailwind palette colors (e.g. bg-blue-500). Prefer CSS variables: `bg-[var(--bg-primary)]` etc.',
    );
  }

  // Console logs: warning (not blocking).
  if (/\bconsole\.(log|debug|info)\(/.test(addedNoComments)) {
    pushByLevel(
      { errors, warnings },
      cfg.checks?.console ?? 'warn',
      'Added console logging. Prefer structured logging or remove before merge.',
    );
  }

  // Supabase client creation must be centralized.
  const supabaseCfg = cfg.checks?.supabaseCreateClient;
  if (levelEnabled(supabaseCfg?.level)) {
    const createsClient =
      /\bfrom\s+['"]@supabase\/supabase-js['"]/.test(addedNoComments) &&
      /\bcreateClient\b/.test(addedNoComments);
    const callsCreateClient = /\bcreateClient\s*\(/.test(addedNoComments);
    if ((createsClient || callsCreateClient) && !isAllowedSupabaseCreateClient(filePath, cfg)) {
      pushByLevel(
        { errors, warnings },
        supabaseCfg.level,
        "Supabase: don't create clients in feature code. Use `src/utils/supabase/client.ts` (or helper wrappers) instead.",
      );
    }
  }

  return { errors, warnings };
}

function checkSrp(filePath, stagedContent) {
  const cfg = configForFile(loadGuardrailsConfig(), filePath);
  const errors = [];
  const warnings = [];

  const lines = countLines(stagedContent);
  const old = readHeadFile(filePath);
  const oldLines = old ? countLines(old) : 0;
  const delta = lines - oldLines;
  const mode = cfg.mode || 'ratchet';
  const srp = cfg.srp || {};

  // New files must be SRP-compliant.
  if (!old && lines > (srp.newFileMaxLines ?? 300)) {
    errors.push(
      `SRP: new file exceeds ${srp.newFileMaxLines ?? 300} lines (${lines}). Split into hooks/components/services/types.`,
    );
    return { errors, warnings };
  }

  if (mode === 'strict') {
    const strictMax = srp.strictMaxLines ?? srp.newFileMaxLines ?? 300;
    if (isSrpExempt(filePath, srp)) {
      // Explicit legacy exemption: don't block strict SRP on these files yet.
      // Still allow other checks (colors/imports/etc.) to run.
      if (lines > (srp.warnOverLines ?? 200) && delta >= 0) {
        warnings.push(`SRP(exempt): file is ${lines} lines (target ≤${srp.warnOverLines ?? 200}). Track for refactor.`);
      }
      return { errors, warnings };
    }
    if (lines > strictMax) {
      errors.push(`SRP(strict): file is ${lines} lines (> ${strictMax}). Refactor required when touching this area.`);
    } else if (lines > (srp.warnOverLines ?? 200) && delta >= 0) {
      warnings.push(`SRP: file is ${lines} lines (target ≤${srp.warnOverLines ?? 200}).`);
    }
    return { errors, warnings };
  }

  // Ratchet mode: avoid blocking on legacy debt unless a change makes it worse.
  const blockOver = srp.ratchetBlockOverLines ?? 350;
  const blockGrowsBy = srp.ratchetBlockIfGrowsBy ?? 10;
  if (lines > blockOver && delta > blockGrowsBy) {
    errors.push(`SRP: file grew by ${delta} lines and is now ${lines} lines. Refactor while touching (target ≤${srp.newFileMaxLines ?? 300}).`);
  } else if (lines > (srp.newFileMaxLines ?? 300) && delta > 0) {
    warnings.push(`SRP: file is ${lines} lines (>${srp.newFileMaxLines ?? 300}). Consider splitting.`);
  } else if (lines > (srp.warnOverLines ?? 200) && delta >= 0) {
    warnings.push(`SRP: file is ${lines} lines (target ≤${srp.warnOverLines ?? 200}).`);
  }

  return { errors, warnings };
}

function formatIssues(title, items) {
  return `${title}\n${items.map((x) => `  - ${x}`).join('\n')}`;
}

function main() {
  const root = repoRoot();
  process.chdir(root);

  const files = getStagedFiles();
  if (files.length === 0) {
    console.log('🛡️  Guardrails: no staged TS/TSX files to check.');
    return;
  }

  const fileIssues = [];
  let totalWarnings = 0;

  for (const filePath of files) {
    const addedLines = getDiffAddedLines(filePath);
    const { errors: lineErrors, warnings: lineWarnings } = checkAddedLines(filePath, addedLines);

    const staged = readStagedFile(filePath);
    const { errors: srpErrors, warnings: srpWarnings } = staged ? checkSrp(filePath, staged) : { errors: [], warnings: [] };

    const errors = [...lineErrors, ...srpErrors];
    const warnings = [...lineWarnings, ...srpWarnings];
    totalWarnings += warnings.length;

    if (errors.length || warnings.length) {
      fileIssues.push({ filePath, errors, warnings });
    }
  }

  if (fileIssues.length === 0) {
    console.log('✅ Guardrails: passed.');
    return;
  }

  const failures = fileIssues.filter((x) => x.errors.length > 0);
  const hasErrors = failures.length > 0;

  for (const issue of fileIssues) {
    const rel = normalizeSlashes(path.relative(root, path.join(root, issue.filePath)));
    console.log(`\n${hasErrors ? '❌' : '⚠️'} ${rel}`);
    if (issue.errors.length) console.log(formatIssues('Errors:', issue.errors));
    if (issue.warnings.length) console.log(formatIssues('Warnings:', issue.warnings));
  }

  if (hasErrors) {
    console.log('\n❌ Guardrails failed. Fix errors or (emergency only) set SKIP_GUARDRAILS=1.');
    process.exit(1);
  }

  console.log(`\n⚠️  Guardrails warnings: ${totalWarnings}.`);
}

main();


