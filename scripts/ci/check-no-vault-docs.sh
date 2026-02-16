#!/usr/bin/env bash
set -euo pipefail

# This repo standardizes on Sealed Secrets / cluster-native secret workflows.
# We intentionally fail CI if new docs reintroduce Vault guidance.

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

if ! command -v rg >/dev/null 2>&1; then
  echo "rg is required for vault-docs check" >&2
  exit 1
fi

MATCHES="$(rg -n -i "\\bvault\\b" docs/ k8s/ .github/ 2>/dev/null || true)"
if [ -n "$MATCHES" ]; then
  echo "❌ Vault references detected in docs/manifests. Use Sealed Secrets guidance instead."
  echo "$MATCHES"
  exit 1
fi

echo "✅ No Vault references found."

