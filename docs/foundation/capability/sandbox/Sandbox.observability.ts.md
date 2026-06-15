---
title: Sandbox.observability.ts
nav_order: 19
parent: "@beep/sandbox"
---

## Sandbox.observability.ts overview

Observability helpers for sandbox workflows.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [SandboxPhaseAttributes (type alias)](#sandboxphaseattributes-type-alias)
- [schemas](#schemas)
  - [SandboxPhaseAttributes](#sandboxphaseattributes)
- [utilities](#utilities)
  - [profileSandboxPhase](#profilesandboxphase)
  - [redactSensitiveText](#redactsensitivetext)
---

# models

## SandboxPhaseAttributes (type alias)

Runtime type for `SandboxPhaseAttributes`.

**Signature**

```ts
type SandboxPhaseAttributes = typeof SandboxPhaseAttributes.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.observability.ts#L157)

Since v0.0.0

# schemas

## SandboxPhaseAttributes

Schema for safe observability phase attributes.

**Example**

```ts
import { SandboxPhaseAttributes } from "@beep/sandbox/Sandbox.observability"

console.log(SandboxPhaseAttributes)
```

**Signature**

```ts
declare const SandboxPhaseAttributes: AnnotatedSchema<S.$Record<S.String, S.String>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.observability.ts#L145)

Since v0.0.0

# utilities

## profileSandboxPhase

Profile a named sandbox phase with spans, logs, and phase metrics.

**Example**

```ts
import { Effect } from "effect"
import { profileSandboxPhase } from "@beep/sandbox"

const program = Effect.succeed("ok").pipe(
  profileSandboxPhase({ phase: "sandbox.example" })
)

console.log(program)
```

**Signature**

```ts
declare const profileSandboxPhase: { <A, E, R>(effect: Effect.Effect<A, E, R>, options: SandboxPhaseOptions): Effect.Effect<A, E, R>; <A, E, R>(options: SandboxPhaseOptions, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>; (options: SandboxPhaseOptions): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.observability.ts#L86)

Since v0.0.0

## redactSensitiveText

Redact secret-shaped values from text before it is displayed or logged.

**Example**

```ts
import { redactSensitiveText } from "@beep/sandbox"

const safe = redactSensitiveText("OPENAI_API_KEY=sk-test-secret")

console.log(safe)
```

**Signature**

```ts
declare const redactSensitiveText: (text: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.observability.ts#L57)

Since v0.0.0