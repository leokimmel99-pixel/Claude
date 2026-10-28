# Project instructions

## Session continuity (remote host: Mac mini, accessed over Tailscale + VS Code Remote-SSH)

The conversation transcript is already persisted by Claude Code in `~/.claude/projects/`
and is resumed with `claude --continue` / `claude --resume`. Do NOT copy chat history
into any file. Your job is to keep a short *working-state* file that survives a
dropped connection, a `/clear`, or a compaction.

- State file: `.claude/session/SESSION.md` (gitignored; local to this host).
- Auto snapshot: `.claude/session/AUTO.md` is rewritten by a Stop hook after every
  turn (branch, dirty files, diff stat, session id). Never edit it by hand.
- Both files are injected into your context at session start, resume, clear and compact.

### Update `SESSION.md` when, and only when:
1. You start a task that will take more than one turn.
2. You finish, abandon, or get blocked on a task.
3. You are about to run something long or risky (migration, large refactor, dependency bump).

Keep it under 40 lines. Overwrite stale content; do not append a journal. Format:

```
## Objective
<one line>
## In progress
- [ ] <task> — <file(s)> — <next concrete step>
## Done this session
- <task> (<commit sha or "uncommitted">)
## Blocked / decisions needed
- <question for the user>
## Notes for the next session
- <non-obvious context: env quirks, failing test names, commands that must run first>
```

### On resume
Read `SESSION.md` and `AUTO.md`, reconcile them against `git status`, then state in
one line what you are resuming. If they disagree with the working tree, trust the
working tree and fix `SESSION.md`.

## Host constraints
- macOS on Apple M2. Homebrew is at `/opt/homebrew`.
- Prefer targeted Grep/Glob over recursive listings; never scan `node_modules`,
  `.venv`, `dist`, `build`, `.next`, `target`.
- Run long-lived dev servers in a separate tmux window, not in your Bash tool.
