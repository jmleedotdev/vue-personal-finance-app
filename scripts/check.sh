#!/bin/sh
set -eu

cd "$(dirname "$0")/.."
for check in lint:check type-check test:fast build-only; do
  printf '\n==> %s\n' "$check"
  if pnpm run "$check"; then
    :
  else
    status=$?
    echo "Check failed: $check (exit $status)" >&2
    exit "$status"
  fi
done
