---
title: Shared.schema.ts
nav_order: 19
parent: "@beep/repo-configs"
---

## Shared.schema.ts overview

Shared schemas for primitive Next.js configuration helper types.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [FileSizeSuffix (type alias)](#filesizesuffix-type-alias)
  - [SizeLimit (type alias)](#sizelimit-type-alias)
- [schemas](#schemas)
  - [FileSizeSuffix](#filesizesuffix)
  - [SizeLimit](#sizelimit)
---

# models

## FileSizeSuffix (type alias)

File-size suffix accepted by Next.js size limit strings.

**Example**

```ts
import type { FileSizeSuffix } from "@beep/repo-configs/next/models/Shared.schema"
const suffix = "MB" satisfies FileSizeSuffix
console.log(suffix)
```

**Signature**

```ts
type FileSizeSuffix = typeof FileSizeSuffix.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Shared.schema.ts#L51)

Since v0.0.0

## SizeLimit (type alias)

Non-negative numeric or suffixed string size limit accepted by Next.js.

**Example**

```ts
import type { SizeLimit } from "@beep/repo-configs/next/models/Shared.schema"
const limit = "2mb" satisfies SizeLimit
console.log(limit)
```

**Signature**

```ts
type SizeLimit = typeof SizeLimit.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Shared.schema.ts#L102)

Since v0.0.0

# schemas

## FileSizeSuffix

File-size suffix accepted by Next.js size limit strings.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { FileSizeSuffix } from "@beep/repo-configs/next/models/Shared.schema"
const program = S.decodeUnknownEffect(FileSizeSuffix)("mb")
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const FileSizeSuffix: AnnotatedSchema<S.TemplateLiteral<readonly [LiteralKit<readonly ["k", "K", "m", "M", "g", "G", "t", "T", "p", "P"], undefined>, LiteralKit<readonly ["b", "B"], undefined>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Shared.schema.ts#L32)

Since v0.0.0

## SizeLimit

Non-negative numeric or suffixed string size limit accepted by Next.js.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { SizeLimit } from "@beep/repo-configs/next/models/Shared.schema"
const program = S.decodeUnknownEffect(SizeLimit)("2mb")
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const SizeLimit: AnnotatedSchema<S.Union<readonly [S.Finite, S.TemplateLiteral<readonly [S.Finite, AnnotatedSchema<S.TemplateLiteral<readonly [LiteralKit<readonly ["k", "K", "m", "M", "g", "G", "t", "T", "p", "P"], undefined>, LiteralKit<readonly ["b", "B"], undefined>]>>]>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Shared.schema.ts#L82)

Since v0.0.0