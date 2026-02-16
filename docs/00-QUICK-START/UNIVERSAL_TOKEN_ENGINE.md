# Universal Token Engine (ES256) — Canonical Reference

**Source of truth** lives in the infra repo:

- `cerebral-deployment/docs/04-OPERATIONS/UNIVERSAL_TOKEN_ENGINE_ES256.md`

Mobile-specific guidance (what we follow platform-wide):

- Mobile should not embed long-lived secrets.
- Mobile obtains a Supabase user session first, then calls a platform bootstrap endpoint.
- Server mints **short-lived ES256** bearer tokens (workflow/BMAD/etc.) and returns them.
- Mobile stores tokens in OS secure storage (keychain/keystore) with TTL-aware refresh.
