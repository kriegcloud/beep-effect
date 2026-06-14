---
title: NextConfig.model.ts
nav_order: 22
parent: "@beep/repo-configs"
---

## NextConfig.model.ts overview

Schema-backed model for public Next.js configuration.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [defineNextConfig](#definenextconfig)
- [decoding](#decoding)
  - [decodeNextConfig](#decodenextconfig)
- [models](#models)
  - [NextConfigBase (type alias)](#nextconfigbase-type-alias)
  - [NextConfigExperimental (type alias)](#nextconfigexperimental-type-alias)
- [schemas](#schemas)
  - [NextConfig (class)](#nextconfig-class)
  - [NextConfigBase](#nextconfigbase)
  - [NextConfigExperimental](#nextconfigexperimental)
---

# constructors

## defineNextConfig

Synchronously validate and normalize a user-authored Next.js config.

**Example**

```ts
import { defineNextConfig } from "@beep/repo-configs/next"
import type { NextConfig } from "next"
export default defineNextConfig({
  reactStrictMode: true
} satisfies NextConfig)
```

**Signature**

```ts
declare const defineNextConfig: (config: unknown) => NextConfigFromNext
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/NextConfig.model.ts#L428)

Since v0.0.0

# decoding

## decodeNextConfig

Decode unknown input into a public Next.js configuration value.

**Example**

```ts
import { Effect } from "effect"
import { decodeNextConfig } from "@beep/repo-configs/next"
const program = decodeNextConfig({ reactStrictMode: true })
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const decodeNextConfig: (input: unknown, options?: ParseOptions) => Effect<NextConfig, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/NextConfig.model.ts#L410)

Since v0.0.0

# models

## NextConfigBase (type alias)

Backwards-compatible alias for the public Next.js configuration model.

**Example**

```ts
import type { NextConfigBase } from "@beep/repo-configs/next"
const config: NextConfigBase = { reactStrictMode: true }
console.log(config)
```

**Signature**

```ts
type NextConfigBase = typeof NextConfigBase.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/NextConfig.model.ts#L488)

Since v0.0.0

## NextConfigExperimental (type alias)

Backwards-compatible alias for the public experimental Next.js model.

**Example**

```ts
import type { NextConfigExperimental } from "@beep/repo-configs/next"
const experimental: NextConfigExperimental = { cssChunking: true }
console.log(experimental)
```

**Signature**

```ts
type NextConfigExperimental = ExperimentalConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/NextConfig.model.ts#L460)

Since v0.0.0

# schemas

## NextConfig (class)

Public Next.js configuration schema.

**Example**

```ts
import { defineNextConfig } from "@beep/repo-configs/next"
import type { NextConfig } from "next"
const config = defineNextConfig({
  allowedDevOrigins: ["codedank-web.localhost"],
  reactStrictMode: true
} satisfies NextConfig)
console.log(config)
```

**Signature**

```ts
declare class NextConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/NextConfig.model.ts#L180)

Since v0.0.0

## NextConfigBase

Backwards-compatible alias for the public Next.js configuration schema.

**Example**

```ts
import { NextConfigBase } from "@beep/repo-configs/next"
const config = NextConfigBase.make({ reactStrictMode: true })
console.log(config)
```

**Signature**

```ts
declare const NextConfigBase: typeof NextConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/NextConfig.model.ts#L474)

Since v0.0.0

## NextConfigExperimental

Backwards-compatible alias for the public experimental Next.js schema.

**Example**

```ts
import { NextConfigExperimental } from "@beep/repo-configs/next"
const experimental = NextConfigExperimental.make({ cssChunking: true })
console.log(experimental)
```

**Signature**

```ts
declare const NextConfigExperimental: typeof ExperimentalConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/NextConfig.model.ts#L446)

Since v0.0.0