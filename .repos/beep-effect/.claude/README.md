# .claude

Pattern-based suggestions and guardrails for Claude Code tool usage via PreToolUse/PostToolUse hooks.

## Overview

The pattern-detector system hooks into Claude Code's PreToolUse and PostToolUse events to provide:
- Context-aware suggestions when patterns are detected in tool inputs
- Permission controls (ask/deny) for dangerous operations
- Automatic skill recommendations based on code patterns

## Patterns

Patterns are markdown files in `.claude/patterns/` with YAML frontmatter that match against tool inputs:

```markdown
---
name: prefer-option-over-null
description: Suggest Option type instead of null/undefined
event: PostToolUse
tool: Edit|Write
glob: "**/*.ts"
pattern: "\bnull\b|\bundefined\b"
action: context
level: info
tag: code-smell
---

Use `Option<A>` from Effect instead of `null` or `undefined`:

```typescript
// Avoid
const findUser = (id: string): User | null => ...

// Prefer
const findUser = (id: string): Option.Option<User> => ...
```
```

## Pattern Schema

Frontmatter fields (from `patterns/schema.ts`):

- `name`: Unique identifier for the pattern
- `description`: Human-readable description
- `event`: "PreToolUse" | "PostToolUse" (default: PostToolUse)
- `tool`: Regex matching tool names (default: ".*")
- `glob`: Optional glob pattern for file paths (e.g., "**/*.ts")
- `pattern`: Regex matching tool input content (command, new_string, content, etc.)
- `action`: "context" | "ask" | "deny" (default: context)
- `level`: "critical" | "high" | "medium" | "warning" | "info" (default: info)
- `tag`: Optional XML tag for context blocks (default: "pattern-suggestion")

### Actions

- `context`: Add suggestion to PostToolUse response
- `ask`: Prompt user for permission (PreToolUse only)
- `deny`: Block the operation with reason (PreToolUse only)

### Content Matching

The pattern detector searches these fields in order:
1. `command` (Bash)
2. `new_string` (Edit)
3. `content` (Write)
4. `pattern` (Grep)
5. `query` (WebSearch)
6. `url` (WebFetch)
7. `prompt` (WebFetch)

Falls back to JSON.stringify(tool_input) if none match.

## Testing

`test/TestClaude.ts` provides tool shape constructors for testing patterns:

```typescript
import * as TestClaude from "./.claude/test/TestClaude"
import { runPatternDetector } from "./.claude/hooks/pattern-detector"

// Create pre/post hook inputs
const bashHook = TestClaude.Bash({ command: "rm -rf /" })
const editHook = TestClaude.Edit({
  file_path: "/foo.ts",
  old_string: "old",
  new_string: "null"
})

// Test against patterns
const output = await runPatternDetector(bashHook.pre)
// or
const output = await runPatternDetector(editHook.post)
```

Each tool constructor returns `{ pre, post }` shapes with correct tool_name and hook_event_name.

## Files

- `hooks/pattern-detector.ts`: Main hook implementation (PreToolUse/PostToolUse)
- `patterns/schema.ts`: Pattern frontmatter Schema definitions
- `patterns/TEMPLATE.md`: Template for new patterns
- `patterns/dangerous-commands/`: PreToolUse ask/deny patterns
- `patterns/code-smells/`: PostToolUse context suggestions
- `test/TestClaude.ts`: Tool shape constructors for testing
- `CLAUDE.md`: Project guidelines referencing pattern system
