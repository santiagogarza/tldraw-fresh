#!/usr/bin/env bash
# Pre-demo checklist for the "color change broken" Cursor Cloud agent demo.
#
# Run this once before a demo session to confirm the remote is in a state the
# Slack automation can actually reproduce against. With --reset, also restores
# the demo branch back to the planted-bug tag if it has drifted (e.g. someone
# force-pushed by accident, or an old run wrote to it).
#
# Usage:
#   scripts/demo-bug-automation/setup-demo-bug.sh           # verify only
#   scripts/demo-bug-automation/setup-demo-bug.sh --reset   # verify + reset
#
# What this checks:
#   1. The demo branch (santi-demo-bug-automation) exists on origin and is at
#      the planted-bug tag (santi-demo-bug-v1).
#   2. main is reachable and the tag is one commit ahead of main (sanity).
#   3. Recent stacked PRs against the demo branch (lets you eyeball what the
#      previous demo runs look like before you fire a new one).
#
# What this does NOT touch:
#   - Per-run cursor/* branches and their PRs. Each automation run creates a
#     fresh cursor/<auto-name>-XXXX branch off the demo branch and PRs from
#     it. Old runs stay frozen; we leave them alone so you can scroll up to
#     them during the demo.
#   - The local working tree. The cloud agent VM has its own clone.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

DEMO_BRANCH="santi-demo-bug-automation"
DEMO_TAG="santi-demo-bug-v1"
GITHUB_REPO="santiagogarza/tldraw-fresh"

RESET=0
for arg in "$@"; do
	case "$arg" in
		--reset) RESET=1 ;;
		-h|--help)
			sed -n '2,25p' "$0" | sed 's/^# \{0,1\}//'
			exit 0
			;;
		*)
			echo "setup-demo-bug: unknown argument: $arg" >&2
			echo "  usage: $0 [--reset]" >&2
			exit 2
			;;
	esac
done

cd "$REPO_ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	echo "setup-demo-bug: not inside a git work tree." >&2
	exit 1
fi

echo "setup-demo-bug: fetching origin..."
git fetch origin --prune --tags >/dev/null

TAG_SHA=$(git rev-parse --verify "refs/tags/${DEMO_TAG}" 2>/dev/null || true)
if [ -z "$TAG_SHA" ]; then
	echo "setup-demo-bug: tag ${DEMO_TAG} is missing locally and on origin." >&2
	echo "  expected a tag pinning the planted-bug commit. nothing to verify against." >&2
	exit 1
fi

BRANCH_SHA=$(git rev-parse --verify "refs/remotes/origin/${DEMO_BRANCH}" 2>/dev/null || true)
if [ -z "$BRANCH_SHA" ]; then
	echo "setup-demo-bug: origin/${DEMO_BRANCH} does not exist." >&2
	if [ "$RESET" -eq 1 ]; then
		echo "setup-demo-bug: creating origin/${DEMO_BRANCH} at ${TAG_SHA:0:9}..."
		git push origin "${TAG_SHA}:refs/heads/${DEMO_BRANCH}"
		BRANCH_SHA="$TAG_SHA"
	else
		echo "  rerun with --reset to create it at ${DEMO_TAG}." >&2
		exit 1
	fi
fi

if [ "$BRANCH_SHA" != "$TAG_SHA" ]; then
	echo "setup-demo-bug: WARNING origin/${DEMO_BRANCH} (${BRANCH_SHA:0:9}) does not match ${DEMO_TAG} (${TAG_SHA:0:9})."
	echo "  commits on the branch but not on the tag:"
	git log --oneline "${TAG_SHA}..${BRANCH_SHA}" | sed 's/^/    /' || true

	if [ "$RESET" -eq 1 ]; then
		echo "setup-demo-bug: resetting origin/${DEMO_BRANCH} to ${DEMO_TAG} (${TAG_SHA:0:9})..."
		git push origin --force-with-lease="${DEMO_BRANCH}:${BRANCH_SHA}" "${TAG_SHA}:refs/heads/${DEMO_BRANCH}"
	else
		echo "  rerun with --reset to force ${DEMO_BRANCH} back to ${DEMO_TAG}." >&2
		exit 1
	fi
else
	echo "setup-demo-bug: origin/${DEMO_BRANCH} is at ${DEMO_TAG} (${TAG_SHA:0:9}). good."
fi

AHEAD=$(git rev-list --count "origin/main..${TAG_SHA}" 2>/dev/null || echo "?")
BEHIND=$(git rev-list --count "${TAG_SHA}..origin/main" 2>/dev/null || echo "?")
echo "setup-demo-bug: ${DEMO_BRANCH} is ${AHEAD} commit(s) ahead of origin/main, ${BEHIND} behind."
if [ "$AHEAD" != "1" ] || [ "$BEHIND" != "0" ]; then
	echo "  expected exactly 1 commit ahead and 0 behind (just the planted bug)." >&2
	echo "  if you've moved main, refresh the patch and bump ${DEMO_TAG}, then rerun with --reset." >&2
	exit 1
fi

echo ""
echo "setup-demo-bug: recent stacked demo PRs (head -> ${DEMO_BRANCH}):"
if command -v gh >/dev/null 2>&1; then
	pr_rows=$(gh pr list \
		--repo "${GITHUB_REPO}" \
		--base "${DEMO_BRANCH}" \
		--state all \
		--limit 10 \
		--json number,state,title,headRefName \
		--jq '.[] | "  #\(.number)  \(.state)  \(.title)  (\(.headRefName))"' 2>/dev/null || true)
	if [ -z "$pr_rows" ]; then
		echo "  (no PRs yet against ${DEMO_BRANCH})"
	else
		echo "$pr_rows"
	fi
else
	echo "  (gh CLI not installed; skipping PR listing)"
fi

cat <<'NOTE'

setup-demo-bug: ready. summary:
  - demo branch (PR base):        santi-demo-bug-automation
  - planted-bug tag (truth):      santi-demo-bug-v1
  - per-run agent branch:         cursor/<auto-name>-XXXX  (the VM creates this)
  - no fixed "repro" branch is used. each run = new branch = new PR. old PRs stay frozen.
NOTE
