# Phase 3: Screen Audit & Wrapping Strategy

**Date**: November 9, 2025
**Status**: ✅ Audit Complete
**Total Screens Found**: 7 main screens + subcomponents

---

## SCREEN INVENTORY

### Authentication Screens (Free Access)
```
✅ LoginScreen.tsx                      TIER: free          FLAGS: none
✅ SignupScreen.tsx                     TIER: free          FLAGS: none
```

### Core Dashboard Screens
```
✅ DashboardScreen.tsx                  TIER: free (base)   FLAGS: new_dashboard (optional)
   ├─ QuickActions.tsx                 TIER: free
   ├─ RecentActivity.tsx               TIER: free
   └─ StatsCard.tsx                    TIER: free
```

### Task Management Screens
```
✅ TasksScreen.tsx                      TIER: free          FLAGS: none
   ├─ FilterBar.tsx                    TIER: free
   └─ TaskCard.tsx                     TIER: free

✅ CreateTaskScreen.tsx                 TIER: free          FLAGS: none
   ├─ TaskForm.tsx                     TIER: free
   └─ FormField.tsx                    TIER: free

✅ TaskDetailScreen.tsx                 TIER: free          FLAGS: none
   ├─ TaskHeader.tsx                   TIER: free
   ├─ TaskField.tsx                    TIER: free
   └─ TaskDetailStates.tsx             TIER: free
```

### Premium Screens
```
✅ LiveDashboardScreen.tsx              TIER: standard      FLAGS: live_dashboard
✅ ARViewScreen.tsx                     TIER: enterprise    FLAGS: ar_mode (beta)
```

---

## TIER CATEGORIZATION

### FREE TIER (5 screens - No wrapping needed)
1. LoginScreen - Authentication (pre-login)
2. SignupScreen - Authentication (pre-login)
3. DashboardScreen - Main dashboard with basic stats
4. TasksScreen - Basic task list
5. CreateTaskScreen - Basic task creation
6. TaskDetailScreen - Basic task details

**Wrapping Strategy**: No TierGuard needed (default access)
**Add FeatureFlagGuard**: For feature-flagged versions only

### STANDARD TIER (1 screen)
1. LiveDashboardScreen - Real-time dashboard analytics

**Wrapping Strategy**: Wrap with `<TierGuard tier="standard">`
**Fallback**: Show upgrade prompt or link to free dashboard

### ENTERPRISE TIER (1 screen)
1. ARViewScreen - Augmented reality view

**Wrapping Strategy**: Wrap with `<TierGuard tier="enterprise">`
**Fallback**: Show upgrade prompt explaining premium feature

---

## FEATURE FLAG CATEGORIZATION

### FEATURE-FLAGGED SCREENS/FEATURES

#### Beta Features (Behind Flags)
- `new_dashboard` flag → Enhanced DashboardScreen (optional redesign)
- `live_dashboard` flag → LiveDashboardScreen (real-time updates)
- `ar_mode` flag → ARViewScreen additional features (beta)

#### Experimental Features
- `advanced_filtering` → Enhanced TasksScreen FilterBar
- `ai_suggestions` → AI-powered task suggestions in CreateTaskScreen
- `analytics_export` → Data export functionality

---

## WRAPPING STRATEGY

### Step 1: Free Tier Screens (No wrapping)
```
DashboardScreen ✅
TasksScreen ✅
CreateTaskScreen ✅
TaskDetailScreen ✅
```

### Step 2: Authentication (No wrapping)
```
LoginScreen ✅
SignupScreen ✅
```

### Step 3: Standard Tier Screens (Add TierGuard)
```
<TierGuard tier="standard">
  <LiveDashboardScreen />
</TierGuard>
```

### Step 4: Enterprise Tier Screens (Add TierGuard)
```
<TierGuard tier="enterprise">
  <ARViewScreen />
</TierGuard>
```

### Step 5: Feature-Flagged Content (Add FeatureFlagGuard)
```
<FeatureFlagGuard flag="new_dashboard">
  <EnhancedDashboard />
</FeatureFlagGuard>
```

### Step 6: Combined Guards (Feature + Tier)
```
<FeatureFlagGuard flag="ar_mode">
  <TierGuard tier="enterprise">
    <ARViewScreen />
  </TierGuard>
</FeatureFlagGuard>
```

