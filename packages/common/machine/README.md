# @beep/machine

Type-safe, schema-first state machines for Effect.

This package provides a fluent machine builder (`Machine.make`), actor runtime (`Machine.spawn`), slot-based guard/effect injection (`Slot.Guards`, `Slot.Effects`), pure transition testing utilities, and optional persistence adapters.

## Purpose

`@beep/machine` is a shared runtime primitive for workflows that need:

- Explicit state transition graphs
- Typed event handling
- Scoped side effects
- Deterministic transition testing
- Optional durable actor restoration

## Key Exports

| Export | Description |
|--------|-------------|
| `Machine` | Namespace containing `make`, `spawn`, and transition helpers |
| `State` / `Event` | Schema-first variant constructors for state/event unions |
| `Slot` | Slot definition utilities for guards and effects |
| `simulate` / `createTestHarness` | Actor-free transition testing helpers |
| `assertPath` / `assertReaches` / `assertNeverReaches` | Assertions for expected machine paths |
| `createPersistentActor` / `restorePersistentActor` | Persistent actor runtime wrappers |
| `InMemoryPersistenceAdapter` | In-memory adapter for tests/dev |
| `consoleInspector` / `collectingInspector` | Runtime inspection instrumentation helpers |

## Architecture Fit

- Pure TypeScript runtime package under `packages/common/*`
- No domain coupling (knowledge/iam/documents logic stays outside)
- Effect-native execution model for transitions and side effects
- Storage-agnostic persistence via adapter interface

## Package Layout

```text
src/
├── index.ts                # public exports
├── schema.ts               # State/Event schema constructors
├── machine.ts              # fluent builder + BuiltMachine
├── facade.ts               # Machine namespace assembly
├── actor.ts                # actor runtime + spawn
├── slot.ts                 # guards/effects slot definitions
├── testing.ts              # simulate/test harness/assert helpers
├── inspection.ts           # inspection events and services
├── persistence/            # adapter contracts + persistent actor helpers
├── cluster/                # entity-oriented integration helpers
└── internal/               # transition and runtime internals
```

## Quick Start

```ts
import { Event, Machine, Slot, State } from "@beep/machine";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const OrderState = State({
  Pending: { orderId: S.String },
  Processing: { orderId: S.String },
  Completed: { orderId: S.String },
  Failed: { orderId: S.String, reason: S.String },
});

const OrderEvent = Event({
  Start: {},
  Complete: {},
  Fail: { reason: S.String },
});

const OrderEffects = Slot.Effects({
  notify: { orderId: S.String },
});

const orderMachine = Machine.make({
  state: OrderState,
  event: OrderEvent,
  effects: OrderEffects,
  initial: OrderState.Pending({ orderId: "order-1" }),
})
  .on(OrderState.Pending, OrderEvent.Start, ({ state }) =>
    OrderState.Processing.derive(state),
  )
  .on(OrderState.Processing, OrderEvent.Complete, ({ state }) =>
    OrderState.Completed.derive(state),
  )
  .on(OrderState.Processing, OrderEvent.Fail, ({ state, event }) =>
    OrderState.Failed.derive(state, { reason: event.reason }),
  )
  .spawn(OrderState.Processing, ({ effects, state }) =>
    effects.notify({ orderId: state.orderId }),
  )
  .final(OrderState.Completed)
  .final(OrderState.Failed)
  .build({
    notify: ({ orderId }) =>
      Effect.logInfo("Order entered processing").pipe(
        Effect.annotateLogs({ orderId }),
      ),
  });

const program = Effect.gen(function* () {
  const actor = yield* Machine.spawn(orderMachine);
  yield* actor.send(OrderEvent.Start);
  yield* actor.send(OrderEvent.Complete);
  const done = yield* actor.waitFor(OrderState.Completed);
  return done;
});
```

## Testing Example

```ts
import { assertPath } from "@beep/machine";

yield* assertPath(
  orderMachine,
  [OrderEvent.Start, OrderEvent.Complete],
  ["Pending", "Processing", "Completed"],
);
```

## Persistence

Use `.persist(...)` on a built machine, then run through persistent actor helpers:

```ts
import {
  createPersistentActor,
  makeInMemoryPersistenceAdapter,
  PersistenceAdapterTag,
  restorePersistentActor,
} from "@beep/machine";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";

const adapter = makeInMemoryPersistenceAdapter();

const persistent = orderMachine.persist({
  snapshotSchedule: Schedule.recurs(10),
  journalEvents: true,
  machineType: "order-workflow",
});

const actor = yield* createPersistentActor("order-actor-1", persistent).pipe(
  Effect.provideService(PersistenceAdapterTag, adapter),
);

const restored = yield* restorePersistentActor("order-actor-1", persistent).pipe(
  Effect.provideService(PersistenceAdapterTag, adapter),
);
```

## Scripts

Run from repo root:

- `bunx turbo run check --filter=@beep/machine`
- `bunx turbo run test --filter=@beep/machine`
- `bunx turbo run lint --filter=@beep/machine`
- `bunx turbo run lint:fix --filter=@beep/machine`

## Additional Docs

- `primer/index.md`
- `primer/basics.md`
- `primer/handlers.md`
- `primer/effects.md`
- `primer/testing.md`
- `primer/actors.md`
- `primer/persistence.md`
- `primer/gotchas.md`
- `AGENTS.md`
- `CLAUDE.md`
- `ai-context.md`
