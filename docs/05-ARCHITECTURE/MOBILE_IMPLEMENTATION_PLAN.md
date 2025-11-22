# Cerebral Mobile - Implementation Plan

**Document Version**: 1.0
**Date**: November 9, 2025
**Status**: Ready for Execution
**Estimated Effort**: 4-6 weeks
**Repository**: `/Users/bbaer/Development/cerebral-mobile-1`

---

## EXECUTIVE SUMMARY

### Current State

- ✅ React Native codebase with iOS & Android platforms
- ✅ Basic app structure with screens and navigation
- ✅ Authentication service in place
- ❌ **Feature flags SDK not integrated** (0/100)
- ❌ **Tier system not implemented** (0/100)
- ❌ **In-App Purchases not integrated** (0/100)
- ⚠️ App builds manual or via GitHub Actions only
- ⚠️ No automated TestFlight/Play Store deployment

### Vision

Build a complete feature management and monetization system for the mobile app:

**Layer 1**: Implement feature flags SDK for React Native with offline caching
**Layer 2**: Implement tier system with JWT extraction and validation
**Layer 3**: Implement In-App Purchases (RevenueCat) for tier upgrades
**Layer 4**: Wrap 30+ screens with appropriate guards
**Layer 5**: Automate iOS/Android builds via Tekton
**Layer 6**: Automate TestFlight & Play Store distribution

### Project Structure

```
cerebral-mobile-1/
├── .cursor/rules/
│   ├── cerebral-mobile.mdc              ✅ CREATED
│   └── feature-flags-mobile.mdc         ✅ CREATED
│
├── frontend-react-native/
│   └── src/
│       ├── hooks/                       ← NEW (Phase 1-2)
│       │   ├── useFeatureFlags.ts       ← NEW
│       │   ├── useUserTier.ts           ← NEW
│       │   ├── usePermissions.ts        ← NEW
│       │   └── useIAP.ts                ← NEW
│       ├── services/                    ← EXISTING
│       │   ├── featureFlags.ts          ← NEW
│       │   ├── tiers.ts                 ← NEW
│       │   └── iap.ts                   ← NEW
│       ├── components/                  ← NEW (Phase 1-2)
│       │   ├── FeatureFlagGuard.tsx     ← NEW
│       │   ├── TierGuard.tsx            ← NEW
│       │   ├── IAPFeature.tsx           ← NEW
│       │   └── UpgradeCTA.tsx           ← NEW
│       ├── types/                       ← EXISTING
│       │   ├── featureFlags.ts          ← NEW
│       │   ├── tiers.ts                 ← NEW
│       │   └── iap.ts                   ← NEW
│       ├── providers/                   ← NEW (Phase 1-2)
│       │   ├── FeatureFlagProvider.tsx  ← NEW
│       │   ├── TierProvider.tsx         ← NEW
│       │   └── IAPProvider.tsx          ← NEW
│       └── screens/                     ← WRAP WITH GUARDS (Phase 3)
│           ├── Dashboard/
│           ├── Tasks/
│           ├── [27+ screens wrapped]
│
├── docs/
│   ├── FEATURE_FLAGS.md                 ← NEW
│   ├── TIER_SYSTEM.md                   ← NEW
│   ├── IN_APP_PURCHASES.md              ← NEW
│   └── APP_STORE_DISTRIBUTION.md        ← NEW
│
├── build-todo/                          ← NEW PLANNING
│   ├── PHASE_1_FEATURE_FLAGS.md
│   ├── PHASE_2_TIER_SYSTEM.md
│   ├── PHASE_3_SCREEN_WRAPPING.md
│   ├── PHASE_4_BUILD_AUTOMATION.md
│   ├── PHASE_5_DISTRIBUTION.md
│   └── PHASE_6_TESTING_QA.md
│
├── k8s/                                 ← NEW (Phase 4)
│   ├── deployment-ios.yaml
│   ├── deployment-android.yaml
│   └── secret-app-signing.yaml
│
├── fastlane/                            ← NEW (Phase 5)
│   ├── Fastfile
│   ├── Appfile
│   └── certificates/
│
├── scripts/                             ← NEW (Phase 4)
│   ├── build-ios.sh
│   └── build-android.sh
│
└── [other files unchanged]
```

