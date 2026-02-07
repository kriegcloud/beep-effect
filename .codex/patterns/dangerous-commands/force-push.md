---
tool: Bash
event: PreToolUse
name: git-force-push
description: Force push to remote repository
pattern: git\s+push\s+.*(-f|--force|--force-with-lease)
level: high
action: ask
---

# Git Force Push

This command will overwrite remote history.

**Why dangerous:**
- Rewrites commit history on remote
- Can destroy teammates' work if they've pulled
- May lose commits that only exist on remote
- Particularly dangerous on main/master branches

**Consider:**
- Use `--force-with-lease` instead of `--force` (safer)
- Coordinate with team before force pushing shared branches
- Never force push to main/master without team agreement
