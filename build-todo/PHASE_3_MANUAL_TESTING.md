# Phase 3.11: Manual Testing - Complete Testing Plan

## Overview
Comprehensive manual testing plan for all tier-guarded and feature-flagged screens on iOS and Android simulators.

**Status**: 🚀 IN PROGRESS
**Date Created**: November 9, 2025
**Test Platforms**: iOS Simulator + Android Emulator
**Estimated Duration**: 2-3 hours per platform
**Success Criteria**: 100% of test cases pass

---

## Quick Start Guide

### Setup Requirements

**Prerequisites**
```bash
# Ensure you have the following installed:
✓ Node.js 16+ (npm or pnpm)
✓ Xcode 13+ (for iOS)
✓ Android SDK (for Android)
✓ React Native CLI
✓ Metro Bundler

# Install dependencies (if not already done)
cd /Users/bbaer/Development/cerebral-mobile-1/frontend-react-native
pnpm install
```

### Starting Simulators

**iOS Simulator**
```bash
# List available iOS simulators
xcrun simctl list devices

# Start iPhone 14 Pro simulator
open -a Simulator --args -CurrentDeviceUDID <UDID>

# Or use a simpler command
xcrun simctl boot booted

# Run app on iOS
cd frontend-react-native
npm run ios
```

**Android Emulator**
```bash
# List available Android emulators
emulator -list-avds

# Start specific emulator
emulator -avd <emulator_name>

# Run app on Android
cd frontend-react-native
npm run android
```

---

## Test Environment Setup

### Mock Data Configuration

**For Testing, Use Mock JWT Tokens:**

**Free Tier Token**
```
Payload: { "user_id": "user_free", "tier": "free", "exp": 9999999999 }
Store in: AsyncStorage with key 'mock_jwt_token'
```

**Standard Tier Token**
```
Payload: { "user_id": "user_std", "tier": "standard", "exp": 9999999999 }
Store in: AsyncStorage with key 'mock_jwt_token'
```

**Enterprise Tier Token**
```
Payload: { "user_id": "user_ent", "tier": "enterprise", "exp": 9999999999 }
Store in: AsyncStorage with key 'mock_jwt_token'
```

### Feature Flag Configuration

**For Testing, Mock Feature Flags:**

```typescript
// Mock all flags in useFeatureFlags hook
const testFlags = {
  advanced_filtering: true,      // Beta feature
  advanced_actions: true,        // Beta feature
  ar_mode: true,                 // Beta feature
  ai_suggestions: true,          // Experimental
  workflow_automation: true,     // Experimental
  new_dashboard: false,          // Can toggle
  analytics_export: false,       // Can toggle
  live_dashboard: true,          // Core feature
};
```

---

## Test Suites

### Test Suite 1: Free Tier User (2 hours)

#### 1.1 Screen Accessibility

**Test Case: Login Screen**
```
Tier: Free
Expected: ✅ Visible and accessible
Steps:
  1. Launch app
  2. Verify login form visible
  3. Verify signup link visible
Action: Can proceed to login
Result: ✅ PASS / ❌ FAIL
```

**Test Case: Signup Screen**
```
Tier: Free
Expected: ✅ Visible and accessible
Steps:
  1. Tap signup link
  2. Verify signup form visible
  3. Verify all fields present
Action: Can create account
Result: ✅ PASS / ❌ FAIL
```

**Test Case: Dashboard Screen (Base)**
```
Tier: Free
Expected: ✅ Base dashboard visible
Blocked: ❌ Advanced Analytics, AI Insights
Steps:
  1. Login as free user
  2. Navigate to dashboard
  3. Verify welcome message
  4. Verify stats cards visible
  5. Verify quick actions visible
  6. Verify recent activity visible
  7. Scroll down - NO Advanced Analytics
  8. Scroll down - NO AI Insights
Action: Restricted features not shown
Result: ✅ PASS / ❌ FAIL
```

