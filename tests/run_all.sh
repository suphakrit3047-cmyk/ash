#!/bin/sh
# full check: build, syntax, golden master, then browser tests (needs playwright + chromium)
set -e
cd "$(dirname "$0")/.."
python3 tools/build.py
node --check build/check.js
node tests/golden.js --check
python3 -m http.server 8765 >/dev/null 2>&1 & SRV=$!
trap 'kill $SRV' EXIT
sleep 1
for t in tests/ui/test_*.py; do echo "== $t"; timeout 600 python3 "$t" | tail -6; done
