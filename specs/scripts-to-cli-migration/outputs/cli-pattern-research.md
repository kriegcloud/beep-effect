# CLI Pattern Research: repo-cli Command Architecture

> Pre-researched patterns from `tooling/cli/`. Phase 2 agent MUST verify and expand.

---

## Directory Structure

```
tooling/cli/src/
  index.ts                    -- Root "beep" command + all subcommands + runtime layers
  commands/
    errors.ts                 -- Shared error classes
    topo-sort.ts              -- Single-file command pattern
    agents-validate.ts        -- Single-file command pattern
    tsconfig-sync/            -- Multi-file command pattern
      index.ts                -- Options + Command definition + Layer
      handler.ts              -- Business logic
      schemas.ts              -- Input validation (S.Class)
      errors.ts               -- Tagged errors with $RepoCliId
    create-slice/             -- Multi-file with services
      index.ts
      handler.ts
      schemas.ts
      errors.ts
    verify/                   -- Command group with subcommands
      index.ts
      options.ts
```

## Runtime Bootstrap (from `index.ts`)

```typescript
const runtimeLayers = Layer.mergeAll(BunContext.layer, BunTerminal.layer, FsUtilsLive);
```

## Command Registration Pattern

```typescript
const repoCommand = CliCommand.make("beep").pipe(
  CliCommand.withSubcommands([...existingCommands, newCommand])
);
```

## Command Creation Pattern

```typescript
export const myCommand = Command.make("name", { options }, ({ options }) =>
  handler(input)
).pipe(
  Command.withDescription("..."),
  Command.provide(ServiceLayer)
);
```

---

## Pattern Selection Guide

| Command | Pattern | Rationale |
|---------|---------|-----------|
| `analyze-agents` | Multi-file | Complex analysis logic, needs schemas/errors |
| `analyze-readmes` | Multi-file | Complex analysis logic, needs schemas/errors |
| `find-missing-docs` | Single-file | Simple existence checks, minimal logic |
| `sync-cursor-rules` | Single-file | Already Effect-idiomatic, just wrapping in CLI |

## Key Utilities

| Utility | Import | Methods |
|---------|--------|---------|
| `RepoUtils.REPOSITORY_ROOT` | `@beep/utils` | Absolute path to monorepo root |
| `FsUtils.glob` | `@beep/utils` | Glob file discovery |
| `FsUtils.globFiles` | `@beep/utils` | Glob returning file paths |
| `RepoUtils.RepoWorkspaceMap` | `@beep/utils` | Package workspace discovery |

## Error Pattern

```typescript
import { $RepoCliId } from "../errors.js";

export class AnalyzeAgentsError extends S.TaggedError<AnalyzeAgentsError>()(
  $RepoCliId("AnalyzeAgentsError"),
  { message: S.String }
) {}
```

---

## Phase 2 Agent Instructions

The executing agent MUST:
1. Verify all patterns above against current source files
2. Document exact file paths and line numbers
3. List all available `FsUtils` and `RepoUtils` methods
4. Confirm Layer composition chain
5. Write final research to this file (overwrite)
