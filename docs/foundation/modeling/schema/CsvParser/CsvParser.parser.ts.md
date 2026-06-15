---
title: CsvParser.parser.ts
nav_order: 42
parent: "@beep/schema"
---

## CsvParser.parser.ts overview

Whole-text CSV parsing helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ParsedField (class)](#parsedfield-class)
  - [ParsedRow (class)](#parsedrow-class)
- [schemas](#schemas)
  - [parse](#parse)
- [utilities](#utilities)
  - [parseCsvRows](#parsecsvrows)
---

# models

## ParsedField (class)

Parsed CSV field with the cursor position after the field and normalized
string value.

**Example**

```ts
import { ParsedField } from "@beep/schema/CsvParser"

const field = ParsedField.make({ cursor: 4, value: "Ada" })
console.log(field.value)
```

**Signature**

```ts
declare class ParsedField
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvParser/CsvParser.parser.ts#L110)

Since v0.0.0

## ParsedRow (class)

Parsed CSV row with the cursor position after the row and raw field values.

**Example**

```ts
import { ParsedRow } from "@beep/schema/CsvParser"

const row = ParsedRow.make({ cursor: 8, row: ["Ada", "36"] })
console.log(row.row.length)
```

**Signature**

```ts
declare class ParsedRow
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvParser/CsvParser.parser.ts#L265)

Since v0.0.0

# schemas

## parse

Public aliases for concise namespace roles.

**Signature**

```ts
declare const parse: { (input: string, parserOptions: ParserOptions): Effect.Effect<ReadonlyArray<ReadonlyArray<string>>, CsvError, never>; (parserOptions: ParserOptions): (input: string) => Effect.Effect<ReadonlyArray<ReadonlyArray<string>>, CsvError, never>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvParser/CsvParser.parser.ts#L424)

Since v0.0.0

# utilities

## parseCsvRows

Parse full CSV text into raw row arrays using low-level parser options.

**Example**

```ts
import { Effect } from "effect"
import { parseCsvRows } from "@beep/schema/CsvParser"
import { ParserOptions } from "@beep/schema/ParserOptions"

const rows = Effect.runSync(parseCsvRows("name,age\nAda,36", ParserOptions.new()))
console.log(rows.length)
```

**Signature**

```ts
declare const parseCsvRows: { (input: string, parserOptions: ParserOptions): Effect.Effect<ReadonlyArray<ReadonlyArray<string>>, CsvError, never>; (parserOptions: ParserOptions): (input: string) => Effect.Effect<ReadonlyArray<ReadonlyArray<string>>, CsvError, never>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvParser/CsvParser.parser.ts#L411)

Since v0.0.0