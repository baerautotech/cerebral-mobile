# 🛡️ CODE QUALITY GUARDRAILS - Cerebral Mobile

**Enterprise-grade code quality enforcement for production-ready development**

---

## Overview

This document describes all automated guardrails that ensure **100% lint compliance**, **type safety**, and **code quality standards** across the cerebral-mobile monorepo.

**Goal**: Prevent defects from reaching production and maintain consistent code quality across all platforms.

---

## 🔒 GUARDRAILS & CONTROLS

### 1. Pre-Commit Hooks (Git Hooks)

**File**: `.husky/pre-commit`
**Triggered**: Before every `git commit`
**Action**: Runs `git-hooks/enhanced-pre-commit` script

**What It Does**:
- ✅ Validates TypeScript compilation
- ✅ Runs ESLint (100% lint compliance)
- ✅ Checks Prettier formatting
- ✅ Validates Jest tests
- ✅ Prevents sensitive files from being committed
- ✅ Validates workspace integrity

**If Pre-Commit Fails**:
```
❌ Code will NOT be committed
✗ Error message shows what failed
💡 Helpful hints provided for fixes
📋 Detailed log in .cerebraflow/logs/pre-commit-validation.log
```

### 2. TypeScript Strict Mode

**File**: `tsconfig.json`
**Effect**: Enforces strict type checking

**Enabled Rules**:
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true
}
```

**What This Prevents**:
- ❌ Implicit `any` types
- ❌ Unused variables/parameters
- ❌ Missing return types
- ❌ Null reference errors
- ❌ Function type mismatches

### 3. ESLint Configuration

**File**: `.eslintrc.json`
**Rules**: React + React Native + TypeScript

**What It Enforces**:
- ✅ No `console.log()` in production code
- ✅ No unused imports
- ✅ Proper import ordering
- ✅ React best practices
- ✅ TypeScript best practices
- ✅ No bare `any` types

**To Run Manually**:
```bash
pnpm lint
```

**Auto-Fix Issues**:
```bash
pnpm lint -- --fix
```

### 4. Prettier Code Formatting

**File**: `.prettierrc.json`
**Enforces**: Consistent code style

**Standards**:
- 2-space indentation
- Single quotes for strings
- Trailing commas (ES5)
- 100-character line width
- Semicolons enabled

**To Format**:
```bash
pnpm format
```

**Pre-Commit Check**:
```bash
pnpm exec prettier --check <files>
```

### 5. Jest Testing

**File**: `jest.config.js`
**Enforces**: Minimum test coverage

**Coverage Thresholds**:
```
Branches:   70% minimum
Functions:  70% minimum
Lines:      70% minimum
Statements: 70% minimum
```

**To Run Tests**:
```bash
pnpm test
```

**Watch Mode**:
```bash
pnpm test -- --watch
```

### 6. Lint-Staged Integration

**File**: `package.json` (`lint-staged` section)
**Purpose**: Only lint/format staged files

**Configured Tasks**:
```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yaml,yml}": [
    "prettier --write"
  ]
}
```

### 7. Workspace Integrity Validation

**Checks**:
- ✅ All `package.json` files are valid JSON
- ✅ Monorepo configuration is correct
- ✅ Cross-workspace references are valid
- ✅ No circular dependencies

---

## 📋 HOW TO USE

### Setting Up for First Time

```bash
# Install dependencies (Husky installs itself)
pnpm install

# Husky hooks are automatically set up during install
# (via "prepare": "husky install" in package.json)
```

### Making a Commit

**Normal Flow**:
```bash
git add .
git commit -m "feat: your feature"
```

**Pre-commit Hook Runs**:
1. TypeScript compilation check
2. ESLint validation (lint)
3. Prettier format check
4. Jest tests (if configured)
5. File organization check
6. Workspace integrity check

**If Everything Passes**:
```
✅ PRE-COMMIT VALIDATION SUCCESSFUL
✓ TypeScript compilation: PASSED
✓ ESLint (100% lint compliance): PASSED
✓ Prettier formatting: PASSED
✓ Jest tests: PASSED
✓ Workspace integrity: PASSED
```

**If Something Fails**:
```
❌ PRE-COMMIT VALIDATION FAILED
❌ [Error description]
📋 Check detailed log: .cerebraflow/logs/pre-commit-validation.log
💡 Common fixes:
   • Run: pnpm lint  (fix linting issues)
   • Run: pnpm format  (auto-format code)
   • Run: pnpm test  (ensure tests pass)
```

### Fixing Common Issues

#### TypeScript Errors
```bash
# See detailed errors
pnpm run build

# Fix most errors automatically
pnpm run build --watch

# Manually fix type errors in IDE
```

#### Linting Issues
```bash
# See violations
pnpm lint

# Auto-fix most issues
pnpm lint -- --fix

# For issues that need manual fixing
# Use IDE's ESLint extension for inline hints
```

#### Formatting Issues
```bash
# Format all files
pnpm format

# Or just format staged files
npx lint-staged
```

#### Test Failures
```bash
# Run tests to see failures
pnpm test

# Run in watch mode
pnpm test -- --watch

