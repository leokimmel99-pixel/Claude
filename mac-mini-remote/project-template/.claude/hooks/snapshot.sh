#!/bin/bash
# Stop / PreCompact hook: deterministic snapshot of repo state. Bash 3.2 compatible, no jq.
input=$(cat)
root="${CLAUDE_PROJECT_DIR:-$PWD}"
dir="$root/.claude/session"
mkdir -p "$dir"
sid=$(printf '%s' "$input" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
cd "$root" || exit 0
tmp="$dir/AUTO.md.tmp"
{
  echo "updated: $(date '+%Y-%m-%d %H:%M:%S %Z')  host: $(hostname -s)"
  echo "session_id: ${sid:-unknown}   (resume: claude --resume ${sid:-<id>})"
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "branch: $(git branch --show-current 2>/dev/null)  head: $(git rev-parse --short HEAD 2>/dev/null)"
    echo "dirty files:"
    git status --porcelain=v1 2>/dev/null | head -n 40 | sed 's/^/  /'
    echo "diff stat:"
    git diff --stat HEAD 2>/dev/null | tail -n 15 | sed 's/^/  /'
  fi
} > "$tmp" && mv "$tmp" "$dir/AUTO.md"
exit 0
