---
tool: Bash
event: PreToolUse
name: drop-database
description: SQL commands that drop databases or tables
pattern: ^(?!(echo|grep|cat|less|more|head|tail|sed|awk|print)\s).*(DROP\s+(DATABASE|TABLE|SCHEMA)|TRUNCATE\s+TABLE)
level: critical
action: ask
---

# Drop Database/Table

This command will permanently delete database objects.

**Why dangerous:**
- Irreversibly deletes all data in table/database
- No undo without backups
- Can affect production if wrong connection

**Consider:**
- Verify you're connected to the right database
- Create a backup first
- Use transactions if possible
