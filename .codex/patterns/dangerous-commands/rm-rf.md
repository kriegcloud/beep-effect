---
tool: Bash
event: PreToolUse
name: rm-rf-root
description: Recursive force delete from root or home directory
pattern: rm\s+(-[rf]+\s+)*(/$|/\s|~/?$|~\s|\$HOME/?$|\$HOME\s|/home/?$|/home\s)
level: critical
action: ask
---

# Recursive Delete from Root/Home

This command attempts to recursively delete from a critical system location.

**Why dangerous:**
- `rm -rf /` destroys the entire filesystem
- `rm -rf ~` or `rm -rf $HOME` destroys your home directory
- Cannot be undone without backups
- May require OS reinstallation

**Consider:**
- Be more specific about what to delete
- Use trash/recycle bin instead
- Verify the path before running
