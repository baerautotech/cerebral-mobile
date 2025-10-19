# Troubleshooting Guide - Cerebral Mobile

## Common Issues & Solutions

### 1. Build Failures (Native)

**Symptoms**: Build fails for iOS or Android

**Diagnosis**:
```bash
# Android
npm run build:android 2>&1 | tail -100

# iOS
npm run build:ios 2>&1 | tail -100
```

**Common Fixes**:

- **Gradle errors (Android)**: Update Gradle
  ```bash
  cd android && ./gradlew clean && cd ..
  npm run build:android
  ```

- **Pod issues (iOS)**: Reset CocoaPods
  ```bash
  cd ios && pod deintegrate && pod install && cd ..
  npm run build:ios
  ```

- **Java/Kotlin issues**: Check SDK versions
  ```bash
  echo $JAVA_HOME
  echo $ANDROID_HOME
  ```

### 2. Runtime Crashes

**Symptoms**: App crashes on startup, crashes when using feature

**Diagnosis**:
```bash
# iOS logs
xcrun simctl spawn booted log stream --predicate 'process == "Cerebral"'

# Android logs
adb logcat | grep "Cerebral\|ReactNative\|Error"
```

**Common Causes**:

- **Native module error**: Check module linking
- **Out of memory**: Check app size
- **Version incompatibility**: Check React Native version
- **Missing permissions**: Check AndroidManifest.xml, Info.plist

**Solutions**:

- Unlink and relink native modules
- Reduce bundle size (code splitting)
- Upgrade React Native if needed
- Grant required permissions

### 3. Performance Issues

**Symptoms**: Slow startup, frame drops, high memory

**Diagnosis**:
```bash
# Frame drops
adb shell dumpsys gfxinfo | grep "Janky frames"

# Memory
adb shell dumpsys meminfo | grep "Cerebral"
```

**Common Causes**:

- **Heavy JavaScript**: Profile with React DevTools
- **Large images**: Check image sizes
- **Animations**: Check frame rate
- **Memory leaks**: Check for detached listeners

**Solutions**:

- Enable Hermes engine for Android
- Use native optimized animations
- Implement image caching
- Clean up listeners in useEffect

### 4. Network Issues

**Symptoms**: API calls fail, timeout, no connectivity

**Diagnosis**:
```bash
# Test network connectivity
curl https://api.dev.cerebral.baerautotech.com/health

# Check request headers
adb logcat | grep "OkHttp"
```

**Common Causes**:

- **API endpoint wrong**: Check BASE_URL
- **SSL certificate**: Check HTTPS setup
- **Network timeout**: Check timeout settings
- **CORS**: Check backend CORS headers

**Solutions**:

- Verify API_BASE_URL in config
- Use Certificate Pinning for security
- Increase timeout for slow networks
- Test on different networks

### 5. State Sync Issues

**Symptoms**: UI doesn't update, offline changes don't sync

**Diagnosis**:
```bash
# Check Zustand store (React Native DevTools)
# Use React Native Debugger

# Check local storage
adb shell "run-as com.cerebral cat /data/data/com.cerebral/shared_prefs/MMKV.xml"
```

**Common Causes**:

- **Store not subscribed**: Component not listening to store
- **Offline queue stuck**: Check sync logic
- **Local storage corrupted**: Clear cache

**Solutions**:

- Use useShallow hook in Zustand
- Implement proper offline queue
- Add error handling for sync
- Clear local storage on error

## Device-Specific Issues

### iOS

- **Simulator vs Device**: Some issues only appear on device
- **Xcode cache**: Clean build folder (Cmd+Shift+K)
- **Swift version**: Check Deployment Target

### Android

- **API level**: Check minSdkVersion vs device
- **Gradle version**: Update gradle wrapper
- **SDK version**: Install required SDK levels

## Performance Monitoring

Monitor with:
- Xcode Instruments (iOS)
- Android Studio Profiler (Android)
- React Native DevTools
- Sentry dashboard

## Escalation

Collect before escalating:
```bash
# Device info
adb shell "getprop | grep model"

# OS version
adb shell "getprop ro.build.version.release"

# Crash logs
adb logcat > crash_log.txt

# App size
ls -lh app-release.apk  # or .ipa
```
