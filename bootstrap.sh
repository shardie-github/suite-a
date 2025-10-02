#!/usr/bin/env bash
set -euo pipefail
npm config set bin-links false
for d in packages/shopify/epr-bluebox-app packages/slack/compliance-bot packages/datalake; do
  [ -f "$d/package.json" ] && (cd "$d" && npm install --no-bin-links || true)
done
echo "✅ bootstrap complete"
