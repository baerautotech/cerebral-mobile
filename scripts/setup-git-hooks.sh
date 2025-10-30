#!/bin/bash

echo "🔧 Installing git hooks..."
mkdir -p .git/hooks

# Copy and make executable
for hook in .git-hooks/*.sh; do
    if [ -f "$hook" ]; then
        hook_name=$(basename "$hook")
        cp "$hook" ".git/hooks/$hook_name"
        chmod +x ".git/hooks/$hook_name"
        echo "✅ Installed: $hook_name"
    fi
done

# Create commit-msg hook that runs our validators
cat > .git/hooks/commit-msg << 'COMMIT_MSG_HOOK'
#!/bin/bash
.git/hooks/validate-commit-message.sh
COMMIT_MSG_HOOK
chmod +x .git/hooks/commit-msg

# Create pre-push hook
cat > .git/hooks/pre-push << 'PREPUSH_HOOK'
#!/bin/bash
.git/hooks/validate-branch.sh
.git/hooks/validate-changed-files.sh
PREPUSH_HOOK
chmod +x .git/hooks/pre-push

echo ""
echo "✅ All git hooks installed successfully"
