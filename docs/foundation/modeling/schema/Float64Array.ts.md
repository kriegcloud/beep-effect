---
title: Float64Array.ts
nav_order: 94
parent: "@beep/schema"
---

## Float64Array.ts overview

Schemas and model-field helpers for working with `globalThis.Float64Array`
values.

Use this module when the domain model should keep native `Float64Array`
instances, but JSON create and update payloads still need a plain array-of-
numbers representation.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Float64Arr (type alias)](#float64arr-type-alias)
  - [Float64ArrayFromArray (type alias)](#float64arrayfromarray-type-alias)
  - [Float64ArrayFromArray (namespace)](#float64arrayfromarray-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
- [schemas](#schemas)
  - [Float64ArrayField](#float64arrayfield)
- [validation](#validation)
  - [Float64Arr](#float64arr)
  - [Float64ArrayFromArray](#float64arrayfromarray)
---

# models

## Float64Arr (type alias)

Type for `Float64Arr`.

**Signature**

```ts
type Float64Arr = typeof Float64Arr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float64Array.ts#L59)

Since v0.0.0

## Float64ArrayFromArray (type alias)

Type for `Float64ArrayFromArray`.

**Signature**

```ts
type Float64ArrayFromArray = typeof Float64ArrayFromArray.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float64Array.ts#L107)

Since v0.0.0

## Float64ArrayFromArray (namespace)

Namespace members for `Float64ArrayFromArray`.

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float64Array.ts#L115)

Since v0.0.0

### Encoded (type alias)

Encoded representation accepted by `Float64ArrayFromArray`.

This stays as a plain array of numbers so JSON payloads can represent
typed-array content without a custom wire format.

**Example**

```ts
import { type Float64ArrayFromArray } from "@beep/schema/Float64Array";

const payload: Float64ArrayFromArray.Encoded = [0.5, 1.25, 2.75];

console.log(payload.length); // 3
```

**Signature**

```ts
type Encoded = typeof Float64ArrayFromArray.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float64Array.ts#L133)

Since v0.0.0

# schemas

## Float64ArrayField

Model field helper for storing `Float64Array` values in variant-based model
schemas.

Database-facing `insert` and `update` variants require native
`Float64Array` instances, while `jsonCreate` and `jsonUpdate` accept plain
numeric arrays through `Float64ArrayFromArray`. This field does not
define a `json` variant, allowing read-side JSON serialization to be chosen
explicitly by the surrounding model.

**Example**

```ts
import { Float64ArrayField } from "@beep/schema/Float64Array";

console.log(Float64ArrayField.schemas.insert.ast._tag);
```

**Signature**

```ts
declare const Float64ArrayField: Field<{ readonly insert: AnnotatedSchema<S.instanceOf<Float64Array<ArrayBuffer>, Float64Array<ArrayBufferLike>>>; readonly update: AnnotatedSchema<S.instanceOf<Float64Array<ArrayBuffer>, Float64Array<ArrayBufferLike>>>; readonly jsonCreate: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.instanceOf<Float64Array<ArrayBuffer>, Float64Array<ArrayBufferLike>>>, S.$Array<S.Finite>, never, never>>; readonly jsonUpdate: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.instanceOf<Float64Array<ArrayBuffer>, Float64Array<ArrayBufferLike>>>, S.$Array<S.Finite>, never, never>>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float64Array.ts#L156)

Since v0.0.0

# validation

## Float64Arr

Schema that accepts native `Float64Array` instances.

This is useful for internal boundaries that already operate on typed arrays
and only need runtime schema validation plus reusable schema metadata.

**Example**

```ts
import * as S from "effect/Schema";
import { Float64Arr } from "@beep/schema/Float64Array";

const decodeFloat64Array = S.decodeUnknownSync(Float64Arr);
const value = decodeFloat64Array(new Float64Array([1, 2, 3]));

console.log(value.length); // 3
```

**Signature**

```ts
declare const Float64Arr: AnnotatedSchema<S.instanceOf<Float64Array<ArrayBuffer>, Float64Array<ArrayBufferLike>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float64Array.ts#L40)

Since v0.0.0

## Float64ArrayFromArray

Bidirectional schema that decodes arrays of numbers into `Float64Array`
values.

Decoding allocates a new `Float64Array` from the provided numeric array.
Encoding converts the typed array back into a standard array of numbers so it
can be transported through JSON-friendly boundaries.

**Example**

```ts
import * as S from "effect/Schema";
import { Float64ArrayFromArray } from "@beep/schema/Float64Array";

const decodeFloat64Array = S.decodeUnknownSync(Float64ArrayFromArray);
const encodeFloat64Array = S.encodeSync(Float64ArrayFromArray);

const value = decodeFloat64Array([0.5, 1.25, 2.75]);
const encoded = encodeFloat64Array(value);

console.log(value instanceof Float64Array); // true
console.log(encoded); // [0.5, 1.25, 2.75]
```

**Signature**

```ts
declare const Float64ArrayFromArray: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.instanceOf<Float64Array<ArrayBuffer>, Float64Array<ArrayBufferLike>>>, S.$Array<S.Finite>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float64Array.ts#L86)

Since v0.0.0