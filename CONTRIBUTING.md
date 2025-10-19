# Contributing to Cerebral Platform

Thank you for your interest in contributing! This document outlines our development practices and standards.

## 🎯 Commit Message Convention

We use semantic commit messages to automatically manage versioning and changelogs. Every commit message should follow this format:

```
<type>(<scope>): <subject>
<blank line>
<body>
<blank line>
<footer>
```

### Commit Types

- **feat**: A new feature (triggers MINOR version bump)
- **fix**: A bug fix (triggers PATCH version bump)
- **docs**: Documentation changes only
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build, dependencies, or tooling changes
- **ci**: CI/CD configuration changes

### Breaking Changes

If your commit introduces a breaking change, add `BREAKING CHANGE:` in the footer:

```
feat: redesign authentication flow

BREAKING CHANGE: Session tokens are no longer accepted. Use JWT tokens instead.
```

This triggers a MAJOR version bump.

### Examples

Good commits:
```
feat(auth): add JWT token validation
fix(api): resolve race condition in data sync
docs(readme): add deployment instructions
test(mobile): add unit tests for Swift models
```

## 🏗️ Development Workflow

### Before Committing

1. **Run pre-commit checks** (automatic)
   - Code linting
   - Format checking
   - Tests
   - Language-specific validations

2. **Fix any issues**
   ```bash
   # Auto-fix formatting
   # Language-specific commands:
   pnpm format              # JavaScript/TypeScript
   black .                  # Python
   swiftformat .            # Swift
   ktlint -F                # Kotlin
   ```

3. **Stage your changes**
   ```bash
   git add <files>
   ```

4. **Commit with semantic message**
   ```bash
   git commit -m "feat(component): add new feature"
   ```

### Automated Checks

Your commit will automatically trigger:

| Language | Checks |
|----------|--------|
| **Python** | pylint, black, pytest |
| **JavaScript/TypeScript** | eslint, prettier, jest, tsc |
| **React/Next.js** | eslint, prettier, jest, tsc |
| **Swift** | swiftlint, swiftformat |
| **Kotlin** | ktlint |
| **Rust** | cargo check, clippy, rustfmt |
| **Java** | checkstyle, maven/gradle |

## 📋 Pull Request Process

1. **Create feature branch** from `develop` or `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit with semantic messages

3. **Create Pull Request** with:
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes

4. **Ensure CI passes** (all checks must be green)

5. **Get code review approval**

6. **Merge** when approved

## 🔄 Release Process

Releases happen automatically:

- Push to `main` → Automated release creation
- Commits are analyzed for semantic meaning
- Version number auto-incremented
- CHANGELOG.md automatically updated
- GitHub release created with notes
- Docker images tagged with version

## 🛠️ Development Tools

### Python Projects

```bash
pip install pylint black pytest
```

### JavaScript/TypeScript Projects

```bash
pnpm install
pnpm run test      # Run tests
pnpm run lint      # Run linter
pnpm run format    # Auto-format code
```

### Swift Projects

```bash
brew install swiftlint swiftformat
swift build        # Build
swift test         # Run tests
```

### Kotlin Projects

```bash
brew install ktlint  # macOS
# or appropriate package manager for your OS
```

### Rust Projects

```bash
# Built into Rust toolchain
cargo test         # Run tests
cargo clippy       # Check for warnings
```

## 📚 Code Standards

### Universal Standards (All Languages)

- ✅ One commit = one logical change
- ✅ Use semantic commit messages
- ✅ All tests must pass locally before pushing
- ✅ Use meaningful variable/function names
- ✅ Document complex logic with comments
- ✅ No console.log/print statements in production code

### Python

- Follow PEP 8
- Use type hints
- Black for formatting
- Pylint for linting

### JavaScript/TypeScript

- Use const/let (never var)
- Use arrow functions
- Use strict equality (===)
- ESLint + Prettier automatically enforce

### Swift

- Follow Apple style guide
- Use type inference
- SwiftLint automatically enforces
- Use MARK: comments for organization

### Kotlin

- Follow Kotlin style guide
- Use data classes
- Ktlint automatically enforces

## ❓ Questions?

- Check existing issues and discussions
- Read language-specific documentation
- Check CI logs for detailed error information

---

**Last Updated**: October 2025
**Enforced By**: Husky Pre-Commit Hooks
**Automatic Release**: Semantic Release
