# Frontend File Structure Guidelines

**Date**: October 10, 2025
**Status**: 🔒 **ENFORCED**
**Compliance**: Enterprise-grade organization

---

## 📁 **Mandatory Structure**

```
frontend-react-native/
├── src/
│   ├── screens/           # Full-page components ONLY
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   ├── LoginScreen.test.tsx
│   │   │   └── index.ts
│   │   ├── Dashboard/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── components/     # Screen-specific components
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── components/        # Reusable components
│   │   ├── ui/            # Base UI library
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Button.styles.ts
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   └── index.ts
│   │   ├── forms/         # Form components
│   │   ├── layouts/       # Layout components
│   │   └── index.ts
│   │
│   ├── services/          # Business logic, API clients
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── tasks.ts
│   │   │   ├── client.ts
│   │   │   └── index.ts
│   │   ├── supabase.ts
│   │   └── index.ts
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useDebounce.ts
│   │   └── index.ts
│   │
│   ├── context/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── index.ts
│   │
│   ├── navigation/        # React Navigation
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── AppNavigator.tsx
│   │   └── index.ts
│   │
│   ├── types/             # TypeScript definitions
│   │   ├── api.ts
│   │   ├── models.ts
│   │   ├── navigation.ts
│   │   └── index.ts
│   │
│   ├── utils/             # Utility functions
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   ├── platform.ts
│   │   └── index.ts
│   │
│   ├── constants/         # App constants
│   │   ├── colors.ts
│   │   ├── config.ts
│   │   ├── api.ts
│   │   └── index.ts
│   │
│   └── assets/            # Static assets
│       ├── images/
│       ├── fonts/
│       └── index.ts
│
├── __tests__/             # Tests (mirrors src/)
│   ├── screens/
│   ├── components/
│   └── services/
│
├── web/                   # Web-specific files
│   ├── index.html
│   └── webpack.config.js
│
├── android/               # Android native
├── ios/                   # iOS native
└── web-build/             # Generated (gitignored)
```

---

## 🚫 **Forbidden Patterns**

### **❌ NO Flat Structure**:
```
src/
  ├── LoginScreen.tsx          ❌
  ├── DashboardScreen.tsx      ❌
  ├── Button.tsx               ❌
  └── authService.ts           ❌
```

### **❌ NO Mixed Concerns**:
```
src/components/
  ├── LoginForm.tsx            ❌ (Should be in screens/Auth/)
  ├── apiClient.ts             ❌ (Should be in services/)
  └── useAuth.ts               ❌ (Should be in hooks/)
```

### **❌ NO Deep Nesting** (Max 3 levels):
```
src/screens/Dashboard/components/widgets/charts/types.ts  ❌ TOO DEEP
src/screens/Dashboard/components/ChartWidget.tsx          ✅ GOOD
```

---

## ✅ **Naming Conventions**

### **Files**:
```typescript
// Components: PascalCase.tsx
LoginScreen.tsx           ✅
Button.tsx                ✅
login-screen.tsx          ❌
button.tsx                ❌

// Utilities: camelCase.ts
validation.ts             ✅
formatting.ts             ✅
ValidationUtils.ts        ❌

// Types: camelCase.ts or PascalCase.ts
api.ts                    ✅
models.ts                 ✅
ApiTypes.ts               ✅ (also acceptable)

// Tests: *.test.tsx
LoginScreen.test.tsx      ✅
login.test.tsx            ❌
test-login.tsx            ❌
```

### **Exports**:
```typescript
// Named exports preferred
export const LoginScreen = () => {}      ✅
export default LoginScreen;              ✅ (also okay)
export default () => {}                  ❌ (anonymous)

// index.ts files
export { LoginScreen } from './LoginScreen';     ✅
export { SignupScreen } from './SignupScreen';   ✅
export * from './LoginScreen';                   ❌ (too implicit)
```

---

## 📏 **Size Limits** (Enforced by ESLint)

```
✅ Max 300 lines per file
✅ Max 50 lines per function
✅ Max 10 cyclomatic complexity
✅ Max 4 function parameters
✅ Max 4 nesting depth
✅ Max 3 callback nesting
```

**If you exceed**: Split into smaller files/functions

