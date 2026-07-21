#!/usr/bin/env bash
# Plants the demo bugs on the current branch.
#
# Used by the Cursor Cloud agent environment setup script for the
# bug-reproduction demo automation, so every cloud agent VM that
# spins up against this repo starts with a known, broken state to
# reproduce and fix.
#
# NOTE: the name is historical (the Cloud Agent environment setup script in
# the Cursor dashboard invokes it by name). It now plants EVERY *.patch in
# this directory:
#   - color-change-broken.patch   color swatch does nothing for selected shapes
#   - star-upside-down.patch      star geo shape renders flipped vertically
#
# Behaviour per patch:
#   - Applies it to the working tree as uncommitted changes.
#   - If the patch already applies cleanly in reverse (i.e. the bug
#     is already planted), it is skipped.
#   - Fails loudly if the target file has drifted so much that the
#     patch no longer applies; refresh the patch alongside the next
#     refactor of the target file.
#
# Mirror branch on origin: santi-demo-bug-automation (= main + these
# patches as a single commit, tagged santi-demo-bug-v4). Keep them in
# sync when main moves.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

shopt -s nullglob
PATCHES=("$SCRIPT_DIR"/*.patch)
shopt -u nullglob

if [ ${#PATCHES[@]} -eq 0 ]; then
	echo "plant-color-bug: no *.patch files found in $SCRIPT_DIR" >&2
	exit 1
fi

FAILED=0
for patch in "${PATCHES[@]}"; do
	name="$(basename "$patch")"
	if git apply --reverse --check "$patch" >/dev/null 2>&1; then
		echo "plant-color-bug: $name already planted, skipping."
		continue
	fi
	if ! git apply --check "$patch" >/dev/null 2>&1; then
		echo "plant-color-bug: $name no longer applies cleanly." >&2
		echo "  refresh scripts/demo-bug-automation/$name" >&2
		echo "  and origin/santi-demo-bug-automation against current main." >&2
		FAILED=1
		continue
	fi
	git apply "$patch"
	echo "plant-color-bug: applied $name to working tree."
done

exit "$FAILED"
