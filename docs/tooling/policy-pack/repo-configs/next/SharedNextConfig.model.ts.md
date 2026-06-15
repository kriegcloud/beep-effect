---
title: SharedNextConfig.model.ts
nav_order: 25
parent: "@beep/repo-configs"
---

## SharedNextConfig.model.ts overview

Shared repo-owned Next.js configuration preset.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [composeNextConfig](#composenextconfig)
- [constructors](#constructors)
  - [defineBeepNextConfig](#definebeepnextconfig)
  - [defineBeepNextConfigEnv](#definebeepnextconfigenv)
  - [makeBeepNextBaseConfig](#makebeepnextbaseconfig)
- [decoding](#decoding)
  - [decodeBeepNextConfigEnv](#decodebeepnextconfigenv)
- [models](#models)
  - [BeepNextBundleAnalyzerConfig (type alias)](#beepnextbundleanalyzerconfig-type-alias)
  - [BeepNextConfigOptionsInput (type alias)](#beepnextconfigoptionsinput-type-alias)
  - [BeepNextMdxConfig (type alias)](#beepnextmdxconfig-type-alias)
  - [BeepNextPwaConfig (type alias)](#beepnextpwaconfig-type-alias)
  - [NextConfigPlugin (type alias)](#nextconfigplugin-type-alias)
- [schemas](#schemas)
  - [BeepNextBundleAnalyzerConfig](#beepnextbundleanalyzerconfig)
  - [BeepNextConfigEnv (class)](#beepnextconfigenv-class)
  - [BeepNextConfigOptions (class)](#beepnextconfigoptions-class)
  - [BeepNextMdxConfig](#beepnextmdxconfig)
  - [BeepNextPwaConfig](#beepnextpwaconfig)
---

# combinators

## composeNextConfig

Compose Next.js config plugin functions in explicit left-to-right order.

**Example**

```ts
import { composeNextConfig } from "@beep/repo-configs/next"
const config = composeNextConfig({ reactStrictMode: true }, [
  (current) => ({ ...current, poweredByHeader: false })
])
console.log(config)
```

**Signature**

```ts
declare const composeNextConfig: { (config: NextConfigFromNext, plugins: ReadonlyArray<NextConfigPlugin>): NextConfigFromNext; (plugins: ReadonlyArray<NextConfigPlugin>): (config: NextConfigFromNext) => NextConfigFromNext; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L525)

Since v0.0.0

# constructors

## defineBeepNextConfig

Define a shared repo-owned Next.js config with the standard plugin stack.

**Example**

```ts
import { defineBeepNextConfig } from "@beep/repo-configs/next"
const config = defineBeepNextConfig({
  repoRoot: "/repo",
  allowedDevOrigins: ["oip-web.localhost"],
  env: { NEXT_DISABLE_PWA: "1" }
})
console.log(config)
```

**Signature**

```ts
declare const defineBeepNextConfig: (options: BeepNextConfigOptionsInput) => NextConfigFromNext
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L578)

Since v0.0.0

## defineBeepNextConfigEnv

Synchronously decode an environment snapshot for the shared Next.js preset.

**Example**

```ts
import { defineBeepNextConfigEnv } from "@beep/repo-configs/next"
const env = defineBeepNextConfigEnv({ NEXT_DISABLE_PWA: "0" })
console.log(env)
```

**Signature**

```ts
declare const defineBeepNextConfigEnv: (env: unknown) => BeepNextConfigEnv
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L508)

Since v0.0.0

## makeBeepNextBaseConfig

Build the shared repo-owned Next.js base config before plugin wrapping.

**Example**

```ts
import { makeBeepNextBaseConfig } from "@beep/repo-configs/next"
const config = makeBeepNextBaseConfig({
  repoRoot: "/repo",
  allowedDevOrigins: ["oip-web.localhost"]
})
console.log(config)
```

**Signature**

```ts
declare const makeBeepNextBaseConfig: (options: BeepNextConfigOptionsInput) => NextConfigFromNext
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L554)

Since v0.0.0

# decoding

## decodeBeepNextConfigEnv

Decode an unknown environment snapshot for the shared Next.js preset.

**Example**

```ts
import { Effect } from "effect"
import { decodeBeepNextConfigEnv } from "@beep/repo-configs/next"
const program = decodeBeepNextConfigEnv({ ANALYZE: "1" })
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const decodeBeepNextConfigEnv: (input: unknown, options?: ParseOptions) => Effect<BeepNextConfigEnv, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L492)

Since v0.0.0

# models

## BeepNextBundleAnalyzerConfig (type alias)

Bundle analyzer feature configuration for the shared Next.js preset.

**Example**

```ts
import type { BeepNextBundleAnalyzerConfig } from "@beep/repo-configs/next"
const config: BeepNextBundleAnalyzerConfig = { enabled: true }
console.log(config)
```

**Signature**

```ts
type BeepNextBundleAnalyzerConfig = typeof BeepNextBundleAnalyzerConfig.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L147)

Since v0.0.0

## BeepNextConfigOptionsInput (type alias)

User-authored input options accepted by `defineBeepNextConfig`.

**Example**

```ts
import type { BeepNextConfigOptionsInput } from "@beep/repo-configs/next"
const options: BeepNextConfigOptionsInput = {
  repoRoot: "/repo",
  allowedDevOrigins: ["oip-web.localhost"],
  env: { ANALYZE: "1" }
}
console.log(options)
```

**Signature**

```ts
type BeepNextConfigOptionsInput = Omit<typeof BeepNextConfigOptions.Encoded, "env"> & {
  readonly env?: unknown;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L305)

Since v0.0.0

## BeepNextMdxConfig (type alias)

MDX feature configuration for the shared Next.js preset.

**Example**

```ts
import type { BeepNextMdxConfig } from "@beep/repo-configs/next"
const config: BeepNextMdxConfig = {}
console.log(config)
```

**Signature**

```ts
type BeepNextMdxConfig = typeof BeepNextMdxConfig.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L190)

Since v0.0.0

## BeepNextPwaConfig (type alias)

PWA feature configuration for the shared Next.js preset.

**Example**

```ts
import type { BeepNextPwaConfig } from "@beep/repo-configs/next"
const config: BeepNextPwaConfig = { enabled: false }
console.log(config)
```

**Signature**

```ts
type BeepNextPwaConfig = typeof BeepNextPwaConfig.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L241)

Since v0.0.0

## NextConfigPlugin (type alias)

A pure Next.js config plugin function.

**Example**

```ts
import type { NextConfigPlugin } from "@beep/repo-configs/next"
const plugin: NextConfigPlugin = (config) => config
console.log(plugin)
```

**Signature**

```ts
type NextConfigPlugin = (config: NextConfigFromNext) => NextConfigFromNext
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L321)

Since v0.0.0

# schemas

## BeepNextBundleAnalyzerConfig

Bundle analyzer feature configuration for the shared Next.js preset.

**Example**

```ts
import { BeepNextBundleAnalyzerConfig } from "@beep/repo-configs/next"
const config = BeepNextBundleAnalyzerConfig.make({
  analyzerMode: "static",
  openAnalyzer: false
})
console.log(config)
```

**Signature**

```ts
declare const BeepNextBundleAnalyzerConfig: AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof BeepNextBundleAnalyzerConfigOptions]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L129)

Since v0.0.0

## BeepNextConfigEnv (class)

Environment snapshot understood by the shared Next.js config preset.

**Example**

```ts
import { BeepNextConfigEnv } from "@beep/repo-configs/next"
const env = BeepNextConfigEnv.make({
  ANALYZE: "1",
  NEXT_DISABLE_PWA: "1"
})
console.log(env)
```

**Signature**

```ts
declare class BeepNextConfigEnv
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L90)

Since v0.0.0

## BeepNextConfigOptions (class)

Input options for the shared repo-owned Next.js config preset.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { BeepNextConfigOptions } from "@beep/repo-configs/next"
const program = S.decodeUnknownEffect(BeepNextConfigOptions)({
  repoRoot: "/repo",
  allowedDevOrigins: ["oip-web.localhost"]
})
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare class BeepNextConfigOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L260)

Since v0.0.0

## BeepNextMdxConfig

MDX feature configuration for the shared Next.js preset.

**Example**

```ts
import { BeepNextMdxConfig } from "@beep/repo-configs/next"
const config = BeepNextMdxConfig.make({
  extension: /\.(md|mdx)$/
})
console.log(config)
```

**Signature**

```ts
declare const BeepNextMdxConfig: AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof BeepNextMdxConfigOptions]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L172)

Since v0.0.0

## BeepNextPwaConfig

PWA feature configuration for the shared Next.js preset.

**Example**

```ts
import { BeepNextPwaConfig } from "@beep/repo-configs/next"
const config = BeepNextPwaConfig.make({
  dest: "public",
  register: true
})
console.log(config)
```

**Signature**

```ts
declare const BeepNextPwaConfig: AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof BeepNextPwaConfigOptions]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/SharedNextConfig.model.ts#L223)

Since v0.0.0