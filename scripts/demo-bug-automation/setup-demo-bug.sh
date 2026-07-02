#!/usr/bin/env bash
# One-command pre-flight for the "color change broken" Cursor Cloud agent
# demo. Default behaviour: get the laptop into a state where you can show
# the bug live and trigger the Slack automation immediately.
#
# Steps (default):
#   1. Verify remote demo state (origin/santi-demo-bug-automation is pinned
#      to the santi-demo-bug-v1 tag). With --reset, force the branch back.
#   2. Plant the bug in the working tree as uncommitted changes.
#   3. Ensure node 20 + healthy node_modules (re-run yarn install if broken).
#   4. Run the lazy `predev` + `refresh-assets` prep so Vite has assets.
#   5. Kill any stale listener on the demo port (configurable, default 5420).
#   6. Start `cd apps/examples && yarn dev` in the background.
#   7. Wait for http://localhost:$PORT to actually answer.
#   8. Open the URL in your browser.
#
# Usage:
#   scripts/demo-bug-automation/setup-demo-bug.sh                 # full pre-flight (RECOMMENDED)
#   scripts/demo-bug-automation/setup-demo-bug.sh --check-only    # remote sanity check only
#   scripts/demo-bug-automation/setup-demo-bug.sh --reset         # also force-reset the demo branch on origin
#   scripts/demo-bug-automation/setup-demo-bug.sh --no-open       # don't open browser
#   scripts/demo-bug-automation/setup-demo-bug.sh --port 5422     # pick a different local port
#
# Companion script:
#   scripts/demo-bug-automation/demo-local-down.sh                # stop the Vite server when you're done

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

DEMO_BRANCH="santi-demo-bug-automation"
DEMO_TAG="santi-demo-bug-v3"
GITHUB_REPO="santiagogarza/tldraw-fresh"
# Fallback path for Apple Silicon Homebrew (used only if the active `node` on
# PATH isn't v20). Other install layouts (nvm/mise/fnm, Intel Homebrew at
# /usr/local/opt/node@20, Linux distro packages) work as long as `node 20.x`
# is on PATH first.
NODE20_BIN="/opt/homebrew/opt/node@20/bin"

LOG_DIR="$REPO_ROOT/.demo-bug-automation"
LOG_FILE="$LOG_DIR/vite.log"
PREP_LOG="$LOG_DIR/prep.log"
PID_FILE="$LOG_DIR/vite.pid"

CHECK_ONLY=0
RESET=0
OPEN_BROWSER=1
PORT=5420
READY_TIMEOUT=180

print_help() {
	sed -n '2,32p' "$0" | sed 's/^# \{0,1\}//'
}

# arg parsing: support --port 5422 and --port=5422
while [ $# -gt 0 ]; do
	case "$1" in
		--check-only) CHECK_ONLY=1; shift ;;
		--reset) RESET=1; shift ;;
		--no-open) OPEN_BROWSER=0; shift ;;
		--port) PORT="${2:?--port needs a value}"; shift 2 ;;
		--port=*) PORT="${1#*=}"; shift ;;
		-h|--help) print_help; exit 0 ;;
		*)
			echo "setup-demo-bug: unknown argument: $1" >&2
			echo "  run with --help for usage." >&2
			exit 2
			;;
	esac
done

URL="http://localhost:${PORT}"

cd "$REPO_ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	echo "setup-demo-bug: not inside a git work tree." >&2
	exit 1
fi

# ---------------------------------------------------------------------------
# 1. Remote sanity check
# ---------------------------------------------------------------------------
echo "setup-demo-bug: [1/8] fetching origin..."
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
	echo "  expected exactly 1 commit ahead and 0 behind (just the planted bug)."
	echo "  if you've moved main, refresh the patch and bump ${DEMO_TAG}, then rerun with --reset."
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

if [ "$CHECK_ONLY" -eq 1 ]; then
	cat <<'NOTE'

setup-demo-bug: --check-only complete. summary:
  - demo branch (PR base):        santi-demo-bug-automation
  - planted-bug tag (truth):      santi-demo-bug-v1
  - per-run agent branch:         cursor/<auto-name>-XXXX  (the VM creates this)
  - to bring the local demo up:   rerun without --check-only
NOTE
	exit 0
fi

mkdir -p "$LOG_DIR"

# ---------------------------------------------------------------------------
# 2. Plant the bug in the working tree
# ---------------------------------------------------------------------------
echo ""
echo "setup-demo-bug: [2/8] planting bug in working tree..."
bash "$SCRIPT_DIR/plant-color-bug.sh"

# ---------------------------------------------------------------------------
# 3. Toolchain (node 20) + dependency health
# ---------------------------------------------------------------------------
echo ""
echo "setup-demo-bug: [3/8] checking toolchain..."

