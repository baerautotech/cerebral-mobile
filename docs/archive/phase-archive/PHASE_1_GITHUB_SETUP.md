# 🔐 Phase 1 GitHub Setup Guide

**Status**: Phase 1 code is deployed. Now complete GitHub repository configuration.

**Estimated Time**: 20-30 minutes

---

## ✅ CODE CHANGES DEPLOYED

The following Phase 1 code changes have been committed and pushed to GitHub:

- ✅ `.github/actionlint.yaml` - Workflow syntax validation
- ✅ `.releaserc.js` - Semantic release configuration
- ✅ `.github/workflows/release.yml` - Automated release workflow
- ✅ Updated build workflows - Version tags on Docker images
- ✅ `CHANGELOG.md` - Changelog template
- ✅ `package.json` - Semantic-release dependencies added

**Next**: Configure GitHub repository settings

---

## 🔧 REQUIRED GITHUB CONFIGURATION

### Step 1: Configure Repository Secrets

**Location**: Settings > Secrets and variables > Actions

**Add these secrets**:

```
GITHUB_TOKEN              (already available by default)
NPM_TOKEN                 (use GITHUB_TOKEN as fallback)
```

**How to add**:

1. Go to https://github.com/baerautotech/cerebral-mobile/settings/secrets/actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Use your GitHub token (or leave empty, falls back to GITHUB_TOKEN)
5. Click "Add secret"

**Note**: `GITHUB_TOKEN` is automatically provided by GitHub Actions, no need to add manually.

---

### Step 2: Create GitHub Environments

**Location**: Settings > Environments

**Create 3 environments**:

#### 2a. `development` Environment

1. Go to https://github.com/baerautotech/cerebral-mobile/settings/environments
2. Click "New environment"
3. Name: `development`
4. Click "Configure environment"
5. **Deployment branches**: Allow deployments from `develop` branch
6. Click "Save protection rules"

**Secrets for this environment** (optional):

- Add any environment-specific variables

#### 2b. `staging` Environment

1. Click "New environment"
2. Name: `staging`
3. Click "Configure environment"
4. **Deployment branches**: Allow from `main` branch
5. **Require reviewers**: Uncheck (automatic)
6. Click "Save protection rules"

#### 2c. `production` Environment

1. Click "New environment"
2. Name: `production`
3. Click "Configure environment"
4. **Deployment branches**: Allow from `main` branch
5. **Required reviewers**: Check and add reviewers (optional)
6. **Restrict deployments**: Uncheck (optional)
7. Click "Save protection rules"

---

### Step 3: Enable Branch Protection Rules

**Location**: Settings > Branches

**Setup for `main` branch**:

1. Go to https://github.com/baerautotech/cerebral-mobile/settings/branches
2. Click "Add rule" under "Branch protection rules"
3. **Branch name pattern**: `main`
4. Click "Create"

**Configure the rule**:

Check these options:

- ✅ **Require a pull request before merging**
  - Require approvals: 1
  - Dismiss stale pull request approvals when new commits are pushed: ✓
  - Require review from code owners: ✗ (optional)

- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: ✓
  - Status checks that must pass:
    - `release` (from release.yml workflow)
    - `build` (from build workflows)

- ✅ **Require conversation resolution before merging**
  - Requires all conversations be resolved: ✓

- ✅ **Include administrators**
  - Enforce all the above rules for administrators: ✓

- ✅ **Restrict who can push to matching branches**
  - Add allowed users/teams (optional)

5. Click "Save changes"

---

## 🔄 WORKFLOW: How Semantic Versioning Works Now

### Release Flow

```
Developer commits with "feat: ..." or "fix: ..." message
        ↓
Push to main or develop branch
        ↓
GitHub Actions runs release.yml automatically
        ↓
semantic-release analyzes commits
        ↓
Determines version bump (patch/minor/major)
        ↓
Updates package.json files
        ↓
Updates CHANGELOG.md
        ↓
Creates git tag (v1.0.1, v1.1.0, etc.)
        ↓
Generates GitHub Release with notes
        ↓
Commits version changes
        ↓
Build workflows triggered with version tag
        ↓
Docker images tagged: cerebral/native:1.0.1
        ↓
✅ Release complete!
```

### Example Commits

