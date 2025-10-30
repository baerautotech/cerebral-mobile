#!/bin/bash

MESSAGE=$(git log -1 --pretty=%B)

if [[ $MESSAGE =~ ^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?!?: ]]; then
    echo "✅ Commit message follows conventional commits"
    exit 0
fi

echo "❌ Commit message doesn't follow conventional commits format"
echo ""
echo "Required format: type(scope): message"
echo "Example: feat(ai-services): add version endpoint"
echo ""
echo "Types: feat, fix, docs, style, refactor, perf, test, chore"
exit 1
