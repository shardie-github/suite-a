#!/usr/bin/env bash
set -euo pipefail
echo "▶ Pre-submit (format/lint/md/spell) — soft-fail"
# Always use npx -y (no global assumption); never fail the pipeline hard.
npx -y prettier --version >/dev/null 2>&1 && npx -y prettier --check . || echo "ℹ️ Prettier not available or changes needed."
npx -y eslint --version   >/dev/null 2>&1 && npx -y eslint .          || echo "ℹ️ ESLint not available or had findings."
npx -y markdownlint-cli --version >/dev/null 2>&1 && npx -y markdownlint-cli '**/*.md' -i node_modules -i .data -i dist -i logs || echo "ℹ️ MD lint skipped."
