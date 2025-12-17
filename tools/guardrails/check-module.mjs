import fs from 'node:fs';
import path from 'node:path';
import {
  countLines,
  isInIgnoredDir,
  isTsLike,
  listFilesRecursive,
  normalizeSlashes,
  repoRoot,
  stripLikelyComments,
} from './shared.mjs';

function parseArgs(argv) {
  const args = { module: null, path: null, maxLines: 300 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--module') args.module = argv[++i] || null;
    else if (a === '--path') args.path = argv[++i] || null;
    else if (a === '--max-lines') args.maxLines = Number(argv[++i] || 300);
  }
  return args;
}

function defaultPathsForModule(moduleName) {
  const mod = moduleName.toLowerCase();
  return [
    `src/components/${mod}`,
    `src/routes/${mod}`,
    `src/pages/${mod}`,
    `src/features/${mod}`,
    `src/stores/${mod}`,
  ];
}

const HEX_COLOR = /#[0-9A-Fa-f]{3,8}\b/;
const TAILWIND_PALETTE =
  /\b(bg|text|border|ring)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;

function analyzeFile(absPath, relPath, maxLines) {
  const content = fs.readFileSync(absPath, 'utf8');
  const stripped = stripLikelyComments(content);

  const lines = countLines(content);
  const issues = {
    relPath,
    lines,
    errors: [],
    warnings: [],
  };

  if (lines > maxLines) {
    issues.errors.push(`SRP: ${lines} lines (limit ${maxLines}). Split into orchestrator + hooks/components/services/types.`);
  } else if (lines > 200) {
    issues.warnings.push(`SRP: ${lines} lines (target ≤200).`);
  }

  if (HEX_COLOR.test(stripped)) {
    issues.errors.push('Hardcoded hex colors detected. Use CSS variables / tokens (Half-pipe design system).');
  }

  const tailwindMatches = stripped.match(TAILWIND_PALETTE) || [];
  if (tailwindMatches.length) {
    issues.warnings.push(`Tailwind palette colors detected (${tailwindMatches.slice(0, 4).join(', ')}${tailwindMatches.length > 4 ? ', …' : ''}). Prefer CSS variables.`);
  }

  if (/\bfrom\s+['"]lucide-react['"]/.test(stripped)) {
    issues.errors.push("Forbidden icon library: 'lucide-react' (use '@phosphor-icons/react').");
  }

  return issues;
}

function main() {
  const root = repoRoot();
  process.chdir(root);

  const args = parseArgs(process.argv);
  const relTargets = [];

  if (args.path) {
    relTargets.push(normalizeSlashes(args.path));
  } else if (args.module) {
    relTargets.push(...defaultPathsForModule(args.module));
  } else {
    console.error('Usage: node tools/guardrails/check-module.mjs --module <name> OR --path <relative-or-absolute-path>');
    process.exit(2);
  }

  const absTargets = relTargets
    .map((p) => (path.isAbsolute(p) ? p : path.join(root, p)))
    .filter((p) => fs.existsSync(p));

  if (absTargets.length === 0) {
    console.error(`No matching module paths found for: ${relTargets.join(', ')}`);
    process.exit(2);
  }

  const files = absTargets
    .flatMap((dir) => (fs.statSync(dir).isDirectory() ? listFilesRecursive(dir) : [dir]))
    .map((abs) => ({ abs, rel: normalizeSlashes(path.relative(root, abs)) }))
    .filter((f) => !isInIgnoredDir(f.rel))
    .filter((f) => isTsLike(f.rel));

  if (files.length === 0) {
    console.log('No TS/TSX files found in module paths.');
    return;
  }

  const results = files.map((f) => analyzeFile(f.abs, f.rel, args.maxLines));
  const failures = results.filter((r) => r.errors.length > 0);
  const warnings = results.filter((r) => r.warnings.length > 0);

  // Show top SRP offenders first.
  results.sort((a, b) => b.lines - a.lines);

  for (const r of results) {
    if (!r.errors.length && !r.warnings.length) continue;
    console.log(`\n${r.errors.length ? '❌' : '⚠️'} ${r.relPath} (${r.lines} lines)`);
    for (const e of r.errors) console.log(`  - ERROR: ${e}`);
    for (const w of r.warnings) console.log(`  - WARN: ${w}`);
  }

  console.log('\nSummary:');
  console.log(`- Files scanned: ${files.length}`);
  console.log(`- Errors: ${failures.length} files`);
  console.log(`- Warnings: ${warnings.length} files`);

  if (failures.length) process.exit(1);
}

main();


