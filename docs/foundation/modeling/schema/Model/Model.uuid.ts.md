---
title: Model.uuid.ts
nav_order: 155
parent: "@beep/schema"
---

## Model.uuid.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [Uint8Array](#uint8array)
  - [UuidV4Insert](#uuidv4insert)
  - [UuidV4WithGenerate](#uuidv4withgenerate)
- [models](#models)
  - [UuidV4Insert (interface)](#uuidv4insert-interface)
---

# constructors

## Uint8Array

Schema for `Uint8Array` values, used as the base for binary UUID fields.

**Example**

```ts
import * as Model from "@beep/schema/Model"

console.log(Model.Uint8Array)
```

**Signature**

```ts
declare const Uint8Array: S.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.uuid.ts#L50)

Since v0.0.0

## UuidV4Insert

A field that represents a binary UUID v4 that is generated on inserts.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

const BlobId = Model.Uint8Array.pipe(Schema.brand("BlobId"))

class Blob extends Model.Class<Blob>("Blob")({}) {}

console.log(Blob)
```

**Signature**

```ts
declare const UuidV4Insert: <const B extends string>(schema: S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>) => UuidV4Insert<B>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.uuid.ts#L96)

Since v0.0.0

## UuidV4WithGenerate

Wrap a branded `Uint8Array` schema in an `Overridable` that generates a UUID v4 by default.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

const BlobId = Model.Uint8Array.pipe(Schema.brand("BlobId"))
const overridable = Model.UuidV4WithGenerate(BlobId)

console.log(overridable)
```

**Signature**

```ts
declare const UuidV4WithGenerate: <B extends string>(schema: S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>) => Overridable<S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.uuid.ts#L71)

Since v0.0.0

# models

## UuidV4Insert (interface)

Interface for a binary UUID v4 field auto-generated on insert.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

const BlobId = Model.Uint8Array.pipe(Schema.brand("BlobId"))
const field: Model.UuidV4Insert<"BlobId"> = Model.UuidV4Insert(BlobId)

console.log(field)
```

**Signature**

```ts
export interface UuidV4Insert<B extends string>
  extends VariantSchema.Field<{
    readonly select: S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>;
    readonly insert: Overridable<S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>>;
    readonly update: S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>;
    readonly json: S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>;
  }> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.uuid.ts#L29)

Since v0.0.0