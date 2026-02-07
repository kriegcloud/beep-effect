# P0 Orchestrator Prompt: Utility Improvements

> Copy-paste this prompt to execute Phase 0 utility improvements for tsconfig-sync.

---

## Prompt

```
You are implementing Phase 0 utility improvements for the tsconfig-sync command spec.

## Context

Read these files for full context:
- specs/tsconfig-sync-command/handoffs/P0_UTILITY_IMPROVEMENTS.md (task details)
- specs/tsconfig-sync-command/EXISTING_UTILITIES.md (current utilities)
- tooling/utils/AGENTS.md (utility package patterns)
- tooling/cli/src/commands/topo-sort.ts (source for extraction)

## Objectives

1. Fix schema bug in WorkspaceDependencies.ts
2. Add CatalogValue schema support
3. Extract graph utilities from topo-sort.ts to new Graph.ts
4. Create DepSorter.ts with sorting utilities
5. Create Paths.ts with path calculation utilities

## Implementation Order

Execute in this order, verifying after each step:

### Step 1: Schema Fixes (5 min)

File: `tooling/utils/src/schemas/WorkspaceDependencies.ts`

1. Fix line ~15: Change `S.Literal("workspace:^", "workspace:^")` to `S.Literal("workspace:^")`
2. Add CatalogValue schema:
   ```typescript
   export const CatalogValue = S.Literal("catalog:");
   ```
3. Add VersionSpecifier union:
   ```typescript
   export const VersionSpecifier = S.Union(WorkspacePkgValue, CatalogValue, NpmDepValue);
   ```

Verify: `bun run check --filter @beep/tooling-utils`

### Step 2: Create Graph.ts (30 min)

File: `tooling/utils/src/repo/Graph.ts`

Extract from `tooling/cli/src/commands/topo-sort.ts`:
- CyclicDependencyError (enhance with cycles array)
- topologicalSort function (Kahn's algorithm)

Add new:
- computeTransitiveClosure (recursive dependency collection)
- detectCycles (return cycle paths)

Pattern: Use Effect.gen, HashMap, HashSet, Ref from effect/*

Verify: `bun run check --filter @beep/tooling-utils`

### Step 3: Create DepSorter.ts (20 min)

File: `tooling/utils/src/repo/DepSorter.ts`

Implement:
- sortDependencies (topo for workspace, alpha for external)
- enforceVersionSpecifiers (workspace:^ for @beep/*, catalog: for external)
- mergeSortedDeps (combine back to Record)

Use topologicalSort from Graph.ts

Verify: `bun run check --filter @beep/tooling-utils`

### Step 4: Create Paths.ts (10 min)

File: `tooling/utils/src/repo/Paths.ts`

Implement:
- buildRootRelativePath(sourcePath, targetPath) → string
- calculateDepth(path) → number

Algorithm:
1. Count "/" in sourcePath to get depth
2. Prepend "../" × depth
3. Append targetPath

Verify: `bun run check --filter @beep/tooling-utils`

### Step 5: Update Exports (5 min)

File: `tooling/utils/src/repo/index.ts`

Add re-exports:
```typescript
export * from "./Graph.js";
export * from "./DepSorter.js";
export * from "./Paths.js";
```

### Step 6: Update topo-sort.ts (10 min)

File: `tooling/cli/src/commands/topo-sort.ts`

Replace inline implementations with imports from @beep/tooling-utils:
```typescript
import { topologicalSort, CyclicDependencyError } from "@beep/tooling-utils/repo/Graph";
```

Verify:
- `bun run check --filter @beep/repo-cli`
- `bun run repo-cli topo-sort` (functional test)

### Step 7: Add Tests (20 min)

Create: `tooling/utils/test/repo/Graph.test.ts`
Create: `tooling/utils/test/repo/DepSorter.test.ts`
Create: `tooling/utils/test/repo/Paths.test.ts`

Use @beep/testkit patterns:
```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
```

Verify: `bun run test --filter @beep/tooling-utils`

## Success Criteria

- [ ] `bun run check --filter @beep/tooling-utils` passes
- [ ] `bun run lint --filter @beep/tooling-utils` passes
- [ ] `bun run test --filter @beep/tooling-utils` passes
- [ ] `bun run repo-cli topo-sort` still works
- [ ] New utilities exported from @beep/tooling-utils/repo

## Patterns to Follow

### Effect Imports
```typescript
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Ref from "effect/Ref";
```

### Tagged Errors
```typescript
export class CyclicDependencyError extends S.TaggedError<CyclicDependencyError>()(
  "CyclicDependencyError",
  { packages: S.Array(S.String), cycles: S.Array(S.Array(S.String)) }
) {}
```

### Pure Functions (Paths.ts)
```typescript
// No Effect needed for pure path calculations
export const buildRootRelativePath = (source: string, target: string): string => {
  const depth = calculateDepth(source);
  return A.replicate("../", depth).join("") + target;
};
```

## Anti-Patterns to Avoid

- NEVER use native array.map(), use A.map()
- NEVER use native string.split(), use Str.split()
- NEVER use async/await, use Effect.gen
- NEVER use Node.js fs, use @effect/platform FileSystem

## Reference Files

| File | Purpose |
|------|---------|
| tooling/cli/src/commands/topo-sort.ts | Source for topologicalSort extraction |
| tooling/utils/src/repo/DependencyIndex.ts | HashMap structure patterns |
| tooling/utils/src/repo/Workspaces.ts | Effect service patterns |
| tooling/utils/AGENTS.md | Package conventions |

## Estimated Time: 1.5-2 hours

Report completion by updating:
- specs/tsconfig-sync-command/REFLECTION_LOG.md (add P0 entry)
- specs/tsconfig-sync-command/handoffs/HANDOFF_P1.md (mark P0 complete)
```

---

## Usage

1. Start a new Claude Code session
2. Copy the prompt above
3. Paste and execute
4. Verify all success criteria pass
5. Commit changes with message: `feat(tooling-utils): add graph, sorting, and path utilities for tsconfig-sync`
