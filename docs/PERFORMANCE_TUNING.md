# Mobile Performance Tuning Guide

**Version**: 2.0  
**Platform**: React Native (iOS/Android) + React Web  
**Status**: Production  
**Last Updated**: October 2025

---

## 📋 Overview

This guide optimizes the Cerebral Mobile monorepo across three platforms: Native iOS/Android, WearOS/watchOS, and web tablet.

---

## 🎯 Performance Targets

| Platform | Metric | Target |
|----------|--------|--------|
| **Native** | App startup | < 2s |
| | Frame rate | 60 FPS (iOS), 60 FPS (Android) |
| | Memory | < 200MB |
| **Wearable** | App startup | < 1s |
| | Battery drain | < 5%/hour |
| **Tablet (Web)** | Time to Interactive | < 4s |
| | LCP | < 2.5s |

---

## 📦 Bundle Size Optimization

### Analyze APK/IPA Size

```bash
# Android APK analysis
npx react-native android --analyze

# View breakdown
npx react-native size-compare

# Identify large modules
npm run build -- --profile
```

### Remove Unused Modules

```bash
# Detect unused dependencies
npx depcheck

# Remove unused packages
npm uninstall unused-package

# Use ES modules for tree-shaking
import { throttle } from 'lodash-es';  // ✅ Good
import { throttle } from 'lodash';     // ❌ Bad (whole library)
```

### ProGuard Rules (Android)

```proguard
# android/app/proguard-rules.pro
-keep class com.facebook.react.** { *; }
-keep class com.swmansion.reanimated.** { *; }

# Remove unused resources
-dontshrink
-dontoptimize
-dontobfuscate
```

---

## ⚡ React Native Optimization

### FlatList Virtualization

```typescript
import { FlatList } from 'react-native';

// For large lists, use FlatList with windowing
<FlatList
  data={tasks}
  renderItem={({ item }) => <TaskCard task={item} />}
  keyExtractor={item => item.id.toString()}
  windowSize={21}           // Number of items rendered outside viewport
  maxToRenderPerBatch={10}  // Items per rendering batch
  updateCellsBatchingPeriod={50}
/>
```

### Image Optimization

```typescript
import { Image } from 'react-native';

// Use fixed dimensions to prevent layout thrashing
<Image
  source={require('./image.png')}
  style={{ width: 200, height: 200 }}
  resizeMode="contain"
/>

// Or use responsive sizing
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: '100%', height: 200 }}
  progressiveRenderingEnabled
/>
```

### Memoization for Lists

```typescript
import { memo } from 'react';

// Prevent re-renders of list items
const TaskCard = memo(({ task, onPress }: Props) => (
  <TouchableOpacity onPress={() => onPress(task.id)}>
    <Text>{task.title}</Text>
  </TouchableOpacity>
), (prevProps, nextProps) => {
  return prevProps.task.id === nextProps.task.id;
});
```

---

## 💾 Memory Management

### Profile Memory Usage

```bash
# Android
adb shell am dumpheap <PID> /data/local/tmp/heap.bin
adb pull /data/local/tmp/heap.bin
# Analyze with Android Studio Profiler

# iOS
# Use Xcode Instruments: Memory Graph, Leaks, Allocations
```

### Avoid Memory Leaks

```typescript
// ✅ Good: Clean up listeners
useEffect(() => {
  const subscription = eventEmitter.addListener('task-update', handler);
  return () => subscription.remove();  // Cleanup
}, []);

// ❌ Bad: Leaked listener
useEffect(() => {
  eventEmitter.addListener('task-update', handler);  // No cleanup
}, []);
```

### Manage Large Collections

```typescript
// Bad: Keeps entire history in memory
const [allTasks, setAllTasks] = useState([]);

// Good: Pagination
const [tasks, setTasks] = useState([]);
const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const newTasks = await api.getTasks({ page: page + 1 });
  setTasks([...tasks, ...newTasks]);
  setPage(page + 1);
};
```

---

## 🎨 Native Performance

### Native Modules for Heavy Work

```typescript
// Instead of JS for expensive operations, use native
import { NativeModules } from 'react-native';

const CryptoModule = NativeModules.CryptoModule;

// In JS
const encrypted = await CryptoModule.encrypt(data);  // Much faster
```

### Bridge Optimization

```typescript
// ✅ Good: Batch operations
NativeModule.batchOperation([
  { operation: 'read', key: 'a' },
  { operation: 'read', key: 'b' },
  { operation: 'read', key: 'c' }
]);

// ❌ Bad: Multiple bridge calls
NativeModule.read('a');
NativeModule.read('b');
NativeModule.read('c');
```

---

## 🔄 State Management Optimization

### Zustand Store Subscription

