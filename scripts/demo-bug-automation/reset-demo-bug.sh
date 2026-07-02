#!/usr/bin/env bash
# Resets the working tree to a clean "bugs planted" state for the
# demo automation. Intended to be re-run between demo runs on a
# long-lived workspace.
#
# Steps:
#   1. Restore the bug target files from HEAD (discarding uncommitted edits).
#   2. Reapply every *.patch in this directory via plant-color-bug.sh.
#
# This is destructive for the targeted files. Do not run on real work
# branches.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

shopt -s nullglob
for patch in "$SCRIPT_DIR"/*.patch; do
	for target in $(grep -E '^\+\+\+ b/' "$patch" | sed 's|^+++ b/||'); do
		echo "reset-demo-bug: restoring $target from HEAD."
		git checkout -- "$target"
	done
done
shopt -u nullglob

"$SCRIPT_DIR/plant-color-bug.sh"
