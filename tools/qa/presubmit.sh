#!/usr/bin/env bash
set -euo pipefail
echo "▶ Pre-submit checks"
npx -y prettier --check . || true
npx -y eslint . || true
npx -y markdownlint-cli '**/*.md' -i node_modules -i .data -i dist -i logs || true
[ -f docs/site/index.html ] && echo "Docs site present ✅" || echo "Docs site missing ⚠️"