---

## PHASE BREAKDOWN

### PHASE 1: Feature Flags SDK for Mobile (Days 1-4)

**Goal**: Implement feature flag service with offline caching

**Deliverables**:

1. ✅ `frontend-react-native/src/types/featureFlags.ts` - Type definitions
2. ✅ `frontend-react-native/src/services/featureFlags.ts` - Feature flag client
3. ✅ `frontend-react-native/src/hooks/useFeatureFlags.ts` - React hook with caching
4. ✅ `frontend-react-native/src/components/FeatureFlagGuard.tsx` - Guard component
5. ✅ `frontend-react-native/src/providers/FeatureFlagProvider.tsx` - Context provider
6. ✅ Update `frontend-react-native/App.tsx` - Add provider wrapper
7. ✅ `frontend-react-native/__tests__/hooks/useFeatureFlags.test.ts` - Unit tests
8. ✅ `docs/FEATURE_FLAGS.md` - Implementation documentation

**Key Points**:

- Cache flags in AsyncStorage with 5-minute TTL
- Fallback to cached flags if backend unavailable
- Support pull-to-refresh to manually update
- Handle loading states gracefully
- No errors on offline scenarios

**Success Criteria**:

- [ ] Flags fetched from backend on startup
- [ ] Flags cached in AsyncStorage
- [ ] FeatureFlagGuard hides components correctly
- [ ] Manual refresh updates flags
- [ ] Offline scenario works without errors
- [ ] Unit tests passing
- [ ] Works on both iOS and Android

---

### PHASE 2: Tier System & In-App Purchases (Days 5-8)

**Goal**: Implement tier system and In-App Purchase integration

**Deliverables**:

1. ✅ `frontend-react-native/src/types/tiers.ts` - Tier type definitions
2. ✅ `frontend-react-native/src/services/tiers.ts` - Tier extraction from JWT
3. ✅ `frontend-react-native/src/hooks/useUserTier.ts` - Tier hook
4. ✅ `frontend-react-native/src/components/TierGuard.tsx` - Tier guard component
5. ✅ `frontend-react-native/src/components/UpgradeCTA.tsx` - Upgrade call-to-action
6. ✅ `frontend-react-native/src/types/iap.ts` - IAP type definitions
7. ✅ `frontend-react-native/src/services/iap.ts` - RevenueCat integration
8. ✅ `frontend-react-native/src/hooks/useIAP.ts` - IAP hook
9. ✅ `frontend-react-native/src/components/IAPFeature.tsx` - IAP feature component
10. ✅ `frontend-react-native/src/providers/TierProvider.tsx` - Tier context provider
11. ✅ `frontend-react-native/src/providers/IAPProvider.tsx` - IAP context provider
12. ✅ Update `frontend-react-native/App.tsx` - Add tier & IAP providers
13. ✅ `frontend-react-native/__tests__/hooks/useUserTier.test.ts` - Tier tests
14. ✅ `frontend-react-native/__tests__/hooks/useIAP.test.ts` - IAP tests
15. ✅ `docs/TIER_SYSTEM.md` - Tier architecture
16. ✅ `docs/IN_APP_PURCHASES.md` - RevenueCat setup

**Tier Structure**:

- `free`: No purchase required (default)
- `standard`: $9.99/month subscription
- `enterprise`: $49.99/month subscription
- `family`: $99.99/year subscription

**SKU Definitions**:

- `free_tier`: Free tier (no purchase)
- `standard_monthly`: $9.99/month
- `enterprise_monthly`: $49.99/month
- `family_annual`: $99.99/year

