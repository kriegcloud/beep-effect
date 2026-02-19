---
tool: Bash
event: PreToolUse
name: git-discard-changes
description: Discard uncommitted working directory changes
pattern: git\s+(checkout\s+--\s*\.|restore\s+\.)
level: high
action: ask
---

# Git Discard Changes

This command discards all uncommitted changes in the working directory.

**Why dangerous:**
- Permanently discards all uncommitted changes in working directory
- Cannot be recovered with git commands
- Affects all modified files at once

**Consider:**
- Stash changes first: `git stash`
- Commit changes before discarding
- Use `git diff` to review changes before discarding
- Discard specific files instead of all: `git checkout -- file.txt`
