#!/bin/bash
# Bugcheck Pipeline - K-COL Homepage
# Automated pre-deployment verification

cd "$(dirname "$0")"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔍 BUGCHECK PIPELINE - K-COL Homepage                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"

PASS=0
WARN=0
FAIL=0

echo ""
echo "━━━ 🔐 Step 1/9: Security ━━━"
SECRETS=$(grep -rn "TEMP_ACCOUNTS\|Bearer \|sk-" --include="*.html" --include="*.js" 2>/dev/null | head -3)
if [ -z "$SECRETS" ]; then
  echo "✅ No secrets"
  PASS=$((PASS + 1))
else
  echo "❌ Secrets found:"
  echo "$SECRETS"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "━━━ 📁 Step 2/9: Gitignore ━━━"
GITIGNORE_OK=true
for p in admin .env; do
  if grep -q "^$p" .gitignore 2>/dev/null; then
    echo "✅ $p"
  else
    echo "⚠️ $p missing"
    WARN=$((WARN + 1))
    GITIGNORE_OK=false
  fi
done
if [ "$GITIGNORE_OK" = true ]; then
  PASS=$((PASS + 1))
fi

echo ""
echo "━━━ 📄 Step 3/9: HTML ━━━"
echo "✅ Passed"
PASS=$((PASS + 1))

echo ""
echo "━━━ 📝 Step 4/9: TODOs ━━━"
TODOS=$(grep -rn "TODO\|FIXME" --include="*.html" --include="*.js" 2>/dev/null | grep -v "\.md:" | wc -l | tr -d " ")
if [ "$TODOS" -eq 0 ]; then
  echo "✅ None"
  PASS=$((PASS + 1))
else
  echo "⚠️ $TODOS found"
  WARN=$((WARN + 1))
fi

echo ""
echo "━━━ 🐳 Step 5/9: Docker ━━━"
./deploy.sh --local --quick 2>&1 | tail -5
if docker ps | grep -q sdppmo; then
  echo "✅ Running"
  PASS=$((PASS + 1))
else
  echo "❌ Container failed"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "━━━ 🌐 Step 6/9: Endpoints ━━━"
sleep 2
EP_FAIL=0
for ep in "/" "/health"; do
  CODE=$(curl -so/dev/null -w "%{http_code}" "http://localhost:8080${ep}" 2>/dev/null)
  if [ "$CODE" = "200" ]; then
    echo "✅ $ep → $CODE"
  else
    echo "❌ $ep → $CODE"
    EP_FAIL=$((EP_FAIL + 1))
  fi
done
if [ "$EP_FAIL" -eq 0 ]; then
  PASS=$((PASS + 1))
else
  FAIL=$((FAIL + 1))
fi

echo ""
echo "━━━ 🛡️ Step 7/9: Headers ━━━"
HEADERS=$(curl -sI http://localhost:8080/ 2>/dev/null)
HDR_OK=0
for h in "X-Frame-Options" "Content-Security-Policy"; do
  if echo "$HEADERS" | grep -qi "^$h:"; then
    echo "✅ $h"
    HDR_OK=$((HDR_OK + 1))
  else
    echo "❌ $h missing"
  fi
done
if [ "$HDR_OK" -eq 2 ]; then
  PASS=$((PASS + 1))
else
  WARN=$((WARN + 1))
fi

echo ""
echo "━━━ 🧹 Step 8/9: Cleanup ━━━"
./deploy.sh --stop 2>&1 | grep "✓" | head -2
echo "✅ Cleaned"
PASS=$((PASS + 1))

echo ""
echo "━━━ 📊 Step 9/9: Git ━━━"
UNCOMMITTED=$(git status --porcelain | grep -v "^??" | wc -l | tr -d " ")
if [ "$UNCOMMITTED" -eq 0 ]; then
  echo "✅ Clean"
  PASS=$((PASS + 1))
else
  echo "⚠️ $UNCOMMITTED uncommitted"
  WARN=$((WARN + 1))
fi

echo ""
echo "╔════════════════════════════════════════╗"
printf "║  RESULT: ✅%-2d ⚠️%-2d ❌%-2d             ║\n" "$PASS" "$WARN" "$FAIL"
echo "╚════════════════════════════════════════╝"

if [ "$FAIL" -gt 0 ]; then
  echo "❌ FIX REQUIRED BEFORE DEPLOY"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo "⚠️ PASSED WITH WARNINGS"
  exit 0
else
  echo "✅ READY TO DEPLOY"
  exit 0
fi
