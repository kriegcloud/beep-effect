---
tool: Bash
event: PreToolUse
name: git-branch-force-delete
description: Force delete unmerged branch
pattern: git\s+branch\s+.*-D
level: medium
action: ask
---

# Git Branch Force Delete

This command force-deletes a branch even if it contains unmerged commits.

**Why dangerous:**
- Force-deletes branch even if not merged
- Commits unique to that branch may be lost
- Cannot be easily undone if branch had unmerged work

**Consider:**
- Use `git branch -d` (lowercase) for safe delete that checks merge status
- Verify branch is merged first: `git branch --merged`
- Create a backup tag before deleting: `git tag backup/branch-name branch-name`