**Test Case: Tasks Screen (Base)**
```
Tier: Free
Expected: ✅ Base tasks list visible
Blocked: ❌ Advanced filters, bulk actions, AI suggestions
Steps:
  1. Navigate to tasks
  2. Verify search bar present
  3. Verify filter bar present
  4. Verify task list visible
  5. Scroll down - NO "Advanced Filters"
  6. Scroll down - NO "Bulk Actions"
  7. Scroll down - NO "AI Task Suggestions"
Action: Restricted features not shown
Result: ✅ PASS / ❌ FAIL
```

**Test Case: Create Task Screen**
```
Tier: Free
Expected: ✅ Basic form visible
Blocked: ❌ AI Suggestions
Steps:
  1. Tap create task button
  2. Verify form fields visible
  3. Verify submit button visible
  4. Scroll down - NO "AI Suggestions" section
Action: Restricted features not shown
Result: ✅ PASS / ❌ FAIL
```

**Test Case: Task Detail Screen**
```
Tier: Free
Expected: ✅ Base task detail visible
Blocked: ❌ Export, AI Insights, Automation
Steps:
  1. Select a task from list
  2. Verify title and description visible
  3. Verify status/priority visible
  4. Scroll down - NO "Export Task Data"
  5. Scroll down - NO "AI Insights"
  6. Scroll down - NO "Automation Rules"
Action: Restricted features not shown
Result: ✅ PASS / ❌ FAIL
```

**Test Case: LiveDashboard Screen**
```
Tier: Free
Expected: ❌ NOT Visible (tier guard blocks)
Blocked: Entire screen blocked
Steps:
  1. Try to navigate to LiveDashboard (if accessible via menu)
  2. Verify screen does not load
  3. Verify no error displayed
Action: Access denied gracefully
Result: ✅ PASS / ❌ FAIL
```

**Test Case: AR View Screen**
```
Tier: Free
Expected: ❌ NOT Visible (tier guard + flag)
Blocked: Entire screen blocked
Steps:
  1. Try to navigate to AR View (if accessible)
  2. Verify screen does not load
  3. Verify no error displayed
Action: Access denied gracefully
Result: ✅ PASS / ❌ FAIL
```

#### 1.2 Feature Flag Tests (Free Tier)

**Test Case: Advanced Filtering Flag (OFF)**
```
Flag: advanced_filtering = false
Tier: Free
Expected: ❌ Feature hidden
Steps:
  1. Go to Tasks screen
  2. Scroll down
  3. Look for "Advanced Filters Available"
Result: ✅ NOT visible / ❌ visible (FAIL)
```

**Test Case: Advanced Filtering Flag (ON)**
```
Flag: advanced_filtering = true
Tier: Free
Expected: ✅ Feature shown (even free tier)
Steps:
  1. Go to Tasks screen
  2. Scroll down
  3. Look for "Advanced Filters Available"
Result: ✅ visible / ❌ NOT visible (FAIL)
```

---

### Test Suite 2: Standard Tier User (2 hours)

#### 2.1 Tier Inheritance Tests

**Test Case: Standard Tier Has Free Features**
```
Tier: Standard
Expected: ✅ All free tier features visible + new features
Steps:
  1. Login as standard user
  2. Navigate to Dashboard
  3. Verify base dashboard visible
  4. Scroll down - VERIFY "Advanced Analytics" VISIBLE
  5. Verify quick actions, recent activity visible
Action: Inherits free tier features
Result: ✅ PASS / ❌ FAIL
```

**Test Case: LiveDashboard Screen (Standard)**
```
Tier: Standard
Expected: ✅ Visible (tier guard passes)
Steps:
  1. Try to navigate to LiveDashboard
  2. Verify screen loads
  3. Verify title "Live AI/ML Dashboard" visible
  4. Verify placeholder content visible
Action: Access granted
Result: ✅ PASS / ❌ FAIL
```

#### 2.2 Feature Isolation Tests