**Key Points**:

- Extract tier from JWT (decode token in secure storage)
- Validate tier hierarchy (free < standard < enterprise)
- Show upgrade CTA for insufficient tier
- Handle IAP purchase flow
- Verify purchases with backend
- Persist purchase state

**Success Criteria**:

- [ ] User tier extracted correctly from JWT
- [ ] Tier hierarchy enforced
- [ ] TierGuard blocks insufficient tiers
- [ ] Upgrade CTA displayed
- [ ] RevenueCat SDK initialized
- [ ] IAP purchases work in TestFlight
- [ ] Purchases sync to backend
- [ ] Unit tests passing

---

### PHASE 3: Screen Wrapping & Integration (Days 9-12)

**Goal**: Audit and wrap 30+ screens with feature flags and tier guards

**Deliverables**:

1. ✅ Screen audit document (`build-todo/PHASE_3_SCREEN_AUDIT.md`)
2. ✅ Tier mapping document (`build-todo/TIER_MAPPING.md`)
3. ✅ Feature flag mapping document (`build-todo/FEATURE_FLAG_MAPPING.md`)
4. ✅ Wrap Dashboard screens with guards
5. ✅ Wrap Tasks screens with guards
6. ✅ Wrap Auth screens with guards
7. ✅ Wrap all remaining screens (30+ total)
8. ✅ Integration tests for wrapped screens
9. ✅ Manual testing on simulator
10. ✅ Manual testing on real iOS device
11. ✅ Manual testing on real Android device

**Screen Categories**:

**Free Tier Screens**:

- LoginScreen, SignupScreen, DashboardScreen
- TasksScreen, CreateTaskScreen, TaskDetailScreen
- SettingsScreen, ProfileScreen

**Standard Tier Screens** (show upgrade):

- AdvancedAnalytics, CustomReports, DataExport
- CollaborationFeatures, TeamManagement

**Enterprise Tier Screens** (premium):

- AIFeatures, AIAnalytics, CustomBranding
- APIAccess, AdminPanel, AuditLogs

**Feature-Flagged Screens** (behind flags):

- NewDashboardBeta, AIFeatures, ExperimentalUI
- AdvancedSearch, IntelligentSync

**Key Points**:

- Most screens: tier-based or no wrap
- New features: feature flag only
- Premium features: flag + tier combined
- Test with flag enabled and disabled
- Test with different user tiers
- Verify no dead code paths

**Success Criteria**:

- [ ] All 30+ screens categorized
- [ ] Tier-gated screens wrapped
- [ ] Feature-flagged screens wrapped
- [ ] No dead code
- [ ] No infinite loading loops
- [ ] Manual testing on iOS and Android
- [ ] All integration tests passing

---

### PHASE 4: Build Automation with Tekton (Days 13-15)

**Goal**: Automate iOS and Android builds via Tekton

**Deliverables**:

1. ✅ `scripts/build-ios.sh` - iOS build wrapper
2. ✅ `scripts/build-android.sh` - Android build wrapper
3. ✅ `k8s/secret-app-signing.yaml` - K8s secrets for signing certificates
4. ✅ Tekton task for iOS builds (xcodebuild)
5. ✅ Tekton task for Android builds (gradle)
6. ✅ Tekton pipeline with parallel iOS/Android
7. ✅ GitHub webhook integration
8. ✅ Build configuration for develop/staging/main branches
9. ✅ End-to-end build testing

**Build Flows**:

**develop branch** → Debug builds

- iOS: Debug build (not distributed)
- Android: Debug APK (installable)

**staging branch** → TestFlight builds

- iOS: Release build → TestFlight
- Android: Release bundle → Play Store internal

**main branch** → Production releases

- iOS: Release build → App Store
- Android: Release bundle → Play Store production

**Key Points**:

- Parallel iOS + Android builds
- Signing certificates from K8s secrets
- Build artifacts uploaded to storage
- Webhook triggered on push
- Build status reported to GitHub
- Complete in < 30 min (iOS) + < 20 min (Android)

