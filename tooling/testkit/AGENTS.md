# AGENTS — `@beep/testkit`

## Purpose & Fit
- Wraps Bun's `bun:test` runner with Effect-first helpers so suites can compose Layers, Scopes, and retries without leaving the `Effect` algebra.
- Supplies assertion shims (`assert*`, `strictEqual`, `throwsAsync`, etc.) that align with Effect data types (`Option`, `Either`, `Exit`) used across `@beep/*` packages.
- Provides a lightweight alternative to `@effect/vitest` while staying compatible with Bun tooling and the repo's strict namespace-import guardrails.

## Surface Map
- `tooling/testkit/src/index.ts` re-exports:
  - Bun primitives (`describe`, `it`, `expect`, …).
  - Assertion helpers from `assert.ts` (prefer these over hand-rolled assertions for Option/Either/Exit).
  - Test orchestration helpers: `effect`, `scoped`, `scopedLive`, `live`, `layer`, `flakyTest`, `prop`, `makeMethods`, `describeWrapped`, `addEqualityTesters`.
- `tooling/testkit/src/assert.ts` implements domain-friendly assertions; new assertions should rely on Effect equality (`Equal.equals`) and maintain compatibility with Bun snapshots.
- `tooling/testkit/src/internal/internal.ts` houses the runtime plumbing:
  - `makeTester` wraps Bun's `it` with Effect-runner semantics and skip/only helpers.
  - `layer` builds memoised runtimes (`Layer.toRuntimeWithMemoMap`) while optionally injecting `TestContext`.
  - `flakyTest` uses `Effect.retry` + `Schedule` combinators to stabilize intermittently failing specs.
  - `makeMethods` is the template for callers constructing bespoke `it` facades.

## Usage Snapshots
- `packages/iam/sdk/test/auth-wrapper/call-auth.test.ts:3` — exercises `effect` with metrics assertions, illustrating how to stay entirely inside `Effect.gen`.
- `packages/_internal/db-admin/test/coreDb.test.ts:6` — wraps Testcontainers setup with `layer(PgContainer.Live)(...)`, showing memo-mapped runtime sharing and DB teardown expectations.
- `packages/common/errors/test/utils/accumulate.test.ts:3` — uses `scoped` to ensure spies are restored via `Effect.addFinalizer`, demonstrating why scoped tests must run in `Scope.Scope`.
- `tooling/repo-scripts/test/enforce-js-import-suffix.test.ts:2` — combines `layer(..., { excludeTestServices: true })` with repository tooling Layers, highlighting when to bypass the default test environment to avoid `TestContext` interference.

## Tooling & Docs Shortcuts
- Search consumers: `jetbrains__search_in_files_by_text` ⇒ `{"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","searchText":"\"@beep/testkit\"","maxUsageCount":200}`.
- Inspect source: `jetbrains__get_file_text_by_path` ⇒ `{"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"tooling/testkit/src/internal/internal.ts","maxLinesCount":400}`.
- Effect Layer memoization reference: `effect_docs__get_effect_doc` ⇒ `{"documentId":7105}` (Layer.toRuntimeWithMemoMap).
- Effect MemoMap creation: `effect_docs__get_effect_doc` ⇒ `{"documentId":7118}` (Layer.makeMemoMap).
- Retry semantics: `effect_docs__get_effect_doc` ⇒ `{"documentId":5867}` (Effect.retry) and `{"documentId":8600}` (Schedule.recurs).
- Cached runtimes: `effect_docs__get_effect_doc` ⇒ `{"documentId":5804}` (Effect.cached).
- Test environment baseline: `effect_docs__get_effect_doc` ⇒ `{"documentId":10356}` (TestContext.TestContext).
- Contextual Effect testing patterns: `context7__get-library-docs` ⇒ `{"context7CompatibleLibraryID":"/effect-ts/effect","tokens":2000,"topic":"testing"}`.

