# Portable Enterprise Guardrails (Frontend + Mobile)

This repo’s guardrails are designed to be **copied** into `cerebral-frontend` and `cerebral-mobile` with minimal changes.

## What to copy

- **Guardrail scripts**: `tools/guardrails/*`
- **Policy file**: `guardrails.config.json`
- **Git hooks**: `.githooks/*` and `scripts/setup-git-hooks.sh`
- **CI step**: the “Guardrails (diff-based ratchet)” step in `.github/workflows/ci.yml`
- **PR template**: `.github/pull_request_template.md`

## How the system works

- **Local (developer) enforcement**
  - `/.githooks/pre-commit` runs:
    - `lint-staged`
    - `node tools/guardrails/check-staged.mjs` (blocks *new* violations in staged changes)
  - `/.githooks/pre-push` runs:
    - typecheck + unit tests + bundle size budget
- **CI (merge gate) enforcement**
  - `node tools/guardrails/check-diff.mjs` runs against the PR’s `base..head` range.
  - Guardrails are **ratcheting** by default: don’t block legacy debt unless a change worsens it.
  - Selected modules (ex: `projects`) can be set to **strict** mode (block if touched and still >300 lines).

## What you customize per repo

### 1) `guardrails.config.json`

- **Module strictness**: add/remove overrides in `overrides[]` based on module priorities.
- **Supabase allowlist**:
  - Update `checks.supabaseCreateClient.allowImportPaths` to match the repo’s canonical Supabase client wrapper.
- **SRP thresholds**:
  - If React Native modules trend larger, you can adjust `newFileMaxLines` or tighten `ratchetBlockOverLines`.

### 2) CI commands (package scripts)

This repo assumes:
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run size`

For other repos:
- If the mobile repo uses `pnpm`/`yarn` or different script names, update `.githooks/pre-push` and `.github/workflows/ci.yml` accordingly.

## Recommended rollout plan (enterprise safe)

1. **Week 1**: enable ratchet mode across the repo (no new violations)
2. **Week 2**: make the next “build module” strict (ex: `projects`)
3. **Week 3+**: expand strict mode module-by-module until the entire repo is strict

## Common failure modes this prevents

- “Days-later” SRP refactors because oversized files were allowed to grow during the build
- Token drift (hardcoded colors) slipping in unnoticed
- Ad-hoc Supabase client creation and inconsistent auth/session behavior
- Bundle growth with no accountability (size budget + lazy loading expectations)


