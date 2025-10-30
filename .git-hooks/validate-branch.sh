#!/bin/bash
set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Define allowed branches by phase
DEVELOP_BRANCHES="develop|dev|feature/.*|bugfix/.*"
STAGING_BRANCHES="staging|stage"
PRODUCTION_BRANCHES="main|master|hotfix/.*"

# Validate branch
if [[ $BRANCH =~ ^($DEVELOP_BRANCHES|$STAGING_BRANCHES|$PRODUCTION_BRANCHES)$ ]]; then
    echo "✅ Branch '$BRANCH' is valid"
    
    # Warn about production branches in development mode
    if [[ $BRANCH =~ ^($PRODUCTION_BRANCHES)$ ]]; then
        echo "⚠️  WARNING: You're on a production branch ($BRANCH)"
        echo "⚠️  This will deploy to cerebral-production namespace"
        read -p "Continue? (y/n) " -n 1 -r
        echo
        [[ $REPLY =~ ^[Yy]$ ]] || exit 1
    fi
    exit 0
fi

echo "❌ Invalid branch: $BRANCH"
echo ""
echo "Allowed branches:"
echo "  Development: develop, dev, feature/*, bugfix/*"
echo "  Testing:    staging, stage"
echo "  Production: main, master, hotfix/*"
exit 1
