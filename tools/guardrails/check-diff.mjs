import path from 'node:path';
import {
  countLines,
  execOrEmpty,
  isInIgnoredDir,
  isTsLike,
  normalizeSlashes,
  repoRoot,
  stripLikelyComments,
} from './shared.mjs';
import { configForFile, loadGuardrailsConfig } from './config.mjs';

function parseArgs(argv) {
  const args = { base: null, head: null, prefix: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--base') args.base = argv[++i] || null;
    else if (a === '--head') args.head = argv[++i] || null;
    else if (a === '--prefix') args.prefix.push(normalizeSlashes(argv[++i] || ''));
  }
  return args;
}

function getChangedFiles(base, head) {
  const raw = execOrEmpty(`git diff --name-only --diff-filter=ACMR ${base}..${head}`);
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeSlashes)
    .filter((f) => !isInIgnoredDir(f))
    .filter((f) => isTsLike(f));
}

function getDiffAddedLines(base, head, filePath) {
  const diff = execOrEmpty(`git diff ${base}..${head} -U0 -- ${filePath}`);
  const lines = diff.split('\n');
  const added = [];
  for (const line of lines) {
    if (line.startsWith('+++ ') || line.startsWith('@@') || line.startsWith('diff ') || line.startsWith('index ')) continue;
    if (!line.startsWith('+')) continue;
    added.push(line.slice(1));
  }
  return added;
}

function isUnderAnyPrefix(filePath, prefixes) {
  if (!prefixes.length) return true;
  const p = normalizeSlashes(filePath);
  return prefixes.some((pref) => pref && p.startsWith(pref));
}

