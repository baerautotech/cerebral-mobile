#!/bin/bash

# Script to create Kubernetes secret for Android keystore
# Usage: ./create-android-secret.sh <keystore.jks> <keystore-password> <keystore-alias> <alias-password>

set -e

if [ "$#" -ne 4 ]; then
    echo "Usage: $0 <keystore.jks> <keystore-password> <keystore-alias> <alias-password>"
    echo ""
    echo "Arguments:"
    echo "  keystore.jks - Path to Android keystore file"
    echo "  keystore-password - Password for the keystore"
    echo "  keystore-alias - Alias/name of the key in the keystore"
    echo "  alias-password - Password for the key alias"
    exit 1
fi

KEYSTORE_FILE=$1
KEYSTORE_PASSWORD=$2
KEYSTORE_ALIAS=$3
ALIAS_PASSWORD=$4
NAMESPACE="tekton-pipelines"
SECRET_NAME="android-keystore"

echo "🔐 Creating Android keystore secret..."
echo ""

# Verify file exists
if [ ! -f "$KEYSTORE_FILE" ]; then
    echo "❌ Error: Keystore file not found: $KEYSTORE_FILE"
    exit 1
fi

# Check if secret already exists
if kubectl get secret $SECRET_NAME -n $NAMESPACE &> /dev/null; then
    echo "⚠️  Secret '$SECRET_NAME' already exists. Deleting..."
    kubectl delete secret $SECRET_NAME -n $NAMESPACE
fi

# Create secret
echo "📦 Creating secret with:"
echo "   Keystore file: $KEYSTORE_FILE"
echo "   Keystore alias: $KEYSTORE_ALIAS"
echo "   Namespace: $NAMESPACE"
echo ""

kubectl create secret generic $SECRET_NAME \
    --from-file=keystore.jks="$KEYSTORE_FILE" \
    --from-literal=keystore-password="$KEYSTORE_PASSWORD" \
    --from-literal=keystore-alias="$KEYSTORE_ALIAS" \
    --from-literal=alias-password="$ALIAS_PASSWORD" \
    -n $NAMESPACE

# Verify
echo ""
echo "✅ Secret created successfully!"
echo ""
echo "Verify with:"
echo "  kubectl get secret $SECRET_NAME -n $NAMESPACE"
echo "  kubectl describe secret $SECRET_NAME -n $NAMESPACE"