---

## 🎨 **Component Patterns**

### **1. Component File** (LoginScreen.tsx):
```typescript
/**
 * LoginScreen - User authentication interface
 *
 * @component
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { LoginScreenProps } from './types';

export const LoginScreen: React.FC<LoginScreenProps> = (props) => {
  // Component logic
  return <View style={styles.container}>{/* ... */}</View>;
};

const styles = StyleSheet.create({
  container: { flex: 1 }
});
```

### **2. Types File** (types.ts):
```typescript
export interface LoginScreenProps {
  onLoginSuccess: () => void;
  onSignupPress?: () => void;
}

export interface LoginFormData {
  email: string;
  password: string;
}
```

### **3. Index File** (index.ts):
```typescript
export { LoginScreen } from './LoginScreen';
export type { LoginScreenProps, LoginFormData } from './types';
```

---

## 🔐 **Security Standards**

### **Required**:
```typescript
// ✅ NO hardcoded secrets
const API_KEY = process.env.REACT_APP_API_KEY;  ✅
const API_KEY = 'sk-1234567890';                ❌

// ✅ NO eval or dangerous patterns
eval(userInput);                                ❌
new Function(userInput);                        ❌

// ✅ Validate user input
const email = sanitizeInput(userInput);         ✅
const email = userInput;                        ❌

// ✅ Use secure dependencies
npm audit --audit-level=high                    (must pass)
```

---

## 📊 **Quality Metrics**

### **Required Thresholds**:
```json
{
  "bundleSize": {
    "main": "<500KB",
    "css": "<150KB"
  },
  "typeScriptErrors": 0,
  "eslintErrors": 0,
  "eslintWarnings": "<10",
  "testCoverage": ">80%",
  "complexity": "<10",
  "duplicateStrings": "<5"
}
```

### **CI/CD Gates**:
```bash
# All must pass for merge:
✅ npm run lint      (0 errors, <10 warnings)
✅ npm run type-check (0 errors)
✅ npm test          (all pass, >80% coverage)
✅ npm audit         (no high/critical)
✅ Bundle size check (<500KB)
```

---

## 🎯 **Component Architecture**

### **Atomic Design Principles**:

```
1. Atoms         → src/components/ui/
   - Button, Input, Text, Icon
   - Max 50 lines
   - No state
   - Pure, reusable

2. Molecules     → src/components/forms/
   - FormField (Label + Input + Error)
   - SearchBar (Input + Icon + Button)
   - Max 100 lines
   - Simple local state

3. Organisms     → src/components/layouts/
   - LoginForm (multiple molecules)
   - NavigationBar
   - Max 200 lines
   - Complex state

4. Templates     → src/screens/[Name]/components/
   - Screen-specific layouts
   - Max 250 lines

5. Pages         → src/screens/[Name]/
   - Full screens
   - Max 300 lines
   - Connect to services
```

---

## 🚀 **Implementation Checklist**

### **Immediate** (Today):
- [x] Create enterprise .eslintrc.js
- [x] Create strict tsconfig.json
- [x] Update package.json with scripts
- [x] Create Husky hooks
- [x] Create structure guidelines
- [ ] Install dependencies
- [ ] Run quality assessment
- [ ] Fix any issues found

### **Ongoing**:
- [ ] Enforce in code reviews
- [ ] Monitor quality metrics
- [ ] Update rules as needed
- [ ] Add custom rules for project patterns
- [ ] Weekly quality reports

---

## 📝 **Developer Workflow**

### **Before Starting Work**:
```bash
git checkout -b feature/new-feature
npm install  # Get latest dependencies
npm run quality  # Check baseline
```

### **During Development**:
```bash
# Auto-fix on save (VS Code/Cursor)
# Or run manually:
npm run quality:fix
```

### **Before Commit**:
```bash
git add .
git commit -m "feat: add feature"
# Husky runs automatically:
#   ✅ lint-staged
#   ✅ type-check
#   ✅ tests on changed files
```

### **Before Push**:
```bash
git push
# Husky runs:
#   ✅ Full lint
#   ✅ Full type-check
#   ✅ All tests
```

---

**Status**: Guidelines created, ready to enforce!
