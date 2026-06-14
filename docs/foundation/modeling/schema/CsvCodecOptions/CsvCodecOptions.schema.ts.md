---
title: CsvCodecOptions.schema.ts
nav_order: 36
parent: "@beep/schema"
---

## CsvCodecOptions.schema.ts overview

High-level CSV codec options for text decode/encode flows.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [CsvCodecOptions (class)](#csvcodecoptions-class)
  - [CsvCodecOptionsArgs (type alias)](#csvcodecoptionsargs-type-alias)
  - [CsvCodecOptionsParseOptions](#csvcodecoptionsparseoptions)
- [schemas](#schemas)
  - [ParseOptions](#parseoptions)
  - [Schema](#schema)
---

# configuration

## CsvCodecOptions (class)

Schema-backed CSV text codec options.

**Example**

```ts
import { CsvCodecOptions } from "@beep/schema/CsvCodecOptions"
import * as S from "effect/Schema"

const options = S.decodeUnknownSync(CsvCodecOptions)({ delimiter: ";" })
console.log(options.delimiter)
```

**Signature**

```ts
declare class CsvCodecOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvCodecOptions/CsvCodecOptions.schema.ts#L47)

Since v0.0.0

## CsvCodecOptionsArgs (type alias)

Encoded/raw constructor input for `CsvCodecOptions`.

**Example**

```ts
import type { CsvCodecOptionsArgs } from "@beep/schema/CsvCodecOptions"

const options = { delimiter: ";" } satisfies CsvCodecOptionsArgs
console.log(options.delimiter)
```

**Signature**

```ts
type CsvCodecOptionsArgs = typeof CsvCodecOptions.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvCodecOptions/CsvCodecOptions.schema.ts#L122)

Since v0.0.0

## CsvCodecOptionsParseOptions

Parse options used when normalizing raw CSV codec option input.

**Example**

```ts
import { CsvCodecOptionsParseOptions } from "@beep/schema/CsvCodecOptions"

console.log(CsvCodecOptionsParseOptions.exact)
```

**Signature**

```ts
declare const CsvCodecOptionsParseOptions: { exact: true; onExcessProperty: "error"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvCodecOptions/CsvCodecOptions.schema.ts#L137)

Since v0.0.0

# schemas

## ParseOptions

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ParseOptions: { exact: true; onExcessProperty: "error"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvCodecOptions/CsvCodecOptions.schema.ts#L145)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: typeof CsvCodecOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvCodecOptions/CsvCodecOptions.schema.ts#L145)

Since v0.0.0