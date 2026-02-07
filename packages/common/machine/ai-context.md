---
path: packages/common/machine
summary: Type-safe Effect state machine runtime with schema-first definitions, actors, testing, and persistence
tags: [machine, state-machine, effect, actor, persistence, testing]
---

# @beep/machine

Schema-first state machine toolkit for Effect applications. Defines typed states/events via `State(...)` and `Event(...)`, composes transitions with `Machine.make(...)`, and executes as actors with optional persistence.

## Architecture

```
|-------------------|     |-------------------|     |-------------------|
| schema.ts         | --> | machine.ts        | --> | actor.ts          |
| State/Event defs  |     | builder API       |     | runtime execution |
|-------------------|     |-------------------|     |-------------------|
         |                          |                          |
         v                          v                          v
|-------------------|     |-------------------|     |-------------------|
| slot.ts           |     | testing.ts        |     | persistence/*     |
| guards/effects    |     | simulate/assert   |     | snapshots/journal |
|-------------------|     |-------------------|     |-------------------|
                 \             |              /
                  \            |             /
                   v           v            v
                   |-------------------------|
                   | src/index.ts public API |
                   |-------------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `schema.ts` | `State(...)` / `Event(...)` schema constructors and tag helpers |
| `machine.ts` | Fluent builder (`on`, `onAny`, `reenter`, `spawn`, `task`, `final`, `build`) |
| `actor.ts` | Actor runtime (`Machine.spawn`, subscriptions, `send`, `waitFor`) |
| `slot.ts` | Guard/effect slot definitions and typed provisioning |
| `testing.ts` | Pure transition simulation and path assertions without actors |
| `persistence/*` | Persistent machine wrappers, adapters, restore/snapshot primitives |
| `cluster/*` | Entity-style wiring helpers for clustered orchestration |
| `inspection.ts` | Inspection event stream and inspector constructors |

## Usage Patterns

### Schema-first machine

```typescript
import { Event, Machine, State } from "@beep/machine";

const S = State({ Idle: {}, Running: {} });
const E = Event({ Start: {}, Stop: {} });

const machine = Machine.make({
  state: S,
  event: E,
  initial: S.Idle,
})
  .on(S.Idle, E.Start, () => S.Running)
  .on(S.Running, E.Stop, () => S.Idle)
  .build();
```

### Pure transition tests

```typescript
import { assertPath } from "@beep/machine";

yield* assertPath(machine, [E.Start, E.Stop], ["Idle", "Running", "Idle"]);
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| States/events are schemas | Single source of truth for runtime decoding and static types |
| Slot provisioning at `.build()` | Forces explicit guard/effect dependencies before runtime |
| `BuiltMachine` terminal type | Prevents spawning unfinalized machines |
| Simulation skips actor lifecycle effects | Deterministic tests for transition logic |
| Persistence is adapter-based | Keeps package storage-agnostic and testable |

## Dependencies

**Internal**: `@beep/identity`, `@beep/invariant`, `@beep/schema`, `@beep/utils`

**External**: `effect`, `@effect/platform`

## Related

- **AGENTS.md** - Contributor rules and package-specific guardrails
- **CLAUDE.md** - Claude workflow instructions for this package
- **primer/** - Long-form concepts and API primers
