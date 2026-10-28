#!/bin/bash
# SessionStart hook: stdout is added to Claude's context.
dir="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/session"
mkdir -p "$dir"
echo "=== Working state (.claude/session/SESSION.md) ==="
if [ -s "$dir/SESSION.md" ]; then cat "$dir/SESSION.md"; else echo "(empty — create it if this task spans turns)"; fi
echo
echo "=== Last auto snapshot (.claude/session/AUTO.md) ==="
if [ -s "$dir/AUTO.md" ]; then cat "$dir/AUTO.md"; else echo "(none yet)"; fi
exit 0
