# Phase 3 Handoff: Comprehensive Testing

**From**: P2 (Handler Refactoring)
**To**: P3 (Comprehensive Testing)
**Date**: 2026-01-22

---

## Executive Summary

P2 extracted handler into modular functions. P3 adds comprehensive tests for each module. Target: 80%+ coverage.

---

## Pre-requisites

- **P0 complete**: Next.js apps build successfully
- **P1 complete**: package.json sync working
- **P2 complete**: Modular functions extracted
- Handler < 300 LOC
- All existing tests passing

**Critical**: P3 must include a regression test for P0's Next.js transitive dependency fix.

---

## Test Structure

```
tooling/cli/test/commands/tsconfig-sync/
├── handler.test.ts          # Existing - schema validation
├── discover.test.ts         # NEW - workspace discovery
├── references.test.ts       # NEW - reference computation
├── package-sync.test.ts     # NEW - package.json sync
├── tsconfig-sync.test.ts    # NEW - tsconfig file sync
└── integration.test.ts      # NEW - full workflow
```

---

## Test Files to Create

### `nextjs-transitive.test.ts` (CRITICAL - P0 Regression Test)

```typescript
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import * as HashSet from "effect/HashSet";
import { processNextJsApps, computeAppTransitiveDeps } from "../../../src/commands/tsconfig-sync/app-sync";

const TestLayer = Layer.mergeAll(
  BunFileSystem.layer,
  FsUtilsLive
);

layer(TestLayer, { timeout: Duration.seconds(30) })("Next.js transitive deps", (it) => {
  it.effect("includes transitive deps in path aliases", () =>
    Effect.gen(function* () {
      // Mock: apps/web depends on @beep/documents-server
      // @beep/documents-server depends on @beep/documents-domain
      // Result: apps/web tsconfig should have BOTH path aliases

      const directDeps = HashSet.make("@beep/documents-server");
      const adjacencyList = HashMap.make(
        ["@beep/documents-server", HashSet.make("@beep/documents-domain")],
        ["@beep/documents-domain", HashSet.make("@beep/shared-domain")]
      );

      const transitiveDeps = yield* computeAppTransitiveDeps(directDeps, adjacencyList);

      // Should include ALL: direct + transitive
      strictEqual(HashSet.has(transitiveDeps, "@beep/documents-server"), true);
      strictEqual(HashSet.has(transitiveDeps, "@beep/documents-domain"), true);
      strictEqual(HashSet.has(transitiveDeps, "@beep/shared-domain"), true);
    })
  );

  it.effect("deep transitive chain (4+ levels) included", () =>
    Effect.gen(function* () {
      // A -> B -> C -> D -> E
      const directDeps = HashSet.make("A");
      const adjacencyList = HashMap.make(
        ["A", HashSet.make("B")],
        ["B", HashSet.make("C")],
        ["C", HashSet.make("D")],
        ["D", HashSet.make("E")],
        ["E", HashSet.empty()]
      );

      const transitiveDeps = yield* computeAppTransitiveDeps(directDeps, adjacencyList);

      // All 5 packages should be included
      strictEqual(HashSet.size(transitiveDeps), 5);
    })
  );
});
```

### Integration test: Next.js build verification

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { spawn } from "child_process";

