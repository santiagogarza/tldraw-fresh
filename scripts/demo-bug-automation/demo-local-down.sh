#!/usr/bin/env bash
# Stop the local demo started by setup-demo-bug.sh: kill the background Vite
# server, drop the listener on the demo port, and optionally restore the
# planted-bug file.
#
# Usage:
#   scripts/demo-bug-automation/demo-local-down.sh
#   scripts/demo-bug-automation/demo-local-down.sh --reset       # also drop the planted-bug patch
#   scripts/demo-bug-automation/demo-local-down.sh --port 5422   # non-default port

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

LOG_DIR="$REPO_ROOT/.demo-bug-automation"
PID_FILE="$LOG_DIR/vite.pid"

RESET=0
PORT=5420

while [ $# -gt 0 ]; do
	case "$1" in
		--reset) RESET=1; shift ;;
		--port) PORT="${2:?--port needs a value}"; shift 2 ;;
		--port=*) PORT="${1#*=}"; shift ;;
		-h|--help)
			sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'
			exit 0
			;;
		*)
			echo "demo-local-down: unknown argument: $1" >&2
			exit 2
			;;
	esac
done

cd "$REPO_ROOT"

STOPPED=0
if [ -f "$PID_FILE" ]; then
	PID=$(cat "$PID_FILE" 2>/dev/null || true)
	if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
		echo "demo-local-down: stopping vite (pid $PID)..."
		kill "$PID" 2>/dev/null || true
		sleep 2
		if kill -0 "$PID" 2>/dev/null; then
			echo "demo-local-down: force killing pid $PID..."
			kill -9 "$PID" 2>/dev/null || true
		fi
		STOPPED=1
	fi
	rm -f "$PID_FILE"
fi

# Sweep any leftover *listener* on the port. Filter -sTCP:LISTEN so we never
# kill clients that happen to be connected to the dev server.
LEFTOVER_PIDS=$(lsof -ti tcp:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$LEFTOVER_PIDS" ]; then
	echo "demo-local-down: cleaning up leftover listener(s) on port ${PORT}: $LEFTOVER_PIDS"
	# shellcheck disable=SC2086
	kill $LEFTOVER_PIDS 2>/dev/null || true
	sleep 1
	# shellcheck disable=SC2086
	kill -9 $LEFTOVER_PIDS 2>/dev/null || true
	STOPPED=1
fi

if [ "$STOPPED" -eq 0 ]; then
	echo "demo-local-down: no running dev server found on port ${PORT}."
fi

if [ "$RESET" -eq 1 ]; then
	TARGET="packages/editor/src/lib/editor/Editor.ts"
	if [ -f "$TARGET" ]; then
		echo "demo-local-down: restoring $TARGET from HEAD..."
		git restore -- "$TARGET" || true
	fi
fi

echo "demo-local-down: done."