**Test Case: Standard Tier Blocked from Enterprise Features**
```
Tier: Standard
Flag: ai_suggestions = true (enabled)
Expected: ❌ AI features NOT visible
Steps:
  1. Go to Tasks screen
  2. Scroll to bottom
  3. Look for "AI Task Suggestions"
  4. Should NOT see it
Action: Enterprise features blocked
Result: ✅ NOT visible / ❌ visible (FAIL)
```

**Test Case: ARView Screen (Standard)**
```
Tier: Standard
Flag: ar_mode = true
Expected: ❌ NOT Visible (tier guard blocks enterprise)
Steps:
  1. Try to navigate to AR View
  2. Verify screen does not load
  3. Verify no error
Action: Access denied gracefully
Result: ✅ PASS / ❌ FAIL
```

#### 2.3 Standard Tier Exclusive Features

**Test Case: Export Task Data**
```
Tier: Standard
Expected: ✅ Visible
Steps:
  1. Go to Task Detail screen
  2. Scroll down
  3. Look for "📊 Export Task Data"
  4. Verify text "Available in Standard tier"
Action: Feature visible
Result: ✅ visible / ❌ NOT visible (FAIL)
```

---

### Test Suite 3: Enterprise Tier User (2.5 hours)

#### 3.1 Full Feature Access

**Test Case: Enterprise Has All Features**
```
Tier: Enterprise
Expected: ✅ All screens and features visible
Steps:
  1. Login as enterprise user
  2. Verify Dashboard shows:
     - Base dashboard ✅
     - Advanced Analytics ✅
     - AI-Powered Insights ✅
  3. Verify Tasks shows:
     - Base tasks ✅
     - Advanced Filters ✅
     - Bulk Actions ✅
     - AI Task Suggestions ✅
  4. Verify CreateTask shows:
     - Base form ✅
     - AI Suggestions ✅
  5. Verify TaskDetail shows:
     - Base details ✅
     - Export Task Data ✅
     - AI Insights ✅
     - Automation Rules ✅
Action: All features accessible
Result: ✅ PASS / ❌ FAIL
```

**Test Case: LiveDashboard Screen**
```
Tier: Enterprise
Expected: ✅ Visible
Steps:
  1. Navigate to LiveDashboard
  2. Verify screen loads
  3. Verify "Live AI/ML Dashboard" title visible
  4. Verify content visible
Action: Access granted
Result: ✅ PASS / ❌ FAIL
```

**Test Case: AR View Screen (With Flag)**
```
Tier: Enterprise
Flag: ar_mode = true
Expected: ✅ Visible
Steps:
  1. Navigate to AR View
  2. Verify screen loads
  3. Verify "Augmented Reality View" title visible
  4. Verify AR Scene placeholder visible
Action: Access granted
Result: ✅ PASS / ❌ FAIL
```

#### 3.2 Combined Guard Tests

**Test Case: AI Suggestions (Flag + Tier)**
```
Tier: Enterprise
Flag: ai_suggestions = true
Expected: ✅ Visible
Steps:
  1. Go to Tasks screen
  2. Scroll to bottom
  3. Verify "🤖 AI Task Suggestions" visible
Action: Both conditions met = visible
Result: ✅ visible / ❌ NOT visible (FAIL)
```

**Test Case: AI Suggestions Without Flag**
```
Tier: Enterprise
Flag: ai_suggestions = false
Expected: ❌ NOT Visible
Steps:
  1. Go to Tasks screen
  2. Scroll to bottom
  3. Look for "🤖 AI Task Suggestions"
  4. Should NOT see it
Action: Flag condition blocks feature
Result: ✅ NOT visible / ❌ visible (FAIL)
```

**Test Case: Workflow Automation (Flag + Tier)**
```
Tier: Enterprise
Flag: workflow_automation = true
Expected: ✅ Visible
Steps:
  1. Go to Task Detail screen
  2. Scroll to bottom
  3. Verify "⚙️ Automation Rules" visible
  4. Verify text about automation present
Action: Both conditions met = visible
Result: ✅ visible / ❌ NOT visible (FAIL)
```

