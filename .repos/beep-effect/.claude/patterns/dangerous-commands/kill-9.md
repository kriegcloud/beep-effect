---
tool: Bash
event: PreToolUse
name: kill-signal-9
description: Forcefully killing processes with SIGKILL
pattern: kill\s+(-9|--signal\s+9|-s\s+9|SIGKILL|-KILL)
level: medium
action: ask
---

# Kill -9 (SIGKILL)

Forcefully terminates a process without cleanup.

**Why dangerous:**
- Process cannot catch or ignore SIGKILL
- No opportunity for graceful shutdown
- May leave resources in inconsistent state
- Can corrupt files being written

**Consider:**
- Try `kill` (SIGTERM) first for graceful shutdown
- Only use kill -9 if process is truly stuck
- Check what the process is doing before killing
