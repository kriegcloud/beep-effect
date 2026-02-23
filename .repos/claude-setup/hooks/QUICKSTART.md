# Pattern Detector - Quick Start

## 1. Test the Implementation

```bash
# Make executable
chmod +x .claude/hooks/pattern-detector.sh
chmod +x .claude/hooks/test-pattern-detector.sh

# Run tests
.claude/hooks/test-pattern-detector.sh
```

## 2. Expected Output

### Test 1: Force Push (ask)
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "PATTERN ALERT\n\n⚠️ git-force-push [high]: Force push to remote repository..."
  }
}
```

### Test 2: rm -rf (deny)
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "PATTERN ALERT\n\n⚠️ rm-rf-root [critical]: Recursive force delete from root..."
  }
}
```

### Test 3: For Loop (context)
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "<use-functional>\n**imperative-loops**\n\nUse functional transformations..."
  }
}
```

### Test 4 & 5: No Match
(No output - silent when no patterns match)

## 3. Create Your First Pattern

```bash
# Create a new pattern file
cat > .claude/patterns/custom/my-pattern.md << 'EOF'
---
name: my-custom-pattern
description: Detects something important
event: PostToolUse
tool: (Edit|Write)
glob: "**/*.ts"
pattern: console\.log
action: context
severity: info
tag: avoid-console-log
---

# Avoid console.log

Use Effect's logging system instead:

```typescript
// ❌ Bad
console.log("message")

// ✅ Good
Effect.log("message")
```

Provides structured logging, log levels, and better testing.
EOF
```

## 4. Test Your Pattern

```bash
echo '{"hook_event_name":"PostToolUse","tool_name":"Edit","tool_input":{"file_path":"src/test.ts","new_string":"console.log(\"test\")"}}' | \
  CLAUDE_PROJECT_DIR=. bun run .claude/hooks/pattern-detector.ts
```

## 5. Pattern Types Cheat Sheet

### Context Pattern (Code Suggestions)
```yaml
event: PostToolUse
tool: (Edit|Write)
action: context
severity: warning
tag: suggestion-tag
```

### Ask Pattern (Confirm Dangerous)
```yaml
event: PreToolUse
tool: Bash
action: ask
level: high
```

### Deny Pattern (Block Critical)
```yaml
event: PreToolUse
tool: Bash
action: deny
level: critical
```

## 6. Integration with Hooks

Update `.claude/hooks.json`:

```json
{
  "hooks": {
    "PreToolUse": ".claude/hooks/pattern-detector.sh",
    "PostToolUse": ".claude/hooks/pattern-detector.sh"
  }
}
```

## 7. Common Patterns

### Match Multiple Tools
```yaml
tool: (Edit|Write|Bash)
```

### Match TypeScript/TypeScript React
```yaml
glob: "**/*.{ts,tsx}"
```

### Match Bash Commands
```yaml
tool: Bash
pattern: git\s+push\s+--force
```

### Match File Content
```yaml
tool: (Edit|Write)
pattern: for\s*\(
```

## 8. Debugging

### Enable verbose output
```bash
# See what's happening
CLAUDE_PROJECT_DIR=. bun run .claude/hooks/pattern-detector.ts <<< '{
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {"command": "git push --force"}
}' | jq .
```

### Check pattern loading
```bash
# Add debug logging to pattern-detector.ts temporarily
yield* Console.log(`Loaded ${patterns.length} patterns`)
```

### Verify pattern files
```bash
# List all patterns
find .claude/patterns -name "*.md"

# Check frontmatter
head -20 .claude/patterns/code-smells/imperative-loops.md
```

## 9. Migration from Old System

```bash
# Migrate existing patterns
CLAUDE_PROJECT_DIR=. bun run .claude/hooks/migrate-patterns.ts

# Verify migration
ls -R .claude/patterns/

# Test migrated patterns
.claude/hooks/test-pattern-detector.sh

# Archive old directories
mv .claude/smells .claude/smells.backup
mv .claude/dangerzone .claude/dangerzone.backup
```

## 10. Resources

- **Full documentation**: `.claude/hooks/PATTERN-DETECTOR.md`
- **Pattern format**: `.claude/patterns/README.md`
- **Template**: `.claude/patterns/TEMPLATE.md`
- **Summary**: `.claude/hooks/PATTERN-DETECTOR-SUMMARY.md`

## Troubleshooting

### No output when expecting matches
1. Check `event` field matches hook event name
2. Verify `tool` regex matches tool name
3. Test `pattern` regex separately
4. Ensure frontmatter is valid YAML

### Pattern not loading
1. File must end in `.md`
2. Frontmatter must start/end with `---`
3. Required fields: `name`, `description`, `pattern`
4. Check for YAML syntax errors

### Wrong priority
1. Check `level` values: critical > high > medium
2. Verify sorting in output
3. Only highest priority match used for PreToolUse

### Pattern format issues
1. Use YAML strings for regex: `pattern: "regex\s+here"`
2. Escape backslashes in YAML: `\\s` becomes `\s` in regex
3. Test regex separately: `echo "test" | grep -E "pattern"`
