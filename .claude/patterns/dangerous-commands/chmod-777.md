---
tool: Bash
event: PreToolUse
name: chmod-world-writable
description: Making files world-writable or overly permissive
pattern: chmod\s+(-R\s+)?777
level: high
action: ask
---

# World-Writable Permissions

Setting chmod 777 makes files writable by everyone.

**Why dangerous:**
- Any user on the system can modify/delete
- Major security vulnerability
- Can lead to privilege escalation attacks
- Recursive `-R` affects all subdirectories

**Consider:**
- Use more restrictive permissions: 755 for dirs, 644 for files
- Only grant permissions that are actually needed
- Use groups for shared access
