#!/usr/bin/env bash
set -euo pipefail

# Browser acceptance orchestrator, run remotely by
# `openclaw-ops e2e --project panopticlick-org` (or standalone from the
# workspace). URL precedence: OPENCLAW_TARGET_URL -> OPENCLAW_PREVIEW_URL ->
# production.
BASE_URL="${OPENCLAW_TARGET_URL:-${OPENCLAW_PREVIEW_URL:-https://panopticlick.org}}"
BASE_URL="${BASE_URL%/}"
ARTIFACT_DIR="${OPENCLAW_ARTIFACT_DIR:-output/playwright/production}"
mkdir -p "$ARTIFACT_DIR"

export PANOPTICLICK_QA_BASE_URL="$BASE_URL"
export OPENCLAW_ARTIFACT_DIR="$ARTIFACT_DIR"

node scripts/openclaw-browser-validate.mjs | tee "$ARTIFACT_DIR/browser-validation.txt"
