---
tool: Bash
event: PreToolUse
name: sudo-rm
description: Deleting files as root
pattern: sudo\s+rm\s+(-[rRf]+\s+)*
level: critical
action: ask
---

# Sudo Remove

Running rm as root bypasses all permission protections.

**Why dangerous:**
- Root can delete any file including system files
- No confirmation prompts with `-f`
- Can make system unbootable
- Cannot be undone

**Consider:**
- Double-check the exact path
- Avoid `-f` flag to get confirmation prompts
- Use `sudo ls` first to verify what will be deleted
