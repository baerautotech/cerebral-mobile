# Feature Flag Mapping: Beta & Experimental Features

**Reference**: Maps screens & components to feature flags for Phase 3 wrapping

---

## FEATURE FLAG CATEGORIES

### Beta Features (New/Experimental)

Controlled rollout of new functionality

### Experimental Features

Advanced features being tested

### Performance Features

Features with performance implications

---

## FEATURE FLAG DEFINITIONS

### new_dashboard (Beta)

- **Description**: Redesigned dashboard layout
- **Type**: Beta/UI
- **Screen**: DashboardScreen
- **Default**: false (use old dashboard)
- **Impact**: UI changes, better UX
- **Wrapping**: `<FeatureFlagGuard flag="new_dashboard"><NewDashboard/></FeatureFlagGuard>`
- **Fallback**: Show classic dashboard
- **Rollout**: Gradual (0% → 100%)

### live_dashboard (Feature)

- **Description**: Real-time dashboard updates
- **Type**: Core Feature (requires Standard tier)
- **Screen**: LiveDashboardScreen
- **Default**: true (generally available)
- **Dependencies**: Standard tier + Feature flag
- **Wrapping**: Both `<FeatureFlagGuard>` AND `<TierGuard>`
- **Combined**:
  ```typescript
  <FeatureFlagGuard flag="live_dashboard">
    <TierGuard tier="standard">
      <LiveDashboardScreen />
    </TierGuard>
  </FeatureFlagGuard>
  ```

### advanced_filtering (Beta)

- **Description**: Advanced task filtering UI
- **Type**: Beta/Performance
- **Screen**: TasksScreen
- **Default**: false
- **Impact**: Enhanced filtering capabilities
- **Wrapping**: `<FeatureFlagGuard flag="advanced_filtering"><AdvancedFilterBar/></FeatureFlagGuard>`
- **Fallback**: Show basic filters
- **Rollout**: Gradual

### ai_suggestions (Experimental)

- **Description**: AI-powered task suggestions
- **Type**: Experimental/Enterprise
- **Screens**: TasksScreen, CreateTaskScreen, TaskDetailScreen
- **Default**: false
- **Tier**: Enterprise only
- **Dependencies**: Enterprise tier + Feature flag
- **Wrapping**: Both guards needed
- **Rollout**: Experimental (5% → 20% → 50%)

### analytics_export (Feature)

- **Description**: Export analytics as CSV/PDF
- **Type**: Standard tier feature
- **Screen**: DashboardScreen
- **Default**: true
- **Tier**: Standard+
- **Wrapping**: `<TierGuard tier="standard">`
- **Fallback**: Show "Export" button as disabled

### advanced_actions (Beta)

- **Description**: Bulk task actions
- **Type**: Beta
- **Screen**: TasksScreen
- **Default**: false
- **Impact**: Better task management
- **Wrapping**: `<FeatureFlagGuard flag="advanced_actions">`
- **Rollout**: Gradual

### ar_mode (Beta)

- **Description**: AR view of tasks/data
- **Type**: Beta/Enterprise
- **Screen**: ARViewScreen
- **Default**: false
- **Tier**: Enterprise only
- **Dependencies**: Enterprise tier + Feature flag
- **Wrapping**: Both guards needed
- **Rollout**: Early beta (2% → 5%)

### workflow_automation (Experimental)

- **Description**: Automated task workflows
- **Type**: Experimental/Enterprise
- **Screen**: TaskDetailScreen
- **Default**: false
- **Tier**: Enterprise only
- **Wrapping**: Both guards needed
- **Rollout**: Internal testing only

---

## FEATURE FLAG BY SCREEN

### DashboardScreen

```typescript
{/* Base always visible */}
<BasicDashboard />

{/* Beta redesign */}
<FeatureFlagGuard flag="new_dashboard">
  <EnhancedDashboardLayout />
</FeatureFlagGuard>

{/* Standard tier advanced analytics */}
<TierGuard tier="standard">
  <AdvancedAnalytics />
</TierGuard>

{/* Optional export feature */}
<FeatureFlagGuard flag="analytics_export">
  <ExportButton />
</FeatureFlagGuard>

{/* Enterprise AI insights */}
<TierGuard tier="enterprise">
  <AIInsights />
</TierGuard>
```

### TasksScreen

```typescript
{/* Base always visible */}
<BasicTaskList />

{/* Beta advanced filters */}
<FeatureFlagGuard flag="advanced_filtering">
  <AdvancedFilterBar />
</FeatureFlagGuard>

{/* Beta bulk actions */}
<FeatureFlagGuard flag="advanced_actions">
  <BulkActionsBar />
</FeatureFlagGuard>

{/* Experimental AI suggestions */}
<FeatureFlagGuard flag="ai_suggestions">
  <TierGuard tier="enterprise">
    <AISuggestions />
  </TierGuard>
</FeatureFlagGuard>
```

### CreateTaskScreen

```typescript
{/* Base always visible */}
<BasicTaskForm />

{/* Experimental AI suggestions */}
<FeatureFlagGuard flag="ai_suggestions">
  <TierGuard tier="enterprise">
    <AISuggestions />
  </TierGuard>
</FeatureFlagGuard>
```