#### 3.3 AR Mode Combined Guard

**Test Case: AR View with Flag ON**
```
Tier: Enterprise
Flag: ar_mode = true
Expected: ✅ Screen visible
Steps:
  1. Navigate to AR View
  2. Verify loads successfully
  3. Verify content visible
Action: Both conditions met = visible
Result: ✅ PASS / ❌ FAIL
```

**Test Case: AR View with Flag OFF**
```
Tier: Enterprise
Flag: ar_mode = false
Expected: ❌ Screen hidden
Steps:
  1. Try to navigate to AR View
  2. Verify screen does NOT load
  3. Verify no error
Action: Flag condition blocks access
Result: ✅ PASS / ❌ FAIL
```

---

### Test Suite 4: Tier Transitions (1 hour)

#### 4.1 Upgrade from Free to Standard

**Test Case: Feature Appearance on Upgrade**
```
Steps:
  1. Start as free tier user
  2. Verify Advanced Analytics NOT visible
  3. Change tier to standard in mock data
  4. Navigate back to Dashboard
  5. Verify Advanced Analytics NOW visible
Action: Features appear after upgrade
Result: ✅ PASS / ❌ FAIL
```

**Test Case: LiveDashboard Appears on Upgrade**
```
Steps:
  1. Start as free tier user
  2. Try to access LiveDashboard - blocked
  3. Upgrade to standard tier
  4. Try to access LiveDashboard again
  5. Should now be visible
Action: Screen becomes accessible
Result: ✅ PASS / ❌ FAIL
```

#### 4.2 Downgrade from Enterprise to Standard

**Test Case: Features Disappear on Downgrade**
```
Steps:
  1. Start as enterprise tier user
  2. Verify AI Suggestions visible
  3. Change tier to standard
  4. Navigate back to Tasks screen
  5. Verify AI Suggestions NOT visible
Action: Enterprise features disappear
Result: ✅ PASS / ❌ FAIL
```

**Test Case: AR View Disappears on Downgrade**
```
Steps:
  1. Start as enterprise tier user
  2. Verify AR View accessible
  3. Change tier to standard
  4. Try to access AR View
  5. Should be blocked
Action: Screen becomes inaccessible
Result: ✅ PASS / ❌ FAIL
```

---

### Test Suite 5: Feature Flag Rollout (1 hour)

#### 5.1 Progressive Rollout Simulation

**Test Case: Flag Disabled (0% rollout)**
```
Flag: advanced_filtering = false
Tier: Standard (or Free)
Expected: ❌ Feature NOT visible
Steps:
  1. Go to Tasks screen
  2. Look for "Advanced Filters"
  3. Should NOT see it
Action: Feature hidden
Result: ✅ NOT visible / ❌ visible (FAIL)
```

**Test Case: Flag Enabled (100% rollout)**
```
Flag: advanced_filtering = true
Tier: Standard (or Free)
Expected: ✅ Feature visible
Steps:
  1. Go to Tasks screen
  2. Look for "Advanced Filters"
  3. Should see it
Action: Feature visible
Result: ✅ visible / ❌ NOT visible (FAIL)
```

#### 5.2 Feature Killswitch Testing

**Test Case: Kill Feature via Flag**
```
Steps:
  1. Start with ai_suggestions = true
  2. Go to Tasks screen
  3. Verify AI Suggestions visible (if enterprise)
  4. Change flag to ai_suggestions = false
  5. Refresh screen
  6. Verify AI Suggestions NOW hidden
Action: Feature instantly disabled
Result: ✅ PASS / ❌ FAIL
```

---

### Test Suite 6: Edge Cases (1 hour)

#### 6.1 Offline Behavior

**Test Case: App Works Offline (Free Tier)**
```
Steps:
  1. Login as free user
  2. Enable airplane mode
  3. Navigate between screens
  4. Verify all free features work
  5. Verify no errors
Action: Offline functionality preserved
Result: ✅ PASS / ❌ FAIL
```

