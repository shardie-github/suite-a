#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://localhost:3000}"
echo "🩺 GET $BASE/healthz"
curl -iS "$BASE/healthz" || true
echo
echo "🟢 GET $BASE/readyz"
curl -iS "$BASE/readyz" || true
echo
echo "📈 GET $BASE/metrics (first 200 chars)"
curl -sS "$BASE/metrics" | head -c 200 || true
echo
echo "📄 GET /api/reports (should be 401 w/o token)"
curl -iS "$BASE/api/reports?from=2025-01-01&to=2025-12-31" || true
echo
