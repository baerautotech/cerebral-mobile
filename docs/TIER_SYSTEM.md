# Tier System Implementation Guide

**Date**: November 9, 2025
**Status**: ✅ Phase 2 Complete
**Framework**: React Native with TypeScript

---

## Overview

The tier system controls feature access based on user subscription level. Users are assigned one of three tiers: Free, Standard, or Enterprise.

### Tier Hierarchy
```
Free (0)  ← Standard (1)  ← Enterprise (2)
```

Higher tiers include all features from lower tiers plus additional premium features.

---

## Tier Levels

### Free Tier (Default)
- No payment required
- Basic features only
- Community support
- Default for all new users

### Standard Tier ($9.99/month)
- Includes all Free tier features
- Advanced analytics
- Custom reports
- Data export
- Email support
- Team collaboration

### Enterprise Tier ($49.99/month)
- Includes all Standard tier features
- AI-powered insights
- Custom integrations
- Team management
- Custom branding
- API access
- Priority support
- Audit logs

---

## Architecture

### Data Flow
```
App Start
    ↓
useAuth() gets JWT token
    ↓
Extract tier from JWT payload
    ↓
Validate tier (free, standard, or enterprise)
    ↓
Store in TierContext
    ↓
Components use TierGuard or useUserTier
```

### Components

1. **Types** (`src/types/tiers.ts`)
   - `TierLevel` - Type union: 'free' | 'standard' | 'enterprise'
   - `UserTier` - User tier information
   - `TierConfig` - Tier configuration with display info

2. **Service** (`src/services/tiers.ts`)
   - `extractTierFromJWT()` - Extract tier from JWT
   - `hasTierAccess()` - Check tier hierarchy
   - `getTierLevel()` - Get numeric tier level
   - `formatTierName()` - Format for display

3. **Hook** (`src/hooks/useUserTier.ts`)
   - Extracts tier from JWT
   - Provides `hasTier()` method
   - Returns `{ tier, loading, refresh, hasTier }`

4. **Component** (`src/components/TierGuard.tsx`)
   - Wraps content behind tier requirement
   - Shows upgrade prompt if insufficient tier
   - Supports fallback UI

5. **Provider** (`src/providers/TierProvider.tsx`)
   - React Context provider
   - Makes tier available app-wide

---

## Usage

### Step 1: Wrap Your App

In `App.tsx`:
```typescript
import { TierProvider } from './src/providers/TierProvider';

export function App() {
  return (
    <TierProvider>
      <YourApp />
    </TierProvider>
  );
}
```

### Step 2: Use TierGuard in Screens

```typescript
import { TierGuard } from '../components/TierGuard';

export function DashboardScreen() {
  return (
    <View>
      <Text>Always visible</Text>

      {/* Show only to standard+ users */}
      <TierGuard tier="standard">
        <AdvancedAnalyticsScreen />
      </TierGuard>

      {/* Show only to enterprise users */}
      <TierGuard tier="enterprise">
        <AIFeaturesScreen />
      </TierGuard>

      {/* With custom fallback */}
      <TierGuard
        tier="enterprise"
        fallback={<Text>Available in Enterprise plan only</Text>}
      >
        <CustomBrandingFeature />
      </TierGuard>
    </View>
  );
}
```

### Step 3: Check Tier in Code

```typescript
import { useUserTier } from '../hooks/useUserTier';

export function MyComponent() {
  const { tier, hasTier, loading } = useUserTier();

  if (loading) return <LoadingSpinner />;

  if (tier === 'enterprise') {
    return <PremiumFeature />;
  }

  if (hasTier('standard')) {
    return <StandardFeature />;
  }

  return <FreeFeature />;
}
```

---

## JWT Token Structure

Your backend should return a JWT with the `tier` field:

```json
{
  "user_id": "user_123",
  "email": "user@example.com",
  "tier": "standard",
  "iat": 1699592850,
  "exp": 1699679250
}
```

### Supported Tier Fields
The system checks for these field names in order:
1. `tier`
2. `user_tier`

If neither exists, defaults to `free`.

---

## Tier Hierarchy

The system enforces tier hierarchy:
- `hasTier('free')` returns true for all tiers
- `hasTier('standard')` returns true for standard and enterprise
- `hasTier('enterprise')` returns true for enterprise only

```typescript
const { hasTier } = useUserTier();

hasTier('free');       // true for all users
hasTier('standard');   // true if standard or enterprise
hasTier('enterprise'); // true if enterprise
```

---

## Common Patterns

### Pattern 1: Simple Tier Check
```typescript
<TierGuard tier="standard">
  <AdvancedFeature />
</TierGuard>
```

### Pattern 2: With Fallback UI
```typescript
<TierGuard
  tier="enterprise"
  fallback={<Text>Upgrade to Enterprise to unlock</Text>}
>
  <EnterpriseFeature />
</TierGuard>
```

### Pattern 3: Hook-Based Check
```typescript
function MyScreen() {
  const { hasTier, tier } = useUserTier();

  if (!hasTier('standard')) {
    return <UpgradePrompt />;
  }

  return <StandardFeature />;
}
```