```bash
# Patch release (1.0.0 → 1.0.1)
git commit -m "fix: incorrect battery calculation in wearable app"

# Minor release (1.0.0 → 1.1.0)
git commit -m "feat(native): add push notification support"

# Major release (1.0.0 → 2.0.0)
git commit -m "feat!: complete redesign of UI components

BREAKING CHANGE: Old component API no longer supported"
```

---

## ✅ VERIFICATION CHECKLIST

After completing the GitHub setup:

- [ ] Repository secrets configured (GITHUB_TOKEN, NPM_TOKEN)
- [ ] Three environments created (development, staging, production)
- [ ] Branch protection rules enabled on `main`
- [ ] Status checks required (release, build workflows)
- [ ] Pull request reviews required (1 approval)
- [ ] Stale PR approvals dismissed on new commits
- [ ] Admin enforcement enabled

---

## 🚀 TEST THE RELEASE WORKFLOW

### Option 1: Trigger Release Manually

```bash
gh workflow run release.yml --repo baerautotech/cerebral-mobile --ref main
```

### Option 2: Make a Test Commit

```bash
# Create test branch
git checkout -b test/release-workflow

# Make a test commit
echo "# Test Release" >> docs/test.md
git add docs/test.md
git commit -m "docs: test release workflow"

# Create pull request
gh pr create --title "test: verify release workflow" --body "Testing semantic versioning"

# After merge to main, release workflow triggers automatically
```

### Option 3: Check Workflow Runs

```bash
# List recent workflow runs
gh run list --repo baerautotech/cerebral-mobile

# Watch release workflow
gh run watch --repo baerautotech/cerebral-mobile
```

---

## 📊 WHAT TO EXPECT AFTER CONFIGURATION

### When you commit with "feat: ..." message:

```
✅ Release workflow runs automatically
✅ Version bumped (1.0.0 → 1.1.0)
✅ CHANGELOG.md updated
✅ Git tag created (v1.1.0)
✅ GitHub Release created with notes
✅ Docker images tagged (cerebral/native:1.1.0, cerebral/native:latest)
✅ All three apps versioned consistently
```

### When you commit with "fix: ..." message:

```
✅ Release workflow runs automatically
✅ Version bumped (1.1.0 → 1.1.1)
✅ CHANGELOG.md updated
✅ Git tag created (v1.1.1)
✅ GitHub Release created
✅ Docker images tagged (cerebral/native:1.1.1, cerebral/native:latest)
```

---

## 🆘 TROUBLESHOOTING

### Workflow not triggering?

**Check**:

1. Verify secrets are configured: Settings > Secrets
2. Verify environments exist: Settings > Environments
3. Check branch protection rules: Settings > Branches
4. Run: `gh run list --repo baerautotech/cerebral-mobile`

### Release failed?

**Check logs**:

```bash
gh run view --repo baerautotech/cerebral-mobile <run-id> --log
```

### Version not bumping?

**Verify commit message format**:

- Must start with `feat:` or `fix:` or `BREAKING CHANGE:`
- Example: `feat(native): add push notifications`
- NOT: `Feature: add push notifications` (wrong format!)

### Docker images not tagged with version?

**Check**:

1. Verify `.releaserc.js` is in repo
2. Verify build workflows use `${{ steps.version.outputs.version }}`
3. Run: `docker image ls` to see current tags

---

## 📝 FINAL CHECKLIST

### Before committing code with "feat:" message:

- [ ] Semantic-release dependencies installed (`pnpm install`)
- [ ] Repository secrets configured
- [ ] GitHub environments created (3 total)
- [ ] Branch protection rules enabled
- [ ] Can see `release.yml` in Actions tab
- [ ] Can see updated build workflows

### After first "feat:" commit:

- [ ] Workflow runs automatically
- [ ] CHANGELOG.md updated with new version
- [ ] Git tag created (check GitHub Releases)
- [ ] Docker images tagged with version
- [ ] Version bumped in all package.json files

---

## 🎊 SUCCESS!

Once this checklist is complete, **Phase 1 is DONE**! 🎉

Your repository now has:

✅ Semantic versioning automation
✅ Release workflow
✅ Version-tagged Docker images
✅ Changelog generation
✅ GitHub environments for deployments
✅ Branch protection on main

**Next**: Phase 2 - High Priority Workflows (AutoDoc, Image validation, K8s validation, Security scanning)

---

_Phase 1 GitHub Setup Guide - October 19, 2025_
