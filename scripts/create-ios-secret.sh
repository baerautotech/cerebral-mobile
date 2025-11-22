#!/bin/bash

# Script to create Kubernetes secret for iOS signing certificate
# Usage: ./create-ios-secret.sh <cert.p12> <profile.mobileprovision> <cert-password>

set -e

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <cert.p12> <profile.mobileprovision> <cert-password>"
    echo ""
    echo "Arguments:"
    echo "  cert.p12 - Path to iOS signing certificate"
    echo "  profile.mobileprovision - Path to provisioning profile"
    echo "  cert-password - Password for the certificate"
    exit 1
fi

CERT_FILE=$1
PROFILE_FILE=$2
CERT_PASSWORD=$3
NAMESPACE="tekton-pipelines"
SECRET_NAME="ios-signing-cert"

echo "🔐 Creating iOS signing certificate secret..."
echo ""

# Verify files exist
if [ ! -f "$CERT_FILE" ]; then
    echo "❌ Error: Certificate file not found: $CERT_FILE"
    exit 1
fi

if [ ! -f "$PROFILE_FILE" ]; then
    echo "❌ Error: Provisioning profile not found: $PROFILE_FILE"
    exit 1
fi

# Check if secret already exists
if kubectl get secret $SECRET_NAME -n $NAMESPACE &> /dev/null; then
    echo "⚠️  Secret '$SECRET_NAME' already exists. Deleting..."
    kubectl delete secret $SECRET_NAME -n $NAMESPACE
fi

# Create secret
echo "📦 Creating secret with:"
echo "   Cert file: $CERT_FILE"
echo "   Profile file: $PROFILE_FILE"
echo "   Namespace: $NAMESPACE"
echo ""

kubectl create secret generic $SECRET_NAME \
    --from-file=cert.p12="$CERT_FILE" \
    --from-file=profile.mobileprovision="$PROFILE_FILE" \
    --from-literal=cert-password="$CERT_PASSWORD" \
    -n $NAMESPACE

# Verify
echo ""
echo "✅ Secret created successfully!"
echo ""
echo "Verify with:"
echo "  kubectl get secret $SECRET_NAME -n $NAMESPACE"
echo "  kubectl describe secret $SECRET_NAME -n $NAMESPACE"

