#!/usr/bin/env bash
set -euo pipefail

# This repo standardizes on Sealed Secrets / cluster-native secret workflows.
# We intentionally fail CI if new docs reintroduce Vault guidance.

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

paths=()
[ -d "docs" ] && paths+=("docs")
[ -d "k8s" ] && paths+=("k8s")
[ -d ".github" ] && paths+=(".github")

if [ ${#paths[@]} -eq 0 ]; then
  echo "✅ No docs/manifests paths present."
  exit 0
fi

MATCHES="$(grep -RIn -E "\\bvault\\b" "${paths[@]}" 2>/dev/null || true)"
if [ -n "$MATCHES" ]; then
  echo "❌ Vault references detected in docs/manifests. Use Sealed Secrets guidance instead."
  echo "$MATCHES"
  exit 1
fi

echo "✅ No Vault references found."

