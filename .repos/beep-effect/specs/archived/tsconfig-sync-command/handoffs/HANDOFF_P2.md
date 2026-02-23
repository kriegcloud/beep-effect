# Phase 2 Handoff: tsconfig-sync Tests & File Writing

> Context document for implementing Phase 2 - Tests and File Writing Implementation

**STATUS**: Ready to Start

---

## Prerequisites

### Phase 1 ✅ COMPLETE

Phase 1 implemented the command structure and orchestration:

| Component | Status | Notes |
|-----------|--------|-------|
| Command definition (`index.ts`) | ✅ | 5 options, registered in CLI |
| Handler orchestration (`handler.ts`) | ✅ | Uses P0b utilities |
| Input schemas (`schemas.ts`) | ✅ | `TsconfigSyncInput`, `getSyncMode` |
| Error classes (`errors.ts`) | ✅ | `DriftDetectedError`, `TsconfigSyncError` |

**Current Limitations** (to be addressed in Phase 2):
- Handler computes expected state but does NOT write changes
- No tests exist

---

## Phase 2 Objectives

### 2.1 File Writing Implementation

Add actual file writing to the handler:

1. **tsconfig.build.json updates** - Write computed references using `jsonc-parser`
2. **package.json updates** - Write sorted, hoisted dependencies
3. **Preserve comments/formatting** - Use `jsonc-parser` for JSON with comments

### 2.2 Test Implementation

Add Effect-based tests using `@beep/testkit`:

1. **Unit tests** - Test individual utilities and helpers
2. **Integration tests** - Test full sync workflow
3. **Edge case tests** - Circular deps, missing files, filter mode

---

## Work Items

| # | Item | Priority | Est. LOC | Depends On |
|---|------|----------|----------|------------|
| 1 | Add `TsconfigWriter` utility | P0 | ~60 | - |
| 2 | Add `PackageJsonWriter` utility | P0 | ~50 | - |
| 3 | Update handler to use writers | P0 | ~40 | 1, 2 |
| 4 | Unit tests for utilities | P1 | ~100 | 1, 2 |
| 5 | Integration tests | P1 | ~150 | 3 |
| **Total** | | | **~400** | |

---

## Implementation Patterns

### TsconfigWriter Utility

Reference: `tooling/cli/src/commands/create-slice/utils/config-updater.ts`

```typescript
// tooling/cli/src/commands/tsconfig-sync/utils/tsconfig-writer.ts
import { FileSystem } from "@effect/platform";
import * as Effect from "effect/Effect";
import * as jsonc from "jsonc-parser";

export interface TsconfigReference {
  readonly path: string;
}

export interface TsconfigWriterInput {
  readonly filePath: string;
  readonly references: ReadonlyArray<TsconfigReference>;
}

/**
 * Write tsconfig references preserving comments and formatting.
 */
export const writeTsconfigReferences = (
  input: TsconfigWriterInput
): Effect.Effect<void, TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    // Read existing file
    const content = yield* fs.readFileString(input.filePath);

    // Parse with jsonc-parser to preserve comments
    const edits = jsonc.modify(content, ["references"], input.references, {
      formattingOptions: { tabSize: 2, insertSpaces: true },
    });

    // Apply edits
    const newContent = jsonc.applyEdits(content, edits);

    // Write back
    yield* fs.writeFileString(input.filePath, newContent);
  });
```

### PackageJsonWriter Utility

```typescript
// tooling/cli/src/commands/tsconfig-sync/utils/package-json-writer.ts
import { FileSystem } from "@effect/platform";
import * as Effect from "effect/Effect";

export interface PackageJsonWriterInput {
  readonly filePath: string;
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly peerDependencies?: Record<string, string>;
}

/**
 * Write sorted dependencies to package.json.
 */
export const writePackageJsonDeps = (
  input: PackageJsonWriterInput
): Effect.Effect<void, TsconfigSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    // Read existing file
    const content = yield* fs.readFileString(input.filePath);
    const pkg = JSON.parse(content);

    // Update dependency sections (only if provided)
    if (input.dependencies) pkg.dependencies = input.dependencies;
    if (input.devDependencies) pkg.devDependencies = input.devDependencies;
    if (input.peerDependencies) pkg.peerDependencies = input.peerDependencies;

    // Write back with 2-space indent
    yield* fs.writeFileString(input.filePath, JSON.stringify(pkg, null, 2) + "\n");
  });
```

### Test Pattern

Reference: `tooling/testkit/AGENTS.md`

