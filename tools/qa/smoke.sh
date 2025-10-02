#!/usr/bin/env bash
# Suite A smoke checks
set -euo pipefail
BASE="${1:-http://localhost:3000}"

echo "🩺 /healthz :" && curl -fsS "$BASE/healthz" && echo
echo "🟢 /readyz  :" && curl -fsS "$BASE/readyz" && echo
echo "📈 /metrics :" && curl -fsS "$BASE/metrics" | head -1

# /api/reports requires a session token, so we expect 401 without it
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/reports?from=2025-01-01&to=2025-12-31")
echo "📄 /api/reports (no token) → expected 401, got $CODE"
exit 0
