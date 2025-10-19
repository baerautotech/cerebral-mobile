# 📱 Cerebral Mobile - React Native Monorepo

**Production-ready monorepo** for Cerebral's mobile, wearable, and tablet applications using React Native, React, and a shared component library.

## 🎯 Overview

This monorepo contains three client applications and two shared packages:

### 📦 Shared Packages

- **`@cerebral/core`** - Business logic, API client, state management, hooks
- **`@cerebral/design-system`** - Reusable UI components, themes, and styling

### 📱 Applications

- **`cerebral-native`** - Native iOS/Android app (React Native)
- **`cerebral-wearable`** - WearOS & watchOS apps (React Native)
- **`cerebral-tablet`** - Tablet-optimized responsive web app (React)

---

## 🏗️ Monorepo Structure

```
cerebral-mobile/
├── packages/
│   ├── core/                    # Shared business logic
│   │   ├── src/
│   │   │   ├── api/            # API client and services
│   │   │   ├── models/         # Data models and types
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── store/          # State management
│   │   │   └── utils/          # Utility functions
│   │   └── package.json
│   │
│   └── design-system/          # Shared UI components
│       ├── src/
│       │   ├── components/     # Reusable components
│       │   ├── theme/          # Theme definitions
│       │   └── styles/         # Global styles
│       └── package.json
│
├── apps/
│   ├── native/                 # iOS/Android app
│   │   ├── ios/
│   │   ├── android/
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── wearable/               # WearOS/watchOS app
│   │   ├── wearos/
│   │   ├── watchos/
│   │   ├── src/
│   │   └── package.json
│   │
│   └── tablet/                 # Web app for tablets
│       ├── src/
│       └── package.json
│
├── .github/
│   └── workflows/
│       ├── native-build.yml
│       ├── wearable-build.yml
│       └── tablet-build.yml
│
├── pnpm-workspace.yaml         # pnpm workspaces config
├── package.json                # Root package
├── tsconfig.json               # TypeScript config
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 9.0.0 (or run `npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone https://github.com/baerautotech/cerebral-mobile.git
cd cerebral-mobile

# Install dependencies (pnpm monorepo)
pnpm install
```

### Development

```bash
# Start development servers for all apps
pnpm dev

# Or run a specific app
pnpm dev -F cerebral-native
pnpm dev -F cerebral-wearable
pnpm dev -F cerebral-tablet
```

### Building

```bash
# Build all apps
pnpm build

# Build a specific app
pnpm build -F cerebral-native
pnpm build -F cerebral-wearable
pnpm build -F cerebral-tablet
```

### Testing

```bash
# Run tests for all packages
pnpm test

# Run tests for a specific package
pnpm test -F @cerebral/core
```

### Linting & Formatting

```bash
# Lint all code
pnpm lint

# Format code with Prettier
pnpm format
```

---

## 📦 Working with Packages

### Using Shared Packages in Apps

All apps have access to the shared packages through workspace references:

```json
{
  "dependencies": {
    "@cerebral/core": "workspace:*",
    "@cerebral/design-system": "workspace:*"
  }
}
```

### Importing from Shared Packages

```typescript
// From @cerebral/core
import { useApi, getUser } from '@cerebral/core/hooks';
import { ApiClient } from '@cerebral/core/api';
import type { User } from '@cerebral/core/models';

// From @cerebral/design-system
import { Button, Card, Input } from '@cerebral/design-system/components';
import { theme } from '@cerebral/design-system/theme';
```

---

## 🔄 CI/CD Workflows

### Automated Builds

Each app has its own GitHub Actions workflow:

- **`native-build.yml`** - Builds on macOS (iOS/Android support)
- **`wearable-build.yml`** - Builds on macOS (WearOS/watchOS support)
- **`tablet-build.yml`** - Builds on Ubuntu (web platform)

### Container Builds

All apps are automatically containerized using Kaniko and pushed to the registry:

```
registry.dev.cerebral.baerautotech.com/cerebral/native:SHA256_DIGEST
registry.dev.cerebral.baerautotech.com/cerebral/wearable:SHA256_DIGEST
registry.dev.cerebral.baerautotech.com/cerebral/tablet:SHA256_DIGEST
```

---

## 🎨 Design System Usage

### Theme Integration

```typescript
import { theme } from '@cerebral/design-system/theme';

const MyComponent = () => (
  <View style={{ backgroundColor: theme.colors.primary }}>
    <Text style={{ fontSize: theme.typography.sizes.lg }}>Hello</Text>
  </View>
);
```

### Component Library

Pre-built components available:

- `Button` - Primary, secondary, tertiary variants
- `Card` - Container with styling
- `Input` - Text and specialized inputs
- `Navigation` - Navigation components
- And more...

---

## 🛠️ Development Workflow

### Adding a New Feature

1. **Decide where it belongs**:
   - Shared logic → `packages/core`
   - UI component → `packages/design-system`
   - App-specific → `apps/*/src`

2. **Develop and test**:
   ```bash
   pnpm dev -F <package-or-app>
   pnpm test -F <package-or-app>
   ```

3. **Lint and format**:
   ```bash
   pnpm lint
   pnpm format
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: description"
   git push
   ```

5. **CI/CD workflows run automatically** on push

---

## 📝 TypeScript Configuration

The monorepo uses strict TypeScript configuration for type safety:

- Strict mode enabled
- No implicit any
- Proper null checking
- Module resolution via path aliases

Path aliases available:
```json
{
  "@cerebral/core": "packages/core/src",
  "@cerebral/design-system": "packages/design-system/src"
}
```

---

## 🧪 Testing

All packages include Jest configuration:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run with coverage
pnpm test --coverage
```

---

## 📚 Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Detailed development guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture decisions
- **[.github/workflows/](./github/workflows/)** - CI/CD workflow details

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

All PRs must:
- Pass linting and formatting
- Have tests
- Pass CI/CD checks
- Get reviewed before merging

---

## 📊 Project Dependencies

### Production Dependencies
- `react` (18.3+)
- `react-native` (0.74+)
- `react-dom` (18.3+)
- `axios` (1.7+)
- `zustand` (4.5+)

### Development Dependencies
- `typescript` (5.5+)
- `eslint` (9+)
- `prettier` (3+)
- `jest` (29+)

---

## 🚀 Deployment

### Native App Deployment

**iOS**:
```bash
cd apps/native/ios
pod install
cd ..
xcode-select --install  # if needed
pnpm run ios
```

**Android**:
```bash
# Configure Android environment first
cd apps/native
pnpm run android
```

### Wearable Deployment

Similar process for WearOS and watchOS platforms

### Tablet Web Deployment

```bash
pnpm build -F cerebral-tablet
# Built files in apps/tablet/dist/
# Deploy to web server or use Docker image
```

---

## 🐛 Troubleshooting

### Issue: Dependency conflicts

**Solution**: Clear and reinstall
```bash
pnpm clean
pnpm install
```

### Issue: Module not found

**Solution**: Check path aliases in `tsconfig.json` and ensure package exists

### Issue: Build fails

**Solution**: Run linter and formatter first
```bash
pnpm lint
pnpm format
pnpm build
```

---

## 📞 Support

For issues or questions:
1. Check existing issues on GitHub
2. Review documentation in `/docs`
3. Open a new issue with detailed information

---

## 📄 License

Proprietary - Baer AutoTech

---

## 🎉 Created by

**Cerebral Agent** - October 19, 2025
**Part of**: Cerebral Platform Restructuring (Phase 4)

---

**Status**: ✅ Production Ready  
**Last Updated**: October 19, 2025
