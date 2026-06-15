---
title: use-scribe.ts
nav_order: 5
parent: "@beep/ui"
---

## use-scribe.ts overview

---
## Exports Grouped by Category
- [hooks](#hooks)
  - [AudioFormat](#audioformat)
  - [CommitStrategy](#commitstrategy)
  - [useScribe](#usescribe)
- [type-level](#type-level)
  - [ScribeStatus (type alias)](#scribestatus-type-alias)
---

# hooks

## AudioFormat

ElevenLabs Scribe enum exports used by the `@beep/ui` speech components.

**Signature**

```ts
declare const AudioFormat: typeof AudioFormat
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/use-scribe.ts#L50)

Since v0.0.0

## CommitStrategy

ElevenLabs Scribe enum exports used by the `@beep/ui` speech components.

**Signature**

```ts
declare const CommitStrategy: typeof CommitStrategy
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/use-scribe.ts#L50)

Since v0.0.0

## useScribe

Use scribe hook.

**Example**

```ts
import { useScribe } from "@beep/ui/hooks/use-scribe"

console.log(useScribe)
```

**Signature**

```ts
declare const useScribe: (options: UseScribeOptions) => UseScribeResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/use-scribe.ts#L195)

Since v0.0.0

# type-level

## ScribeStatus (type alias)

Scribe status type.

**Example**

```ts
import type { ScribeStatus } from "@beep/ui/hooks/use-scribe"

const value = {} as ScribeStatus
console.log(value)
```

**Signature**

```ts
type ScribeStatus = "idle" | "connecting" | "connected"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/use-scribe.ts#L66)

Since v0.0.0