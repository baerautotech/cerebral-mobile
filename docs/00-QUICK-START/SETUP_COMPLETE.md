# ✅ Cerebral Mobile - Workspace Setup Complete

**Date**: November 9, 2025
**Status**: ✅ Ready for Phase 1 Implementation
**Agent**: You (Mobile Developer)

---

## 🎯 MISSION

Build the **Feature Flags + Tier System + In-App Purchases** system for the Cerebral mobile app (React Native, iOS & Android) over the next 4-6 weeks.

---

## ✅ WHAT'S BEEN SET UP

### 1. Cursor Workspace Rules

```
.cursor/rules/
├── cerebral-mobile.mdc              ✅ General workspace rules
└── feature-flags-mobile.mdc         ✅ Feature flags implementation guide
```

**What's in them:**

- Repository context and key principles
- Screen wrapping patterns (FeatureFlagGuard, TierGuard, IAPFeature)
- Development branches and CI/CD overview
- Common tasks and debugging checklist
- Code patterns for feature flags, tier system, IAP
- Testing strategies
- All resources and documentation locations

**Use these as your reference**: Cursor will show these rules in context as you work.

---

### 2. Implementation Plan

```
MOBILE_IMPLEMENTATION_PLAN.md       ✅ Complete 4-6 week roadmap
```

**What's included:**

- Executive summary (current state → vision)
- 6 implementation phases (Phase 1-6)
- For each phase:
  - Deliverables checklist
  - Key points and success criteria
  - Screen categories and tier mapping
  - Code patterns and examples
- Dependency matrix
- Testing strategy (unit, integration, E2E, performance)
- Timeline (week-by-week)
- Success metrics (90%+ coverage, zero critical bugs)
- Getting started guide

---

### 3. Phase 1 Checklist

```
build-todo/PHASE_1_FEATURE_FLAGS.md  ✅ Detailed Phase 1 breakdown
```

**What's included:**

- 8 detailed deliverables:
  1. Type definitions
  2. Feature flag service
  3. Feature flag hook
  4. FeatureFlagGuard component
  5. FeatureFlagProvider
  6. Update App.tsx
  7. Unit tests
  8. Documentation
- Each with sub-checklist items
- Testing checklist (simulator + real devices)
- Code patterns and templates
- Debugging tips
- Acceptance criteria

---

## 📁 DIRECTORY STRUCTURE

Your mobile app is structured as a **monorepo with workspaces**:

```
cerebral-mobile-1/
├── .cursor/rules/                           ← Cursor configuration ✅
│   ├── cerebral-mobile.mdc
│   └── feature-flags-mobile.mdc
│
├── frontend-react-native/                   ← React Native app (main focus)
│   ├── src/
│   │   ├── hooks/                           ← Will add useFeatureFlags, useUserTier, useIAP
│   │   ├── services/                        ← Will add featureFlags, tiers, iap services
│   │   ├── components/                      ← Will add Guard components
│   │   ├── types/                           ← Will add type definitions
│   │   ├── providers/                       ← Will add context providers
│   │   ├── screens/                         ← 30+ screens to wrap (Phase 3)
│   │   ├── App.tsx                          ← Update with providers (Phase 1)
│   │   └── ...
│   ├── __tests__/                           ← Unit tests (Phase 1-2)
│   ├── android/                             ← Android native code
│   ├── ios/                                 ← iOS native code
│   ├── package.json                         ← Dependencies (Phase 2: add RevenueCat)
│   └── ...
│
├── apps/
│   ├── native/                              ← Alternative native app
│   ├── tablet/                              ← Tablet app
│   └── wearable/                            ← Wearable app
│
├── docs/
│   ├── FEATURE_FLAGS.md                     ← Phase 1 docs (create)
│   ├── TIER_SYSTEM.md                       ← Phase 2 docs (create)
│   ├── IN_APP_PURCHASES.md                  ← Phase 2 docs (create)
│   └── APP_STORE_DISTRIBUTION.md            ← Phase 5 docs (create)
│
├── build-todo/
│   ├── PHASE_1_FEATURE_FLAGS.md             ✅ Current phase
│   ├── PHASE_2_TIER_SYSTEM.md               ⏳ Next phase
│   ├── PHASE_3_SCREEN_WRAPPING.md           ⏳ Future
│   ├── PHASE_4_BUILD_AUTOMATION.md          ⏳ Future
│   ├── PHASE_5_DISTRIBUTION.md              ⏳ Future
│   └── PHASE_6_TESTING_QA.md                ⏳ Future
│
├── k8s/                                     ← Kubernetes configs (Phase 4)
│   ├── secret-app-signing.yaml              ⏳ Create later
│   ├── deployment-ios.yaml
│   └── deployment-android.yaml
│
├── fastlane/                                ← App Store automation (Phase 5)
│   ├── Fastfile                             ⏳ Create later
│   └── Appfile
│
├── scripts/                                 ← Build scripts (Phase 4)
│   ├── build-ios.sh                         ⏳ Create later
│   └── build-android.sh                     ⏳ Create later
│
├── MOBILE_IMPLEMENTATION_PLAN.md            ✅ Your roadmap (read this!)
└── [other files...]
```