**Success Criteria**:

- [ ] develop branch triggers builds
- [ ] staging branch triggers builds
- [ ] main branch triggers builds
- [ ] iOS build completes in < 30 min
- [ ] Android build completes in < 20 min
- [ ] Signing certificates work
- [ ] Build artifacts accessible
- [ ] No manual steps required

---

### PHASE 5: App Store & Play Store Distribution (Days 16-17)

**Goal**: Automate distribution to TestFlight and app stores

**Deliverables**:

1. ✅ `fastlane/Fastfile` - Fastlane lanes for iOS & Android
2. ✅ `fastlane/Appfile` - App Store Connect credentials
3. ✅ `fastlane/certificates/` - Certificate configurations
4. ✅ App Store Connect API key setup
5. ✅ Google Play Console service account setup
6. ✅ TestFlight beta distribution workflow
7. ✅ Play Store internal testing workflow
8. ✅ App Store production release workflow
9. ✅ Play Store production release workflow
10. ✅ Release notes generation from git tags
11. ✅ End-to-end distribution testing
12. ✅ `docs/APP_STORE_DISTRIBUTION.md` - Distribution guide

**Distribution Flows**:

**TestFlight (iOS)**:

- staging → External testers
- main → Production review

**Play Store (Android)**:

- staging → Internal testing track
- main → Production track

**Key Points**:

- Fastlane automates signing and uploads
- TestFlight setup for QA testing
- Play Store internal testing before release
- Automatic release notes from git
- No manual App Store/Play Store uploads

**Success Criteria**:

- [ ] Fastlane lanes working
- [ ] TestFlight receives builds automatically
- [ ] Play Store receives builds automatically
- [ ] Release notes auto-generated
- [ ] No manual steps needed
- [ ] QA can test before release

---

### PHASE 6: Testing & QA (Days 18-20)

**Goal**: Comprehensive testing and QA validation

**Deliverables**:

1. ✅ Feature flags test suite
   - [ ] Flag fetching on startup
   - [ ] Caching in AsyncStorage
   - [ ] Refresh on pull-to-refresh
   - [ ] Offline scenarios
   - [ ] Re-render on flag change

2. ✅ Tier system test suite
   - [ ] JWT tier extraction
   - [ ] Tier validation
   - [ ] Tier blocking enforcement
   - [ ] Upgrade CTA display

3. ✅ In-App Purchase test suite
   - [ ] Purchase flow
   - [ ] Receipt verification
   - [ ] Backend sync
   - [ ] Restore purchases
   - [ ] Offline handling

4. ✅ Screen integration tests
   - [ ] All wrapped screens testable
   - [ ] Navigation between screens
   - [ ] Deep linking with guards
   - [ ] Loading states

5. ✅ Performance tests
   - [ ] App startup < 3 sec
   - [ ] Flag evaluation < 100ms
   - [ ] IAP flow < 30 sec
   - [ ] No memory leaks

6. ✅ Device testing
   - [ ] iOS 14+ devices
   - [ ] Android 9+ devices
   - [ ] WiFi + cellular
   - [ ] Offline scenarios
   - [ ] Background app state

7. ✅ QA test plan
   - [ ] Test matrix documentation
   - [ ] Test results tracking
   - [ ] Known issues/limitations
   - [ ] Performance metrics
   - [ ] Sign-off confirmation

**Key Points**:

- 90%+ unit test coverage
- Integration tests for all guards
- E2E tests on real devices
- Performance benchmarks
- Crash metric monitoring

**Success Criteria**:

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Manual testing on iOS + Android
- [ ] QA approval on TestFlight
- [ ] Performance metrics acceptable
- [ ] No critical bugs
- [ ] Ready for App Store release

---

## IMPLEMENTATION WORKFLOW

### Branch Strategy

