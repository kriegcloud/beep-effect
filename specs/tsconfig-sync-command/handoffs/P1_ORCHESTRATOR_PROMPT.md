# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the `tsconfig-sync` command spec.

### Context

Phase 0 (Scaffolding) is complete. The spec design is finalized:
- Command: `tsconfig-sync` with `--check`, `--dry-run`, `--filter`, `--no-hoist`, `--verbose` flags
- Features: tsconfig reference sync, transitive dep hoisting, dep sorting, root-relative paths
- Complexity: 48 (High)

### Your Mission

Implement the core command structure in `tooling/cli/src/commands/tsconfig-sync/`:

1. **index.ts** - Command definition with all options
2. **handler.ts** - Effect-based handler skeleton
3. **schemas.ts** - Input validation schemas
4. **errors.ts** - Tagged error types
5. **utils/workspace-parser.ts** - Package discovery
6. **utils/reference-path-builder.ts** - Root-relative path calculation

### Critical Patterns

**Effect imports** (REQUIRED):
```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import { FileSystem } from "@effect/platform";
```

**Error definition** (REQUIRED):
```typescript
export class CircularDependencyError extends S.TaggedError<CircularDependencyError>()(
  "CircularDependencyError",
  { cycles: S.Array(S.Array(S.String)) }
) {}
```

**FileSystem usage** (REQUIRED):
```typescript
const fs = yield* FileSystem.FileSystem;
const content = yield* fs.readFileString(path);
```

### Reference Files

- `tooling/cli/src/commands/create-slice/` - Canonical command pattern
- `tooling/cli/src/commands/topo-sort.ts` - Topological sorting
- `specs/tsconfig-sync-command/templates/` - Handler and test templates

### Verification

After each file:
```bash
bun run check --filter @beep/repo-cli
bun run lint --filter @beep/repo-cli
```

After all files:
```bash
bun run repo-cli tsconfig-sync --help
bun run repo-cli tsconfig-sync --dry-run
```

### Success Criteria

- [ ] Command shows in `--help` with all options
- [ ] `--dry-run` executes without error
- [ ] Type check passes
- [ ] Lint passes

### Handoff Document

Read full context in: `specs/tsconfig-sync-command/handoffs/HANDOFF_P1.md`
