#!/bin/bash

BRANCH=$(git rev-parse --abbrev-ref HEAD)
CHANGED_FILES=$(git diff --cached --name-only)

# Get target namespace for this branch
get_target_namespace() {
    local branch=$1
    if [[ $branch =~ ^(main|master|hotfix/.*)$ ]]; then
        echo "cerebral-production"
    elif [[ $branch =~ ^(staging|stage)$ ]]; then
        echo "cerebral-staging"
    else
        echo "cerebral-development"
    fi
}

TARGET_NS=$(get_target_namespace "$BRANCH")

# Check for buildable changes
if echo "$CHANGED_FILES" | grep -q "microservices/"; then
    echo "✅ Will build microservices and deploy to: $TARGET_NS"
    exit 0
fi

if echo "$CHANGED_FILES" | grep -qE "backend-python/|automation/|constraints/"; then
    echo "✅ Will rebuild ALL services and deploy to: $TARGET_NS"
    exit 0
fi

# Docs-only changes
if ! echo "$CHANGED_FILES" | grep -qE "\.(py|js|ts|java|go|rs|swift)$"; then
    echo "⚠️  Documentation-only changes"
    echo "    No builds will trigger (this is normal)"
    exit 0
fi

echo "ℹ️  No microservices code changes detected"
exit 0