# Prefer whatever `node` is already on PATH if it's v20 (works for nvm, mise,
# fnm, Intel Homebrew, Linux distro packages, cloud-agent VMs, etc.). Fall
# back to the Apple Silicon Homebrew layout only if PATH doesn't already
# resolve to node 20.
node_major() {
	command -v node >/dev/null 2>&1 || return 1
	node -p "process.versions.node.split('.')[0]" 2>/dev/null
}
CURRENT_NODE_MAJOR="$(node_major || true)"
if [ "$CURRENT_NODE_MAJOR" != "20" ]; then
	if [ -x "${NODE20_BIN}/node" ]; then
		export PATH="${NODE20_BIN}:${PATH}"
	else
		if [ -n "$CURRENT_NODE_MAJOR" ]; then
			echo "setup-demo-bug: node v$(node --version 2>/dev/null) is on PATH, but this repo requires node 20.x." >&2
		else
			echo "setup-demo-bug: node is not on PATH and no fallback found at ${NODE20_BIN}/node." >&2
		fi
		echo "  install node 20 and put it on PATH. options:" >&2
		echo "    mise use node@20             # if you use mise" >&2
		echo "    nvm install 20 && nvm use 20 # if you use nvm" >&2
		echo "    brew install node@20         # macOS Homebrew" >&2
		exit 1
	fi
fi
echo "  node:  $(node --version)  ($(command -v node))"

if ! command -v yarn >/dev/null 2>&1; then
	echo "setup-demo-bug: yarn is not on PATH. install it (e.g. corepack enable) and retry." >&2
	exit 1
fi
echo "  yarn:  $(yarn --version)"

tsx_healthy() {
	local tsx_bin="${REPO_ROOT}/node_modules/.bin/tsx"
	[ -x "$tsx_bin" ] && (cd "$REPO_ROOT" && "$tsx_bin" --version >/dev/null 2>&1)
}

needs_install=0
if [ ! -f "$REPO_ROOT/node_modules/vite/package.json" ]; then
	echo "  node_modules/vite missing -> will run yarn install"
	needs_install=1
elif [ ! -f "$REPO_ROOT/node_modules/vite/dist/node/cli.js" ]; then
	echo "  node_modules/vite is incomplete -> will run yarn install"
	needs_install=1
elif ! tsx_healthy; then
	echo "  tsx binary broken -> will run yarn install"
	needs_install=1
fi

if [ "$needs_install" -eq 1 ]; then
	echo "setup-demo-bug: running yarn install (this can take a few minutes)..."
	if ! (cd "$REPO_ROOT" && yarn install); then
		echo "setup-demo-bug: yarn install failed. fix it and rerun." >&2
		exit 1
	fi
	if ! tsx_healthy; then
		echo "setup-demo-bug: tsx still broken after install. try: rm -rf node_modules && yarn install" >&2
		exit 1
	fi
fi

# ---------------------------------------------------------------------------
# 4. Asset prep (predev + refresh-assets) so Vite has everything it needs
# ---------------------------------------------------------------------------
echo ""
echo "setup-demo-bug: [4/8] preparing tldraw assets (lazy predev + refresh-assets)..."
: > "$PREP_LOG"
if ! (
	cd "$REPO_ROOT"
	LAZYREPO_PRETTY_OUTPUT=0 yarn lazy run predev --filter='packages/tldraw'
	LAZYREPO_PRETTY_OUTPUT=0 yarn lazy run refresh-assets
) >>"$PREP_LOG" 2>&1; then
	echo "setup-demo-bug: asset prep failed. last 30 lines of ${PREP_LOG}:" >&2
	tail -30 "$PREP_LOG" >&2 || true
	exit 1
fi
echo "  done (log: ${PREP_LOG})."

# ---------------------------------------------------------------------------
# 5. Kill stale listener on $PORT (reset the demo)
# ---------------------------------------------------------------------------
echo ""
echo "setup-demo-bug: [5/8] freeing port ${PORT}..."

# Stop a prior background server we spawned, if any.
if [ -f "$PID_FILE" ]; then
	OLD_PID=$(cat "$PID_FILE" 2>/dev/null || true)
	if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
		echo "  stopping previous setup-demo-bug vite (pid $OLD_PID)..."
		kill "$OLD_PID" 2>/dev/null || true
		sleep 2
		kill -9 "$OLD_PID" 2>/dev/null || true
	fi
	rm -f "$PID_FILE"
fi

