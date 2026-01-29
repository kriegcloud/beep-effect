---
tool: Bash
event: PreToolUse
name: git-stash-destroy
description: Permanently delete stashed changes
pattern: git\s+stash\s+(drop|clear)
level: medium
action: ask
---

# Git Stash Destroy

This command permanently deletes stashed changes.

**Why dangerous:**
- Permanently destroys stashed work
- Cannot be recovered after garbage collection
- May lose unsaved work that was stashed for later

**Consider:**
- Review stash contents first: `git stash show -p`
- Create a branch from the stash: `git stash branch <name>`
- Use `git stash pop` to apply and remove safely
