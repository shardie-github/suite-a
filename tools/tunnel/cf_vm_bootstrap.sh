#!/usr/bin/env bash
# Cloud VM bootstrap (Ubuntu) to install cloudflared as a service with a named tunnel.
# Usage on VM: bash cf_vm_bootstrap.sh <CLOUDFLARE_ACCOUNT_ID> <TUNNEL_NAME> <ROUTE_HOSTNAME>
set -euo pipefail
ACC="${1:-}"; NAME="${2:-suitea}"; HOST="${3:-}"
[ -n "$ACC" ] || { echo "Missing account id"; exit 1; }
curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
cloudflared tunnel login
cloudflared tunnel create "$NAME"
cloudflared tunnel route dns "$NAME" "$HOST" || true
cat >/etc/cloudflared/config.yml <<EOF
tunnel: $NAME
credentials-file: /root/.cloudflared/$NAME.json
ingress:
  - hostname: $HOST
    service: http://localhost:3001
  - service: http_status:404
EOF
cloudflared service install
systemctl enable cloudflared && systemctl restart cloudflared
echo "✅ Tunnel $NAME bound to $HOST"