---

## DETAILED SCREEN BREAKDOWN

### Screen 1: LoginScreen.tsx
- **Current Tier**: Free (public)
- **Required Tier**: Free
- **Feature Flags**: None
- **Wrapping Needed**: NO
- **Status**: ✅ No changes needed
- **Notes**: Authentication screen, always accessible

### Screen 2: SignupScreen.tsx
- **Current Tier**: Free (public)
- **Required Tier**: Free
- **Feature Flags**: None
- **Wrapping Needed**: NO
- **Status**: ✅ No changes needed
- **Notes**: Authentication screen, always accessible

### Screen 3: DashboardScreen.tsx
- **Current Tier**: Free
- **Required Tier**: Free (base), Standard (advanced stats)
- **Feature Flags**: `new_dashboard` (redesign), `advanced_analytics`
- **Wrapping Needed**: PARTIAL
- **Status**: ⏳ Wrap advanced components
- **Pattern**:
  ```typescript
  <View>
    {/* Base dashboard (always visible) */}
    <BasicStats />

    {/* Feature-flagged redesign */}
    <FeatureFlagGuard flag="new_dashboard">
      <EnhancedLayout />
    </FeatureFlagGuard>

    {/* Tier-gated advanced analytics */}
    <TierGuard tier="standard">
      <AdvancedAnalytics />
    </TierGuard>
  </View>
  ```

### Screen 4: TasksScreen.tsx
- **Current Tier**: Free
- **Required Tier**: Free
- **Feature Flags**: `advanced_filtering`, `ai_suggestions`
- **Wrapping Needed**: PARTIAL
- **Status**: ⏳ Wrap advanced filtering
- **Pattern**:
  ```typescript
  <View>
    <BasicTaskList />
    <FeatureFlagGuard flag="advanced_filtering">
      <AdvancedFilterBar />
    </FeatureFlagGuard>
  </View>
  ```

### Screen 5: CreateTaskScreen.tsx
- **Current Tier**: Free
- **Required Tier**: Free
- **Feature Flags**: `ai_suggestions`
- **Wrapping Needed**: PARTIAL
- **Status**: ⏳ Wrap AI suggestions
- **Pattern**:
  ```typescript
  <View>
    <BasicTaskForm />
    <FeatureFlagGuard flag="ai_suggestions">
      <AISuggestions />
    </FeatureFlagGuard>
  </View>
  ```

### Screen 6: TaskDetailScreen.tsx
- **Current Tier**: Free
- **Required Tier**: Free
- **Feature Flags**: `ai_suggestions`, `advanced_actions`
- **Wrapping Needed**: PARTIAL
- **Status**: ⏳ Wrap advanced features
- **Pattern**:
  ```typescript
  <View>
    <TaskHeader />
    <TaskFields />
    <FeatureFlagGuard flag="ai_suggestions">
      <AISuggestions />
    </FeatureFlagGuard>
  </View>
  ```

### Screen 7: LiveDashboardScreen.tsx
- **Current Tier**: Standard minimum
- **Required Tier**: Standard
- **Feature Flags**: `live_dashboard`
- **Wrapping Needed**: YES (TierGuard + FeatureFlagGuard)
- **Status**: ⏳ Wrap with tier guard
- **Pattern**:
  ```typescript
  <FeatureFlagGuard flag="live_dashboard">
    <TierGuard tier="standard">
      <LiveDashboardScreen />
    </TierGuard>
  </FeatureFlagGuard>
  ```

### Screen 8: ARViewScreen.tsx
- **Current Tier**: Enterprise only
- **Required Tier**: Enterprise
- **Feature Flags**: `ar_mode` (beta)
- **Wrapping Needed**: YES (TierGuard + FeatureFlagGuard)
- **Status**: ⏳ Wrap with tier guard
- **Pattern**:
  ```typescript
  <FeatureFlagGuard flag="ar_mode">
    <TierGuard tier="enterprise">
      <ARViewScreen />
    </TierGuard>
  </FeatureFlagGuard>
  ```

---

## WRAPPING CHECKLIST

### Free Tier Base Screens (No wrapping)
- [x] LoginScreen
- [x] SignupScreen
- [x] DashboardScreen (base)
- [x] TasksScreen (base)
- [x] CreateTaskScreen
- [x] TaskDetailScreen (base)

