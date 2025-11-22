# Contributing to Cerebral

## Code Quality Standards

### Linting & Formatting

- **ESLint**: All code must pass linting checks
- **Prettier**: Automatic code formatting
- **Pre-commit Hooks**: Validation runs before each commit
- Commands: `npm run lint`, `npm run format`

### Testing Requirements

- Minimum **80% code coverage** required
- All new features must include tests
- Commands: `npm run test`, `npm run test:coverage`

### Commit Messages

- **Semantic Versioning**: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
- Example: `feat(auth): add two-factor authentication`
- Automatically generates CHANGELOG and version bumps

## Development Workflow

### 1. Setup Local Environment

```bash
# Clone repository
git clone https://github.com/baerautotech/[repo].git
cd [repo]

# Install dependencies
npm install

# Install pre-commit hooks
npm run prepare
```

### 2. Create Feature Branch

```bash
# Always branch from main
git checkout -b feat/feature-name
```

### 3. Development Cycle

```bash
# Lint code
npm run lint

# Run tests
npm run test

# Build for production
npm run build
```

### 4. Commit & Push

```bash
# Pre-commit hooks run automatically
# Commit with semantic message
git commit -m "feat(component): add new feature"

# Push to GitHub
git push origin feat/feature-name
```

### 5. Create Pull Request

- GitHub Actions automatically runs:
  - ✅ ESLint checks
  - ✅ Tests with coverage
  - ✅ Build verification
- Requires **2 approvals** before merge
- Semantic release creates automatic releases

## Shared GitHub Actions

All repos use **reusable GitHub Actions** for consistency:

- `build-image` - Docker build & push (Kaniko)
- `run-tests` - Jest test execution & coverage
- `run-linting` - ESLint/Prettier validation

See `.github/workflows/` for examples.

## Questions?

- 📖 Read [README.md](README.md)
- 📋 Check [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 🚀 See [DEPLOYMENT.md](docs/DEPLOYMENT.md)
- 💬 Open an issue on GitHub
