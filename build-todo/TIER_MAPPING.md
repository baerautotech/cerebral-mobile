# Tier Mapping: Screens & Features

**Reference**: Maps screens to required tier levels for Phase 3 wrapping

---

## TIER HIERARCHY

```
FREE (0)  ← STANDARD (1)  ← ENTERPRISE (2)
```

Users with higher tiers can access all lower tier features.

---

## FREE TIER SCREENS (Default - No wrapping)

### Authentication

- LoginScreen
- SignupScreen

### Core Features

- DashboardScreen (base version)
- TasksScreen (base version)
- CreateTaskScreen
- TaskDetailScreen (base version)

**Implementation**: No TierGuard needed - these are public by default

---

## STANDARD TIER SCREENS

### Real-time Features

- **LiveDashboardScreen**
  - Requires: Standard tier or higher
  - Description: Live updating dashboard with real-time metrics
  - Wrapping: `<TierGuard tier="standard"><LiveDashboardScreen /></TierGuard>`
  - Fallback: "This feature requires Standard tier. Upgrade to continue."
  - Cost: $9.99/month

### Standard Tier Features (in Free Screens)

- Advanced Analytics (in Dashboard)
- Custom Reports (in Dashboard)
- Advanced Task Filtering (in TasksScreen)
- Data Export (in TaskDetailScreen)
- Team Collaboration (in CreateTaskScreen)

**Implementation Pattern**:

```typescript
<View>
  {/* Base feature - always visible */}
  <BasicStats />

  {/* Standard tier feature */}
  <TierGuard tier="standard">
    <AdvancedAnalytics />
  </TierGuard>
</View>
```

---

## ENTERPRISE TIER SCREENS

### Premium Features

- **ARViewScreen** (Augmented Reality)
  - Requires: Enterprise tier
  - Description: AR visualization of data and tasks
  - Wrapping: `<TierGuard tier="enterprise"><ARViewScreen /></TierGuard>`
  - Fallback: "AR features require Enterprise tier. Upgrade to unlock."
  - Cost: $49.99/month

### Enterprise Tier Features (in Free Screens)

- AI-Powered Insights
- Custom Integrations
- Team Management
- API Access
- Audit Logs
- Custom Branding
- Advanced Scheduling
- Workflow Automation

**Implementation Pattern**:

```typescript
<View>
  {/* Base feature - always visible */}
  <BasicTasks />

  {/* Enterprise tier feature */}
  <TierGuard tier="enterprise">
    <WorkflowAutomation />
  </TierGuard>
</View>
```

---

## SCREEN-BY-SCREEN TIER REQUIREMENTS

| Screen              | Min Tier   | Features                                                     | Wrapping                |
| ------------------- | ---------- | ------------------------------------------------------------ | ----------------------- |
| LoginScreen         | Free       | None                                                         | ❌ None                 |
| SignupScreen        | Free       | None                                                         | ❌ None                 |
| DashboardScreen     | Free       | Basic: ✅<br/>Advanced: Standard<br/>Insights: Enterprise    | ⚠️ Partial (components) |
| TasksScreen         | Free       | Basic: ✅<br/>Filtering: Standard<br/>Automation: Enterprise | ⚠️ Partial (components) |
| CreateTaskScreen    | Free       | Basic: ✅<br/>AI: Enterprise                                 | ⚠️ Partial (components) |
| TaskDetailScreen    | Free       | Basic: ✅<br/>Export: Standard<br/>Workflow: Enterprise      | ⚠️ Partial (components) |
| LiveDashboardScreen | Standard   | Real-time: ✅                                                | ✅ Full (screen)        |
| ARViewScreen        | Enterprise | AR View: ✅                                                  | ✅ Full (screen)        |

---

## TIER GUARD WRAPPING LOCATIONS

### Full Screen Wrapping (Entire Screen)

```
Location: src/screens/LiveDashboardScreen.tsx
Guard: <TierGuard tier="standard">
  <LiveDashboardScreen />
</TierGuard>

Location: src/screens/ARViewScreen.tsx
Guard: <TierGuard tier="enterprise">
  <ARViewScreen />
</TierGuard>
```

### Partial Component Wrapping (Feature within Screen)

