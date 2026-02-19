---
allowed-tools: Bash(git submodule add:*)
argument-hint: <repo-url>
description: Add a git repo as a submodule in .context for reference
---

Add the repository at `$ARGUMENTS` as a git submodule in the `.context` directory.

1. Extract the repo name from the URL (e.g., `https://github.com/foo/bar` → `bar`)
2. Run: `git submodule add $ARGUMENTS .context/<repo-name>`
3. Report success or any errors