```bash
# Main branches
develop     # Latest development
staging     # Release candidates for QA
main        # Production releases

# Feature branches (one per phase)
feature/feature-flags-sdk         # Phase 1
feature/tier-system-iap           # Phase 2
feature/screen-wrapping           # Phase 3
feature/build-automation          # Phase 4
feature/app-store-distribution    # Phase 5
feature/comprehensive-testing     # Phase 6
```

### Daily Workflow

1. **9:00 AM** - Start work on current phase
2. **Hourly** - Commit progress (small commits)
3. **4:00 PM** - Update todo list with progress
4. **5:00 PM** - Push to feature branch
5. **End of day** - Document blockers

### Phase Completion Checklist

- [ ] All code written and tested locally
- [ ] All tests passing (unit, integration)
- [ ] Manual testing on simulator completed
- [ ] Manual testing on real iOS device completed
- [ ] Manual testing on real Android device completed
- [ ] Code review completed (self-review + peer)
- [ ] Documentation updated
- [ ] PR created and merged to develop
- [ ] No console errors or warnings
- [ ] Performance acceptable

---

## DEPENDENCIES & BLOCKERS

### External Dependencies

- ✅ Backend feature flags endpoint (`GET /api/flags`)
- ✅ Backend JWT with tier field
- ✅ Backend IAP verification endpoint (`POST /api/iap/verify-receipt`)
- ⏳ RevenueCat SDK setup and API key
- ⏳ App Store Connect API key
- ⏳ Google Play Console service account
- ⏳ iOS provisioning profile and certificate
- ⏳ Android keystore and signing key

### Internal Dependencies

- Phase 1 → Phase 2 (flags needed before tier system)
- Phase 2 → Phase 3 (need guards before wrapping screens)
- Phase 3 → Phase 4 (need final code before build automation)
- Phase 4 → Phase 5 (need build automation before distribution)
- Phase 5 → Phase 6 (need distribution before full QA)

### Potential Blockers & Mitigations

| Blocker                    | Mitigation                                         |
| -------------------------- | -------------------------------------------------- |
| Backend not ready          | Use mock API endpoints for testing                 |
| RevenueCat setup delay     | Implement native iOS/Android IAP as fallback       |
| Signing certificate issues | Verify certificate not expired, check provisioning |
| Tekton webhook not working | Manually trigger builds for testing                |
| TestFlight upload fails    | Check bundle ID, signing certificate, API key      |

---

## TESTING STRATEGY

### Unit Tests (90%+ coverage)

- Feature flag service and hook
- Tier service and hook
- IAP service and hook
- Type definitions
- Utility functions

### Integration Tests

- Feature flag guard with different flags
- Tier guard with different tiers
- IAP feature with different purchases
- Combined guards (flag + tier)
- Navigation between guarded screens

### E2E Tests (Real Devices)

- Feature flag fetching and caching
- Tier extraction from JWT
- IAP purchase flow end-to-end
- Screen visibility based on flags/tiers
- Pull-to-refresh flag updates
- Deep linking with guards

### Performance Tests

- App startup time
- Flag evaluation latency
- IAP flow duration
- Memory usage
- Network bandwidth

---

## RESOURCES & REFERENCES

### Documentation Files (To Be Created)

- `docs/FEATURE_FLAGS.md` - Feature flag SDK guide
- `docs/TIER_SYSTEM.md` - Tier system architecture
- `docs/IN_APP_PURCHASES.md` - RevenueCat integration
- `docs/APP_STORE_DISTRIBUTION.md` - Build and distribution

### Cursor Rules (Already Created)

- `.cursor/rules/cerebral-mobile.mdc` - Main workspace rules
- `.cursor/rules/feature-flags-mobile.mdc` - Feature flags implementation guide

### Build Todo Docs (To Be Created)

