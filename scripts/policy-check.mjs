import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const POLICY_ORG = process.env.POLICY_ORG ?? 'baerautotech';
const POLICY_PACK_REPO = process.env.POLICY_PACK_REPO ?? `${POLICY_ORG}/policy-pack`;
const BASE_BRANCH = process.env.POLICY_BASE_BRANCH ?? 'main';
const TOKEN = process.env.POLICY_BOT_TOKEN ?? process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;

const ROOT = process.cwd();
const manifestPath = path.join(ROOT, 'policy-files.json');
if (!existsSync(manifestPath)) process.exit(0);

if (!TOKEN) {
  // Keep `main` mergeable even if org secrets are not configured yet.
  console.log('POLICY_BOT_TOKEN not configured; skipping policy file validation.');
  process.exit(0);
}

const policyFiles = JSON.parse(readFileSync(manifestPath, 'utf8')).files ?? [];

async function fetchPolicyFile(filePath) {
  const url = `https://api.github.com/repos/${POLICY_PACK_REPO}/contents/${filePath}?ref=${BASE_BRANCH}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github.raw',
      'User-Agent': 'policy-pack-check',
    },
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch ${filePath}: ${response.status} ${text}`);
  }

  return response.text();
}

const mismatches = [];

for (const file of policyFiles) {
  const localPath = path.join(ROOT, file);
  const localContents = existsSync(localPath) ? readFileSync(localPath, 'utf8') : null;
  const policyContents = await fetchPolicyFile(file);
  if (policyContents === null) {
    mismatches.push(`${file} (missing in policy pack)`);
    continue;
  }
  if (localContents !== policyContents) {
    mismatches.push(file);
  }
}

if (mismatches.length > 0) {
  console.error('Policy files are out of sync:');
  for (const file of mismatches) {
    console.error(`- ${file}`);
  }
  console.error('Run policy sync or update via policy-pack.');
  process.exit(1);
}

console.log('Policy files are in sync.');
