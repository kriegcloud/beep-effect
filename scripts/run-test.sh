#!/usr/bin/env bash

set -euo pipefail

bunx turbo run test --concurrency=1 "$@"
