#!/usr/bin/env bash
set -euo pipefail
BASE="$(pwd)"
PORT_SHOPIFY="${PORT_SHOPIFY-3000}"
PORT_SLACK="${PORT_SLACK-3001}"
SHP="http//localhost${PORT_SHOPIFY}"
SLK="http//localhost${PORT_SLACK}"
STAMP="$(date +%Y%m%d_%H%M)"
OUT_TXT="/sdcard/Download/SuiteA_PreSubmit_${STAMP}.txt"
OUT_JSON="/sdcard/Download/SuiteA_PreSubmit_${STAMP}.json"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
mkdir -p /sdcard/Download
pass=0; fail=0; warn=0
add(){ case "$1" in PASS) ((pass++));; FAIL) ((fail++));; WARN) ((warn++));; esac
  printf "[%s] %-22s %s\n" "$1" "$2" "$3" >> "$OUT_TXT"
  echo "{\"level\"\"$1\",\"code\"\"$2\",\"msg\"$(jq -Rs . <<<"$3")}," >> "$TMP/items.json"
}
 > "$OUT_TXT"
echo "Suite A — Pre-Submission Checklist ($STAMP)" >> "$OUT_TXT"
echo "Repo $(git remote -v | head -1 | awk '{print $2}')" >> "$OUT_TXT"
echo "----------------------------------------------------------------------" >> "$OUT_TXT"

need=( "README.md" "LICENSE" "SECURITY.md" "CONTRIBUTING.md" ".github/workflows/ci.yml"
       "packages/shopify/epr-bluebox-app/server.js"
       "packages/slack/compliance-bot/app.js" )
for f in "${need[@]}"; do [ -f "$f" ] && add PASS "file.$(basename "$f")" "$f present" || add FAIL "file.$(basename "$f")" "$f missing"; done

if grep -R --exclude-dir=node_modules --exclude-dir=.git -n '\| \|=' . >/dev/null 2>&1; then add FAIL "repo.conflicts" "merge markers present"; else add PASS "repo.conflicts" "no merge markers"; fi
if grep -R -i --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=logs --exclude-dir=.data -n -E '|AI[- ]?(assistant|generated)||||' . >/dev/null 2>&1; then add WARN "repo.sanitized" "AI tells / s found"; else add PASS "repo.sanitized" "clean"; fi
if grep -R --exclude-dir=node_modules --exclude-dir=.git -n -E '(sk_live_|xoxb-|xoxp-|xoxs-|AIzaSy|BEGIN RSA PRIVATE KEY|ssh-ed25519 AAAA|stripe_live_|slack_token=)' . >/dev/null 2>&1; then add FAIL "secrets.leak" "potential secrets present"; else add PASS "secrets.leak" "no obvious secrets"; fi

hit(){ local u="$1" c="$2"; if curl -fsS "$u" >/dev/null 2>&1; then add PASS "$c" "$u OK"; else add FAIL "$c" "$u not reachable"; fi }
hit "$SHP/healthz" "shop.healthz"
hit "$SHP/readyz"  "shop.readyz"
curl -fsSI "$SHP/reports.html" > "$TMP/h.txt" || true
grep -i '^Content-Security-Policy' "$TMP/h.txt" >/dev/null && add PASS "hdr.csp" "CSP present" || add WARN "hdr.csp" "no CSP"
grep -i '^Strict-Transport-Security' "$TMP/h.txt" >/dev/null && add PASS "hdr.hsts" "HSTS present" || add WARN "hdr.hsts" "no HSTS (ok for http dev)"

if curl -fsS "$SLK/healthz" >/dev/null 2>&1; then add PASS "slack.healthz" "Slack bot running"; else add WARN "slack.healthz" "Slack bot not reachable"; fi
MF="packages/slack/compliance-bot/slack_manifest.json"
[ -f "$MF" ] && add PASS "slack.manifest" "manifest present" || add WARN "slack.manifest" "manifest missing"

STATUS="PASS"; [ $fail -gt 0 ] && STATUS="FAIL"
echo -e "Status $STATUS  Pass $pass  Warn $warn  Fail $fail\n----------------------------------------------------------------------" >> "$OUT_TXT"
cat "$OUT_TXT" > "$OUT_TXT" # keep content

ITEMS="$(sed 's/,$//' "$TMP/items.json" 2>/dev/null || true)"; [ -z "$ITEMS" ] && ITEMS=""
cat > "$OUT_JSON" <<JSON
{"timestamp""$STAMP","repo""$(git remote -v | head -1 | awk '{print $2}')","summary"{"status""$STATUS","pass"$pass,"warn"$warn,"fail"$fail},"items"[ $ITEMS ]}
JSON

echo "Report $OUT_TXT"
echo "JSON   $OUT_JSON"
[ "$STATUS" = "PASS" ] || exit 1
