# Phase 1: Feature Flags SDK for Mobile

**Status**: ⏳ Pending  
**Duration**: 3-4 days  
**Priority**: 🔴 Critical - Foundation for all other phases  

---

## DELIVERABLES CHECKLIST

### 1. Type Definitions
- [ ] `frontend-react-native/src/types/featureFlags.ts`
  - [ ] `FeatureFlags` interface (Record<string, boolean>)
  - [ ] `FeatureFlagContextType` interface
  - [ ] `FeatureFlagProviderProps` interface
  - [ ] Export all types

### 2. Feature Flag Service
- [ ] `frontend-react-native/src/services/featureFlags.ts`
  - [ ] `fetchFeatureFlags()` function - calls backend /api/flags
  - [ ] Handle network errors gracefully
  - [ ] Return empty object on failure (offline support)
  - [ ] Add TypeScript types
  - [ ] Add JSDoc comments

### 3. Feature Flag Hook
- [ ] `frontend-react-native/src/hooks/useFeatureFlags.ts`
  - [ ] `CACHE_KEY` constant = 'feature_flags'
  - [ ] `CACHE_TTL` constant = 5 * 60 * 1000 (5 minutes)
  - [ ] State: `flags`, `loading`, `lastUpdated`
  - [ ] `loadFlags()` function with caching logic
  - [ ] Check AsyncStorage for cached flags
  - [ ] If cache fresh (< 5 min), use cached
  - [ ] Otherwise, fetch from backend
  - [ ] Update cache with fresh flags
  - [ ] Fallback to expired cache if offline
  - [ ] `useEffect` to load on mount
  - [ ] Return `{ flags, loading, refresh, lastUpdated }`
  - [ ] Export as named export

### 4. Feature Flag Guard Component
- [ ] `frontend-react-native/src/components/FeatureFlagGuard.tsx`
  - [ ] Props: `flag: string`, `children: ReactNode`, `fallback?: ReactNode`
  - [ ] Use `useFeatureFlags()` hook
  - [ ] Return null during loading
  - [ ] Show `children` if flag enabled
  - [ ] Show `fallback` if flag disabled
  - [ ] TypeScript types for props
  - [ ] Export as named export

### 5. Feature Flag Provider
- [ ] `frontend-react-native/src/providers/FeatureFlagProvider.tsx`
  - [ ] Create `FeatureFlagContext` using React.createContext
  - [ ] `FeatureFlagProvider` component
  - [ ] Use `useFeatureFlags()` hook internally
  - [ ] Wrap context value with flags, loading, refresh
  - [ ] Provide to children
  - [ ] TypeScript types for context
  - [ ] Export context and provider

### 6. Update App.tsx
- [ ] `frontend-react-native/App.tsx`
  - [ ] Import `FeatureFlagProvider`
  - [ ] Wrap root component with provider
  - [ ] Keep existing providers (if any)
  - [ ] Test that app still starts

### 7. Unit Tests
- [ ] `frontend-react-native/__tests__/hooks/useFeatureFlags.test.ts`
  - [ ] Test: flags loaded from backend
  - [ ] Test: flags cached in AsyncStorage
  - [ ] Test: cache used if fresh
  - [ ] Test: backend called if cache stale
  - [ ] Test: offline fallback to cache
  - [ ] Test: refresh function works
  - [ ] Test: lastUpdated timestamp correct
  - [ ] Test: loading state transitions
  - [ ] Mock AsyncStorage
  - [ ] Mock fetch API

- [ ] `frontend-react-native/__tests__/components/FeatureFlagGuard.test.tsx`
  - [ ] Test: renders children if flag enabled
  - [ ] Test: renders fallback if flag disabled
  - [ ] Test: renders null during loading (if no fallback)
  - [ ] Test: handles flag=undefined gracefully
  - [ ] Mock `useFeatureFlags` hook

### 8. Documentation
- [ ] `docs/FEATURE_FLAGS.md`
  - [ ] Architecture overview
  - [ ] Code patterns and examples
  - [ ] AsyncStorage caching strategy
  - [ ] Offline support explanation
  - [ ] Pull-to-refresh integration
  - [ ] Testing guide
  - [ ] Debugging tips

---

## DEPENDENCIES

