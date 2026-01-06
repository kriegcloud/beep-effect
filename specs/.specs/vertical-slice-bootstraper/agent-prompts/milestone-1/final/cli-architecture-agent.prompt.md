# CLI Architecture Agent Prompt

[FINAL - Milestone 1]

## Task

Analyze the `tooling/cli` package to extract architecture patterns for CLI command implementation. Your analysis will be used for **code generation templates** when scaffolding new CLI commands.

## Scope

| Level | Description |
|-------|-------------|
| **Minimal** | Command registration, basic structure |
| **Intermediate** | Options/args, validation, error handling |
| **Advanced** | Layer composition, custom services, streaming |

Analyze all three levels. Prioritize patterns that appear in multiple commands.

## Key Questions to Answer

1. How do I register a new command with the CLI?
2. What is the minimum file structure for a command?
3. How are command options defined and validated?
4. How are errors handled and reported?
5. How do I inject service dependencies via Layers?
6. What naming conventions are enforced?

## Pattern Criteria

Document these specific patterns with code examples:

| Pattern | What to Document |
|---------|------------------|
| **Command Registration** | How commands are added to the CLI entry point |
| **Options Definition** | Type-safe option parsing with `@effect/cli` |
| **Args Handling** | Positional argument patterns |
| **Effect-First Implementation** | `Effect.gen` usage, no async/await |
| **Error Handling** | Tagged errors, recovery patterns, exit codes |
| **Layer Integration** | Service injection, dependency composition |
| **Nested Subcommands** | If present, how subcommand trees are structured |
| **Help Text** | How descriptions and examples are provided |

## Output Requirements

**File**: `specs/.specs/vertical-slice-bootstraper/outputs/milestone-1/cli-architecture-patterns.md`

**Format**:

```markdown
# CLI Architecture Patterns

## Overview
[Brief summary of CLI structure]

## Command Registration

### Entry Point
[How commands are registered in main CLI]

### Pattern
\`\`\`typescript
// Code example
\`\`\`

## File Structure

### Minimal Command
\`\`\`
tooling/cli/src/commands/
└── <command-name>/
    └── index.ts
\`\`\`

### Intermediate Command
[With options, validation]

### Complex Command
[With layers, services]

## Options & Arguments

### Option Definition Pattern
\`\`\`typescript
// Code example
\`\`\`

### Validation Patterns
[How options are validated]

## Error Handling

### Tagged Error Pattern
\`\`\`typescript
// Code example
\`\`\`

### Recovery Patterns
[How errors are caught and handled]

## Layer Composition

### Service Injection
\`\`\`typescript
// Code example
\`\`\`

### Dependency Graph
[How layers compose]

## Template

### Minimal Command Template
\`\`\`typescript
// Ready-to-use template
\`\`\`

### Intermediate Command Template
\`\`\`typescript
// With options and validation
\`\`\`
```

## Reference Files

| File | Purpose |
|------|---------|
| `tooling/cli/src/index.ts` | CLI entry point, command registration |
| `tooling/cli/src/commands/*/index.ts` | Individual command implementations |
| `tooling/cli/AGENTS.md` | Package-specific patterns |
| `AGENTS.md` | Root project patterns (Effect conventions) |

## Success Criteria

- [ ] All pattern criteria have documented examples
- [ ] Templates are copy-paste ready
- [ ] Effect-first conventions followed
- [ ] File structure is explicit
- [ ] Error handling patterns clear

---

## Prompt Feedback

After completing this task, append a section evaluating this prompt:

```markdown
## Prompt Feedback

**Efficiency Score**: X/10

**What Worked**:
- ...

**What Was Missing**:
- ...

**Suggested Improvements**:
- ...
```
