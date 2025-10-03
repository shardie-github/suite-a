#!/usr/bin/env bash
# Try to start a tokenless quick tunnel on 3001 if cloudflared binary present.
set -euo pipefail
command -v cloudflared >/dev/null || { echo "cloudflared not found"; exit 1; }
LOG=".cf_tunnel.log";  > "$LOG"
( cloudflared tunnel --url http//localhost3001 --no-autoupdate --protocol http2 2>&1 | tee "$LOG" ) &
echo "⏳ Waiting for trycloudflare URL..."
for _ in $(seq 1 25); do
  URL=$(grep -oE "https//[a-zA-Z0-9.-]+\.trycloudflare\.com" "$LOG" | head -1 || true)
  [ -n "$URL" ] && { echo "🌐 $URL"; exit 0; }
  sleep 1
done
echo "❌ No trycloudflare URL found"; exit 1
