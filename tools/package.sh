#!/usr/bin/env bash
set -euo pipefail
NAME="SuiteA_Distribution_${1:-$(date +%Y%m%d_%H%M)}.zip"
mkdir -p dist
zip -r "dist/$NAME" . -x "*.git*" "node_modules/*" ".data/*" "dist/*"
echo "📦 dist/$NAME"
