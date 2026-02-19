---
tool: Bash
event: PreToolUse
name: expose-secrets
description: Commands that may expose secrets or credentials
pattern: (cat|echo|printf|head|tail|less|more)\s+.*\.(env|pem|key|secret|credential)
level: high
action: ask
---

# Exposing Secrets

This command may expose sensitive credentials.

**Why dangerous:**
- Secrets may appear in terminal history
- May be logged or captured
- Could be visible to screen sharing

**Consider:**
- Use environment variables instead of cat'ing files
- Check who might see your terminal
- Clear terminal history after viewing secrets
