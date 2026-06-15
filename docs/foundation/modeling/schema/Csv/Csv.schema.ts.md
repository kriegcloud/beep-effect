---
title: Csv.schema.ts
nav_order: 34
parent: "@beep/schema"
---

## Csv.schema.ts overview

A module for CSV schema definitions.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CSV (type alias)](#csv-type-alias)
  - [CsvDocument (type alias)](#csvdocument-type-alias)
  - [CsvText (type alias)](#csvtext-type-alias)
  - [RowSchemaWithFields (type alias)](#rowschemawithfields-type-alias)
  - [Schema (type alias)](#schema-type-alias)
- [schemas](#schemas)
  - [CSV](#csv)
  - [Schema](#schema)
- [validation](#validation)
  - [Csv](#csv-1)
---

# models

## CSV (type alias)

Runtime type extracted from the `CSV` alias.

**Example**

```ts
import type { CSV } from "@beep/schema/Csv"
import * as S from "effect/Schema"

const Row = S.Struct({ name: S.String })
declare const schema: CSV<typeof Row>
console.log(schema.ast._tag)
```

**Signature**

```ts
type CSV<RowSchema> = CsvDocument<RowSchema>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csv/Csv.schema.ts#L362)

Since v0.0.0

## CsvDocument (type alias)

Schema transformation returned by the CSV schema factory for a row schema.

**Example**

```ts
import type { CsvDocument } from "@beep/schema/Csv"
import * as S from "effect/Schema"

const Row = S.Struct({ name: S.String })
declare const document: CsvDocument<typeof Row>
console.log(document.ast._tag)
```

**Signature**

```ts
type CsvDocument<RowSchema> = S.decodeTo<
  S.toType<S.$Array<RowSchema>>,
  typeof CsvText
>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csv/Csv.schema.ts#L67)

Since v0.0.0

## CsvText (type alias)

Branded runtime type for CSV document text produced by encoding a `CSV`
schema.

**Signature**

```ts
type CsvText = typeof CsvText.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csv/Csv.schema.ts#L336)

Since v0.0.0

## RowSchemaWithFields (type alias)

Object-like row schema contract accepted by the CSV schema factory.

**Example**

```ts
import type { RowSchemaWithFields } from "@beep/schema/Csv"
import * as S from "effect/Schema"

const Row = S.Struct({ name: S.String }) satisfies RowSchemaWithFields
console.log(Object.keys(Row.fields))
```

**Signature**

```ts
type RowSchemaWithFields = S.Top & {
  readonly fields: S.Struct.Fields;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csv/Csv.schema.ts#L47)

Since v0.0.0

## Schema (type alias)

Runtime type extracted from the `Schema` alias.

**Example**

```ts
import type { Schema } from "@beep/schema/Csv"
import * as S from "effect/Schema"

const Row = S.Struct({ name: S.String })
declare const schema: Schema<typeof Row>
console.log(schema.ast._tag)
```

**Signature**

```ts
type Schema<RowSchema> = CsvDocument<RowSchema>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csv/Csv.schema.ts#L380)

Since v0.0.0

# schemas

## CSV

Public aliases for concise namespace roles.

**Signature**

```ts
declare const CSV: { <RowSchema extends RowSchemaWithFields>(rowSchema: RowSchema): CsvDocument<RowSchema>; <RowSchema extends RowSchemaWithFields>(rowSchema: RowSchema, options: CsvCodecOptionsArgs): CsvDocument<RowSchema>; <RowSchema extends RowSchemaWithFields>(options: CsvCodecOptionsArgs): (rowSchema: RowSchema) => CsvDocument<RowSchema>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csv/Csv.schema.ts#L344)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: { <RowSchema extends RowSchemaWithFields>(rowSchema: RowSchema): CsvDocument<RowSchema>; <RowSchema extends RowSchemaWithFields>(rowSchema: RowSchema, options: CsvCodecOptionsArgs): CsvDocument<RowSchema>; <RowSchema extends RowSchemaWithFields>(options: CsvCodecOptionsArgs): (rowSchema: RowSchema) => CsvDocument<RowSchema>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csv/Csv.schema.ts#L344)

Since v0.0.0

# validation

## Csv

Schema factory for CSV documents whose rows are validated by the provided
row schema.

The row schema must be an object-like Effect schema with named fields. CSV
cells remain string boundaries, so callers should use string-backed field
schemas such as `S.FiniteFromString` when coercion is needed.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { CSV } from "@beep/schema/Csv"

const Row = S.Struct({ name: S.String, age: S.FiniteFromString })
const CsvSchema = CSV(Row)

const program = S.decodeUnknownEffect(CsvSchema)("name,age\nAda,36")
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const Csv: { <RowSchema extends RowSchemaWithFields>(rowSchema: RowSchema): CsvDocument<RowSchema>; <RowSchema extends RowSchemaWithFields>(rowSchema: RowSchema, options: CsvCodecOptionsArgs): CsvDocument<RowSchema>; <RowSchema extends RowSchemaWithFields>(options: CsvCodecOptionsArgs): (rowSchema: RowSchema) => CsvDocument<RowSchema>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csv/Csv.schema.ts#L309)

Since v0.0.0