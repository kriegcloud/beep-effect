---
tool: Bash
event: PreToolUse
name: git-hard-reset
description: Hard reset that discards uncommitted changes
pattern: git\s+reset\s+--hard
level: high
action: ask
---

# Git Hard Reset

This command discards all uncommitted changes.

**Why dangerous:**
- Permanently deletes uncommitted work
- Cannot be undone with git commands
- May lose hours of work

**Consider:**
- Stash changes first: `git stash`
- Use `git reset --soft` to unstage but keep changes
- Commit or stash before resetting
