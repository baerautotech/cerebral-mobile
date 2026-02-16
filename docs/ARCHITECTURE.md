# Mobile Monorepo Architecture

**Version**: 2.0
**Platform**: React Native + React Web
**Status**: Production
**Last Updated**: October 2025

---

## 📦 Workspace Overview

Cerebral Mobile is a **pnpm monorepo** containing three platform-specific applications and two shared packages. This architecture enables code sharing across platforms while maintaining platform-specific optimizations and native capabilities.

### Applications & Packages

| Package                     | Type   | Platform       | Technology               |
| --------------------------- | ------ | -------------- | ------------------------ |
| **@cerebral/core**          | Shared | All            | TypeScript, React Native |
| **@cerebral/design-system** | Shared | All            | TypeScript, React        |
| **cerebral-native**         | App    | iOS/Android    | React Native             |
| **cerebral-wearable**       | App    | WearOS/watchOS | React Native Wearable    |
| **cerebral-tablet**         | App    | Web            | React + Tailwind         |

---

## 🏗️ Workspace Structure

```
cerebral-mobile/
│
├── packages/
│   │
│   ├── core/
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   ├── client.ts         # API client
│   │   │   │   ├── endpoints.ts      # Endpoint definitions
│   │   │   │   └── interceptors.ts   # Request/response handlers
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── user.ts
│   │   │   │   ├── task.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useApi.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useTasks.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── store/
│   │   │   │   ├── authStore.ts     # Zustand store
│   │   │   │   ├── taskStore.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── utils/
│   │   │       ├── validation.ts
│   │   │       ├── formatting.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── design-system/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Button/
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Button.web.tsx
│       │   │   │   └── index.ts
│       │   │   │
│       │   │   ├── Card/
│       │   │   ├── Input/
│       │   │   ├── Modal/
│       │   │   └── index.ts
│       │   │
│       │   ├── theme/
│       │   │   ├── colors.ts
│       │   │   ├── typography.ts
│       │   │   └── index.ts
│       │   │
│       │   └── styles/
│       │       ├── global.css
│       │       └── utilities.ts
│       │
│       ├── package.json
│       └── tsconfig.json
│
├── apps/
│   │
│   ├── native/
│   │   ├── src/
│   │   │   ├── components/     # App-specific components
│   │   │   ├── screens/        # Screen components
│   │   │   ├── navigation/     # React Navigation
│   │   │   ├── utils/          # App utilities
│   │   │   └── App.tsx         # Entry point
│   │   │
│   │   ├── ios/
│   │   │   ├── Cerebral/
│   │   │   │   ├── Info.plist
│   │   │   │   ├── LaunchScreen.storyboard
│   │   │   │   └── ...native files...
│   │   │   └── Podfile
│   │   │
│   │   ├── android/
│   │   │   ├── app/
│   │   │   │   └── src/
│   │   │   │       └── main/
│   │   │   │           ├── AndroidManifest.xml
│   │   │   │           └── java/
│   │   │   ├── build.gradle
│   │   │   └── gradle.properties
│   │   │
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── wearable/
│   │   ├── src/
│   │   │   ├── components/     # Wearable-specific components
│   │   │   ├── screens/        # Wearable screens
│   │   │   └── App.tsx
│   │   │
│   │   ├── wearos/             # Android Wear
│   │   │   └── AndroidManifest.xml
│   │   │
│   │   ├── watchos/            # Apple Watch
│   │   │   └── Info.plist
│   │   │
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── tablet/
│       ├── src/
│       │   ├── components/     # Web-specific components
│       │   ├── pages/          # Next.js-style pages
│       │   ├── layouts/        # Page layouts
│       │   └── App.tsx
│       │
│       ├── public/
│       │   ├── index.html
│       │   └── favicon.ico
│       │
│       ├── package.json
│       └── Dockerfile
│
├── .github/
│   └── workflows/
│       ├── native-build.yml
│       ├── wearable-build.yml
│       ├── tablet-build.yml
│       └── shared-lint.yml
│
├── pnpm-workspace.yaml         # Workspace config
├── package.json                # Root package
├── tsconfig.json               # Root TypeScript config
├── .eslintrc.json
├── .prettierrc.json
└── README.md
```