function isExcludedByAnyPrefix(filePath, prefixes) {
  if (!prefixes.length) return false;
  const p = normalizeSlashes(filePath);
  return prefixes.some((pref) => pref && p.startsWith(pref));
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

function checkAddedLines(filePath, addedLines, cfg) {
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

  if (/\bbg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(addedNoComments)) {
    pushByLevel(
      { errors, warnings },
      cfg.checks?.tailwindPalette ?? 'warn',
      'Detected Tailwind palette colors (e.g. bg-blue-500). Prefer CSS variables: `bg-[var(--bg-primary)]` etc.',
    );
  }

  if (/\bconsole\.(log|debug|info)\(/.test(addedNoComments)) {
    pushByLevel(
      { errors, warnings },
      cfg.checks?.console ?? 'warn',
      'Added console logging. Prefer structured logging or remove before merge.',
    );
  }

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

function readFileAtRef(ref, filePath) {
  const raw = execOrEmpty(`git show ${ref}:${filePath}`);
  return raw || '';
}

function checkSrp({ filePath, baseText, headText, strictMaxLines }) {
  const errors = [];
  const warnings = [];

  const headLines = countLines(headText);
  const baseLines = baseText ? countLines(baseText) : 0;
  const delta = headLines - baseLines;

  const isNew = !baseText;
  const cfg = configForFile(loadGuardrailsConfig(), filePath);
  const mode = cfg.mode || 'ratchet';
  const srp = cfg.srp || {};
  const newMax = srp.newFileMaxLines ?? 300;

  if (isNew && headLines > newMax) {
    errors.push(`SRP: new file exceeds ${newMax} lines (${headLines}). Split into hooks/components/services/types.`);
    return { errors, warnings };
  }

  if (mode === 'strict') {
    const strictMax = srp.strictMaxLines ?? strictMaxLines ?? newMax;
    if (isSrpExempt(filePath, srp)) {
      if (headLines > (srp.warnOverLines ?? 200) && delta >= 0) {
        warnings.push(`SRP(exempt): file is ${headLines} lines (target ≤${srp.warnOverLines ?? 200}). Track for refactor.`);
      }
      return { errors, warnings };
    }
    if (headLines > strictMax) {
      errors.push(`SRP(strict): file is ${headLines} lines (> ${strictMax}). Refactor required when touching this area.`);
      return { errors, warnings };
    }
    if (headLines > (srp.warnOverLines ?? 200) && delta >= 0) {
      warnings.push(`SRP: file is ${headLines} lines (target ≤${srp.warnOverLines ?? 200}).`);
    }
    return { errors, warnings };
  }

  // Ratchet mode: allow legacy debt unless this change meaningfully worsens it.
  const blockOver = srp.ratchetBlockOverLines ?? 350;
  const blockGrowsBy = srp.ratchetBlockIfGrowsBy ?? 10;
  if (headLines > blockOver && delta > blockGrowsBy) {
    errors.push(`SRP: file grew by ${delta} lines and is now ${headLines} lines. Refactor while touching (target ≤${newMax}).`);
    return { errors, warnings };
  }

  if (headLines > newMax && delta > 0) {
    warnings.push(`SRP: file is ${headLines} lines (>${newMax}). Consider splitting.`);
  } else if (headLines > (srp.warnOverLines ?? 200) && delta >= 0) {
    warnings.push(`SRP: file is ${headLines} lines (target ≤${srp.warnOverLines ?? 200}).`);
  }

  return { errors, warnings };
}

function formatIssues(title, items) {
  return `${title}\n${items.map((x) => `  - ${x}`).join('\n')}`;
}

function main() {
  const root = repoRoot();
  process.chdir(root);

  const args = parseArgs(process.argv);
  if (!args.base || !args.head) {
    console.error('Usage: node tools/guardrails/check-diff.mjs --base <sha> --head <sha> [--prefix <pathPrefix>...]');
    process.exit(2);
  }

  const config = loadGuardrailsConfig();
  const includePrefixes =
    args.prefix.length > 0
      ? args.prefix
      : (config?.defaults?.scope?.includePathPrefixes || []).map(normalizeSlashes);
  const excludePrefixes = (config?.defaults?.scope?.excludePathPrefixes || []).map(normalizeSlashes);

  const changed = getChangedFiles(args.base, args.head)
    .filter((f) => isUnderAnyPrefix(f, includePrefixes))
    .filter((f) => !isExcludedByAnyPrefix(f, excludePrefixes));
  if (changed.length === 0) {
    console.log('🛡️  Diff guardrails: no matching TS/TSX files changed.');
    return;
  }

  const issues = [];
  let totalWarnings = 0;

  for (const filePath of changed) {
    const perFileCfg = configForFile(config, filePath);
    const addedLines = getDiffAddedLines(args.base, args.head, filePath);
    const { errors: lineErrors, warnings: lineWarnings } = checkAddedLines(filePath, addedLines, perFileCfg);

    const headText = readFileAtRef(args.head, filePath);
    const baseText = readFileAtRef(args.base, filePath);

    const { errors: srpErrors, warnings: srpWarnings } = checkSrp({
      filePath,
      baseText,
      headText,
      strictMaxLines: 300,
    });

    const errors = [...lineErrors, ...srpErrors];
    const warnings = [...lineWarnings, ...srpWarnings];
    totalWarnings += warnings.length;

    if (errors.length || warnings.length) issues.push({ filePath, errors, warnings });
  }

  if (issues.length === 0) {
    console.log('✅ Diff guardrails: passed.');
    return;
  }

  const failures = issues.filter((x) => x.errors.length > 0);
  const hasErrors = failures.length > 0;

  for (const issue of issues) {
    const rel = normalizeSlashes(path.relative(root, path.join(root, issue.filePath)));
    console.log(`\n${hasErrors ? '❌' : '⚠️'} ${rel}`);
    if (issue.errors.length) console.log(formatIssues('Errors:', issue.errors));
    if (issue.warnings.length) console.log(formatIssues('Warnings:', issue.warnings));
  }

  if (hasErrors) {
    console.log('\n❌ Diff guardrails failed.');
    process.exit(1);
  }

  console.log(`\n⚠️  Diff guardrails warnings: ${totalWarnings}.`);
}

main();