# Fix test file issues
```

---

## ⚙️ CONFIGURATION FILES

### `.eslintrc.json`
- ESLint rules for code quality
- Supports React, React Native, TypeScript
- Extends Prettier config to prevent conflicts

### `.prettierrc.json`
- Code formatting standards
- Consistent style across all platforms
- Works with ESLint

### `tsconfig.json`
- Strict TypeScript configuration
- Path aliases for clean imports
- Source maps for debugging

### `jest.config.js`
- Multi-project testing setup
- Coverage thresholds
- Test file patterns

### `pnpm-workspace.yaml`
- Monorepo package declarations
- Ensures all packages are linked

### `.husky/pre-commit`
- Git hook entry point
- Runs enhanced-pre-commit script

### `git-hooks/enhanced-pre-commit`
- Main validation logic
- Comprehensive checks and logging
- User-friendly error messages

---

## 🚀 CI/CD INTEGRATION

### GitHub Actions Workflows

All three app workflows include these pre-commit checks:

```yaml
- name: Setup pnpm
- name: Install dependencies
- name: Lint
  run: pnpm run lint
- name: Build
  run: pnpm run build
- name: Test
  run: pnpm run test
```

**Result**: Commits that pass local pre-commit hooks will also pass CI/CD pipeline.

---

## 📊 QUALITY METRICS

### What We Track

```
✅ Code Quality
  - ESLint violations: 0
  - TypeScript errors: 0
  - Prettier violations: 0

✅ Test Coverage
  - Lines: ≥70%
  - Branches: ≥70%
  - Functions: ≥70%
  - Statements: ≥70%

✅ Production Readiness
  - No security issues
  - No critical warnings
  - 100% lint compliance
```

---

## 🛠️ TROUBLESHOOTING

### "Pre-commit hook failed"

**Step 1**: Read the error message carefully
```bash
# It will tell you exactly what failed
# Example: "ESLint violations found"
```

**Step 2**: Run the corresponding fix command
```bash
pnpm lint -- --fix
pnpm format
pnpm test
```

**Step 3**: Try committing again
```bash
git commit -m "your message"
```

### "Husky hooks not running"

**Check if Husky is installed**:
```bash
ls -la .husky/
# Should show: pre-commit, post-commit, etc.
```

**Reinstall if needed**:
```bash
pnpm install
# This will run "prepare": "husky install"
```

### "My IDE isn't showing ESLint errors"

**Install ESLint Extension**:
- VS Code: "ESLint" by Microsoft
- WebStorm: Built-in ESLint support
- Other IDEs: Check marketplace

**Restart IDE** after installing extension

### "I need to commit without hooks"

⚠️ **Not Recommended** - But if absolutely necessary:
```bash
git commit --no-verify -m "your message"
```

⚠️ **Warning**: This bypasses ALL quality checks!

---

## 📚 BEST PRACTICES

### Do ✅
- ✅ Run `pnpm format` before committing
- ✅ Run `pnpm lint -- --fix` to auto-fix issues
- ✅ Run `pnpm test` before committing
- ✅ Use IDE's ESLint extension for real-time hints
- ✅ Follow the error messages provided
- ✅ Check the validation log if confused

### Don't ❌
- ❌ Don't use `--no-verify` for commits
- ❌ Don't ignore pre-commit errors
- ❌ Don't commit code with `any` types
- ❌ Don't leave console.log() in code
- ❌ Don't skip tests
- ❌ Don't disable linting rules without discussion

---

## 🔍 VALIDATION LOG

**Location**: `.cerebraflow/logs/pre-commit-validation.log`

**Contains**:
```
[2025-10-19 14:30:45] 🚀 Starting cerebral-mobile pre-commit validation
[2025-10-19 14:30:45] 📘 Running TypeScript validation...
[2025-10-19 14:30:46] ✅ TypeScript validation passed
[2025-10-19 14:30:46] 🔍 Running ESLint validation...
[2025-10-19 14:30:47] ✅ ESLint validation passed - 100% lint compliant
[2025-10-19 14:30:47] ✨ Checking Prettier formatting...
[2025-10-19 14:30:47] ✅ Prettier validation passed
[2025-10-19 14:30:47] ✅ All pre-commit validations passed!
```

**Check logs when**:
- Pre-commit failed
- You want detailed validation history
- Debugging validation issues

---

## 🎯 SUMMARY

| Guard Rail | Trigger | Purpose |
|-----------|---------|---------|
| **TypeScript** | Before commit | Catch type errors early |
| **ESLint** | Before commit | Enforce code standards |
| **Prettier** | Before commit | Consistent formatting |
| **Jest** | Before commit | Ensure tests pass |
| **File Checks** | Before commit | Prevent sensitive data |
| **Workspace Check** | Before commit | Monorepo integrity |
| **GitHub Actions** | On push | Verify in CI/CD |

---

## 📞 SUPPORT

**Questions?**
- Check this documentation first
- Review the error message from pre-commit
- Check `.cerebraflow/logs/pre-commit-validation.log`
- Ask the team for help

**All guardrails are designed to help, not hinder.**
They ensure we deliver production-quality code.

---

*Created: October 19, 2025*
*Part of**: Cerebral Platform Mobile Monorepo
*Version**: 1.0 (Enterprise-Grade)