---

## 📱 Applications

### 1. **cerebral-native** (iOS/Android)

**Target Platforms**: Apple iOS, Google Android

**Technology Stack**:

- React Native 0.74+
- TypeScript 5.5+
- React Navigation 6+
- Zustand for state management

**Key Features**:

- Native modules for performance-critical operations
- Platform-specific UI components (TabBar, etc.)
- Background task execution via Detox
- Push notifications (Firebase Cloud Messaging)

**Directory Structure**:

```
apps/native/
├── ios/              # Xcode project
├── android/          # Gradle project
├── src/
│   ├── screens/      # iOS/Android-specific screens
│   ├── components/   # Native components
│   └── App.tsx       # React Native entry
```

**Build Process**:

```bash
# Development
npm run dev -F cerebral-native

# iOS
npm run ios              # Runs on iOS simulator
npm run ios:prod         # Production build

# Android
npm run android          # Runs on Android emulator
npm run android:prod     # Production build
```

---

### 2. **cerebral-wearable** (WearOS/watchOS)

**Target Platforms**: Android WearOS, Apple watchOS

**Technology Stack**:

- React Native Wearable
- TypeScript 5.5+
- Minimal UI for watch screens

**Key Features**:

- Compact interfaces optimized for small screens
- Watchface complications and widgets
- Background task synchronization
- Limited battery usage

**Directory Structure**:

```
apps/wearable/
├── wearos/           # Android Wear specific
├── watchos/          # Apple Watch specific
├── src/
│   ├── screens/      # Wearable screens
│   └── components/   # Compact components
```

**Build Process**:

```bash
# WearOS
npm run wearable:android

# watchOS
npm run wearable:ios
```

---

### 3. **cerebral-tablet** (Responsive Web)

**Target Platforms**: Web Browsers (desktop, tablet)

**Technology Stack**:

- React 18.3+
- TypeScript 5.5+
- Next.js 14+ (or equivalent)
- Tailwind CSS 3.3+

**Key Features**:

- Responsive design (tablet-optimized)
- Progressive Web App (PWA) support
- Offline-first with service workers
- Touch-optimized UI

**Directory Structure**:

```
apps/tablet/
├── public/           # Static assets
├── src/
│   ├── pages/        # Next.js pages
│   ├── components/   # Web components
│   ├── layouts/      # Page layouts
│   └── styles/       # Global styles
└── next.config.js    # Next.js config
```

**Build Process**:

```bash
# Development
npm run dev -F cerebral-tablet

# Production
npm run build -F cerebral-tablet
npm run start -F cerebral-tablet
```

---

## 📦 Shared Packages

### 1. **@cerebral/core** - Business Logic

**Purpose**: Shared business logic, API clients, state management, and custom hooks

**Exports**:

```typescript
// API Client
export { ApiClient, createApiClient } from './api/client';
export type { ApiConfig, ApiResponse } from './api/client';

// Models
export type { User, Task, Project } from './models';

// Hooks
export { useApi, useAuth, useTasks, useUser } from './hooks';

// Store
export { useAuthStore, useTaskStore } from './store';

// Utilities
export { validateEmail, formatDate, parseError } from './utils';
```

**Usage**:

```typescript
// In any app
import { useApi, useTasks } from '@cerebral/core';

const MyComponent = () => {
  const api = useApi();
  const { tasks, loading } = useTasks();

  return <div>{tasks.map(t => <p key={t.id}>{t.title}</p>)}</div>;
};
```

**Dependencies**:

- axios (HTTP client)
- zustand (state management)
- zod (validation)

---

### 2. **@cerebral/design-system** - UI Components

**Purpose**: Reusable UI components, themes, and styling utilities

**Components**:

