#!/usr/bin/env bash
set -euo pipefail
command -v tmux >/dev/null || { echo "Install tmux: pkg install tmux"; exit 1; }
S="suitea345"
tmux has-session -t "$S" 2>/dev/null && tmux kill-session -t "$S"
tmux new-session -d -s "$S" -n shopify "cd packages/shopify/epr-bluebox-app && node server.js"
tmux split-window -h "cd packages/slack/compliance-bot && node app.js"
tmux attach -t "$S"