- `build-todo/PHASE_1_FEATURE_FLAGS.md`
- `build-todo/PHASE_2_TIER_SYSTEM.md`
- `build-todo/PHASE_3_SCREEN_WRAPPING.md`
- `build-todo/PHASE_4_BUILD_AUTOMATION.md`
- `build-todo/PHASE_5_DISTRIBUTION.md`
- `build-todo/PHASE_6_TESTING_QA.md`

### External Resources

- [RevenueCat React Native Docs](https://www.revenuecat.com/docs/reactnative)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Navigation](https://reactnavigation.org/)
- [Fastlane Docs](https://docs.fastlane.tools/)
- [Tekton Pipelines](https://tekton.dev/docs/pipelines/)

---

## TIMELINE

| Week     | Phase   | Tasks                            | Status     |
| -------- | ------- | -------------------------------- | ---------- |
| Week 1   | Phase 1 | Feature flags SDK, tests, docs   | ⏳ Pending |
| Week 2   | Phase 2 | Tier system, IAP, providers      | ⏳ Pending |
| Week 2-3 | Phase 3 | Screen audit, wrapping, testing  | ⏳ Pending |
| Week 3   | Phase 4 | Build scripts, Tekton, webhooks  | ⏳ Pending |
| Week 3-4 | Phase 5 | Fastlane, TestFlight, Play Store | ⏳ Pending |
| Week 4   | Phase 6 | Comprehensive testing, QA        | ⏳ Pending |

**Total Duration**: 4-6 weeks (depending on blockers)

---

## SUCCESS METRICS

After 4-6 weeks:

**Code Quality**:

- ✅ 90%+ unit test coverage
- ✅ Zero critical security vulnerabilities
- ✅ Zero console errors in production build
- ✅ TypeScript strict mode passing

**Functionality**:

- ✅ Feature flags fetched and cached
- ✅ Tier system enforced at screen level
- ✅ In-App Purchases working end-to-end
- ✅ All 30+ screens wrapped appropriately
- ✅ Build automation working
- ✅ Distribution to TestFlight/Play Store working

**Device Testing**:

- ✅ Tested on iOS 14+ devices
- ✅ Tested on Android 9+ devices
- ✅ Tested with WiFi + cellular
- ✅ Tested offline scenarios
- ✅ Tested app backgrounding

**Platform Alignment**:

- ✅ Mobile app aligned with backend feature flags
- ✅ Mobile app aligned with frontend tier system
- ✅ Platform-wide feature flag management
- ✅ Platform-wide tier system enforcement

---

## GETTING STARTED

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- React Native CLI
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- Git

### Initial Setup

```bash
# Install dependencies
cd /Users/bbaer/Development/cerebral-mobile-1
pnpm install

# Install pods for iOS
cd frontend-react-native && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Or run on Android emulator
npm run android
```

### First Phase (Today)

1. ✅ Cursor rules created (DONE)
2. ⏳ Create Phase 1 documentation
3. ⏳ Create feature flags types and service
4. ⏳ Create feature flags hook
5. ⏳ Create FeatureFlagGuard component
6. ⏳ Create provider and update App.tsx
7. ⏳ Write and run unit tests
8. ⏳ Test on simulator

---

## SUMMARY

You now have a complete 4-6 week implementation plan for the Cerebral Mobile app with:

✅ **6 implementation phases** (feature flags → build automation → distribution)
✅ **Workspace rules** (Cursor MDC configuration files)
✅ **Architecture documentation** (before/after structure)
✅ **Phase breakdown** (deliverables, success criteria, daily workflow)
✅ **Testing strategy** (unit, integration, E2E, performance)
✅ **Timeline** (4-6 weeks, week-by-week breakdown)
✅ **Success metrics** (90%+ coverage, zero critical bugs, production-ready)

**Ready to begin Phase 1: Feature Flags SDK**

---

**Plan prepared by**: AI Coding Assistant
**Date**: November 9, 2025
**Status**: ✅ READY FOR EXECUTION
**Next Step**: Begin Phase 1 implementation
