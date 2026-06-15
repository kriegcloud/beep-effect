---
title: interactive.ts
nav_order: 10
parent: "@beep/sandbox"
---

## interactive.ts overview

Interactive agent entrypoint.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [interactive](#interactive)
- [models](#models)
  - [InteractiveResult (class)](#interactiveresult-class)
---

# combinators

## interactive

Start an interactive agent session.

**Example**

```ts
import { interactive } from "@beep/sandbox/interactive"

console.log(interactive)
```

**Signature**

```ts
declare const interactive: <R>(options: RunOptions<R>) => Effect.Effect<InteractiveResult, SandboxError, R | FileSystem.FileSystem | Path.Path | Display>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/interactive.ts#L71)

Since v0.0.0

# models

## InteractiveResult (class)

Result of an interactive agent session.

**Example**

```ts
import { InteractiveResult } from "@beep/sandbox/interactive"

console.log(InteractiveResult)
```

**Signature**

```ts
declare class InteractiveResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/interactive.ts#L44)

Since v0.0.0