```typescript
// tooling/cli/test/commands/tsconfig-sync/handler.test.ts
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import * as Layer from "effect/Layer";
import { BunFileSystem } from "@effect/platform-bun";

import { tsconfigSyncHandler } from "../../../src/commands/tsconfig-sync/handler.js";
import { TsconfigSyncInput } from "../../../src/commands/tsconfig-sync/schemas.js";

// Test layer with real filesystem (for integration tests)
const TestLayer = Layer.mergeAll(
  BunFileSystem.layer,
  // Add other required layers
);

layer(TestLayer, { timeout: Duration.seconds(30) })("tsconfig-sync handler", (it) => {
  it.effect("detects circular dependencies", () =>
    Effect.gen(function* () {
      const input = new TsconfigSyncInput({
        check: true,
        dryRun: false,
        filter: undefined,
        noHoist: false,
        verbose: false,
      });

      // Test with mock data or actual repo
      const result = yield* tsconfigSyncHandler(input).pipe(
        Effect.either
      );

      // Assert on result
    })
  );

  it.effect("computes transitive dependencies correctly", () =>
    Effect.gen(function* () {
      // Test transitive closure computation
    })
  );

  it.effect("filters to specific package", () =>
    Effect.gen(function* () {
      const input = new TsconfigSyncInput({
        check: false,
        dryRun: true,
        filter: "@beep/schema",
        noHoist: false,
        verbose: false,
      });

      // Test filtering
    })
  );
});
```

---

## Handler Updates

Update `handler.ts` to actually write files in sync mode:

```typescript
// In tsconfigSyncHandler, after computing expected state:

if (mode === "sync") {
  // Write tsconfig references
  yield* Effect.forEach(
    packagesToUpdate,
    (pkg) => writeTsconfigReferences({
      filePath: pkg.tsconfigPath,
      references: pkg.expectedRefs,
    }),
    { concurrency: 10 }
  );

  // Write package.json dependencies (if hoisting enabled)
  if (!input.noHoist) {
    yield* Effect.forEach(
      packagesToUpdate,
      (pkg) => writePackageJsonDeps({
        filePath: pkg.packageJsonPath,
        dependencies: pkg.sortedDeps.dependencies,
        devDependencies: pkg.sortedDeps.devDependencies,
        peerDependencies: pkg.sortedDeps.peerDependencies,
      }),
      { concurrency: 10 }
    );
  }
}
```

---

## Test Coverage Requirements

### Unit Tests

| Test | Description |
|------|-------------|
| `findBuildConfig` | Extracts tsconfig.build.json from path array |
| `buildAdjacencyList` | Correctly builds HashMap from dependency index |
| `getSyncMode` | Returns correct mode from input flags |

### Integration Tests

| Test | Description |
|------|-------------|
| `--check` detects drift | Returns DriftDetectedError when out of sync |
| `--check` passes when in sync | Returns success when already synced |
| `--dry-run` reports changes | Shows what would be changed |
| `--filter` scopes correctly | Only processes specified package |
| `--no-hoist` skips transitive | No transitive deps added |
| `--verbose` shows details | Per-package output visible |
| Cycle detection | Reports circular dependencies |

### Edge Case Tests

| Test | Description |
|------|-------------|
| Empty workspace | Handles no packages gracefully |
| Missing tsconfig | Reports error for missing files |
| Self-reference | Skips package depending on itself |
| Deep transitive chain | A→B→C→D computes correctly |

---

## Verification Steps

After each work item:

```bash
# Type check
bun run check --filter @beep/repo-cli

# Lint
bun run lint --filter @beep/repo-cli

# Test
bun run test --filter @beep/repo-cli

# Manual verification
bun run repo-cli tsconfig-sync --dry-run
bun run repo-cli tsconfig-sync --check
```

---

## Success Criteria

### Phase 2 Success

- [ ] `bun run repo-cli tsconfig-sync` writes changes to tsconfig files
- [ ] `bun run repo-cli tsconfig-sync` updates package.json dependencies
- [ ] `bun run test --filter @beep/repo-cli` passes (new tests)
- [ ] `--check` mode correctly detects drift
- [ ] `--dry-run` mode shows accurate preview
- [ ] Comments in tsconfig files are preserved
- [ ] Type check passes: `bun run check --filter @beep/repo-cli`

---

## Reference Files

### Phase 1 Files (to modify)

| File | Changes Needed |
|------|----------------|
| `handler.ts` | Add file writing in sync mode |

### New Files to Create

| File | Purpose |
|------|---------|
| `utils/tsconfig-writer.ts` | Write tsconfig with jsonc-parser |
| `utils/package-json-writer.ts` | Write package.json deps |
| `test/commands/tsconfig-sync/handler.test.ts` | Integration tests |
| `test/commands/tsconfig-sync/utils.test.ts` | Unit tests |

### Existing Patterns

| File | Pattern |
|------|---------|
| `create-slice/utils/config-updater.ts` | jsonc-parser usage |
| `@beep/testkit/AGENTS.md` | Test patterns |
| `tooling/utils/test/` | Test structure |

---

## Dependencies

### Runtime

- `jsonc-parser` - Already in CLI dependencies
- `@effect/platform` - FileSystem service
- `@beep/tooling-utils` - P0b utilities

### Test

- `@beep/testkit` - Effect test utilities
- `bun:test` - Test runner (via testkit)

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [HANDOFF_P1.md](./HANDOFF_P1.md) | Phase 1 completion details |
| [P2_ORCHESTRATOR_PROMPT.md](./P2_ORCHESTRATOR_PROMPT.md) | Copy-paste prompt for P2 |
| [README.md](../README.md) | Spec overview |
| [EXISTING_UTILITIES.md](../EXISTING_UTILITIES.md) | Utility analysis |
