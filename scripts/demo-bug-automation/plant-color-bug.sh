#!/usr/bin/env bash
# Plants the "color change broken" demo bug on the current branch.
#
# Used by the Cursor Cloud agent environment setup script for the
# bug-reproduction demo automation, so every cloud agent VM that
# spins up against this repo starts with a known, broken state to
# reproduce and fix.
#
# Behaviour:
#   - Applies scripts/demo-bug-automation/color-change-broken.patch
#     to the working tree as uncommitted changes.
#   - If the patch already applies cleanly in reverse (i.e. the bug
#     is already planted), the script is a no-op and exits 0.
#   - Fails loudly if the target file has drifted so much that the
#     patch no longer applies; bump the patch alongside the next
#     refactor of setStyleForSelectedShapes.
#
# Mirror branch on origin: santi-demo-bug-automation (= main + this
# patch as a single commit). Keep the two in sync when main moves.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PATCH_FILE="$SCRIPT_DIR/color-change-broken.patch"

cd "$REPO_ROOT"

if [ ! -f "$PATCH_FILE" ]; then
	echo "plant-color-bug: missing patch file at $PATCH_FILE" >&2
	exit 1
fi

if git apply --reverse --check "$PATCH_FILE" >/dev/null 2>&1; then
	echo "plant-color-bug: bug already planted, nothing to do."
	exit 0
fi

if ! git apply --check "$PATCH_FILE" >/dev/null 2>&1; then
	echo "plant-color-bug: patch no longer applies cleanly." >&2
	echo "  refresh scripts/demo-bug-automation/color-change-broken.patch" >&2
	echo "  and origin/santi-demo-bug-automation against current main." >&2
	exit 1
fi

git apply "$PATCH_FILE"
echo "plant-color-bug: applied color-change-broken.patch to working tree."
