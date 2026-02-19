# Pattern System

Unified pattern detection system combining code smell detection and dangerous operation prevention.

## Directory Structure

```
.claude/patterns/
├── code-smells/         # PostToolUse context patterns
│   └── *.md
├── dangerous-commands/  # PreToolUse permission patterns
│   └── *.md
└── custom/              # Project-specific patterns
    └── *.md
```

## Pattern Format

Each pattern is a Markdown file with YAML frontmatter:

```yaml
---
name: pattern-name
description: Brief description
event: PreToolUse | PostToolUse
tool: Bash | Edit | Write | (regex)
glob: "**/*.{ts,tsx}"          # optional, for file tools only
pattern: regex-pattern
action: context | ask | deny
level: critical | high | medium  # for ask/deny
level: info | warning | error # for context
tag: xml-tag-name               # for context
---

# Pattern Body

Markdown content explaining the pattern and suggestions.
```

## Field Reference

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| `name` | Yes | string | Unique identifier |
| `description` | Yes | string | Short explanation |
| `event` | No | PreToolUse, PostToolUse | Hook event (default: PreToolUse) |
| `tool` | No | regex | Tool name pattern (default: .*) |
| `glob` | No | glob | File path pattern (file tools only) |
| `pattern` | Yes | regex | Content/command pattern to match |
| `action` | No | context, ask, deny | Action to take (default: context) |
| `level` | No | critical, high, medium | Danger level for ask/deny |
| `severity` | No | info, warning, error | Severity for context |
| `tag` | No | string | XML tag for context output |

## Action Types

### `context` (PostToolUse)
Adds suggestions/warnings as additional context after tool execution.
- Uses `severity` and `tag` fields
- Non-blocking

### `ask` (PreToolUse)
Prompts user for confirmation before tool execution.
- Uses `level` field
- Can be approved or denied by user

### `deny` (PreToolUse)
Blocks tool execution automatically.
- Uses `level` field
- For critical/destructive operations

## Examples

### Code Smell (PostToolUse, context)
```yaml
---
name: imperative-loops
description: Use functional transformations
event: PostToolUse
tool: (Edit|Write)
glob: "**/*.{ts,tsx}"
pattern: for\s*\(
action: context
level: warning
tag: use-functional
---
```

### Dangerous Command (PreToolUse, ask)
```yaml
---
name: git-force-push
description: Force push to remote
event: PreToolUse
tool: Bash
pattern: git\s+push\s+.*--force
action: ask
level: high
---
```

### Critical Operation (PreToolUse, deny)
```yaml
---
name: rm-rf-root
description: Delete root filesystem
event: PreToolUse
tool: Bash
pattern: rm\s+-[^|]*r[^|]*f.*\s+/($|\s)
action: deny
level: critical
---
```

## Migration Guide

### From `.claude/smells/*.md`
1. Move to `.claude/patterns/code-smells/`
2. Add `event: PostToolUse`
3. Add `action: context`
4. Rename `severity` field (keep existing values)
5. Add `tool: (Edit|Write)`

### From `.claude/dangerzone/*.md`
1. Move to `.claude/patterns/dangerous-commands/`
2. Add `event: PreToolUse`
3. Keep existing `action` and `level`
4. Add `tool: Bash` (or appropriate tool regex)

## Pattern Priority

When multiple patterns match:
1. **Context actions**: All matches are included
2. **Permission actions**: Highest severity match determines behavior
   - Priority: critical > high > medium
   - Action from highest match is used

## Testing

```bash
# Test detection
echo '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"git push --force"}}' | \
  CLAUDE_PROJECT_DIR=. bun run .claude/hooks/pattern-detector.ts

# Run test suite
.claude/hooks/test-pattern-detector.sh
```

## Hook Integration

The pattern detector is used by Claude's hook system:

```json
{
  "hooks": {
    "PreToolUse": ".claude/hooks/pattern-detector.sh",
    "PostToolUse": ".claude/hooks/pattern-detector.sh"
  }
}
```
