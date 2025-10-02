#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://localhost:3000}"
echo "🩺 Health:"; curl -sf "$BASE/healthz" && echo
echo "🟢 Readyz:"; curl -sf "$BASE/readyz" && echo
echo "📈 Metrics (first line):"; curl -sf "$BASE/metrics" | head -1
echo "📄 Reports (401 without session):"; curl -s -o /dev/null -w "%{http_code}\n" "$BASE/api/reports?from=2025-01-01&to=2025-12-31"
