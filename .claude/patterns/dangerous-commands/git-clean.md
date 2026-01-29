---
tool: Bash
event: PreToolUse
name: git-clean
description: Force clean untracked files
pattern: git\s+clean\s+.*(-f|--force)
level: high
action: ask
---

# Git Clean

This command permanently deletes untracked files and directories.

**Why dangerous:**
- Permanently deletes all untracked files and directories
- Cannot be recovered without backup
- May delete work-in-progress files not yet added to git

**Consider:**
- Use dry run first: `git clean -n` to preview deletions
- Use interactive mode: `git clean -i`
- Commit or stash important work before cleaning
