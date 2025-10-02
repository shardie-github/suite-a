#!/usr/bin/env bash
# Quick sanity for OAuth URLs; does not perform real redirect hops.
set -euo pipefail
BASE="${1:-http://localhost:3000}"
SHOP="${2:-example.myshopify.com}"
echo "🔐 Install URL:"
echo "$BASE/oauth/install?shop=$SHOP"
echo "👉 After installing, callback should hit $BASE/oauth/callback and store offline token."
