---
title: EntitySchema.constructors.ts
nav_order: 67
parent: "@beep/schema"
---

## EntitySchema.constructors.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [literal](#literal)
  - [persist](#persist)
- [formatting](#formatting)
  - [columnNameFor](#columnnamefor)
  - [tableNameFromIdentifier](#tablenamefromidentifier)
- [schemas](#schemas)
  - [DateTimeFromMillis](#datetimefrommillis)
  - [int](#int)
---

# constructors

## literal

Literal schema helper for persisted discriminators.

**Example**

```ts
import { literal } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const kind = S.decodeUnknownSync(literal("account"))("account")
console.log(kind)
```

**Signature**

```ts
declare const literal: <const Value extends string | number | boolean | bigint>(value: Value) => S.Literal<Value>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.constructors.ts#L113)

Since v0.0.0

## persist

Persistence descriptor constructors.

**Example**

```ts
import { persist } from "@beep/schema/EntitySchema"

const descriptor = persist.text({ columnName: "display_name" })
console.log(descriptor.columnName)
```

**Signature**

```ts
declare const persist: { readonly blob: <const Strategy extends PersistStrategy = "provided", const ColumnName extends string | undefined = undefined, const IndexHints extends ReadonlyArray<IndexHint> | undefined = undefined>(options?: PersistOptions<Strategy, ColumnName, IndexHints> | undefined) => Strategy extends "computedByService" | "defaultedOnInsert" | "derived" | "generatedOnInsert" | "incrementedOnWrite" | "provided" | "providedByContext" | "updatedOnWrite" ? PersistDescriptorShape<"blob", Strategy, ColumnName, IndexHints> : never; readonly bool: <const Strategy extends PersistStrategy = "provided", const ColumnName extends string | undefined = undefined, const IndexHints extends ReadonlyArray<IndexHint> | undefined = undefined>(options?: PersistOptions<Strategy, ColumnName, IndexHints> | undefined) => Strategy extends "computedByService" | "defaultedOnInsert" | "derived" | "generatedOnInsert" | "incrementedOnWrite" | "provided" | "providedByContext" | "updatedOnWrite" ? PersistDescriptorShape<"bool", Strategy, ColumnName, IndexHints> : never; readonly entityId: <const Strategy extends PersistStrategy = "provided", const ColumnName extends string | undefined = undefined, const IndexHints extends ReadonlyArray<IndexHint> | undefined = undefined>(options?: PersistOptions<Strategy, ColumnName, IndexHints> | undefined) => Strategy extends "computedByService" | "defaultedOnInsert" | "derived" | "generatedOnInsert" | "incrementedOnWrite" | "provided" | "providedByContext" | "updatedOnWrite" ? PersistDescriptorShape<"entityId", Strategy, ColumnName, IndexHints> : never; readonly int: <const Strategy extends PersistStrategy = "provided", const ColumnName extends string | undefined = undefined, const IndexHints extends ReadonlyArray<IndexHint> | undefined = undefined>(options?: PersistOptions<Strategy, ColumnName, IndexHints> | undefined) => Strategy extends "computedByService" | "defaultedOnInsert" | "derived" | "generatedOnInsert" | "incrementedOnWrite" | "provided" | "providedByContext" | "updatedOnWrite" ? PersistDescriptorShape<"int", Strategy, ColumnName, IndexHints> : never; readonly jsonb: <const Strategy extends PersistStrategy = "provided", const ColumnName extends string | undefined = undefined, const IndexHints extends ReadonlyArray<IndexHint> | undefined = undefined>(options?: PersistOptions<Strategy, ColumnName, IndexHints> | undefined) => Strategy extends "computedByService" | "defaultedOnInsert" | "derived" | "generatedOnInsert" | "incrementedOnWrite" | "provided" | "providedByContext" | "updatedOnWrite" ? PersistDescriptorShape<"jsonb", Strategy, ColumnName, IndexHints> : never; readonly literal: <const Strategy extends PersistStrategy = "provided", const ColumnName extends string | undefined = undefined, const IndexHints extends ReadonlyArray<IndexHint> | undefined = undefined>(options?: PersistOptions<Strategy, ColumnName, IndexHints> | undefined) => Strategy extends "computedByService" | "defaultedOnInsert" | "derived" | "generatedOnInsert" | "incrementedOnWrite" | "provided" | "providedByContext" | "updatedOnWrite" ? PersistDescriptorShape<"literal", Strategy, ColumnName, IndexHints> : never; readonly text: <const Strategy extends PersistStrategy = "provided", const ColumnName extends string | undefined = undefined, const IndexHints extends ReadonlyArray<IndexHint> | undefined = undefined>(options?: PersistOptions<Strategy, ColumnName, IndexHints> | undefined) => Strategy extends "computedByService" | "defaultedOnInsert" | "derived" | "generatedOnInsert" | "incrementedOnWrite" | "provided" | "providedByContext" | "updatedOnWrite" ? PersistDescriptorShape<"text", Strategy, ColumnName, IndexHints> : never; readonly timestampDate: <const Strategy extends PersistStrategy = "provided", const ColumnName extends string | undefined = undefined, const IndexHints extends ReadonlyArray<IndexHint> | undefined = undefined>(options?: PersistOptions<Strategy, ColumnName, IndexHints> | undefined) => Strategy extends "computedByService" | "defaultedOnInsert" | "derived" | "generatedOnInsert" | "incrementedOnWrite" | "provided" | "providedByContext" | "updatedOnWrite" ? PersistDescriptorShape<"timestampDate", Strategy, ColumnName, IndexHints> : never; readonly timestampMillis: <const Strategy extends PersistStrategy = "provided", const ColumnName extends string | undefined = undefined, const IndexHints extends ReadonlyArray<IndexHint> | undefined = undefined>(options?: PersistOptions<Strategy, ColumnName, IndexHints> | undefined) => Strategy extends "computedByService" | "defaultedOnInsert" | "derived" | "generatedOnInsert" | "incrementedOnWrite" | "provided" | "providedByContext" | "updatedOnWrite" ? PersistDescriptorShape<"timestampMillis", Strategy, ColumnName, IndexHints> : never; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.constructors.ts#L52)

Since v0.0.0

# formatting

## columnNameFor

Resolve a column name from field key and descriptor override.

**Example**

```ts
import { columnNameFor, persist } from "@beep/schema/EntitySchema"

const columnName = columnNameFor("displayName", persist.text())
console.log(columnName)
```

**Signature**

```ts
declare const columnNameFor: { <const Key extends string, const Descriptor extends PersistDescriptor>(key: Key, descriptor: Descriptor): ColumnNameFor<Key, Descriptor>; <const Descriptor extends PersistDescriptor>(descriptor: Descriptor): <const Key extends string>(key: Key) => ColumnNameFor<Key, Descriptor>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.constructors.ts#L152)

Since v0.0.0

## tableNameFromIdentifier

Derive a table name from the final segment of a schema identifier.

**Example**

```ts
import { tableNameFromIdentifier } from "@beep/schema/EntitySchema"

const tableName = tableNameFromIdentifier("App/UserProfile")
console.log(tableName)
```

**Signature**

```ts
declare const tableNameFromIdentifier: <const Identifier extends string>(identifier: Identifier) => TableNameFromIdentifier<Identifier>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.constructors.ts#L133)

Since v0.0.0

# schemas

## DateTimeFromMillis

Epoch-millis DateTime schema used by persisted timestamp fields.

**Example**

```ts
import { DateTimeFromMillis } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const instant = S.decodeUnknownSync(DateTimeFromMillis)(1_715_000_000_000)
console.log(instant)
```

**Signature**

```ts
declare const DateTimeFromMillis: S.DateTimeUtcFromMillis
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.constructors.ts#L79)

Since v0.0.0

## int

Integer schema used by persisted integer fields.

**Example**

```ts
import { int } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const value = S.decodeUnknownSync(int)(42)
console.log(value)
```

**Signature**

```ts
declare const int: S.Int
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.constructors.ts#L96)

Since v0.0.0