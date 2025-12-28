#!/usr/bin/env bash
set -euo pipefail

# Global migration gate (no-op unless Supabase migrations are staged in this repo).

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if ! git diff --cached --name-only | grep -E '^supabase/migrations/.*\.sql$' >/dev/null 2>&1; then
  exit 0
fi

echo "[migrations] FAIL: This repo has staged Supabase migrations but no configured apply step here." >&2
echo "[migrations] Move Supabase migrations to the canonical repo (usually cerebral/) or add Supabase apply wiring." >&2
exit 1

