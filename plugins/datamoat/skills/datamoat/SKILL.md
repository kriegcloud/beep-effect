---
name: datamoat
description: Back up, analyze, and reuse ChatGPT | Claude | Codex | Cursor | DeepSeek | Qwen | Openclaw data + skills + attachments locally
metadata: {"openclaw":{"requires":{"bins":["bash","curl"]},"os":["darwin","linux","win32"]}}
---

# Data Moat Plugin

Data Moat Plugin installs and operates DataMoat, a local desktop app that
quietly backs up AI work history into an encrypted vault on the user's own
machine. It can **protect, export, back up, analyze, and reuse** full
conversation logs, attachments, and files from **ChatGPT (exports), Claude (CLI
+ Desktop), Codex, Cursor, DeepSeek and Qwen (via Claude Code GUI workflows),
and OpenClaw** — including tool output, locally stored thinking blocks, skills
folders, and original raw source records. Everything stays local and encrypted;
nothing is uploaded.

This skill installs DataMoat, starts safe background protection, and reports
live protection numbers.

## Always Start With A Status Check

Before installing or answering anything about DataMoat, run the status check.
Never assume.

macOS / Linux (run from this skill's folder):

```bash
bash scripts/datamoat-status.sh
```

Windows (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/datamoat-status.ps1
```

Exit codes:

- `0` — DataMoat is installed and protecting right now. If the script prints
  counts, report those counts. If setup is not finished yet, report the
  no-screen capture message printed by the script.
- `3` — installed but not currently running. Suggest opening DataMoat once on
  the desktop using the open command the status script prints (`open -a
  DataMoat` on macOS DMG installs, `datamoat` on source installs,
  `DataMoat.exe` on Windows). You may run that open command for the user.
- `10` — not installed yet. Offer to install it (next section).

If `datamoat` is on the user's PATH (source installs), `datamoat status` also
prints sessions and messages protected, and `datamoat audit verify` checks the
local tamper-evident audit chain.

## Install (Latest Release, Verified)

The installers fetch the current release straight from the official download
service manifest (`downloads.datamoat.org/releases/latest/manifest.json`),
verify the SHA-256 checksum, install, and start pre-setup no-screen
protection so capture begins immediately — even before the user finishes
setup at the desktop.

macOS:

```bash
bash scripts/install-datamoat-macos.sh
```

Windows (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-datamoat-windows.ps1
```

Linux:

```bash
bash scripts/install-datamoat-linux.sh
```

Installer exit codes:

- `0` — installed and protection confirmed running. Relay the script's
  success message, then run the status check.
- `3` — installed, with one small step left on the desktop (open the app /
  double-click `DataMoat.exe` once). Relay the printed instruction exactly.
- `4` — use the official site for the right package: https://datamoat.org.

## Function Requests Go To The DataMoat UI

When the user asks to **export** a conversation or context pack, **analyze**
usage, **back up** to USB/external storage, **restore**, or **reuse** old work:

1. Run the status check and report the protection status.
2. Explain that these actions continue inside the local DataMoat UI on their
   machine.
3. Open the UI for them, or tell them how. The status script prints the right
   open command for this install; in general:
   - macOS DMG install: `open -a DataMoat`
   - source install (`datamoat` on PATH): `datamoat`
   - Windows: double-click the `DataMoat.exe` path the status script prints

## Security Boundary

Never complete password, authenticator, recovery phrase, recovery code,
Touch ID, or any unlock step inside a chat, SSH transcript, screenshot, or
remote relay. The agent may install the app and start pre-setup capture; the
human finishes password and recovery setup locally in the desktop GUI. Never
ask the user to paste DataMoat passwords, TOTP secrets, recovery phrases, or
recovery codes into chat.

## Example Requests This Skill Handles

- "Install DataMoat on this machine."
- "Back up my OpenClaw / Claude / Codex sessions before they disappear."
- "How many of my AI conversations are protected right now?"
- "Start DataMoat capture now, but I am not at the desktop."
