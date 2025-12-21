# Secret Scan Report (Redacted)

- **repo**: `/Users/bbaer/Development/cerebral-mobile-1`
- **findings**: `2`

This report is redacted: it lists **file paths + line numbers + metadata only** (no secret values).

## inline_secret_assignment

- `frontend-react-native/FILE_STRUCTURE_GUIDELINES.md`:L247 — key `api_key`, value_len `13`
- `frontend-react-native/src/services/BackendClient.test.ts`:L337 — key `secret`, value_len `16`