### TaskDetailScreen

```typescript
{/* Base always visible */}
<TaskBasicInfo />

{/* Standard tier export */}
<TierGuard tier="standard">
  <ExportButton />
</TierGuard>

{/* Experimental AI suggestions */}
<FeatureFlagGuard flag="ai_suggestions">
  <TierGuard tier="enterprise">
    <AISuggestions />
  </TierGuard>
</FeatureFlagGuard>

{/* Experimental workflow automation */}
<FeatureFlagGuard flag="workflow_automation">
  <TierGuard tier="enterprise">
    <WorkflowAutomation />
  </TierGuard>
</FeatureFlagGuard>
```

### LiveDashboardScreen

```typescript
{/* Requires both flag and standard tier */}
<FeatureFlagGuard flag="live_dashboard">
  <TierGuard tier="standard">
    <LiveDashboardContent />
  </TierGuard>
</FeatureFlagGuard>
```

### ARViewScreen

```typescript
{/* Requires both flag and enterprise tier */}
<FeatureFlagGuard flag="ar_mode">
  <TierGuard tier="enterprise">
    <ARViewContent />
  </TierGuard>
</FeatureFlagGuard>
```

---

## ROLLOUT SCHEDULE

### Week 1 (Soft Launch)

```
new_dashboard:       1% of users
advanced_filtering:  1% of users
ar_mode:            0% (not launched yet)
```

### Week 2 (Gradual Rollout)

```
new_dashboard:      10% of users
advanced_filtering: 10% of users
ai_suggestions:      2% of enterprise users
ar_mode:            0% (still internal)
```

### Week 3 (Wider Availability)

```
new_dashboard:      50% of users
advanced_filtering: 50% of users
ai_suggestions:     10% of enterprise users
ar_mode:            5% of enterprise users
```

### Week 4 (Full Rollout)

```
new_dashboard:      100% (or deprecate old)
advanced_filtering: 100%
ai_suggestions:     50% of enterprise users
ar_mode:            20% of enterprise users
```

---

## FLAG ROLLOUT CONTROL

### Backend Configuration

```json
{
  "new_dashboard": {
    "enabled": true,
    "rollout_percentage": 50,
    "target_users": ["user_id_1", "user_id_2"],
    "countries": ["US", "CA", "GB"],
    "tier_requirement": "free"
  },
  "ai_suggestions": {
    "enabled": true,
    "rollout_percentage": 10,
    "target_users": [],
    "countries": ["US"],
    "tier_requirement": "enterprise"
  }
}
```

---

## FEATURE FLAG TESTING

### Test 1: Flag Disabled

```
Expected: Feature should NOT appear
- [x] new_dashboard disabled → show classic dashboard
- [x] advanced_filtering disabled → show basic filters
- [x] ai_suggestions disabled → no suggestions shown
- [x] ar_mode disabled → ARViewScreen not accessible
```

### Test 2: Flag Enabled

```
Expected: Feature should appear
- [x] new_dashboard enabled → show new UI
- [x] advanced_filtering enabled → show advanced filters
- [x] ai_suggestions enabled (+ enterprise) → show suggestions
- [x] ar_mode enabled (+ enterprise) → show AR view
```

### Test 3: Tier + Flag Combined

```
Expected: Both conditions must be true
- [x] ai_suggestions enabled but free tier → hidden
- [x] ai_suggestions enabled and enterprise tier → visible
- [x] ar_mode enabled but standard tier → hidden
- [x] ar_mode enabled and enterprise tier → visible
```

---

## IMPLEMENTATION CHECKLIST

### Phase 3.3: Feature Flag Wrapping

- [ ] Wrap new_dashboard component
- [ ] Wrap advanced_filtering component
- [ ] Wrap ai_suggestions (with TierGuard)
- [ ] Wrap analytics_export component
- [ ] Wrap advanced_actions component
- [ ] Wrap workflow_automation (with TierGuard)
- [ ] Wrap ar_mode (with TierGuard)
- [ ] Test each flag enabled/disabled

### Phase 3.4: Combined Guard Testing

- [ ] Test ai_suggestions: flag off → hidden
- [ ] Test ai_suggestions: flag on, free tier → hidden
- [ ] Test ai_suggestions: flag on, enterprise tier → visible
- [ ] Test ar_mode: similar matrix
- [ ] Test workflow_automation: similar matrix

---

## DEBUGGING FLAGS

### Check Backend Flags

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://api.example.com/api/flags
```

### Check Mobile Cache

```bash
# AsyncStorage contains feature flags
adb shell content query --uri content://com.cerebral.mobile/flags
```

### Manual Override (Development)

```typescript
// In development, override flags
const DEV_FLAGS = {
  new_dashboard: true,
  ai_suggestions: true,
  ar_mode: true,
};
```

---

## SUMMARY

**Total Flags**: 8
**Beta Features**: 4
**Experimental Features**: 2
**Tier-Dependent Flags**: 3
**Screens to Wrap**: 8
**Components to Wrap**: 12+
**Estimated Time**: 2-3 hours

---

**Status**: ✅ FEATURE FLAG MAPPING COMPLETE
**Next**: Begin wrapping screens (Phase 3.2+)
