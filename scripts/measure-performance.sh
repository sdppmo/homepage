#!/bin/bash

URL="${1:-https://beta.kcol.kr/test}"
COOKIE="${2:-}" # Session cookie for authenticated requests
RUNS=10

echo "Testing: $URL"
echo "Runs: $RUNS"
echo ""

total=0
for i in $(seq 1 $RUNS); do
  if [ -n "$COOKIE" ]; then
    ttfb=$(curl -o /dev/null -s -w '%{time_starttransfer}' \
      -H "Cookie: $COOKIE" "$URL")
  else
    ttfb=$(curl -o /dev/null -s -w '%{time_starttransfer}' "$URL")
  fi
  ttfb_ms=$(echo "$ttfb * 1000" | bc)
  echo "Run $i: ${ttfb_ms}ms"
  total=$(echo "$total + $ttfb_ms" | bc)
done

avg=$(echo "scale=2; $total / $RUNS" | bc)
echo ""
echo "Average TTFB: ${avg}ms"
echo "Target: <500ms"

if (( $(echo "$avg < 500" | bc -l) )); then
  echo "✅ PASS"
  exit 0
else
  echo "❌ FAIL"
  exit 1
fi