---

## 🚀 GETTING STARTED (TODAY)

### Step 1: Install Dependencies

```bash
cd /Users/bbaer/Development/cerebral-mobile-1
pnpm install
cd frontend-react-native && pod install && cd ..
```

### Step 2: Understand the Current State

```bash
# Check current package.json
cat frontend-react-native/package.json

# See what screens exist
ls frontend-react-native/src/screens/

# See what services exist
ls frontend-react-native/src/services/
```

### Step 3: Start Metro Bundler

```bash
npm start
```

### Step 4: Run on Simulator (Try It!)

```bash
# iOS
npm run ios

# Or Android
npm run android
```

### Step 5: Read the Plan

1. Read `MOBILE_IMPLEMENTATION_PLAN.md` (main plan)
2. Read `build-todo/PHASE_1_FEATURE_FLAGS.md` (today's phase)
3. Skim `.cursor/rules/cerebral-mobile.mdc` (your rules)
4. Skim `.cursor/rules/feature-flags-mobile.mdc` (patterns)

---

## 📋 YOUR 6-PHASE ROADMAP

### Phase 1: Feature Flags SDK (Days 1-4)

- [ ] Create feature flag service with AsyncStorage caching
- [ ] Create useFeatureFlags hook
- [ ] Create FeatureFlagGuard component
- [ ] Create FeatureFlagProvider
- [ ] Update App.tsx
- [ ] Write unit tests
- [ ] Test on simulator + real devices

**See**: `build-todo/PHASE_1_FEATURE_FLAGS.md` (detailed)

### Phase 2: Tier System & In-App Purchases (Days 5-8)

- [ ] Create tier service (extract from JWT)
- [ ] Create useUserTier hook
- [ ] Create TierGuard component
- [ ] Integrate RevenueCat for IAP
- [ ] Create useIAP hook
- [ ] Create IAPFeature component
- [ ] Create UpgradeCTA component
- [ ] Write unit + integration tests

**See**: `build-todo/PHASE_2_TIER_SYSTEM.md` (create this phase)

### Phase 3: Screen Wrapping (Days 9-12)

- [ ] Audit all 30+ screens
- [ ] Map tier and feature flag requirements
- [ ] Wrap screens with guards
- [ ] Test on simulator + real devices

**See**: `build-todo/PHASE_3_SCREEN_WRAPPING.md` (create this phase)

### Phase 4: Build Automation (Days 13-15)

- [ ] Create build scripts (iOS + Android)
- [ ] Setup K8s secrets for signing
- [ ] Create Tekton tasks
- [ ] Wire GitHub webhooks

**See**: `build-todo/PHASE_4_BUILD_AUTOMATION.md` (create this phase)

### Phase 5: App Store Distribution (Days 16-17)

- [ ] Setup Fastlane
- [ ] Configure TestFlight uploads
- [ ] Configure Play Store uploads
- [ ] Test distribution workflow

**See**: `build-todo/PHASE_5_DISTRIBUTION.md` (create this phase)

### Phase 6: Testing & QA (Days 18-20)

- [ ] Write comprehensive tests (unit, integration, E2E)
- [ ] Test on real iOS and Android devices
- [ ] Performance benchmarking
- [ ] QA sign-off

**See**: `build-todo/PHASE_6_TESTING_QA.md` (create this phase)

---

## 📚 KEY RESOURCES

### Your Workspace Rules (Read These!)

- `.cursor/rules/cerebral-mobile.mdc` - Principles, patterns, tasks
- `.cursor/rules/feature-flags-mobile.mdc` - Implementation guide with code

### Your Implementation Plan

- `MOBILE_IMPLEMENTATION_PLAN.md` - Complete roadmap (4-6 weeks)
- `build-todo/PHASE_1_FEATURE_FLAGS.md` - Phase 1 details

### Backend API Contract (You'll Need)

```typescript
// GET /api/flags
// Returns: { flag_name: boolean, ... }
// Example: { "ai_features": true, "premium_analytics": false }

// JWT includes: { user_id, tier, ... }
// Tiers: "free" | "standard" | "enterprise"

// POST /api/iap/verify-receipt (Phase 2)
// Body: { receipt, sku, platform }
// Returns: { valid: boolean, tier_upgrade }
```

### External Docs

- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [RevenueCat React Native](https://www.revenuecat.com/docs/reactnative)
- [React Navigation](https://reactnavigation.org/)
- [Fastlane](https://docs.fastlane.tools/)
- [Tekton Pipelines](https://tekton.dev/docs/pipelines/)

---

## 🎬 STARTING PHASE 1 TODAY

### What to Do First

1. ✅ Read `MOBILE_IMPLEMENTATION_PLAN.md`
2. ✅ Read `build-todo/PHASE_1_FEATURE_FLAGS.md`
3. ⏳ Create feature flag types: `frontend-react-native/src/types/featureFlags.ts`
4. ⏳ Create feature flag service: `frontend-react-native/src/services/featureFlags.ts`
5. ⏳ Create useFeatureFlags hook: `frontend-react-native/src/hooks/useFeatureFlags.ts`
6. ⏳ Create FeatureFlagGuard: `frontend-react-native/src/components/FeatureFlagGuard.tsx`
7. ⏳ Create FeatureFlagProvider: `frontend-react-native/src/providers/FeatureFlagProvider.tsx`
8. ⏳ Update App.tsx with provider
9. ⏳ Write unit tests
10. ⏳ Test on simulator

### Success for Phase 1

- [ ] All code written and tested
- [ ] Unit tests > 90% coverage
- [ ] Flags cached in AsyncStorage
- [ ] FeatureFlagGuard working
- [ ] Pull-to-refresh updates flags
- [ ] Offline fallback works
- [ ] No console errors
- [ ] Works on iOS + Android

---

## ❓ FAQ

**Q: Where do I put new files?**
A: In `frontend-react-native/src/` following the structure in `MOBILE_IMPLEMENTATION_PLAN.md`

**Q: What branch do I use?**
A: Create `feature/feature-flags-sdk` from `develop`

**Q: How often should I commit?**
A: Small commits hourly (keep commits focused on single features)

**Q: When do I test?**
A: After each component (don't wait until end of phase)

**Q: What if backend not ready?**
A: Use mock API returning hardcoded flags for testing

**Q: How do I know if I'm on track?**
A: Check `build-todo/PHASE_1_FEATURE_FLAGS.md` checklist daily

**Q: Who reviews my code?**
A: Self-review (thorough), then peer review (if available)

**Q: When do I move to Phase 2?**
A: After Phase 1 complete and tested on real devices

---

## 📞 GETTING HELP

### If You're Stuck

1. Check the workspace rules: `.cursor/rules/cerebral-mobile.mdc`
2. Check the code patterns: `.cursor/rules/feature-flags-mobile.mdc`
3. Check the phase checklist: `build-todo/PHASE_1_FEATURE_FLAGS.md`
4. Check external docs (links in resources)
5. Try mock API if backend not ready

### Common Blockers

- **Backend not ready**: Use hardcoded mock flags
- **AsyncStorage issues**: Add logging, check installation
- **Network errors**: Mock with fake fetch
- **TestFlight issues**: Check certificate, bundle ID, API key
- **Build failures**: Check Xcode/Android Studio logs

---

## ✨ SUMMARY

You now have:

✅ **Workspace rules** configured (Cursor MDC files)
✅ **Implementation plan** for 4-6 weeks (read MOBILE_IMPLEMENTATION_PLAN.md)
✅ **Phase 1 checklist** with detailed deliverables
✅ **Code patterns** ready to use (in .cursor/rules/)
✅ **Directory structure** planned out
✅ **Testing strategy** defined

**You're ready to start Phase 1: Feature Flags SDK**

---

## 🚀 NEXT STEPS

1. **Today**:
   - [ ] Understand repo structure
   - [ ] Verify app runs on simulator
   - [ ] Read MOBILE_IMPLEMENTATION_PLAN.md

2. **Tomorrow (Day 1)**:
   - [ ] Create feature/feature-flags-sdk branch
   - [ ] Create types/featureFlags.ts
   - [ ] Create services/featureFlags.ts
   - [ ] Start on useFeatureFlags hook

3. **Day 2-3**:
   - [ ] Finish useFeatureFlags hook
   - [ ] Create FeatureFlagGuard component
   - [ ] Create FeatureFlagProvider

4. **Day 4**:
   - [ ] Write unit tests
   - [ ] Test on simulator + real devices
   - [ ] Update documentation
   - [ ] Create PR to develop

5. **Day 5**: Start Phase 2 (Tier System & IAP)

---

**Setup completed**: November 9, 2025
**Status**: ✅ Ready to begin
**Estimated Duration**: 4-6 weeks to complete all 6 phases
**Next Milestone**: Phase 1 complete (4 days)

Good luck! You've got this. 🚀