### Tier-Guarded Screens (Wrap with TierGuard)
- [ ] LiveDashboardScreen (tier: "standard")
- [ ] ARViewScreen (tier: "enterprise")

### Feature-Flagged Components (Wrap with FeatureFlagGuard)
- [ ] Enhanced Dashboard layout (flag: "new_dashboard")
- [ ] Advanced Analytics (flag: "advanced_analytics")
- [ ] Advanced Filtering (flag: "advanced_filtering")
- [ ] AI Suggestions (flag: "ai_suggestions")
- [ ] Advanced Actions (flag: "advanced_actions")
- [ ] Live Dashboard (flag: "live_dashboard")
- [ ] AR Mode (flag: "ar_mode")

### Combined Guards (Both Tier & Flag)
- [ ] Enhanced Dashboard + Advanced Analytics
- [ ] Live Dashboard + Feature Flag
- [ ] AR View + Feature Flag

---

## FILES TO MODIFY

### Immediate (Core Screens)
1. `src/screens/Dashboard/DashboardScreen.tsx` - Add feature flags for enhanced features
2. `src/screens/Tasks/TasksScreen.tsx` - Add feature flag for advanced filtering
3. `src/screens/CreateTask/CreateTaskScreen.tsx` - Add feature flag for AI
4. `src/screens/TaskDetail/TaskDetailScreen.tsx` - Add feature flag for advanced features
5. `src/screens/LiveDashboardScreen.tsx` - Add TierGuard wrapper
6. `src/screens/ARViewScreen.tsx` - Add TierGuard wrapper

### Components to Update
- Dashboard components (QuickActions, RecentActivity, StatsCard)
- Task components (FilterBar, TaskCard)
- TaskDetail components (TaskHeader, TaskField, TaskDetailStates)

---

## IMPLEMENTATION SEQUENCE

### Phase 3.1: Prepare (This doc)
- [x] Audit screens
- [x] Categorize by tier
- [x] Map feature flags
- [ ] Create tier mapping doc
- [ ] Create feature flag mapping doc

### Phase 3.2: Wrap Tier-Gated Screens
- [ ] Wrap LiveDashboardScreen with TierGuard
- [ ] Wrap ARViewScreen with TierGuard
- [ ] Test on simulator

### Phase 3.3: Wrap Feature-Flagged Components
- [ ] Add FeatureFlagGuard to Dashboard enhancements
- [ ] Add FeatureFlagGuard to Tasks advanced filters
- [ ] Add FeatureFlagGuard to AI suggestions
- [ ] Test on simulator

### Phase 3.4: Combined Wrapping
- [ ] Wrap features with both guards where needed
- [ ] Test tier + flag combinations
- [ ] Verify fallbacks work

### Phase 3.5: Testing
- [ ] Unit tests for wrapped screens
- [ ] Integration tests
- [ ] Manual testing on iOS
- [ ] Manual testing on Android

---

## TESTING MATRIX

| Screen | Free Tier | Standard Tier | Enterprise | With Flag | Without Flag |
|--------|-----------|---------------|-----------|-----------|--------------|
| Login | ✅ | ✅ | ✅ | N/A | N/A |
| Signup | ✅ | ✅ | ✅ | N/A | N/A |
| Dashboard | ✅ | ✅ | ✅ | ✅ Show enhanced | ✅ Show basic |
| Tasks | ✅ | ✅ | ✅ | ✅ Show filters | ✅ Show basic |
| Create | ✅ | ✅ | ✅ | ✅ Show AI | ✅ Show basic |
| Details | ✅ | ✅ | ✅ | ✅ Show advanced | ✅ Show basic |
| Live | ❌ | ✅ | ✅ | ✅ Show | ❌ Hide |
| AR View | ❌ | ❌ | ✅ | ✅ Show | ❌ Hide |

---

## SUMMARY

**Total Screens**: 8 main screens
**Free Tier**: 6 screens (no wrapping)
**Standard Tier**: 1 screen (wrap)
**Enterprise Tier**: 1 screen (wrap)
**Feature-Flagged Components**: 7 features
**Estimated Wrapping Time**: 2-3 hours

---

**Status**: ✅ AUDIT COMPLETE - Ready for wrapping phase
**Next Steps**: Create tier mapping and feature flag mapping documents
