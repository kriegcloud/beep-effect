---
title: TSConfig.ts
nav_order: 52
parent: "@beep/repo-utils"
---

## TSConfig.ts overview

Type-safe tsconfig.json schemas using Effect v4 Schema.

The exported `TSConfig` schema models the TypeScript configuration surface we
intentionally support from SchemaStore, including JSONC-aware decode helpers
for comments and trailing commas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [TSConfig (namespace)](#tsconfig-namespace)
    - [Type (type alias)](#type-type-alias)
    - [Encoded (type alias)](#encoded-type-alias)
- [validation](#validation)
  - [TSConfig (class)](#tsconfig-class)
  - [TSConfigBuildOptions (class)](#tsconfigbuildoptions-class)
  - [TSConfigCompilerOptions (class)](#tsconfigcompileroptions-class)
  - [TSConfigReference (class)](#tsconfigreference-class)
  - [TSConfigTypeAcquisition (class)](#tsconfigtypeacquisition-class)
  - [TSConfigWatchOptions (class)](#tsconfigwatchoptions-class)
  - [TSNodeConfig (class)](#tsnodeconfig-class)
  - [decodeTSConfig](#decodetsconfig)
  - [decodeTSConfigEffect](#decodetsconfigeffect)
  - [decodeTSConfigExit](#decodetsconfigexit)
  - [decodeTSConfigFromJsoncTextEffect](#decodetsconfigfromjsonctexteffect)
  - [encodeTSConfigEffect](#encodetsconfigeffect)
  - [encodeTSConfigPrettyEffect](#encodetsconfigprettyeffect)
  - [encodeTSConfigToJsonEffect](#encodetsconfigtojsoneffect)
---

# models

## TSConfig (namespace)

Namespace helpers for the strict tsconfig schema.

**Example**

```ts
import type { TSConfig } from "@beep/repo-utils/schemas/TSConfig"
const readCompilerOptions = (value: TSConfig.Type) => value.compilerOptions
console.log(readCompilerOptions)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1618)

Since v0.0.0

### Type (type alias)

Decoded runtime type for `TSConfig`.

**Signature**

```ts
type Type = S.Schema.Type<typeof TSConfig>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1625)

Since v0.0.0

### Encoded (type alias)

Encoded representation for `TSConfig`.

**Signature**

```ts
type Encoded = S.Codec.Encoded<typeof TSConfig>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1633)

Since v0.0.0

# validation

## TSConfig (class)

Strict TypeScript tsconfig document schema.

Unexpected keys are rejected by the exported decode helpers.

**Example**

```ts
import { TSConfig } from "@beep/repo-utils/schemas/TSConfig"
const schema = TSConfig
console.log(schema)
```

**Signature**

```ts
declare class TSConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1597)

Since v0.0.0

## TSConfigBuildOptions (class)

Strict TypeScript buildOptions section.

**Example**

```ts
import { TSConfigBuildOptions } from "@beep/repo-utils/schemas/TSConfig"
const schema = TSConfigBuildOptions
console.log(schema)
```

**Signature**

```ts
declare class TSConfigBuildOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1343)

Since v0.0.0

## TSConfigCompilerOptions (class)

Strict TypeScript compilerOptions section.

**Example**

```ts
import { TSConfigCompilerOptions } from "@beep/repo-utils/schemas/TSConfig"
const schema = TSConfigCompilerOptions
console.log(schema)
```

**Signature**

```ts
declare class TSConfigCompilerOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1236)

Since v0.0.0

## TSConfigReference (class)

Project reference entry for tsconfig `references`.

**Example**

```ts
import { TSConfigReference } from "@beep/repo-utils/schemas/TSConfig"
const schema = TSConfigReference
console.log(schema)
```

**Signature**

```ts
declare class TSConfigReference
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L488)

Since v0.0.0

## TSConfigTypeAcquisition (class)

Strict TypeScript typeAcquisition section.

**Example**

```ts
import { TSConfigTypeAcquisition } from "@beep/repo-utils/schemas/TSConfig"
const schema = TSConfigTypeAcquisition
console.log(schema)
```

**Signature**

```ts
declare class TSConfigTypeAcquisition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1379)

Since v0.0.0

## TSConfigWatchOptions (class)

Strict TypeScript watchOptions section.

**Example**

```ts
import { TSConfigWatchOptions } from "@beep/repo-utils/schemas/TSConfig"
const schema = TSConfigWatchOptions
console.log(schema)
```

**Signature**

```ts
declare class TSConfigWatchOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1296)

Since v0.0.0

## TSNodeConfig (class)

Strict ts-node config section stored under `ts-node`.

**Example**

```ts
import { TSNodeConfig } from "@beep/repo-utils/schemas/TSConfig"
const schema = TSNodeConfig
console.log(schema)
```

**Signature**

```ts
declare class TSNodeConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1483)

Since v0.0.0

## decodeTSConfig

Synchronously decode an unknown value into a strict `TSConfig`.
Throws a `SchemaError` if validation fails.

**Example**

```ts
import { decodeTSConfig } from "@beep/repo-utils/schemas/TSConfig"
const config = decodeTSConfig({ compilerOptions: { strict: true } })
console.log(config)
```

**Signature**

```ts
declare const decodeTSConfig: (input: unknown) => TSConfig.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1668)

Since v0.0.0

## decodeTSConfigEffect

Decode an unknown value into a strict `TSConfig` as an Effect.

**Example**

```ts
import { decodeTSConfigEffect } from "@beep/repo-utils/schemas/TSConfig"
const program = decodeTSConfigEffect({ compilerOptions: { strict: true } })
console.log(program)
```

**Signature**

```ts
declare const decodeTSConfigEffect: (input: unknown) => Effect.Effect<TSConfig.Type, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1706)

Since v0.0.0

## decodeTSConfigExit

Synchronously decode an unknown value into a strict `TSConfig`,
returning an `Exit` instead of throwing.

**Example**

```ts
import { decodeTSConfigExit } from "@beep/repo-utils/schemas/TSConfig"
const exit = decodeTSConfigExit({ compilerOptions: { strict: true } })
console.log(exit)
```

**Signature**

```ts
declare const decodeTSConfigExit: (input: unknown) => Exit.Exit<TSConfig.Type, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1686)

Since v0.0.0

## decodeTSConfigFromJsoncTextEffect

Decode JSONC text into a strict `TSConfig`.

Supports comments and trailing commas through `@beep/schema/Jsonc`.
Encoding remains JSON-only and does not preserve comments.

**Example**

```ts
import { decodeTSConfigFromJsoncTextEffect } from "@beep/repo-utils/schemas/TSConfig"
const program = decodeTSConfigFromJsoncTextEffect(`{
  // Typecheck only
  "compilerOptions": { "noEmit": true }
}`)
console.log(program)
```

**Signature**

```ts
declare const decodeTSConfigFromJsoncTextEffect: (input: string) => Effect.Effect<TSConfig.Type, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1729)

Since v0.0.0

## encodeTSConfigEffect

Encode a strict `TSConfig` value back to its encoded form as an Effect.

The input is first decoded with strict excess-property rejection so callers
do not accidentally encode malformed tsconfig objects.

**Example**

```ts
import { encodeTSConfigEffect } from "@beep/repo-utils/schemas/TSConfig"
const program = encodeTSConfigEffect({ compilerOptions: { strict: true } })
console.log(program)
```

**Signature**

```ts
declare const encodeTSConfigEffect: (input: unknown) => Effect.Effect<TSConfig.Encoded, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1753)

Since v0.0.0

## encodeTSConfigPrettyEffect

Encode a strict `TSConfig` value to a pretty-printed JSON string.

**Example**

```ts
import { encodeTSConfigPrettyEffect } from "@beep/repo-utils/schemas/TSConfig"
const program = encodeTSConfigPrettyEffect({ compilerOptions: { strict: true } })
console.log(program)
```

**Signature**

```ts
declare const encodeTSConfigPrettyEffect: (input: unknown) => Effect.Effect<string, S.SchemaError | DomainError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1795)

Since v0.0.0

## encodeTSConfigToJsonEffect

Encode a strict `TSConfig` value to a compact JSON string as an Effect.

**Example**

```ts
import { encodeTSConfigToJsonEffect } from "@beep/repo-utils/schemas/TSConfig"
const program = encodeTSConfigToJsonEffect({ compilerOptions: { strict: true } })
console.log(program)
```

**Signature**

```ts
declare const encodeTSConfigToJsonEffect: (input: unknown) => Effect.Effect<string, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TSConfig.ts#L1774)

Since v0.0.0