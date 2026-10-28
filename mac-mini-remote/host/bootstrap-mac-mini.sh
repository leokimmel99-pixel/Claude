#!/bin/bash
# Run ON the Mac mini, from a local (non-SSH) session the first time: some steps need GUI approval.
set -euo pipefail

# 0. Homebrew on PATH for non-interactive SSH shells (VS Code server, tmux, hooks)
if ! grep -q 'brew shellenv' ~/.zprofile 2>/dev/null; then
  echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
fi
grep -q 'brew shellenv' ~/.zshenv 2>/dev/null || echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshenv
eval "$(/opt/homebrew/bin/brew shellenv)"

# 1. Tools
brew install tmux git ripgrep
brew install tailscale            # open-source tailscaled: runs as a system daemon, before login
command -v claude >/dev/null || curl -fsSL https://claude.ai/install.sh | bash

# 2. Tailscale as a boot-time root daemon (headless-safe; the GUI app only runs after user login)
sudo brew services start tailscale
sudo tailscale up --hostname=mac-mini
tailscale status

# 3. SSH server (macOS Remote Login), key-only auth
sudo systemsetup -setremotelogin on
sudo tee /etc/ssh/sshd_config.d/100-hardening.conf >/dev/null <<'CONF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
ClientAliveInterval 30
ClientAliveCountMax 6
CONF
sudo launchctl kickstart -k system/com.openssh.sshd 2>/dev/null || true

# 4. Never sleep (laptop lid is irrelevant; the HOST sleeping is what kills sessions)
sudo pmset -a sleep 0 disksleep 0 displaysleep 10 powernap 0 womp 1 autorestart 1 tcpkeepalive 1
pmset -g | egrep 'sleep|womp|autorestart'

# 5. File descriptor ceiling for big repos (macOS uses FSEvents; there is no inotify limit to raise)
sudo tee /Library/LaunchDaemons/limit.maxfiles.plist >/dev/null <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>limit.maxfiles</string>
  <key>ProgramArguments</key><array>
    <string>launchctl</string><string>limit</string><string>maxfiles</string>
    <string>65536</string><string>524288</string></array>
  <key>RunAtLoad</key><true/>
</dict></plist>
PLIST
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
sudo launchctl bootstrap system /Library/LaunchDaemons/limit.maxfiles.plist 2>/dev/null || true
grep -q 'ulimit -n' ~/.zshenv || echo 'ulimit -n 65536 2>/dev/null' >> ~/.zshenv

# 6. tmux config + launcher
install -m 0644 "$(dirname "$0")/tmux.conf" ~/.tmux.conf
mkdir -p ~/.local/bin
install -m 0755 "$(dirname "$0")/cc" ~/.local/bin/cc
grep -q '.local/bin' ~/.zshenv || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshenv

echo "Done. Tailnet name: $(tailscale status --self --json 2>/dev/null | sed -n 's/.*"DNSName": *"\([^"]*\)".*/\1/p' | head -n1)"
echo "NEXT: in the Tailscale admin console, disable key expiry for this machine."