#### 6.2 Cache Behavior

**Test Case: Feature Flags Cache Works**
```
Steps:
  1. Go to Tasks screen with flags enabled
  2. Verify features visible
  3. Disable network
  4. Navigate away and back
  5. Verify features still visible (from cache)
Action: Cache prevents API calls
Result: ✅ PASS / ❌ FAIL
```

**Test Case: Tier Cache Works**
```
Steps:
  1. Login as enterprise user
  2. View all enterprise features
  3. Disable network
  4. Navigate away and back
  5. Verify tier still recognized
Action: Tier data cached
Result: ✅ PASS / ❌ FAIL
```

#### 6.3 Rapid State Changes

**Test Case: Rapid Tier Changes**
```
Steps:
  1. Start as free tier
  2. Rapidly switch to standard
  3. Rapidly switch to enterprise
  4. Rapidly switch back to free
  5. Verify no crashes
  6. Verify final state is correct
Action: No errors, correct final state
Result: ✅ PASS / ❌ FAIL
```

**Test Case: Rapid Flag Changes**
```
Steps:
  1. Start with advanced_filtering = false
  2. Toggle to true
  3. Toggle to false
  4. Toggle to true 5 times rapidly
  5. Verify no crashes
  6. Verify final state is correct
Action: No errors, correct final state
Result: ✅ PASS / ❌ FAIL
```

---

## Platform-Specific Testing

### iOS-Specific Tests

**Test Case: Dark Mode**
```
Steps:
  1. Enable Dark Mode in simulator settings
  2. Navigate through screens
  3. Verify all text readable
  4. Verify all guards work correctly
  5. Verify no UI issues
Action: App works in dark mode
Result: ✅ PASS / ❌ FAIL
```

**Test Case: Safe Area**
```
Steps:
  1. View all screens
  2. Verify content not hidden by notch
  3. Verify bottom safe area respected
  4. Verify all guards render correctly
Action: Safe area respected
Result: ✅ PASS / ❌ FAIL
```

### Android-Specific Tests

**Test Case: Back Button Navigation**
```
Steps:
  1. Navigate to a premium screen
  2. Press back button
  3. Verify correct navigation
  4. Navigate through multiple screens
  5. Verify back stack works
Action: Back button works correctly
Result: ✅ PASS / ❌ FAIL
```

**Test Case: Different Screen Sizes**
```
Steps:
  1. Test on different emulator screen sizes
  2. Verify guards render correctly
  3. Verify text readable
  4. Verify no overflow
Action: Works on different sizes
Result: ✅ PASS / ❌ FAIL
```

---

## Testing Checklist

### Pre-Testing
- [ ] Install all dependencies
- [ ] Clear app cache
- [ ] Reset simulator/emulator
- [ ] Verify mock data configured
- [ ] Verify test account credentials ready

### iOS Testing
- [ ] Start iOS simulator
- [ ] Run `npm run ios`
- [ ] Test free tier (Test Suite 1)
- [ ] Test standard tier (Test Suite 2)
- [ ] Test enterprise tier (Test Suite 3)
- [ ] Test tier transitions (Test Suite 4)
- [ ] Test feature flags (Test Suite 5)
- [ ] Test edge cases (Test Suite 6)
- [ ] Test dark mode
- [ ] Test safe area

### Android Testing
- [ ] Start Android emulator
- [ ] Run `npm run android`
- [ ] Test free tier (Test Suite 1)
- [ ] Test standard tier (Test Suite 2)
- [ ] Test enterprise tier (Test Suite 3)
- [ ] Test tier transitions (Test Suite 4)
- [ ] Test feature flags (Test Suite 5)
- [ ] Test edge cases (Test Suite 6)
- [ ] Test back button navigation
- [ ] Test different screen sizes

### Post-Testing
- [ ] Document any issues found
- [ ] Fix critical bugs
- [ ] Re-test fixed issues
- [ ] Document passing test cases
- [ ] Create summary report