| Component  | Platforms  | Notes                                 |
| ---------- | ---------- | ------------------------------------- |
| Button     | All        | Primary, secondary, tertiary variants |
| Card       | All        | Container component                   |
| Input      | All        | Text input with validation            |
| Modal      | All        | Dialog/Alert modals                   |
| Toast      | All        | Notification toasts                   |
| Navigation | Native     | Tab navigator                         |
| Tabs       | Web/Tablet | Web-specific tabs                     |

**Usage**:

```typescript
// In any app
import { Button, Card, Input, theme } from '@cerebral/design-system';

const MyComponent = () => (
  <Card>
    <Input placeholder="Enter text" />
    <Button variant="primary">Submit</Button>
  </Card>
);
```

**Theme System**:

```typescript
// colors.ts
export const colors = {
  primary: '#007AFF',
  secondary: '#5AC8FA',
  success: '#4CD964',
  error: '#FF3B30',
  text: '#000000',
  background: '#FFFFFF',
};

// typography.ts
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
};
```

**Platform-Specific Components**:

```typescript
// components/Button/Button.tsx - Cross-platform implementation
import { Platform } from 'react-native';

export const Button = (props) => {
  if (Platform.OS === 'web') {
    return <ButtonWeb {...props} />;
  }
  return <ButtonNative {...props} />;
};

// OR use filename patterns
// Button.tsx - Default/shared
// Button.web.tsx - Web-specific
// Button.native.tsx - Native-specific
```

---

## 🔄 Dependency Management

### Workspace References

All apps reference shared packages using `workspace:*`:

```json
{
  "dependencies": {
    "@cerebral/core": "workspace:*",
    "@cerebral/design-system": "workspace:*"
  }
}
```

### Shared Dependencies

To avoid duplication, common dependencies are specified in root `package.json`:

```json
{
  "dependencies": {
    "react": "18.3.1",
    "react-native": "0.74.0",
    "axios": "1.7.0",
    "zustand": "4.5.0",
    "zod": "3.22.0"
  },
  "devDependencies": {
    "typescript": "5.5.0",
    "eslint": "9.0.0",
    "prettier": "3.3.0",
    "jest": "29.7.0"
  }
}
```

### Installation & Updates

```bash
# Install dependencies for all packages
pnpm install

# Add dependency to specific package
pnpm add axios -F cerebral-native

# Add dev dependency
pnpm add -D @types/node -F @cerebral/core

# Update all packages
pnpm update

# Clean reinstall
pnpm clean
pnpm install
```

---

## 🚀 Build & Deployment

### Development Workflow

```bash
# Start all dev servers
pnpm dev

# Start specific app
pnpm dev -F cerebral-native
pnpm dev -F cerebral-wearable
pnpm dev -F cerebral-tablet
```

### Production Builds

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build -F cerebral-native
pnpm build -F cerebral-tablet
```

### CI/CD Workflows

Each app has its own GitHub Actions workflow:

| Workflow               | Trigger      | Steps                                      |
| ---------------------- | ------------ | ------------------------------------------ |
| **native-build.yml**   | Push to main | Lint, Test, Build (iOS+Android), Upload    |
| **wearable-build.yml** | Push to main | Lint, Test, Build (WearOS+watchOS), Upload |
| **tablet-build.yml**   | Push to main | Lint, Test, Build, Push to registry        |

**Build Output**:

- Native: APK/AAB (Android), IPA (iOS)
- Wearable: APK (WearOS), IPA (watchOS)
- Tablet: Docker image → Registry

---

## 🔄 State Management

### Zustand Stores

```typescript
// store/authStore.ts
import create from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    set({ user: response.user, isAuthenticated: true });
  },

  logout: () => set({ user: null, isAuthenticated: false }),
}));

