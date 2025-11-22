#!/bin/bash

# Script to bump version and create git tag
# Usage: ./bump-version.sh [major|minor|patch]
# Default: patch

set -e

VERSION_FILE="frontend-react-native/version.txt"
PACKAGE_JSON="frontend-react-native/package.json"
BUMP_TYPE=${1:-patch}

# Validate bump type
if [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo "❌ Invalid bump type: $BUMP_TYPE"
    echo "Usage: $0 [major|minor|patch]"
    exit 1
fi

echo "📝 Bumping version ($BUMP_TYPE)..."

# Check if version file exists
if [ ! -f "$VERSION_FILE" ]; then
    echo "❌ Version file not found: $VERSION_FILE"
    exit 1
fi

# Read current version
CURRENT=$(cat "$VERSION_FILE" | tr -d '\n')
echo "Current version: $CURRENT"

# Parse version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

# Bump version
case $BUMP_TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo "New version: $NEW_VERSION"

# Update version.txt
echo "$NEW_VERSION" > "$VERSION_FILE"
echo "✅ Updated $VERSION_FILE"

# Update package.json if it exists
if [ -f "$PACKAGE_JSON" ]; then
    # Use jq if available, otherwise use sed
    if command -v jq &> /dev/null; then
        jq --arg version "$NEW_VERSION" '.version = $version' "$PACKAGE_JSON" > temp.json
        mv temp.json "$PACKAGE_JSON"
    else
        sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/g" "$PACKAGE_JSON"
    fi
    echo "✅ Updated $PACKAGE_JSON"
fi

# Commit changes
echo ""
echo "📦 Committing changes..."
git add "$VERSION_FILE" "$PACKAGE_JSON"
git commit -m "chore: bump version to $NEW_VERSION"
echo "✅ Committed to git"

# Create git tag
echo ""
echo "🏷️  Creating git tag..."
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"
echo "✅ Created tag: v$NEW_VERSION"

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    VERSION BUMP COMPLETE                       ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  Previous Version: $CURRENT"
echo "║  New Version:      $NEW_VERSION"
echo "║  Bump Type:        $BUMP_TYPE"
echo "║                                                                ║"
echo "║  Next Steps:                                                   ║"
echo "║  1. Push to repository: git push origin main --tags            ║"
echo "║  2. Monitor build: kubectl get pipelineruns -n tekton-pipelines║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "To push changes:"
echo "  git push origin main --tags"

