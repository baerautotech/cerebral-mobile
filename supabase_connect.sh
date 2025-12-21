#!/usr/bin/env bash
set -euo pipefail

# Env-driven Supabase/Postgres connection helper (NO hardcoded secrets)
# Required env:
# - SUPABASE_DB_HOST
# - SUPABASE_DB_USER
# - SUPABASE_DB_PASSWORD
# Optional:
# - SUPABASE_DB_PORT (default 5432)
# - SUPABASE_DB_NAME (default postgres)

HOST="${SUPABASE_DB_HOST:-}"
USER="${SUPABASE_DB_USER:-}"
PASS="${SUPABASE_DB_PASSWORD:-}"
PORT="${SUPABASE_DB_PORT:-5432}"
DB="${SUPABASE_DB_NAME:-postgres}"

if [[ -z "$HOST" || -z "$USER" || -z "$PASS" ]]; then
  echo "Missing required env vars: SUPABASE_DB_HOST, SUPABASE_DB_USER, SUPABASE_DB_PASSWORD" >&2
  exit 2
fi

export PGPASSWORD="$PASS"

cmd="${1:-}"
shift || true

case "$cmd" in
  list-tables)
    psql "postgresql://$USER@$HOST:$PORT/$DB" -Atc "select tablename from pg_tables where schemaname='public' order by tablename;"
    ;;
  schema)
    table="${1:-}"
    [[ -n "$table" ]] || { echo "usage: $0 schema <table>" >&2; exit 2; }
    psql "postgresql://$USER@$HOST:$PORT/$DB" -c "\\d+ public.\"$table\""
    ;;
  count)
    table="${1:-}"
    [[ -n "$table" ]] || { echo "usage: $0 count <table>" >&2; exit 2; }
    psql "postgresql://$USER@$HOST:$PORT/$DB" -Atc "select count(*) from public.\"$table\";"
    ;;
  query)
    sql="${1:-}"
    [[ -n "$sql" ]] || { echo "usage: $0 query <sql>" >&2; exit 2; }
    psql "postgresql://$USER@$HOST:$PORT/$DB" -c "$sql"
    ;;
  psql)
    exec psql "postgresql://$USER@$HOST:$PORT/$DB"
    ;;
  *)
    echo "usage: $0 {list-tables|schema <table>|count <table>|query <sql>|psql}" >&2
    exit 2
    ;;
esac