// Usage
const { user, login } = useAuthStore();
```

### Comparison: Redux vs Zustand

| Feature        | Redux Toolkit       | Zustand              |
| -------------- | ------------------- | -------------------- |
| Boilerplate    | More                | Less                 |
| DevTools       | Excellent           | Good                 |
| Bundle Size    | Larger              | Smaller              |
| Learning Curve | Steeper             | Gentler              |
| Scalability    | Best for large apps | Good for medium apps |

**Decision**: Zustand chosen for monorepo due to smaller bundle size and simpler API.

---

## 🎨 Design System

### Theme Usage

```typescript
import { theme } from '@cerebral/design-system';

const MyComponent = () => (
  <div style={{
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.base
  }}>
    Hello World
  </div>
);
```

### Component Variants

```typescript
// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="tertiary">Tertiary</Button>

// Sizes
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
```

---

## 🧪 Testing Strategy

### Test Structure

```
__tests__/
├── unit/              # Unit tests
│   ├── hooks/
│   ├── utils/
│   └── models/
├── integration/       # Integration tests
│   ├── api/
│   └── flows/
└── e2e/              # End-to-end tests
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific package
pnpm test -F cerebral-native

# Run with coverage
pnpm test -- --coverage

# Watch mode
pnpm test -- --watch
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  projects: [
    '<rootDir>/packages/core/jest.config.js',
    '<rootDir>/packages/design-system/jest.config.js',
    '<rootDir>/apps/native/jest.config.js',
    '<rootDir>/apps/tablet/jest.config.js',
  ],
};
```

---

## 🔐 Security

### API Authentication

```typescript
// All requests include Bearer token
import { useAuthStore } from '@cerebral/core';

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Secrets Management

- Store API keys in environment variables
- Use `.env` files (not in git)
- Sealed Secrets for CI/CD

### Input Validation

```typescript
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
});

type CreateTaskInput = z.infer<typeof createTaskSchema>;
```

---

## 📊 Linting & Formatting

### ESLint Configuration

```bash
# Lint all code
pnpm lint

# Fix issues automatically
pnpm lint:fix
```

### Prettier Formatting

```bash
# Format all code
pnpm format

# Check formatting
pnpm format:check
```

---

## 🚨 Error Handling

### Global Error Handler

```typescript
// utils/errorHandler.ts
export const handleError = (error: any) => {
  if (axios.isAxiosError(error)) {
    return {
      code: error.response?.status,
      message: error.response?.data?.message,
    };
  }
  return { code: 500, message: 'Unknown error' };
};
```

### Error Toast Display

```typescript
import { useToast } from '@cerebral/design-system';

const MyComponent = () => {
  const toast = useToast();

  const handleAction = async () => {
    try {
      await api.post('/data');
    } catch (error) {
      toast.show({ message: 'Error occurred', type: 'error' });
    }
  };
};
```

---

## 📚 Development Guidelines

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and test
pnpm lint
pnpm test

# Commit
git commit -m "feat: Add new feature"

# Push and create PR
git push origin feature/my-feature
```

### Commit Conventions

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Test additions
- `chore:` Build/tooling
- `refactor:` Code refactoring

---

## 🚀 Performance Optimization

### Bundle Size

```bash
# Analyze bundle
pnpm build -- --analyze

# Target: < 500KB for native, < 300KB for tablet
```

### Runtime Performance

- Memoize expensive components
- Use lazy loading for screens
- Optimize image assets
- Profile with React DevTools

---

## 📞 Troubleshooting

### Common Issues

**Issue**: Dependency conflicts

```bash
pnpm clean
pnpm install
```

**Issue**: Build fails

```bash
pnpm lint:fix
pnpm format
pnpm build
```

**Issue**: Module not found

```bash
# Check tsconfig.json path aliases
# Verify package.json exports
# Restart dev server
```

---

## 🔗 Related Documentation

- [API Reference](../docs/API_REFERENCE.md) - Backend API
- [Performance Tuning](./PERFORMANCE_TUNING.md) - Optimization guide
- [Contributing](../CONTRIBUTING.md) - Development guidelines
- [README](./README.md) - Quick start

---

**Status**: ✅ Production Ready
**Last Updated**: October 19, 2025
**Maintained By**: Cerebral Mobile Team
