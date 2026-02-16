## Summary

- **What changed**:
- **Why**:
- **How to test**:

## Module completion checklist (enterprise gate)

### Half‑pipe / design tokens
- [ ] **No hardcoded colors** in app surfaces (use CSS variables / pipe utilities)
- [ ] **Carved surfaces use pipe utilities** (`.pipe-container`, `.pipe-card`, `.pipe-button`, `.pipe-input`, `.pipe-badge`)
- [ ] **Prefer existing primitives** in `src/components/ui/*`
- [ ] **Icons are Phosphor only** (`@phosphor-icons/react`)

### Performance (SRP / bundle / lazyload)
- [ ] **No touched file > 300 lines** in this module (split into hooks/components/services/types)
- [ ] **Routes/workspaces are lazy loaded** (use `lazyLoad` / `createLazyRoute` / `lazyWithRetry`)
- [ ] **Memoization is applied where needed** (`useMemo`/`useCallback` for expensive derivations / stable handlers)
- [ ] **No obvious render churn** (avoid creating new objects/functions in hot render paths)

### Feature flags / licensing
- [ ] **Premium features are guarded** (`FeatureGuard` / `BundleGuard` / `PluginGuard` as applicable)
- [ ] **UI/route behavior is correct when the flag is OFF** (hidden/blocked with upgrade UX)

### State management (Zustand)
- [ ] **Shared state uses Zustand** (not ad-hoc Context for state)
- [ ] **Store boundaries are respected** (no cross-module “god stores” introduced)

### Supabase integration
- [ ] **No new `createClient()` usage** outside `src/utils/supabase/client.ts` (or approved wrappers)
- [ ] **Requests use existing helpers/patterns** (edge headers, config helpers, etc.)

### CI / budgets
- [ ] **CI passes** (lint/typecheck/unit tests/bundle budget)
- [ ] **If this touches Projects**: any modified file >300 lines was refactored as part of this PR


