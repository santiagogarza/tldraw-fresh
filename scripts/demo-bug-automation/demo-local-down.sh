#!/usr/bin/env bash
# Stop the Vite dev server started by demo-local-up.sh and optionally
# discard the planted-bug patch from the working tree.
#
# Usage:
#   scripts/demo-bug-automation/demo-local-down.sh
#   scripts/demo-bug-automation/demo-local-down.sh --reset   # also drop planted-bug uncommitted changes

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

PORT=5420
LOG_DIR="$REPO_ROOT/.demo-bug-automation"
PID_FILE="$LOG_DIR/vite.pid"

RESET=0
for arg in "$@"; do
	case "$arg" in
		--reset) RESET=1 ;;
		-h|--help)
			sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'
			exit 0
			;;
		*)
			echo "demo-local-down: unknown argument: $arg" >&2
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

# Sweep any leftover *listener* on the port (e.g. lazy spawned child).
# IMPORTANT: filter -sTCP:LISTEN so we never kill clients that happen to be
# connected to the dev server (Cursor itself, another browser, etc.).
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
	echo "demo-local-down: no running dev server found."
fi

if [ "$RESET" -eq 1 ]; then
	TARGET="packages/editor/src/lib/editor/Editor.ts"
	if [ -f "$TARGET" ]; then
		echo "demo-local-down: restoring $TARGET from HEAD..."
		git restore -- "$TARGET" || true
	fi
fi

echo "demo-local-down: done."
