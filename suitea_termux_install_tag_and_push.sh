#!/usr/bin/env bash
# Suite A v3.4.3 — Termux one-shot: unzip, move to $HOME, install, seed, push, tag to trigger Release
set -euo pipefail
termux-setup-storage || true
cd /sdcard/Download
ZIP=$(ls -t SuiteA_v3_4_3_Implemented_*.zip 2>/dev/null | head -1 || true)
[ -z "${ZIP:-}" ] && { echo "❌ No SuiteA_v3_4_3_Implemented_*.zip in /sdcard/Download"; exit 1; }
TARGET="suite-a-monorepo"
rm -rf "$TARGET" && mkdir "$TARGET"
unzip -o "$ZIP" -d "$TARGET"
DST="$HOME/repos/suite-a-monorepo"
mkdir -p "$HOME/repos"; rm -rf "$DST"; mv "$TARGET" "$DST"
cd "$DST"
pkg install -y sqlite || true
bash bootstrap.sh
node packages/datalake/seed.js || true
git init -b main
git config --global --add safe.directory "$(pwd)"
git config --global user.name "Scott"
git config --global user.email "scott@example.com"
git add .
git commit -m "feat: Suite A v3.4.3 (Releases automation + Termux-ready)" || true
eval "$(ssh-agent -s)"
ssh-add "${SSH_KEY:-$HOME/.ssh/id_ed25519}" || true
GH_OWNER="shardie-github"; REPO="suite-a-monorepo"
git remote remove origin 2>/dev/null || true
git remote add origin "git@github.com:${GH_OWNER}/${REPO}.git"
git push -u origin main
# Create tag to trigger GitHub Release
TAG="v3.4.3"
git tag -a "$TAG" -m "Suite A $TAG"
git push origin "$TAG"
echo "✅ Pushed and tagged $TAG — GitHub Release workflow will attach the ZIP artifact."
echo "👉 Run services: ./dev-up.sh  |  Open: http://localhost:3000/reports.html"
