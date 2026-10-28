# Mac mini as a remote Claude Code host (Tailscale + VS Code Remote-SSH + tmux)

There is no sync layer. Files, git, Claude Code and its transcripts all live on the Mac
mini. The laptop is only a VS Code UI. If you install anything that "syncs" (Syncthing,
iCloud Drive for the repo, Mutagen), you get the duplication you said you wanted to avoid.

```
laptop VS Code ──SSH over Tailscale──▶ Mac mini: VS Code Server ─▶ zsh ─▶ tmux "cc-<proj>" ─▶ claude
                                                   └─ Claude extension (optional, same ~/.claude)
```

## Install
On the Mac mini (sitting at it, logged in once):
```bash
git clone <this repo> ~/claude-kit && ~/claude-kit/mac-mini-remote/host/bootstrap-mac-mini.sh
```
Then in the Tailscale admin console (login.tailscale.com → Machines → mac-mini → ⋯) turn on
**Disable key expiry**. If you skip this, the node key expires (180 days by default) and you
lose remote access until you are back at the machine.

On the laptop:
1. Install Tailscale, sign in to the **same tailnet**, and check that MagicDNS is on (DNS tab).
2. Run `ssh-keygen -t ed25519`, then `ssh-copy-id mac-mini` (do this before the bootstrap turns password auth off, or put the key in `~/.ssh/authorized_keys` on the mini by hand).
3. Append `laptop/ssh_config.snippet` to `~/.ssh/config` and set `User`.
4. Merge `laptop/vscode-user-settings.json` into your local VS Code user settings.
5. Connect with Remote-SSH to `mac-mini`, then merge `host/vscode-remote-settings.json` into
   the **Remote [SSH: mac-mini]** settings tab.

Per project on the mini:
```bash
cp -R ~/claude-kit/mac-mini-remote/project-template/{CLAUDE.md,.claude} /path/to/project/
cat ~/claude-kit/mac-mini-remote/project-template/.gitignore.append >> /path/to/project/.gitignore
```

## Daily use
- Open a terminal in VS Code. The default profile runs `cc`, which attaches to `cc-<project>` or creates it.
- Closing the lid or losing Wi-Fi only disconnects the client. tmux and `claude` keep running on the mini.
- Reconnect, open a terminal, and you're back in the same live loop. If diff previews stopped, run `/ide` (the
  VS Code server may have restarted on a new port).
- From a phone or another machine: `ssh mac-mini -t '~/.local/bin/cc ~/path/to/project'`.
- Detach: `Ctrl-b d`. Kill: `tmux kill-session -t cc-<project>`.

## Verification checklist
1. **Single source of truth**: in the VS Code terminal run `hostname; tailscale ip -4; pwd` and expect the mini's name,
   a `100.x` address and the remote path. Then `tmux ls` should show exactly one `cc-<project>` session with `(attached)`.
2. **File watching**: in the tmux `shell` window run `echo test >> watch_probe.txt`. The Explorer and the SCM badge should
   update within about 1s. Ask Claude to edit that file and the open editor tab should reload. Delete the probe after.
3. **Diff previews**: ask Claude for a one-line change. It should open a VS Code diff tab, not an inline terminal diff.
   If it shows a terminal diff, run `/ide`, pick the listed VS Code instance, and retry.
4. **Survives a disconnect**: start a long task (ask Claude to run `sleep 120 && echo done`). Close the laptop lid
   for about 60s, reopen it and reconnect. The terminal should re-attach to the same pane with the task still running and
   `.claude/session/AUTO.md` updated. Then `tmux kill-server`, run `cc`, and the conversation should come back via
   `claude --continue` with SESSION.md in context.

## Failure modes (ranked by how likely they are to hit you)
- **Mac mini sleeps**: everything dies. Fixed by `pmset` in the bootstrap. Check with `pmset -g`.
- **Keychain locked over SSH**: `claude` asks you to log in again or fails auth. `cc` unlocks it, or run
  `security unlock-keychain ~/Library/Keychains/login.keychain-db`.
- **Tailscale GUI app instead of the daemon**: it only runs after a user logs in at the console. After a power-cut reboot
  you're locked out. The bootstrap uses brew `tailscaled` as a system daemon. Don't run both.
- **`systemsetup` refuses** ("requires Full Disk Access"): turn on System Settings → General → Sharing → Remote Login by hand.
- **Same conversation in two places** (extension panel + CLI at once): messages get mixed up. Pick one front end per conversation.
- **8 GB M2**: tsserver/Pylance on the remote are the memory hogs, not Claude Code. Install only the extensions you need on
  the remote side and run `memory_pressure` if it feels slow.
