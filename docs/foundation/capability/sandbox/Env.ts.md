---
title: Env.ts
nav_order: 6
parent: "@beep/sandbox"
---

## Env.ts overview

Environment file resolution and provider environment merging.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [mergeProviderEnv](#mergeproviderenv)
  - [resolveEnv](#resolveenv)
- [models](#models)
  - [MergeProviderEnvOptions (class)](#mergeproviderenvoptions-class)
---

# combinators

## mergeProviderEnv

Merge resolved environment variables with agent and sandbox provider env.

**Example**

```ts
import { mergeProviderEnv } from "@beep/sandbox/Env"

console.log(mergeProviderEnv)
```

**Signature**

```ts
declare const mergeProviderEnv: (options: MergeProviderEnvOptions) => Effect.Effect<{ [x: string]: string; }, InitError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Env.ts#L130)

Since v0.0.0

## resolveEnv

Resolve declared sandbox environment variables from `.sandcastle/.env`.

**Example**

```ts
import { resolveEnv } from "@beep/sandbox/Env"

console.log(resolveEnv)
```

**Signature**

```ts
declare const resolveEnv: (repoDir: string, runtimeEnv?: any) => Effect.Effect<Record<string, string>, never, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Env.ts#L92)

Since v0.0.0

# models

## MergeProviderEnvOptions (class)

Provider environment merge options.

**Example**

```ts
import { MergeProviderEnvOptions } from "@beep/sandbox/Env"

console.log(MergeProviderEnvOptions)
```

**Signature**

```ts
declare class MergeProviderEnvOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Env.ts#L32)

Since v0.0.0