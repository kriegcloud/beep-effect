---
title: Compiler.schema.ts
nav_order: 12
parent: "@beep/repo-configs"
---

## Compiler.schema.ts overview

Schemas for Next.js compiler and React compiler configuration.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [SassOptions (type alias)](#sassoptions-type-alias)
- [schemas](#schemas)
  - [CompilerConfig (class)](#compilerconfig-class)
  - [EmotionConfig (class)](#emotionconfig-class)
  - [ReactCompilerOptions (class)](#reactcompileroptions-class)
  - [SassOptions](#sassoptions)
  - [StyledComponentsConfig (class)](#styledcomponentsconfig-class)
---

# models

## SassOptions (type alias)

Sass options passed through to Next.js.

**Example**

```ts
import type { SassOptions } from "@beep/repo-configs/next"
const options: SassOptions = { implementation: "sass" }
console.log(options)
```

**Signature**

```ts
type SassOptions = typeof SassOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Compiler.schema.ts#L235)

Since v0.0.0

# schemas

## CompilerConfig (class)

Next.js compiler configuration block.

**Example**

```ts
import { CompilerConfig } from "@beep/repo-configs/next/models/Compiler.schema"
const config = CompilerConfig.make({ removeConsole: true })
console.log(config)
```

**Signature**

```ts
declare class CompilerConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Compiler.schema.ts#L175)

Since v0.0.0

## EmotionConfig (class)

Emotion compiler transform configuration.

**Example**

```ts
import { EmotionConfig } from "@beep/repo-configs/next/models/Compiler.schema"
const config = EmotionConfig.make({ sourceMap: true })
console.log(config)
```

**Signature**

```ts
declare class EmotionConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Compiler.schema.ts#L59)

Since v0.0.0

## ReactCompilerOptions (class)

React Compiler options supported by Next.js.

**Example**

```ts
import { ReactCompilerOptions } from "@beep/repo-configs/next/models/Compiler.schema"
const config = ReactCompilerOptions.make({ compilationMode: "infer" })
console.log(config)
```

**Signature**

```ts
declare class ReactCompilerOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Compiler.schema.ts#L113)

Since v0.0.0

## SassOptions

Sass options passed through to Next.js.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { SassOptions } from "@beep/repo-configs/next"
const program = S.decodeUnknownEffect(SassOptions)({ implementation: "sass" })
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const SassOptions: AnnotatedSchema<S.declare<{ [key: string]: any; implementation?: string; }, { [key: string]: any; implementation?: string; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Compiler.schema.ts#L214)

Since v0.0.0

## StyledComponentsConfig (class)

Styled Components compiler transform configuration.

**Example**

```ts
import { StyledComponentsConfig } from "@beep/repo-configs/next/models/Compiler.schema"
const config = StyledComponentsConfig.make({ ssr: true })
console.log(config)
```

**Signature**

```ts
declare class StyledComponentsConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Compiler.schema.ts#L83)

Since v0.0.0