```
Location: src/screens/Dashboard/DashboardScreen.tsx
Guard: <TierGuard tier="standard">
  <AdvancedAnalytics />
</TierGuard>

Guard: <TierGuard tier="enterprise">
  <AIInsights />
</TierGuard>

Location: src/screens/Tasks/TasksScreen.tsx
Guard: <TierGuard tier="standard">
  <AdvancedFiltering />
</TierGuard>

Guard: <TierGuard tier="enterprise">
  <AutomationRules />
</TierGuard>

Location: src/screens/CreateTask/CreateTaskScreen.tsx
Guard: <TierGuard tier="enterprise">
  <AISuggestions />
</TierGuard>

Location: src/screens/TaskDetail/TaskDetailScreen.tsx
Guard: <TierGuard tier="standard">
  <DataExport />
</TierGuard>

Guard: <TierGuard tier="enterprise">
  <WorkflowAutomation />
</TierGuard>
```

---

## UPGRADE FLOW

When user doesn't have required tier:

### Standard Tier Upgrade Path

1. User clicks on Standard tier feature
2. TierGuard shows upgrade prompt
3. Prompt shows: "Requires Standard Tier - $9.99/month"
4. User taps "Upgrade" button
5. Navigates to in-app purchase screen
6. User purchases standard_monthly SKU
7. Tier updates in JWT
8. useUserTier hook refreshes
9. Component re-renders showing feature

### Enterprise Tier Upgrade Path

1. User clicks on Enterprise tier feature
2. TierGuard shows upgrade prompt
3. Prompt shows: "Requires Enterprise Tier - $49.99/month"
4. User taps "Upgrade" button
5. Navigates to in-app purchase screen
6. User purchases enterprise_monthly SKU
7. Tier updates in JWT
8. useUserTier hook refreshes
9. Component re-renders showing feature

---

## PRICING STRUCTURE

| Tier       | Price     | Features                          | SKU                |
| ---------- | --------- | --------------------------------- | ------------------ |
| Free       | Free      | Basic dashboard, tasks, search    | free_tier          |
| Standard   | $9.99/mo  | Live dashboard, analytics, export | standard_monthly   |
| Enterprise | $49.99/mo | AR view, AI, integrations, API    | enterprise_monthly |
| Family     | $99.99/yr | Everything Standard + shared      | family_annual      |

---

## CUSTOMER JOURNEY

```
User Signup
    ↓
Default: Free Tier
    ├─ Access: DashboardScreen, TasksScreen, etc. ✅
    ├─ Blocked: LiveDashboardScreen ❌
    └─ Blocked: ARViewScreen ❌

User Upgrades to Standard
    ↓
Standard Tier (via In-App Purchase)
    ├─ Access: All Free + LiveDashboardScreen ✅
    ├─ Access: Advanced Analytics ✅
    ├─ Blocked: ARViewScreen ❌
    └─ Blocked: AI Features ❌

User Upgrades to Enterprise
    ↓
Enterprise Tier (via In-App Purchase)
    ├─ Access: All Free ✅
    ├─ Access: All Standard ✅
    ├─ Access: ARViewScreen ✅
    └─ Access: All Premium Features ✅
```

---

## TESTING TIER CHECKS

### Test 1: Free Tier User

```
Expected Results:
- [x] Can view DashboardScreen
- [x] Can view TasksScreen
- [x] Cannot see LiveDashboardScreen
- [x] Cannot see ARViewScreen
- [x] Cannot see Advanced Analytics
- [x] Cannot see AI Features
```

### Test 2: Standard Tier User

```
Expected Results:
- [x] Can view DashboardScreen + Advanced Analytics
- [x] Can view TasksScreen
- [x] Can view LiveDashboardScreen
- [x] Cannot see ARViewScreen
- [x] Cannot see AI Features
- [x] Sees "Upgrade to Enterprise" for AR
```

### Test 3: Enterprise Tier User

```
Expected Results:
- [x] Can view all Free features
- [x] Can view all Standard features
- [x] Can view ARViewScreen
- [x] Can see AI Features everywhere
- [x] No upgrade prompts
- [x] Full feature access
```

---

## MIGRATION NOTES

### For Existing Free Users

- No changes to their access
- New tier-gated features appear as "Upgrade" buttons
- Smooth upgrade path to Standard or Enterprise

### For New Features

- Always add tier requirement upfront
- Use TierGuard to enforce
- Show upgrade prompts clearly
- Link to in-app purchase

### For Feature Removal

- Deprecate with 30-day notice
- Move to different tier if applicable
- Provide migration path

---

## SUMMARY

**Free Tier**: 6 screens, all base features
**Standard Tier**: LiveDashboardScreen + advanced components
**Enterprise Tier**: ARViewScreen + premium features
**Total Tier Guards**: 2 full-screen + 6 partial component
**Estimated Implementation**: 2-3 hours

---

**Status**: ✅ TIER MAPPING COMPLETE
**Next**: Feature flag mapping document
