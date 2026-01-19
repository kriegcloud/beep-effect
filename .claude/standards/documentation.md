# Documentation Standards

Canonical standards for AGENTS.md and README.md files in the beep-effect monorepo.

## Effect Pattern Requirements

All code examples in documentation MUST follow Effect patterns from `.claude/rules/effect-patterns.md`.

### Anti-Pattern Detection

| Violation | Pattern to Find | Correct Pattern |
|-----------|-----------------|-----------------|
| Native `.map()` | `array.map(` | `A.map(array, ` |
| Native `.filter()` | `array.filter(` | `A.filter(array, ` |
| Native `.split()` | `str.split(` | `Str.split(str, ` |
| Direct imports | `import { Effect } from "effect"` | `import * as Effect from "effect/Effect"` |
| Test anti-pattern | `Effect.runPromise(` | `import { effect } from "@beep/testkit"` |
| Lowercase schema | `S.struct({` | `S.Struct({` |
| async/await | `async function` | `Effect.gen(function* ()` |

### Stale Package References

These packages were deleted - replace all occurrences:

| Stale Reference | Current Replacement |
|-----------------|---------------------|
| `@beep/core-db` | `@beep/shared-server` or specific tables package |
| `@beep/core-env` | `@beep/shared-env` |

### MCP Tool Shortcuts

Remove any sections like:
```markdown
## Tooling & Docs Shortcuts
- `jetbrains__*` — ...
- `context7__*` — ...
```

These are IDE configurations, not documentation.

## AGENTS.md vs README.md

| Content Type | README.md | AGENTS.md |
|--------------|-----------|-----------|
| Package purpose | ✅ Brief | ✅ Detailed |
| Installation | ✅ Yes | ❌ No |
| Key exports table | ✅ Simple | ✅ Comprehensive |
| Usage examples | ✅ Basic | ✅ Advanced patterns |
| Integration points | ❌ No | ✅ Yes |
| Architecture role | ❌ No | ✅ Yes |
| Development commands | ✅ Yes | ❌ No |

**Principle**: README is for humans getting started; AGENTS.md is for AI agents understanding the codebase.

## AGENTS.md Required Structure

```markdown
# Package Name AGENTS.md

Brief description of the package purpose.

## Overview
What this package provides and its role in the architecture.

## Key Exports
| Export | Description |
|--------|-------------|

## Dependencies
| Package | Purpose |
|---------|---------|

## Usage Patterns
Effect-compliant code examples.

## Integration Points
How this package connects with others.
```

## README.md Required Structure

```markdown
# @beep/package-name

Brief description from package.json.

## Purpose
2-3 sentences: what it does, where it fits, who uses it.

## Installation
"@beep/package-name": "workspace:*"

## Key Exports
| Export | Description |
|--------|-------------|

## Usage
Basic Effect-compliant code example.

## Dependencies
| Package | Purpose |
|---------|---------|

## Development
bun run --filter @beep/package-name check
```

## Reference Examples

Fully compliant files to copy patterns from:

| File | Notes |
|------|-------|
| `packages/iam/client/AGENTS.md` | Comprehensive, perfect Effect patterns |
| `packages/runtime/client/AGENTS.md` | Clean, well-structured |
| `tooling/testkit/AGENTS.md` | Concise, all sections present |

## Verification

```bash
# Find missing documentation files
bun run scripts/find-missing-agents.ts

# Analyze AGENTS.md compliance
bun run scripts/analyze-agents-md.ts
```