```typescript
import { useShallow } from 'zustand/react/shallow';

// ✅ Good: Subscribe to specific fields
const title = useTaskStore(useShallow(state => ({ title: state.title })));

// ❌ Bad: Subscribe to entire store
const store = useTaskStore();  // Re-renders on any state change
```

### Separate Stores by Domain

```typescript
// Good: Multiple stores prevent unnecessary re-renders
export const useAuthStore = create(/* ... */);
export const useTaskStore = create(/* ... */);
export const useUIStore = create(/* ... */);

// Usage
const user = useAuthStore(state => state.user);  // Only re-renders if auth changes
const tasks = useTaskStore(state => state.tasks);  // Only re-renders if tasks change
```

---

## 📈 Monitoring Performance

### Measure Component Render Time

```typescript
import { PerformanceObserver, performance } from 'react-native';

const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

observer.observe({ entryTypes: ['measure'] });

// Mark performance
performance.mark('render-start');
// ... component rendering ...
performance.mark('render-end');
performance.measure('render', 'render-start', 'render-end');
```

### Debug Menu (Development)

```typescript
import React from 'react';
import { Alert } from 'react-native';

export const DebugMenu = () => {
  const showMetrics = () => {
    Alert.alert(
      'Performance Metrics',
      `FPS: ${globalThis.__DEV__ ? 'Enabled' : 'Disabled'}`
    );
  };

  return <Button title="Debug" onPress={showMetrics} />;
};
```

### Sentry for Error Tracking

```typescript
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: 'https://your-sentry-dsn@sentry.io/project-id',
  tracesSampleRate: 0.1,
});

// Wrap app
export default Sentry.wrap(App);
```

---

## ⏱️ Startup Performance

### Lazy Load Modules

```typescript
// Delay non-critical module loading
const NotificationsModule = lazy(() => import('./notifications'));

// Load after app initialization
setTimeout(() => {
  NotificationsModule.init();
}, 2000);
```

### Optimize Root Navigator

```typescript
// ✅ Good: Defer linking
const linking = {
  prefixes: ['cerebral://', 'https://app.cerebral.com'],
  async getInitialURL() {
    // Only run after app initializes
    await new Promise(r => setTimeout(r, 0));
    // ... get URL ...
  }
};

<NavigationContainer linking={linking}>
  {/* ... */}
</NavigationContainer>
```

---

## 🔋 Battery & Resource Usage

### Wearable-Specific

```typescript
// Minimize battery drain on wearables
import { Platform } from 'react-native';

if (Platform.OS === 'android' && Platform.Version >= 30) {
  // Use low-power mode features
  startLowPowerOptimizations();
}

// Reduce update frequency on watches
const updateInterval = Platform.select({
  web: 1000,      // Every 1s
  android: 5000,  // Every 5s
  ios: 5000       // Every 5s
});
```

### Background Task Optimization

```typescript
// Don't run unnecessary background tasks
import BackgroundTask from 'react-native-background-task';

BackgroundTask.define(async () => {
  // Only sync critical data
  await syncCriticalData();
  // Don't do unnecessary processing
});

// Schedule efficiently
BackgroundTask.schedule({
  period: 900,  // 15 minutes
  flex: 300     // 5 minute flex window
});
```

---

## 🌐 Network Optimization

### Connection-Aware

```typescript
import NetInfo from '@react-native-community/netinfo';

// Adjust behavior based on connection
NetInfo.fetch().then(state => {
  if (state.type === 'cellular') {
    // Reduce quality/size on cellular
    setImageQuality('low');
  } else if (state.type === 'wifi') {
    setImageQuality('high');
  }
});
```

### Request Batching

```typescript
// Batch API requests to reduce round trips
const batchRequests = async (endpoints: string[]) => {
  const response = await api.post('/batch', { endpoints });
  return response.data;
};

// Usage
const [users, tasks, projects] = await batchRequests([
  '/users/1',
  '/tasks/1',
  '/projects/1'
]);
```

---

## ✅ Performance Checklist

### Native (iOS/Android)

- [ ] Startup time < 2s
- [ ] 60 FPS maintained
- [ ] Memory < 200MB
- [ ] No ANRs (Android) or hangs (iOS)
- [ ] Background tasks optimized
- [ ] Image memory managed

### Wearable

- [ ] Startup < 1s
- [ ] Always-on battery < 5%/hour
- [ ] Update interval optimized
- [ ] Layout simple and minimal

### Web (Tablet)

- [ ] LCP < 2.5s
- [ ] TTI < 4s
- [ ] Lighthouse score > 90
- [ ] Bundle < 300KB

---

## 🔗 Related Documentation

- [Architecture](./ARCHITECTURE.md) - Workspace structure
- [API Reference](../docs/API_REFERENCE.md) - Backend API
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Dev guidelines

---

**Status**: ✅ Production Ready  
**Last Updated**: October 19, 2025
