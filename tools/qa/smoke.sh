#!/usr/bin/env bash
set -euo pipefail
SHOP="http://localhost:${PORT_SHOPIFY:-3000}"
SLACK="http://localhost:${PORT_SLACK:-3001}"
k(){ local url="$1" name="$2"; echo -e "\n### $name -> $url"; curl -fsSL "$url" | head -c 400 || true; echo; }
echo "Suite A Smoke:"
k "$SHOP/reports.html" "Shopify UI"
k "$SHOP/healthz" "Shopify /healthz"
k "$SHOP/readyz" "Shopify /readyz"
k "$SLACK/healthz" "Slack /healthz"
