---
title: PhaseProfiler.ts
nav_order: 11
parent: "@beep/observability"
---

## PhaseProfiler.ts overview

Phase profiling for named application lifecycle phases (startup, migrations, etc.).

Wraps an effect with span annotations, structured logs, and optional metric
recording to produce a `PhaseProfile` summary upon completion.

**Example**

```ts
```typescript
import { Effect, Metric } from "effect"
import { profilePhase } from "@beep/observability"

const migrate = Effect.log("running migrations")

const profiled = profilePhase(
  migrate,
  { phase: "migrations" }
)

console.log(Effect.runPromise(profiled))
```
```

Since v0.0.0

---
## Exports Grouped by Category
  - [PhaseOutcome (type alias)](#phaseoutcome-type-alias)
  - [PhaseProfile (class)](#phaseprofile-class)
- [observability](#observability)
  - [profilePhase](#profilephase)
---

# models

## PhaseOutcome

Terminal outcomes for profiled phases: `"completed"`, `"failed"`, or `"interrupted"`.

**Example**

```ts
```typescript
import { PhaseOutcome } from "@beep/observability"

console.log(PhaseOutcome)
```
```

**Signature**

```ts
declare const PhaseOutcome: AnnotatedSchema<LiteralKit<readonly ["completed", "failed", "interrupted"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/PhaseProfiler.ts#L63)

Since v0.0.0

## PhaseOutcome (type alias)

Runtime type for `PhaseOutcome`.

**Example**

```ts
```typescript
import type { PhaseOutcome } from "@beep/observability"

const outcome: PhaseOutcome = "completed"
console.log(outcome)
```
```

**Signature**

```ts
type PhaseOutcome = typeof PhaseOutcome.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/PhaseProfiler.ts#L83)

Since v0.0.0

## PhaseProfile (class)

Deterministic summary of one profiled phase with outcome, duration, and attributes.

**Example**

```ts
```typescript
import { NonNegativeInt } from "@beep/schema"
import * as S from "effect/Schema"
import { PhaseProfile } from "@beep/observability"

const durationMs = S.decodeUnknownSync(NonNegativeInt)(42)
const profile = PhaseProfile.make({
  attributes: {},
  durationMs,
  outcome: "completed",
  phase: "startup"
})

console.log(profile.phase) // "startup"
console.log(profile.outcome) // "completed"
```
```

**Signature**

```ts
declare class PhaseProfile
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/PhaseProfiler.ts#L109)

Since v0.0.0

# observability

## profilePhase

Profiles an Effect phase and records its duration and outcome.

**Example**

```ts
```typescript
import { Effect } from "effect"
import { profilePhase } from "@beep/observability"

const program = profilePhase(Effect.succeed("ok"), { phase: "startup" })
console.log(Effect.runPromise(program))
```
```

**Signature**

```ts
declare const profilePhase: { <A, E, R>(effect: Effect.Effect<A, E, R>, options: ProfilePhaseOptions): Effect.Effect<A, E, R>; <A, E, R>(options: ProfilePhaseOptions, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>; (options: ProfilePhaseOptions): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/PhaseProfiler.ts#L278)

Since v0.0.0