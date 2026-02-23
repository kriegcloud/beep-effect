---
tool: Bash
event: PreToolUse
name: git-destroy-history
description: Destroy reflog or force garbage collection
pattern: git\s+(reflog\s+expire|gc\s+--prune)
level: critical
action: ask
---

# Git Destroy History

This command destroys the reflog safety net or forces garbage collection.

**Why dangerous:**
- `git reflog expire` removes reflog entries that serve as a safety net for recovering lost commits
- `git gc --prune` forces garbage collection of unreachable objects
- Makes recovery of lost commits impossible
- Combined with reset/rebase mistakes, can lead to permanent data loss

**Consider:**
- Let Git handle garbage collection automatically
- Keep reflog entries for at least 90 days (default)
- Only use these commands if you truly need to reclaim disk space
- Ensure all important commits are reachable before expiring
