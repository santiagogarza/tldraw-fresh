#!/usr/bin/env bash
# Resets the working tree to a clean "bug planted" state for the
# color-change demo automation. Intended to be re-run between demo
# runs on a long-lived workspace.
#
# Steps:
#   1. Stash or discard any uncommitted edits to packages/editor/src/lib/editor/Editor.ts.
#   2. Reapply scripts/demo-bug-automation/color-change-broken.patch.
#
# This is destructive for the targeted file. Do not run on real work
# branches.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TARGET_FILE="packages/editor/src/lib/editor/Editor.ts"

cd "$REPO_ROOT"

echo "reset-demo-bug: restoring $TARGET_FILE from HEAD."
git checkout -- "$TARGET_FILE"

"$SCRIPT_DIR/plant-color-bug.sh"
