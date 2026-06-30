#!/usr/bin/env bash
# Bring the local "color change broken" demo up: verify the remote,
# plant the bug in the working tree as uncommitted changes, install
# deps if needed, start Vite in the background, and open the
# examples app once it's listening.
#
# Pairs with:
#   demo-local-down.sh  -- stop the background Vite server
#   setup-demo-bug.sh   -- remote-only sanity check (called from here)
#   plant-color-bug.sh  -- applies the planted-bug patch to the tree
#
# Usage:
#   scripts/demo-bug-automation/demo-local-up.sh
#   scripts/demo-bug-automation/demo-local-up.sh --no-install   # skip yarn install
#   scripts/demo-bug-automation/demo-local-up.sh --no-open      # don't open browser
#   scripts/demo-bug-automation/demo-local-up.sh --skip-remote  # skip setup-demo-bug.sh
#
# What this does NOT do:
#   - Switch git branches. The patch goes onto your current HEAD as
#     uncommitted changes. Use `git restore -- packages/editor/src/lib/editor/Editor.ts`
#     (or run demo-local-down.sh --reset) to drop it.
#   - Touch the remote. The cloud agent has its own VM clone.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

PORT=5420
URL="http://localhost:${PORT}"
LOG_DIR="$REPO_ROOT/.demo-bug-automation"
LOG_FILE="$LOG_DIR/vite.log"
PID_FILE="$LOG_DIR/vite.pid"

INSTALL=1
OPEN_BROWSER=1
RUN_REMOTE_CHECK=1
READY_TIMEOUT=120

for arg in "$@"; do
	case "$arg" in
		--no-install) INSTALL=0 ;;
		--no-open) OPEN_BROWSER=0 ;;
		--skip-remote) RUN_REMOTE_CHECK=0 ;;
		-h|--help)
			sed -n '2,22p' "$0" | sed 's/^# \{0,1\}//'
			exit 0
			;;
		*)
			echo "demo-local-up: unknown argument: $arg" >&2
			exit 2
			;;
	esac
done

cd "$REPO_ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	echo "demo-local-up: not inside a git work tree." >&2
	exit 1
fi

mkdir -p "$LOG_DIR"

# 0. Toolchain sanity. The repo pins node ^20 and yarn 4.12.0; both must be
#    on PATH or the build will explode several layers deep.
if ! command -v node >/dev/null 2>&1; then
	echo "demo-local-up: node is not on PATH. install node 20 (e.g. via mise/nvm/fnm) and retry." >&2
	exit 1
fi
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo "?")
if [ "$NODE_MAJOR" != "20" ]; then
	echo "demo-local-up: node v$(node --version 2>/dev/null) is on PATH, but this repo requires node 20.x." >&2
	echo "  fix it before retrying. options:" >&2
	echo "    mise use node@20             # if you use mise" >&2
	echo "    nvm install 20 && nvm use 20 # if you use nvm" >&2
	echo "    brew install node@20         # then put it ahead of node on PATH" >&2
	exit 1
fi

# 1. Remote sanity check (reuses setup-demo-bug.sh).
if [ "$RUN_REMOTE_CHECK" -eq 1 ]; then
	echo "demo-local-up: [1/5] verifying remote demo state..."
	bash "$SCRIPT_DIR/setup-demo-bug.sh"
	echo ""
else
	echo "demo-local-up: [1/5] skipping remote check (--skip-remote)."
fi

# 2. Plant the bug locally as uncommitted changes.
echo "demo-local-up: [2/5] planting bug in working tree..."
bash "$SCRIPT_DIR/plant-color-bug.sh"
echo ""

# 3. yarn install (idempotent; skips if --no-install).
if [ "$INSTALL" -eq 1 ]; then
	echo "demo-local-up: [3/5] yarn install..."
	if ! command -v yarn >/dev/null 2>&1; then
		echo "demo-local-up: yarn not on PATH. install corepack/yarn first (the repo pins yarn@4.12.0)." >&2
		exit 1
	fi
	yarn install --immutable 2>&1 | tail -20 || {
		echo "demo-local-up: yarn install --immutable failed, retrying without --immutable..." >&2
		yarn install
	}
	echo ""
else
	echo "demo-local-up: [3/5] skipping yarn install (--no-install)."
fi

# 4. Free the port if a stale dev server is hogging it, then start Vite.
echo "demo-local-up: [4/5] starting Vite dev server on port ${PORT}..."

if [ -f "$PID_FILE" ]; then
	OLD_PID=$(cat "$PID_FILE" 2>/dev/null || true)
	if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
		echo "  found existing dev server (pid $OLD_PID), stopping it first..."
		kill "$OLD_PID" 2>/dev/null || true
		sleep 2
		kill -9 "$OLD_PID" 2>/dev/null || true
	fi
	rm -f "$PID_FILE"
fi

if lsof -ti tcp:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
	echo "  port $PORT already has a listener. listing:" >&2
	lsof -i tcp:"$PORT" -sTCP:LISTEN >&2 || true
	echo "  another dev server is already running. either use it as-is, or run" >&2
	echo "  demo-local-down.sh to stop the one started by this script." >&2
	exit 1
fi

: > "$LOG_FILE"
# yarn dev wires up lazy run for apps/examples + packages/tldraw + workers.
nohup yarn dev >"$LOG_FILE" 2>&1 &
VITE_PID=$!
echo "$VITE_PID" > "$PID_FILE"
echo "  vite pid: $VITE_PID  (logs: $LOG_FILE)"

# 5. Wait for the dev server to actually answer on $PORT.
echo "demo-local-up: [5/5] waiting for ${URL} ..."
WAITED=0
while [ "$WAITED" -lt "$READY_TIMEOUT" ]; do
	if ! kill -0 "$VITE_PID" 2>/dev/null; then
		echo "demo-local-up: vite exited before becoming ready. last log lines:" >&2
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
	echo "demo-local-up: ${URL} did not respond within ${READY_TIMEOUT}s. last log lines:" >&2
	tail -40 "$LOG_FILE" >&2 || true
	echo "  vite is still running (pid $VITE_PID). tail $LOG_FILE for details, or run demo-local-down.sh." >&2
	exit 1
fi

if [ "$OPEN_BROWSER" -eq 1 ]; then
	if command -v open >/dev/null 2>&1; then
		open "$URL"
	elif command -v xdg-open >/dev/null 2>&1; then
		xdg-open "$URL" >/dev/null 2>&1 || true
	fi
fi

cat <<NOTE

demo-local-up: ready. summary:
  - local app:                 ${URL}  (apps/examples, Vite)
  - vite pid:                  ${VITE_PID}  (file: ${PID_FILE})
  - vite logs:                 ${LOG_FILE}
  - planted bug:               uncommitted changes in packages/editor/src/lib/editor/Editor.ts
  - to stop:                   bash scripts/demo-bug-automation/demo-local-down.sh
  - to drop the planted bug:   git restore -- packages/editor/src/lib/editor/Editor.ts

ready for demo. open ${URL}, select a shape, click a color swatch, watch nothing happen.
NOTE