# Sweep any listener on the port (not clients connected to it).
LISTENER_PIDS=$(lsof -ti tcp:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$LISTENER_PIDS" ]; then
	echo "  killing existing listener(s) on :${PORT}: $LISTENER_PIDS"
	# shellcheck disable=SC2086
	kill $LISTENER_PIDS 2>/dev/null || true
	sleep 1
	# shellcheck disable=SC2086
	kill -9 $LISTENER_PIDS 2>/dev/null || true
	sleep 1
fi

if lsof -ti tcp:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
	echo "setup-demo-bug: port ${PORT} still has a listener after cleanup:" >&2
	lsof -i tcp:"$PORT" -sTCP:LISTEN >&2 || true
	echo "  free it manually or pick another port with --port NNNN." >&2
	exit 1
fi
echo "  port ${PORT} is free."

# ---------------------------------------------------------------------------
# 6. Start Vite (apps/examples only — no workers, no wrangler dependency)
# ---------------------------------------------------------------------------
echo ""
echo "setup-demo-bug: [6/8] starting Vite on :${PORT}..."
: > "$LOG_FILE"
# nohup + setsid (when available) detach from this shell so the dev server
# survives after this script exits and the controlling terminal closes.
if command -v setsid >/dev/null 2>&1; then
	setsid nohup bash -c "cd '$REPO_ROOT/apps/examples' && exec yarn dev --port '$PORT'" \
		>"$LOG_FILE" 2>&1 < /dev/null &
else
	nohup bash -c "cd '$REPO_ROOT/apps/examples' && exec yarn dev --port '$PORT'" \
		>"$LOG_FILE" 2>&1 < /dev/null &
fi
VITE_PID=$!
disown "$VITE_PID" 2>/dev/null || true
echo "$VITE_PID" > "$PID_FILE"
echo "  vite pid: ${VITE_PID}  (logs: ${LOG_FILE})"

# ---------------------------------------------------------------------------
# 7. Wait for the dev server to respond
# ---------------------------------------------------------------------------
echo ""
echo "setup-demo-bug: [7/8] waiting for ${URL} ..."
WAITED=0
while [ "$WAITED" -lt "$READY_TIMEOUT" ]; do
	if ! kill -0 "$VITE_PID" 2>/dev/null; then
		echo "setup-demo-bug: vite exited before becoming ready. last 40 lines of ${LOG_FILE}:" >&2
		tail -40 "$LOG_FILE" >&2 || true
		rm -f "$PID_FILE"
		exit 1
	fi
	if curl -sf -o /dev/null --max-time 2 "$URL"; then
		echo "  ${URL} is up."
		break
	fi
	sleep 2
	WAITED=$((WAITED + 2))
done

if [ "$WAITED" -ge "$READY_TIMEOUT" ]; then
	echo "setup-demo-bug: ${URL} did not respond within ${READY_TIMEOUT}s. last 40 lines of ${LOG_FILE}:" >&2
	tail -40 "$LOG_FILE" >&2 || true
	echo "  vite is still running (pid ${VITE_PID}). tail the log, or run demo-local-down.sh." >&2
	exit 1
fi

# ---------------------------------------------------------------------------
# 8. Open browser
# ---------------------------------------------------------------------------
if [ "$OPEN_BROWSER" -eq 1 ]; then
	echo ""
	echo "setup-demo-bug: [8/8] opening ${URL} ..."
	if command -v open >/dev/null 2>&1; then
		open "$URL"
	elif command -v xdg-open >/dev/null 2>&1; then
		xdg-open "$URL" >/dev/null 2>&1 || true
	fi
else
	echo ""
	echo "setup-demo-bug: [8/8] skipping browser (--no-open)."
fi

cat <<NOTE

setup-demo-bug: ready for demo.
  - local app (with planted bugs): ${URL}
  - vite pid:                       ${VITE_PID}   (file: ${PID_FILE})
  - vite logs:                      ${LOG_FILE}
  - planted bug 1 (color):          uncommitted changes in packages/editor/src/lib/editor/Editor.ts
  - planted bug 2 (heart):          uncommitted changes in packages/tldraw/src/lib/shapes/geo/getGeoShapePath.ts
  - remote demo branch (PR base):   ${DEMO_BRANCH}  (= ${DEMO_TAG})
  - per-run agent branch:           cursor/<auto-name>-XXXX  (created by the cloud agent VM)

Next steps:
  1. Open ${URL}, draw a shape, select it, click a color swatch. Nothing changes. Bug 1.
  2. Draw a Heart (toolbar > More). It renders upside down. Bug 2.
  3. In Slack #santi-bug-automation, post a bug report mentioning @Cursor.
  4. The agent will thread its repro/screenshots/fix/PR under your message.

To stop:
  bash scripts/demo-bug-automation/demo-local-down.sh
NOTE
