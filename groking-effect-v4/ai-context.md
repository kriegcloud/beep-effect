---
path: groking-effect-v4
summary: Generated learning workspace for Effect v4 exports and examples.
tags: [effect]
---

# @beep/groking-effect-v4

Generated learning workspace for Effect v4 exports and examples.

## Architecture

Generated module playgrounds and supporting generator/runtime utilities.

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/index.ts` | Package entry point |
| `src/generator` | Export surface generation helpers |
| `src/runtime` | Shared playground execution and formatting helpers |

## Usage Patterns

```typescript
import * as Generator from "@beep/groking-effect-v4/generator"
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Keep export playground files executable | Makes each generated page a runnable learning artifact |
| Use shared runtime helpers | Reduces boilerplate and keeps example structure consistent |

## Dependencies

**Internal**: (none)
**External**: `effect`

## Related

- **AGENTS.md** - Detailed contributor guidance
