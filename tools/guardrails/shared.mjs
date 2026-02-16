import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

export function repoRoot() {
  try {
    return execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  } catch {
    return process.cwd();
  }
}

export function exec(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}

export function execOrEmpty(cmd, opts = {}) {
  try {
    return exec(cmd, opts);
  } catch {
    return '';
  }
}

export function spawnOrEmpty(command, args, opts = {}) {
  try {
    const res = spawnSync(command, args, { encoding: 'utf8', ...opts });
    if (res.status !== 0) return '';
    return res.stdout ?? '';
  } catch {
    return '';
  }
}

export function normalizeSlashes(p) {
  return p.replaceAll(path.sep, '/');
}

export function isTsLike(filePath) {
  return filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx');
}

export function isInIgnoredDir(filePath) {
  const p = normalizeSlashes(filePath);
  return (
    p.startsWith('node_modules/') ||
    p.startsWith('build/') ||
    p.startsWith('dist/') ||
    p.startsWith('test-results/') ||
    p.startsWith('coverage/') ||
    p.startsWith('src/supabase/functions/') ||
    p.endsWith('.d.ts')
  );
}

export function listFilesRecursive(dirAbs) {
  const out = [];
  const stack = [dirAbs];

  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'build' || entry.name === 'dist' || entry.name === 'test-results') {
          continue;
        }
        stack.push(abs);
      } else if (entry.isFile()) {
        out.push(abs);
      }
    }
  }

  return out;
}

export function countLines(text) {
  // Normalize newline handling so we don't undercount on trailing newline.
  if (text.length === 0) return 0;
  return text.split('\n').length;
}

export function stripLikelyComments(text) {
  // Best-effort comment stripping for scanning (not a full TS parser).
  // Remove block comments first, then line comments.
  const withoutBlock = text.replace(/\/\*[\s\S]*?\*\//g, '');
  return withoutBlock.replace(/(^|\s)\/\/.*$/gm, '$1');
}

export function readStagedFile(filePath) {
  // Reads file content from git index (staged) rather than working tree.
  // `git show :path` works for added/modified files.
  return spawnOrEmpty('git', ['show', `:${filePath}`], { stdio: ['ignore', 'pipe', 'ignore'] });
}

export function readHeadFile(filePath) {
  return spawnOrEmpty('git', ['show', `HEAD:${filePath}`], { stdio: ['ignore', 'pipe', 'ignore'] });
}