effect("apps/web builds after tsconfig-sync", () =>
  Effect.gen(function* () {
    // Run sync first
    yield* Effect.tryPromise(() =>
      execAsync("bun run repo-cli tsconfig-sync --filter @beep/web")
    );

    // Then verify build succeeds
    const buildResult = yield* Effect.tryPromise(() =>
      execAsync("bun run build --filter @beep/web")
    );

    strictEqual(buildResult.exitCode, 0);
  }),
  { timeout: Duration.minutes(5) }  // Build can take a while
);
```

### `discover.test.ts`

```typescript
import { effect, strictEqual, deepStrictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";
import * as HashMap from "effect/HashMap";
import { discoverWorkspace, detectCycles } from "../../../src/commands/tsconfig-sync/discover";

effect("discoverWorkspace finds all @beep/* packages", () =>
  Effect.gen(function* () {
    const context = yield* discoverWorkspace;
    // Should find 60+ packages
    strictEqual(context.packages.length > 50, true);
  })
);

effect("discoverWorkspace builds correct adjacency list", () =>
  Effect.gen(function* () {
    const context = yield* discoverWorkspace;
    // @beep/schema should have @beep/utils as dependency
    const schemaDeps = HashMap.get(context.adjacencyList, "@beep/schema");
    // ... assertions
  })
);

effect("detectCycles returns empty for acyclic graph", () =>
  Effect.gen(function* () {
    const adjacencyList = HashMap.make(
      ["A", HashSet.make("B")],
      ["B", HashSet.make("C")],
      ["C", HashSet.empty()]
    );
    const cycles = yield* detectCycles(adjacencyList);
    deepStrictEqual(cycles, []);
  })
);

effect("detectCycles detects simple cycle", () =>
  Effect.gen(function* () {
    const adjacencyList = HashMap.make(
      ["A", HashSet.make("B")],
      ["B", HashSet.make("A")]  // Cycle!
    );
    const cycles = yield* detectCycles(adjacencyList);
    strictEqual(cycles.length > 0, true);
  })
);
```

### `references.test.ts`

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { computePackageReferences, normalizeReferencePaths, mergeReferences } from "../../../src/commands/tsconfig-sync/references";

effect("computePackageReferences returns root-relative paths", () =>
  Effect.gen(function* () {
    const refs = yield* computePackageReferences("@beep/schema", deps, closure, context);
    // All refs should start with ../../../
    refs.forEach(ref => {
      strictEqual(Str.startsWith("../../../")(ref), true);
    });
  })
);

effect("normalizeReferencePaths converts package-relative to root-relative", () =>
  Effect.gen(function* () {
    const existing = ["../types/tsconfig.build.json"];
    const normalized = normalizeReferencePaths(existing, "packages/common/schema", context);
    strictEqual(normalized[0], "../../../packages/common/types/tsconfig.build.json");
  })
);

effect("mergeReferences deduplicates", () =>
  Effect.gen(function* () {
    const computed = ["../../../packages/common/types/tsconfig.build.json"];
    const existing = ["../../../packages/common/types/tsconfig.build.json"];
    const merged = mergeReferences(computed, existing, { preserveManual: true });
    strictEqual(merged.length, 1);
  })
);
```

### `package-sync.test.ts`

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { syncPackageJson } from "../../../src/commands/tsconfig-sync/package-sync";

effect("syncPackageJson sorts workspace deps topologically", () =>
  Effect.gen(function* () {
    // Mock deps with known order
    const result = yield* syncPackageJson(
      "@beep/test",
      "/tmp/test",
      mockDeps,
      closure,
      adjacencyList,
      "dry-run",
      { verbose: false, noHoist: false }
    );
    // Verify order in result
  })
);

effect("syncPackageJson sorts external deps alphabetically", () =>
  Effect.gen(function* () {
    const mockDeps = { "zod": "1.0", "axios": "2.0", "effect": "3.0" };
    // Result should be: axios, effect, zod
  })
);

effect("syncPackageJson enforces version specifiers", () =>
  Effect.gen(function* () {
    const mockDeps = { "@beep/schema": "1.0.0", "effect": "^3.0" };
    // Result should have workspace:^ and catalog:
  })
);
```

### `integration.test.ts`

```typescript
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import { tsconfigSyncHandler } from "../../../src/commands/tsconfig-sync/handler";
import { TsconfigSyncInput } from "../../../src/commands/tsconfig-sync/schemas";

const TestLayer = Layer.mergeAll(
  BunFileSystem.layer,
  FsUtilsLive
);

layer(TestLayer, { timeout: Duration.seconds(60) })("tsconfig-sync integration", (it) => {
  it.effect("check mode passes on synced repo", () =>
    Effect.gen(function* () {
      const input = new TsconfigSyncInput({
        check: true,
        dryRun: false,
        filter: O.none(),
        noHoist: false,
        verbose: false,
        packagesOnly: false,
        appsOnly: false
      });
      // Should not throw DriftDetectedError
      yield* tsconfigSyncHandler(input);
    })
  );

  it.effect("dry-run mode reports changes without modifying files", () =>
    Effect.gen(function* () {
      const input = new TsconfigSyncInput({
        check: false,
        dryRun: true,
        filter: O.some("@beep/schema"),
        noHoist: false,
        verbose: true,
        packagesOnly: false,
        appsOnly: false
      });
      yield* tsconfigSyncHandler(input);
      // Verify no files changed
    })
  );
});
```

---

## Test Coverage Targets

| Module | Target | Priority |
|--------|--------|----------|
| **app-sync.ts (P0 fix)** | **100%** | **CRITICAL** |
| discover.ts | 90% | High |
| references.ts | 90% | High |
| package-sync.ts | 90% | High |
| tsconfig-sync.ts | 80% | Medium |
| handler.ts | 80% | Medium |
| integration | 70% | Medium |

**Note**: `app-sync.ts` contains the P0 transitive dependency fix. It MUST have 100% coverage to prevent regression of the critical Next.js build bug.

---

## Testing Patterns

Use `@beep/testkit` consistently:

```typescript
// Unit test pattern
effect("function does X", () =>
  Effect.gen(function* () {
    const result = yield* functionUnderTest(input);
    strictEqual(result, expected);
  })
);

// Integration test with Layer
layer(TestLayer)("suite", (it) => {
  it.effect("scenario", () =>
    Effect.gen(function* () {
      const service = yield* ServiceTag;
      yield* service.method();
    })
  );
});
```

---

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| **nextjs-transitive.test.ts created** | **CRITICAL: File exists with transitive dep tests** |
| discover.test.ts created | File exists with 5+ tests |
| references.test.ts created | File exists with 5+ tests |
| package-sync.test.ts created | File exists with 5+ tests |
| integration.test.ts created | File exists with 3+ tests |
| All tests pass | `bun run test --filter @beep/repo-cli` |
| Coverage > 80% | Manual inspection of test cases |
| **Next.js builds pass after sync** | `bun run build --filter @beep/web && bun run build --filter @beep/todox` |