## Authoring Guardrails
- Maintain namespace imports (`import * as Effect from "effect/Effect"`, `import * as F from "effect/Function"`) in every snippet and new export; do not introduce named imports like `pipe`.
- Treat `Effect`, `Layer`, `Schedule`, and `Duration` helpers as the primary tools; avoid native `Promise`, `setTimeout`, or Array/String helpers in new code (use `Effect.sleep`, `A.map`, `Str.replace`, etc.).
- When extending assertions, ensure they unwrap data via Effect primitives (`Option.some`, `Either.right`) and reflect Bun's diff output by delegating to `expect`.
- Memo maps: call `Layer.makeMemoMap` per suite when wiring `layer` and pass explicit `memoMap` when nesting to prevent resource churn.
- `layer` defaults to merging `TestContext`; set `excludeTestServices: true` when supplying a Layer that already exports testing services or when interacting with platform layers (FileSystem, Path) that expect live implementations.
- `flakyTest` catches defects; prefer fixing the root cause. Only use it with a finite timeout, and compose schedules via `Schedule.compose`/`Schedule.elapsed` rather than ad-hoc timers.
- `prop` is currently a stubbed hook; document limitations when relying on property-based testing and avoid implying FastCheck support until wired.
- Always ensure nested testers (`it.effect`, `it.scoped`, etc.) close scopes. Prefer `scoped` when allocating mutable resources (spies, layers, temp directories).

## Quick Recipes
```typescript
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import * as Layer from "effect/Layer";
import * as Schedule from "effect/Schedule";
import * as F from "effect/Function";
import * as Str from "effect/String";
import { effect, flakyTest, layer } from "@beep/testkit";

const RemoteCall = Effect.tryPromise({
  try: () => client.fetchSummary(), // client: domain-specific HTTP adapter
  catch: (unknownCause) => new Error(String(unknownCause)),
});

// MyDb and Metrics represent slice-specific Layers bundled elsewhere
layer(Layer.mergeAll(MyDb.Live, Metrics.Test), { timeout: Duration.seconds(60) })(
  "db integration",
  (it) => {
    it.effect("reads entities", () =>
      Effect.gen(function* () {
        const repo = yield* MyDb.repo;
        const entity = yield* repo.fetch("entity-123");
        yield* Effect.log(F.pipe(entity.name, Str.concat(" retrieved")));
      })
    );
  }
);

effect("stabilizes transient API", () =>
  flakyTest(
    Effect.retry(
      RemoteCall,
      F.pipe(Schedule.recurs(5), Schedule.compose(Schedule.elapsed))
    ),
    Duration.seconds(10)
  )
);
```

```typescript
import * as Effect from "effect/Effect";
import { scoped } from "@beep/testkit";

scoped("restores spy via finalizer", () =>
  Effect.gen(function* () {
    const spy = createSpy(); // test framework spy with .restore()/.assertCalled()
    yield* Effect.addFinalizer(() => Effect.sync(() => spy.restore()));
    spy.run();
    yield* Effect.sync(() => spy.assertCalled());
  })
);
```

```typescript
import * as Effect from "effect/Effect";
import { describeWrapped } from "@beep/testkit";

describeWrapped("custom harness", (it) => {
  it.effect("runs with bundled helpers", () => Effect.succeed(true));
  it.scoped("manages resources", () =>
    Effect.acquireUseRelease(
      Effect.sync(() => makeResource()), // placeholder for domain resource constructor
      (resource) => Effect.sync(() => resource.use()),
      (resource) => Effect.sync(() => resource.close())
    )
  );
});
```

## Verifications
- `bun run lint` (Biome) — ensures new guides stay formatted and no lint rules regress.
- `bun run test tooling/testkit` — validate local assertions if you extend runtime helpers.
- `bun test tooling/testkit/test/Dummy.test.ts` — smoke-check Bun wiring after modifying runners.
- For cross-package changes, re-run the nearest consumer suite (e.g. `bun test packages/iam/sdk/test`) to confirm updated helpers integrate cleanly.

## Contributor Checklist
- [ ] Update `tooling/testkit/AGENTS_MD_PLAN.md` or archive it once changes land.
- [ ] Capture at least one fresh usage snapshot when adding new helpers.
- [ ] Verify Layer-based helpers reset memo maps or document required teardown.
- [ ] Note limitations of `prop` until FastCheck support is restored.
- [ ] Run `bun run lint` and affected `bun test` suites; report outstanding failures in PR threads.
- [ ] Cross-link this guide from the root `AGENTS.md` entry (see `Package Agent Guides` section).
