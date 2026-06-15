---
title: Turbopack.schema.ts
nav_order: 21
parent: "@beep/repo-configs"
---

## Turbopack.schema.ts overview

Schemas for Next.js Turbopack configuration.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [TurbopackLoaderBuiltinCondition (type alias)](#turbopackloaderbuiltincondition-type-alias)
  - [TurbopackLoaderItem (type alias)](#turbopackloaderitem-type-alias)
  - [TurbopackLoaderOptions (type alias)](#turbopackloaderoptions-type-alias)
  - [TurbopackModuleType (type alias)](#turbopackmoduletype-type-alias)
  - [TurbopackRuleConfigCollection (type alias)](#turbopackruleconfigcollection-type-alias)
- [schemas](#schemas)
  - [JSONValue](#jsonvalue)
  - [JSONValue (type alias)](#jsonvalue-type-alias)
  - [TurbopackLoaderBuiltinCondition](#turbopackloaderbuiltincondition)
  - [TurbopackLoaderItem](#turbopackloaderitem)
  - [TurbopackLoaderOptions](#turbopackloaderoptions)
  - [TurbopackModuleType](#turbopackmoduletype)
  - [TurbopackOptions (class)](#turbopackoptions-class)
  - [TurbopackRuleCondition](#turbopackrulecondition)
  - [TurbopackRuleCondition (type alias)](#turbopackrulecondition-type-alias)
  - [TurbopackRuleConfigCollection](#turbopackruleconfigcollection)
  - [TurbopackRuleConfigItem (class)](#turbopackruleconfigitem-class)
---

# models

## TurbopackLoaderBuiltinCondition (type alias)

Built-in Turbopack rule condition.

**Example**

```ts
import type { TurbopackLoaderBuiltinCondition } from "@beep/repo-configs/next/models/Turbopack.schema"
const condition = "browser" satisfies TurbopackLoaderBuiltinCondition
console.log(condition)
```

**Signature**

```ts
type TurbopackLoaderBuiltinCondition = typeof TurbopackLoaderBuiltinCondition.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L157)

Since v0.0.0

## TurbopackLoaderItem (type alias)

Loader entry accepted by a Turbopack rule.

**Example**

```ts
import type { TurbopackLoaderItem } from "@beep/repo-configs/next/models/Turbopack.schema"
const loader: TurbopackLoaderItem = "sass-loader"
console.log(loader)
```

**Signature**

```ts
type TurbopackLoaderItem = typeof TurbopackLoaderItem.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L118)

Since v0.0.0

## TurbopackLoaderOptions (type alias)

Record of Turbopack loader options.

**Example**

```ts
import type { TurbopackLoaderOptions } from "@beep/repo-configs/next/models/Turbopack.schema"
const options: TurbopackLoaderOptions = { flag: true }
console.log(options)
```

**Signature**

```ts
type TurbopackLoaderOptions = typeof TurbopackLoaderOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L76)

Since v0.0.0

## TurbopackModuleType (type alias)

Module type used by Turbopack for matched files.

**Example**

```ts
import type { TurbopackModuleType } from "@beep/repo-configs/next/models/Turbopack.schema"
const type = "text" satisfies TurbopackModuleType
console.log(type)
```

**Signature**

```ts
type TurbopackModuleType = typeof TurbopackModuleType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L290)

Since v0.0.0

## TurbopackRuleConfigCollection (type alias)

Turbopack rule configuration collection.

**Example**

```ts
import type { TurbopackRuleConfigCollection } from "@beep/repo-configs/next/models/Turbopack.schema"
const collection: TurbopackRuleConfigCollection = ["sass-loader"]
console.log(collection)
```

**Signature**

```ts
type TurbopackRuleConfigCollection = typeof TurbopackRuleConfigCollection.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L355)

Since v0.0.0

# schemas

## JSONValue

JSON-compatible value schema accepted by Turbopack loader options.

**Example**

```ts
import { JSONValue } from "@beep/repo-configs/next/models/Turbopack.schema"
const value = JSONValue.make({ enabled: true })
console.log(value)
```

**Signature**

```ts
declare const JSONValue: S.Codec<JSONValue, JSONValue, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L38)

Since v0.0.0

## JSONValue (type alias)

JSON-compatible value accepted by Turbopack loader options.

**Example**

```ts
import { JSONValue } from "@beep/repo-configs/next/models/Turbopack.schema"
const value = JSONValue.make({ enabled: true })
console.log(value)
```

**Signature**

```ts
type JSONValue = string | number | boolean | Array<JSONValue> | { [key: string]: JSONValue }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L25)

Since v0.0.0

## TurbopackLoaderBuiltinCondition

Built-in Turbopack rule condition.

**Example**

```ts
import { TurbopackLoaderBuiltinCondition } from "@beep/repo-configs/next/models/Turbopack.schema"
const condition = TurbopackLoaderBuiltinCondition.Enum.browser
console.log(condition)
```

**Signature**

```ts
declare const TurbopackLoaderBuiltinCondition: AnnotatedSchema<LiteralKit<readonly ["browser", "foreign", "development", "production", "node", "edge-light"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L132)

Since v0.0.0

## TurbopackLoaderItem

Loader entry accepted by a Turbopack rule.

**Example**

```ts
import { TurbopackLoaderItem } from "@beep/repo-configs/next/models/Turbopack.schema"
const loader = TurbopackLoaderItem.make({ loader: "sass-loader" })
console.log(loader)
```

**Signature**

```ts
declare const TurbopackLoaderItem: AnnotatedSchema<S.Union<readonly [S.String, typeof TurbopackLoaderItemConfig]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L100)

Since v0.0.0

## TurbopackLoaderOptions

Record of Turbopack loader options.

**Example**

```ts
import { TurbopackLoaderOptions } from "@beep/repo-configs/next/models/Turbopack.schema"
const options = TurbopackLoaderOptions.make({ flag: true })
console.log(options)
```

**Signature**

```ts
declare const TurbopackLoaderOptions: AnnotatedSchema<S.$Record<S.String, S.Codec<JSONValue, JSONValue, never, never>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L58)

Since v0.0.0

## TurbopackModuleType

Module type used by Turbopack for matched files.

**Example**

```ts
import { TurbopackModuleType } from "@beep/repo-configs/next/models/Turbopack.schema"
const type = TurbopackModuleType.Enum.ecmascript
console.log(type)
```

**Signature**

```ts
declare const TurbopackModuleType: AnnotatedSchema<LiteralKit<readonly ["asset", "ecmascript", "typescript", "css", "css-module", "wasm", "raw", "node", "bytes", "text"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L260)

Since v0.0.0

## TurbopackOptions (class)

Options for Turbopack in `next.config.js`.

**Example**

```ts
import { TurbopackOptions } from "@beep/repo-configs/next/models/Turbopack.schema"
const options = TurbopackOptions.make({ root: process.cwd() })
console.log(options)
```

**Signature**

```ts
declare class TurbopackOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L380)

Since v0.0.0

## TurbopackRuleCondition

Recursive condition schema used by Turbopack rules.

**Example**

```ts
import { TurbopackRuleCondition } from "@beep/repo-configs/next/models/Turbopack.schema"
const condition = TurbopackRuleCondition.make({ all: ["browser"] })
console.log(condition)
```

**Signature**

```ts
declare const TurbopackRuleCondition: S.Codec<TurbopackRuleCondition, TurbopackRuleCondition, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L234)

Since v0.0.0

## TurbopackRuleCondition (type alias)

Recursive condition object used by Turbopack rules.

**Example**

```ts
import { TurbopackRuleCondition } from "@beep/repo-configs/next/models/Turbopack.schema"
const condition = TurbopackRuleCondition.make({ all: ["browser"] })
console.log(condition)
```

**Signature**

```ts
type TurbopackRuleCondition = | { readonly all: Array<TurbopackRuleCondition> }
  | { readonly any: Array<TurbopackRuleCondition> }
  | { readonly not: TurbopackRuleCondition }
  | TurbopackLoaderBuiltinCondition
  | {
      readonly path?: string | RegExp;
      readonly content?: RegExp;
      readonly query?: string | RegExp;
      readonly contentType?: string | RegExp;
    }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L171)

Since v0.0.0

## TurbopackRuleConfigCollection

Turbopack rule configuration collection.

**Example**

```ts
import { TurbopackRuleConfigCollection } from "@beep/repo-configs/next/models/Turbopack.schema"
const collection = TurbopackRuleConfigCollection.make([{ loader: "sass-loader" }])
console.log(collection)
```

**Signature**

```ts
declare const TurbopackRuleConfigCollection: AnnotatedSchema<S.Union<readonly [typeof TurbopackRuleConfigItem, S.mutable<S.$Array<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.String, typeof TurbopackLoaderItemConfig]>>, typeof TurbopackRuleConfigItem]>>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L334)

Since v0.0.0

## TurbopackRuleConfigItem (class)

Object-form Turbopack rule configuration.

**Example**

```ts
import { TurbopackRuleConfigItem } from "@beep/repo-configs/next/models/Turbopack.schema"
const rule = TurbopackRuleConfigItem.make({ type: "text" })
console.log(rule)
```

**Signature**

```ts
declare class TurbopackRuleConfigItem
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Turbopack.schema.ts#L304)

Since v0.0.0