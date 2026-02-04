---
path: tooling/testkit
summary: Effect-first test harness - test runners, Layer composition, assertions for Effect data types
tags: [testing, effect, bun, testkit, tooling, layers]
---

# @beep/testkit

Bun-first Effect testing harness that wraps `bun:test` with Effect-aware runners, enabling Layer composition, scoped resource management, and assertions for Effect data types (Option, Either, Exit).

## Architecture

```
|------------------|     |-------------------|
|    bun:test      | --> |  internal/runner  |
|------------------|     |-------------------|
                                 |
         |-----------------------|-----------------------|
         v                       v                       v
|------------------|   |------------------|   |------------------|
|  effect/scoped   |   |      layer       |   |    assertions    |
|------------------|   |------------------|   |------------------|
         |                       |
         v                       v
|------------------|   |------------------|
|  TestServices    |   |  MemoMap/Runtime |
|------------------|   |------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `index.ts` | Re-exports Bun primitives + Effect test runners |
| `assert.ts` | Effect-aware assertions (Option, Either, Exit) |
| `internal/internal.ts` | Runtime plumbing: makeTester, layer, flakyTest |
| `rls/` | RLS tenant isolation test helpers |

## Test Runners

| Runner | Requirements | Use Case |
|--------|--------------|----------|
| `effect()` | TestServices | Standard tests with TestClock/TestRandom |
| `scoped()` | TestServices + Scope | Tests with resource cleanup |
| `live()` | none | Pure logic, real Clock/Random |
| `scopedLive()` | Scope | Live services with cleanup |
| `layer()` | Custom Layer | Shared resources across tests |

## Usage Patterns

### Basic Effect Test
```typescript
import * as Effect from "effect/Effect";
import { effect, strictEqual } from "@beep/testkit";

effect("computes result", () =>
  Effect.gen(function* () {
    const result = yield* computeValue();
    strictEqual(result, 42);
  })
);
```

### Shared Layer Tests
```typescript
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import { layer } from "@beep/testkit";

layer(DbLayer, { timeout: Duration.seconds(60) })("db suite", (it) => {
  it.effect("reads entities", () =>
    Effect.gen(function* () {
      const repo = yield* Repo;
      const result = yield* repo.findAll();
    })
  );
});
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Wrap bun:test | Maintain Bun tooling compatibility while adding Effect semantics |
| MemoMap per suite | Prevent resource churn with shared expensive Layers |
| TestContext default | Deterministic tests with TestClock/TestRandom |
| Namespace imports | Comply with repo guardrails, no named imports |

## Dependencies

**Internal**: none (foundational package)
**External**: effect, @effect/platform, @effect/sql, bun:test, @testcontainers/postgresql

## Related

- **AGENTS.md** - Detailed contributor guidance with recipes
- **.claude/rules/effect-patterns.md** - Testing patterns reference
