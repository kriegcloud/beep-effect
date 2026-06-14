---
title: RecoveryMessage.ts
nav_order: 14
parent: "@beep/sandbox"
---

## RecoveryMessage.ts overview

Sync-out recovery message helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [buildRecoveryMessage](#buildrecoverymessage)
- [models](#models)
  - [FailedStep](#failedstep)
  - [FailedStep (type alias)](#failedstep-type-alias)
  - [RecoveryInput (class)](#recoveryinput-class)
---

# constructors

## buildRecoveryMessage

Build copy-pastable recovery commands for a failed sync-out.

**Example**

```ts
import { buildRecoveryMessage, RecoveryInput } from "@beep/sandbox"

const message = buildRecoveryMessage(RecoveryInput.make({
  failedStep: "commits",
  hasCommits: true,
  hasDiff: true,
  hasUntracked: false,
  patchDir: ".sandcastle/patches/20260324-153000",
}))

console.log(message)
```

**Signature**

```ts
declare const buildRecoveryMessage: (input: RecoveryInput) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/RecoveryMessage.ts#L158)

Since v0.0.0

# models

## FailedStep

Sync-out step that failed during patch application.

**Example**

```ts
import { FailedStep } from "@beep/sandbox"

const step: FailedStep = "diff"
```

**Signature**

```ts
declare const FailedStep: AnnotatedSchema<LiteralKit<readonly ["commits", "diff", "untracked"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/RecoveryMessage.ts#L29)

Since v0.0.0

## FailedStep (type alias)

Runtime type for `FailedStep`.

**Signature**

```ts
type FailedStep = typeof FailedStep.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/RecoveryMessage.ts#L41)

Since v0.0.0

## RecoveryInput (class)

Recovery message inputs for a failed sync-out patch application.

**Example**

```ts
import { RecoveryInput } from "@beep/sandbox"

const input = RecoveryInput.make({
  failedStep: "diff",
  hasCommits: true,
  hasDiff: true,
  hasUntracked: false,
  patchDir: ".sandcastle/patches/20260324-153000",
})
```

**Signature**

```ts
declare class RecoveryInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/RecoveryMessage.ts#L62)

Since v0.0.0