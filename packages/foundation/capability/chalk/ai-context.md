---
path: packages/common/chalk
summary: 🖍 Terminal string styling done right
tags: [effect]
---

# @beep/chalk

🖍 Terminal string styling done right

## Architecture

`@beep/chalk` preserves the Chalk 5 callable builder API while keeping exported
data domains schema-first.

## Core Modules

| Module | Purpose |
|--------|---------|
| `index.ts` | Package entry point |
| `Chalk.ts` | Node/runtime Chalk surface and exports |
| `internal/ChalkSchema.ts` | Schema-backed public data models |
| `internal/ChalkRuntime.ts` | Chainable callable builder implementation |
| `internal/SupportsColor.ts` | Runtime stdout/stderr color detection |

## Usage Patterns

```typescript
import chalk, { Chalk } from "@beep/chalk"

const emphasis = chalk.blue.bold("hello")
const plain = new Chalk({ level: 0 })

console.log(emphasis)
console.log(plain.red("offline"))
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|

## Dependencies

**Internal**: `@beep/identity`, `@beep/schema`
**External**: `effect`

## Related

- **AGENTS.md** - Detailed contributor guidance