---

## Issue Tracking

### Critical Issues (Block Release)
- [ ] App crashes on tier change
- [ ] App crashes on flag change
- [ ] Screens inaccessible when should be
- [ ] Screens accessible when should be blocked
- [ ] Major UI rendering issues

### Minor Issues (Nice to Fix)
- [ ] UI alignment issues
- [ ] Text truncation
- [ ] Slow navigation
- [ ] Unnecessary re-renders

---

## Test Results Summary Template

```
PHASE 3.11 MANUAL TESTING RESULTS
==================================

Testing Date: [DATE]
Tester: [NAME]
Platform: iOS / Android
Duration: [HOURS]

FREE TIER TESTS
├─ Screen Accessibility: [PASS/FAIL] ([X/Y] passed)
├─ Feature Restrictions: [PASS/FAIL] ([X/Y] passed)
└─ Feature Flags: [PASS/FAIL] ([X/Y] passed)

STANDARD TIER TESTS
├─ Tier Inheritance: [PASS/FAIL] ([X/Y] passed)
├─ Feature Access: [PASS/FAIL] ([X/Y] passed)
└─ Tier Boundaries: [PASS/FAIL] ([X/Y] passed)

ENTERPRISE TIER TESTS
├─ Full Access: [PASS/FAIL] ([X/Y] passed)
├─ Combined Guards: [PASS/FAIL] ([X/Y] passed)
└─ AR View: [PASS/FAIL] ([X/Y] passed)

TIER TRANSITIONS
├─ Free→Standard: [PASS/FAIL] ([X/Y] passed)
├─ Standard→Enterprise: [PASS/FAIL] ([X/Y] passed)
└─ Downgrade Tests: [PASS/FAIL] ([X/Y] passed)

FEATURE FLAGS
├─ Progressive Rollout: [PASS/FAIL] ([X/Y] passed)
└─ Killswitch: [PASS/FAIL] ([X/Y] passed)

EDGE CASES
├─ Offline: [PASS/FAIL] ([X/Y] passed)
├─ Cache: [PASS/FAIL] ([X/Y] passed)
└─ Rapid Changes: [PASS/FAIL] ([X/Y] passed)

PLATFORM SPECIFIC
├─ [iOS/Android]: [PASS/FAIL] ([X/Y] passed)

CRITICAL ISSUES FOUND: [NUMBER]
MINOR ISSUES FOUND: [NUMBER]
TOTAL TESTS: [NUMBER]
TOTAL PASSED: [NUMBER]
SUCCESS RATE: [PERCENTAGE]%

NOTES:
[Any additional notes]

RECOMMENDATION:
[ ] Ready for Phase 4
[ ] Needs fixes before Phase 4
```

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Document passing results
2. Proceed to Phase 4: Build Automation
3. Archive test results

### If Issues Found ❌
1. Log all issues with severity
2. Fix critical issues first
3. Re-test fixed areas
4. Document resolution
5. Re-run failed test suites

---

## Documentation Links

- [Feature Flags Implementation](../docs/FEATURE_FLAGS.md)
- [Tier System Implementation](../docs/TIER_SYSTEM.md)
- [Phase 3.10 Integration Tests](./PHASE_3_INTEGRATION_TESTS.md)
- [Screen Audit & Mapping](./PHASE_3_SCREEN_AUDIT.md)

---

## Summary

**Phase 3.11 Manual Testing Plan Complete**

- ✅ 6 comprehensive test suites
- ✅ 50+ manual test cases
- ✅ Platform-specific testing
- ✅ Edge case coverage
- ✅ Complete testing checklist
- ✅ Issue tracking system
- ✅ Results documentation template

**Ready to execute manual testing on iOS and Android!**

Estimated time: **4-6 hours total** (2-3 hours per platform)
Success criteria: **100% of critical test cases pass**

---

**Manual Testing Status**: 🚀 READY TO EXECUTE