### NPM Packages (Already Installed)
- ✅ react-native
- ✅ @react-native-async-storage/async-storage (v1.21.0)
- ✅ @react-navigation/* (navigation)
- ✅ typescript

### NPM Packages (Might Need to Add)
- ⏳ @react-native-async-storage/async-storage (verify version)

### Backend API Contract
```typescript
// GET /api/flags
// Returns: { flag_name: boolean, ... }
// Example: { "ai_features": true, "premium_analytics": false }
```

---

## TESTING CHECKLIST

### Unit Tests
- [ ] Run tests: `npm test -- useFeatureFlags`
- [ ] All tests passing
- [ ] Coverage > 90%
- [ ] No console errors

### Manual Testing on Simulator
- [ ] App starts without error
- [ ] Console logs show flags loaded
- [ ] AsyncStorage contains flags
- [ ] Flag values correct
- [ ] FeatureFlagGuard visible if flag enabled
- [ ] FeatureFlagGuard hidden if flag disabled
- [ ] Pull-to-refresh updates flags
- [ ] Offline (no network) - still shows cached flags
- [ ] Network restored - flags update

### Manual Testing on Real Device (iOS)
- [ ] Build app: `npm run ios`
- [ ] App installs and launches
- [ ] Flags load correctly
- [ ] Guard components visible/hidden appropriately
- [ ] No crashes or errors

### Manual Testing on Real Device (Android)
- [ ] Build app: `npm run android`
- [ ] App installs and launches
- [ ] Flags load correctly
- [ ] Guard components visible/hidden appropriately
- [ ] No crashes or errors

---

## CODE PATTERNS

### Feature Flag Service
```typescript
// src/services/featureFlags.ts
import axios from 'axios';

export async function fetchFeatureFlags(): Promise<Record<string, boolean>> {
  try {
    const response = await axios.get('/api/flags');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch feature flags:', error);
    return {};
  }
}
```

### Feature Flag Hook
```typescript
// src/hooks/useFeatureFlags.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchFeatureFlags } from '../services/featureFlags';

const CACHE_KEY = 'feature_flags';
const CACHE_TTL = 5 * 60 * 1000;

export function useFeatureFlags() {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(0);

  const loadFlags = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      const cacheTime = await AsyncStorage.getItem(`${CACHE_KEY}_time`);
      
      if (cached && cacheTime && Date.now() - parseInt(cacheTime) < CACHE_TTL) {
        setFlags(JSON.parse(cached));
        setLastUpdated(parseInt(cacheTime));
        setLoading(false);
        return;
      }

      const newFlags = await fetchFeatureFlags();
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newFlags));
      await AsyncStorage.setItem(`${CACHE_KEY}_time`, Date.now().toString());
      setFlags(newFlags);
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Failed to load feature flags:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        setFlags(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  return { flags, loading, refresh: loadFlags, lastUpdated };
}
```

### Feature Flag Guard Component
```typescript
// src/components/FeatureFlagGuard.tsx
import React, { ReactNode } from 'react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

interface FeatureFlagGuardProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureFlagGuard({ flag, children, fallback }: FeatureFlagGuardProps) {
  const { flags, loading } = useFeatureFlags();

  if (loading) {
    return null;
  }

  if (!flags[flag]) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
```

### Feature Flag Provider
```typescript
// src/providers/FeatureFlagProvider.tsx
import React, { ReactNode, createContext } from 'react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

export const FeatureFlagContext = createContext<any>(null);

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const { flags, loading, refresh, lastUpdated } = useFeatureFlags();

  return (
    <FeatureFlagContext.Provider value={{ flags, loading, refresh, lastUpdated }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
```

---

## DEBUGGING TIPS

### Check Cached Flags
```bash
# Via Xcode (iOS)
# In simulator, inspect ~/Library/Developer/CoreSimulator/Devices/<device_id>/data/Containers/Data/Application/<app_id>/Documents/

# Via adb (Android)
adb shell "cat /data/data/com.cerebral.mobile/shared_prefs/RCTAsyncStorage.xml"
```

### Check Network Requests
```bash
# Use React Native Debugger or:
# iOS: Xcode console logs
# Android: adb logcat
```

### Console Logging
Add logging to verify:
```typescript
console.log('Loading flags from cache...');
console.log('Flags loaded:', flags);
console.log('Cache timestamp:', lastUpdated);
```

---

## ACCEPTANCE CRITERIA

- [ ] All code written and committed
- [ ] All unit tests passing (>90% coverage)
- [ ] Manual testing on iOS simulator complete
- [ ] Manual testing on Android emulator complete
- [ ] No console errors or warnings
- [ ] TypeScript strict mode passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] PR created and merged to develop

---

## NOTES & BLOCKERS

### Potential Issues
- If backend not ready: Use mock endpoint returning hardcoded flags
- If AsyncStorage not working: Add error logging and fallback
- If network slow: Add timeout and fallback to cache

### Questions to Clarify
- What's the exact URL for /api/flags endpoint?
- What does the backend return for flags?
- Should flags auto-refresh in background?
- Should app restart when flags change?

---

**Status**: ⏳ Ready to start  
**Start Date**: TBD  
**Estimated Completion**: TBD

