# AGENTS.md — `@beep/machine`

## Purpose & Fit
- Provides schema-first, type-safe state machines for Effect with actor runtime, test harnesses, and optional persistence.
- Designed as a reusable runtime primitive for slice workflows (for example knowledge batch orchestration), without embedding domain semantics.
- Package must remain runtime-pure and storage-agnostic: no hard dependency on app services, repositories, or slice-specific modules.

## Surface Map (`src/`)
- `schema.ts` — `State(...)` / `Event(...)` constructors, tagged variant schema helpers, and derive utilities.
- `machine.ts` — core fluent builder and terminal `BuiltMachine` type.
- `facade.ts` — assembles public `Machine` namespace (`make`, `spawn`, transition lookup).
- `actor.ts` — actor execution model (`send`, subscriptions, waiting, finalization).
- `slot.ts` — guard/effect slot declarations and type-safe handler contracts.
- `testing.ts` — `simulate`, `createTestHarness`, `assertPath`, `assertReaches`, `assertNeverReaches`.
- `persistence/*` — persistence adapter contracts, in-memory adapter, persistent actor restore/create.
- `cluster/*` — entity-oriented integration helpers for clustered usage.
- `inspection.ts` and `internal/inspection.ts` — transition/effect lifecycle inspection events and inspector utilities.

## Usage Snapshots
- `packages/knowledge/domain/src/value-objects/BatchMachine.schema.ts` defines batch workflow state/event/guard schemas via `State`, `Event`, and `Slot.Guards`.
- `packages/knowledge/server/src/Workflow/BatchMachine.ts` builds a production machine using `.on`, `.reenter`, `.onAny`, `.final`, and slot provisioning through `.build(...)`.
- `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts` uses `createPersistentActor` with `PersistenceAdapterTag` for durable orchestration.
- `packages/knowledge/server/test/Workflow/BatchMachine.test.ts` exercises transition behavior with `simulate` and assertion helpers.

## Authoring Guardrails
- ALWAYS keep state/event schemas as the canonical source. Do not duplicate ad-hoc discriminated unions outside `State(...)` / `Event(...)`.
- ALWAYS use namespaced Effect imports (`import * as Effect from "effect/Effect"`, etc.). Avoid native utility loops where Effect modules already provide an equivalent.
- NEVER introduce slice imports (`@beep/knowledge-*`, `@beep/iam-*`, etc.) in this package.
- Treat `.build(...)` as an explicit dependency boundary: new guard/effect slots must be provision-validated and tested.
- Preserve `BuiltMachine` semantics. Runtime spawning APIs should continue to enforce finalized machines.
- Keep persistence abstractions adapter-driven and deterministic in tests. Avoid time- or IO-coupled logic in core transition code.
- If adding errors, keep them tagged/structured and include stable metadata suitable for effectful error handling.

## Quick Recipes
```ts
import { Event, Machine, Slot, State } from "@beep/machine";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const CounterState = State({
  Idle: { value: S.Number },
  Done: { value: S.Number },
});
const CounterEvent = Event({ Inc: {}, Finish: {} });
const CounterEffects = Slot.Effects({ log: { value: S.Number } });

const counter = Machine.make({
  state: CounterState,
  event: CounterEvent,
  effects: CounterEffects,
  initial: CounterState.Idle({ value: 0 }),
})
  .reenter(CounterState.Idle, CounterEvent.Inc, ({ state, effects }) =>
    Effect.gen(function* () {
      const next = state.value + 1;
      yield* effects.log({ value: next });
      return CounterState.Idle({ value: next });
    }),
  )
  .on(CounterState.Idle, CounterEvent.Finish, ({ state }) => CounterState.Done.derive(state))
  .final(CounterState.Done)
  .build({
    log: ({ value }) => Effect.logDebug("counter").pipe(Effect.annotateLogs({ value })),
  });
```

```ts
import { assertPath } from "@beep/machine";

yield* assertPath(counter, [CounterEvent.Inc, CounterEvent.Finish], ["Idle", "Idle", "Done"]);
```

## Verifications
- `bunx turbo run check --filter=@beep/machine` — Type-check package and tests.
- `bunx turbo run test --filter=@beep/machine` — Bun test suite, including pattern/integration scenarios.
- `bunx turbo run lint --filter=@beep/machine` / `bunx turbo run lint:fix --filter=@beep/machine` — Biome lint and auto-fixes.

## Contributor Checklist
- [ ] Public exports remain intentional through `src/index.ts`.
- [ ] New transitions, reentry behavior, and final states are covered by tests.
- [ ] Slot contracts and `.build(...)` provisioning are validated with failure-path tests.
- [ ] Persistence changes include snapshot/journal compatibility checks.
- [ ] README/primer pages are updated if the user-facing API changes.
