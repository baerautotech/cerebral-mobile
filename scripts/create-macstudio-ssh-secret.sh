#!/usr/bin/env bash
set -euo pipefail

# Creates/updates the Kubernetes secret used by Tekton to SSH into a Mac Studio.
# Expects an ed25519 private key file path.

NAMESPACE="${NAMESPACE:-tekton-pipelines}"
SECRET_NAME="${SECRET_NAME:-macstudio-ssh}"
KEY_PATH="${1:-}"

if [[ -z "$KEY_PATH" || ! -f "$KEY_PATH" ]]; then
  echo "Usage: $0 /path/to/id_ed25519" >&2
  exit 1
fi

kubectl -n "$NAMESPACE" delete secret "$SECRET_NAME" --ignore-not-found
kubectl -n "$NAMESPACE" create secret generic "$SECRET_NAME" \
  --from-file=id_ed25519="$KEY_PATH"

echo "✅ Created secret $NAMESPACE/$SECRET_NAME with id_ed25519"
