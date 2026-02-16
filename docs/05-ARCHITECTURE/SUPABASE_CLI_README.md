# Supabase Database Access - CLI Only

**Status**: Production Ready
**Method**: Supabase CLI (No MCP)
**Global Config**: `~/.cursor/.env.supabase`

---

## Quick Start

Load the global Supabase configuration:

```bash
source ~/.cursor/.env.supabase
```

Then use any Supabase CLI command:

```bash
# List tables
supabase db ls --project-ref=$SUPABASE_PROJECT_REF

# Query data
supabase sql query --project-ref=$SUPABASE_PROJECT_REF "SELECT * FROM users LIMIT 5;"

# Check schema
supabase db columns --project-ref=$SUPABASE_PROJECT_REF --table users
```

---

## Why CLI Instead of MCP?

- ✅ Stable (no crashes)
- ✅ Full functionality
- ✅ Simple to use
- ✅ Better maintained
- ❌ MCP was broken (deprecated)

---

## Global Configuration

All Supabase credentials are available at: `~/.cursor/.env.supabase`

```bash
SUPABASE_PROJECT_REF=txlzlhcrfippujcmnief
SUPABASE_URL=https://txlzlhcrfippujcmnief.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ACCESS_TOKEN=sbp_...
SUPABASE_DB_HOST=txlzlhcrfippujcmnief.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASS=...
```

Load with: `source ~/.cursor/.env.supabase`

---

## Common Commands

```bash
# Load environment first!
source ~/.cursor/.env.supabase

# List all tables
supabase db ls --project-ref=$SUPABASE_PROJECT_REF

# Run SQL query
supabase sql query --project-ref=$SUPABASE_PROJECT_REF "SELECT * FROM table_name;"

# Show table columns
supabase db columns --project-ref=$SUPABASE_PROJECT_REF --table table_name

# List migrations
supabase db migrations list --project-ref=$SUPABASE_PROJECT_REF

# View logs
supabase logs --project-ref=$SUPABASE_PROJECT_REF

# Check projects
supabase projects list
```

---

## In Python Code

```python
import os
from supabase import create_client

# Configuration is automatically available via environment
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Full access

supabase = create_client(url, key)

# Query
users = supabase.table('users').select('*').limit(10).execute()

# Insert
supabase.table('users').insert({"name": "John", "email": "john@example.com"}).execute()

# Update
supabase.table('users').update({"name": "Jane"}).eq('id', 1).execute()

# Delete
supabase.table('users').delete().eq('id', 1).execute()
```

---

## For Cursor Agents

When agents need database access:

1. Load environment: `source ~/.cursor/.env.supabase`
2. Run CLI command or Python code
3. No MCP needed
4. No crashes
5. All functionality available

---

## Troubleshooting

**Command not found: supabase**

```bash
npm install -g supabase --force
```

**Connection failed**

```bash
# Verify token
echo $SUPABASE_ACCESS_TOKEN

# Test connection
supabase projects list
```

**Environment variables not set**

```bash
# Verify file exists
ls -la ~/.cursor/.env.supabase

# Source it
source ~/.cursor/.env.supabase

# Verify loaded
echo $SUPABASE_PROJECT_REF
```

---

## References

- **Global Config**: `~/.cursor/.env.supabase`
- **Agent Guide**: `~/.cursor/SUPABASE_CLI_AGENT_GUIDE.md`
- **Setup Details**: `~/Development/cerebral-deployment/SUPABASE_CLI_FINAL_SETUP.md`
- **Rules**: `~/Development/cerebral-deployment/RULE_UPDATE_SUPABASE_CLI.md`
- **.cursorrules** in this repo

---

## Summary

✅ Supabase CLI is global
✅ Configuration available everywhere
✅ No MCP crashes
✅ Full functionality
✅ Ready to use!