### Pattern 4: Combined with Feature Flags
```typescript
<FeatureFlagGuard flag="premium_analytics_beta">
  <TierGuard tier="enterprise">
    <BetaAnalytics />
  </TierGuard>
</FeatureFlagGuard>
```

---

## Tier Management

### Updating User Tier

When a user upgrades via in-app purchase or backend changes the tier:

```typescript
// The tier is extracted fresh from JWT on each app start
// After user upgrades:
// 1. Backend updates user tier in database
// 2. Backend returns new JWT with new tier
// 3. Mobile stores new JWT
// 4. Call refresh() to re-extract tier

const { refresh } = useUserTier();
await refresh(); // Re-extract tier from updated JWT
```

### Tier Expiration

Tiers can have expiration dates (for trial periods):

```typescript
const { tierInfo } = useUserTier();

if (tierInfo?.expiresAt) {
  const expiryDate = new Date(tierInfo.expiresAt);
  const daysLeft = Math.floor(
    (expiryDate - new Date()) / (1000 * 60 * 60 * 24)
  );
  console.log(`Tier expires in ${daysLeft} days`);
}
```

---

## Testing

### Running Tests
```bash
npm test
```

### Test Scenarios

1. ✅ Free tier users can't see premium features
2. ✅ Standard tier users can see standard features
3. ✅ Enterprise users can see all features
4. ✅ Invalid tiers default to free
5. ✅ Missing JWT token defaults to free
6. ✅ Tier extraction from JWT works
7. ✅ TierGuard renders children for sufficient tier
8. ✅ TierGuard shows fallback for insufficient tier

---

## Debugging

### Check Extracted Tier
```typescript
import { extractTierFromJWT } from '../services/tiers';

const token = await getAuthToken();
const tier = extractTierFromJWT(token);
console.log('Extracted tier:', tier);
```

### Console Logging
The tier system includes console logs:
```
"Tier extracted from JWT: standard"
"User tier loaded: enterprise"
```

### Common Issues

**Issue**: All users see as free tier
- Verify backend returns JWT with `tier` field
- Check JWT format is valid
- Verify tier value is lowercase: 'free', 'standard', 'enterprise'

**Issue**: TierGuard always shows fallback
- Check JWT extraction with console.log
- Verify tier hierarchy (hasTierAccess logic)
- Ensure useUserTier hook is within TierProvider

**Issue**: Tier doesn't update after purchase
- Call `refresh()` after purchase completes
- Ensure backend returns updated JWT
- Check new JWT contains new tier

---

## Best Practices

### ✅ DO
- Use tier-based access for core monetization
- Combine tiers with feature flags for A/B testing
- Show upgrade prompts for insufficient tier
- Cache tier in JWT (don't query backend per request)
- Validate tier server-side for premium actions

### ❌ DON'T
- Use tier for user-specific logic (use user_id)
- Trust client-side tier checks alone
- Hardcode tier values in UI
- Forget to validate tier server-side
- Skip showing upgrade prompts

---

## Integration with Feature Flags

Combine tier system with feature flags:

```typescript
// Feature flag for beta feature
// Tier requirement for premium version
<FeatureFlagGuard flag="analytics_beta">
  <TierGuard tier="enterprise">
    <BetaAnalytics />
  </TierGuard>
</FeatureFlagGuard>
```

---

## Integration with In-App Purchases

Tiers are upgraded via IAP:

1. User starts at free tier
2. User purchases via in-app purchase (IAP)
3. Backend receives purchase verification
4. Backend updates user tier
5. Backend returns new JWT with new tier
6. Mobile extracts new tier on next JWT refresh
7. Features now visible with new tier

See `IN_APP_PURCHASES.md` for purchase flow details.

---

## Tier Configuration

Edit `src/types/tiers.ts` to customize tier names, descriptions, and features:

```typescript
export const TIER_CONFIGS: Record<TierLevel, TierConfig> = {
  free: {
    name: 'Free',
    description: 'Get started with basic features',
    price: 'Free',
    features: [...],
  },
  standard: {
    name: 'Standard',
    price: '$9.99',
    features: [...],
  },
  enterprise: {
    name: 'Enterprise',
    price: '$49.99',
    features: [...],
  },
};
```

---

## Related Documentation

- `FEATURE_FLAGS.md` - Feature flags integration
- `IN_APP_PURCHASES.md` - In-app purchases
- `MOBILE_IMPLEMENTATION_PLAN.md` - Full roadmap
- `.cursor/rules/cerebral-mobile.mdc` - Code patterns

---

## Summary

The tier system:
- ✅ **Simple**: Hierarchy-based access control
- ✅ **Secure**: Server-side validation via JWT
- ✅ **Flexible**: Supports multiple tiers
- ✅ **Integrated**: Works with feature flags and IAP
- ✅ **Tested**: Comprehensive test coverage
- ✅ **Documented**: Clear patterns and examples

---

**Status**: ✅ COMPLETE
**Created**: November 9, 2025
**Phase**: 2 - Tier System & In-App Purchases
