---
title: Float32Array.ts
nav_order: 93
parent: "@beep/schema"
---

## Float32Array.ts overview

Schemas and model-field helpers for working with `globalThis.Float32Array`
values.

Use this module when the domain model should keep native `Float32Array`
instances, but JSON create and update payloads still need a plain array-of-
numbers representation.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Float32Arr (type alias)](#float32arr-type-alias)
  - [Float32ArrayFromArray (type alias)](#float32arrayfromarray-type-alias)
  - [Float32ArrayFromArray (namespace)](#float32arrayfromarray-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
- [schemas](#schemas)
  - [Float32ArrayField](#float32arrayfield)
- [validation](#validation)
  - [Float32Arr](#float32arr)
  - [Float32ArrayFromArray](#float32arrayfromarray)
---

# models

## Float32Arr (type alias)

Type for `Float32Arr`.

**Signature**

```ts
type Float32Arr = typeof Float32Arr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float32Array.ts#L59)

Since v0.0.0

## Float32ArrayFromArray (type alias)

Type for `Float32ArrayFromArray`.

**Signature**

```ts
type Float32ArrayFromArray = typeof Float32ArrayFromArray.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float32Array.ts#L107)

Since v0.0.0

## Float32ArrayFromArray (namespace)

Namespace members for `Float32ArrayFromArray`.

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float32Array.ts#L115)

Since v0.0.0

### Encoded (type alias)

Encoded representation accepted by `Float32ArrayFromArray`.

This stays as a plain array of numbers, so JSON payloads can represent
typed-array content without a custom wire format.

**Example**

```ts
import { type Float32ArrayFromArray } from "@beep/schema/Float32Array";

const payload: Float32ArrayFromArray.Encoded = [0.5, 1.25, 2.75];

console.log(payload.length); // 3
```

**Signature**

```ts
type Encoded = typeof Float32ArrayFromArray.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float32Array.ts#L133)

Since v0.0.0

# schemas

## Float32ArrayField

Model field helper for storing `Float32Array` values in variant-based model
schemas.

Database-facing `insert` and `update` variants require native
`Float32Array` instances, while `jsonCreate` and `jsonUpdate` accept plain
numeric arrays through `Float32ArrayFromArray`. This field does not
define a `json` variant, allowing read-side JSON serialization to be chosen
explicitly by the surrounding model.

**Example**

```ts
import { Float32ArrayField } from "@beep/schema/Float32Array";

console.log(Float32ArrayField.schemas.insert.ast._tag);
```

**Signature**

```ts
declare const Float32ArrayField: Field<{ readonly insert: AnnotatedSchema<S.instanceOf<Float32Array<ArrayBuffer>, Float32Array<ArrayBufferLike>>>; readonly update: AnnotatedSchema<S.instanceOf<Float32Array<ArrayBuffer>, Float32Array<ArrayBufferLike>>>; readonly jsonCreate: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.instanceOf<Float32Array<ArrayBuffer>, Float32Array<ArrayBufferLike>>>, S.$Array<S.Finite>, never, never>>; readonly jsonUpdate: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.instanceOf<Float32Array<ArrayBuffer>, Float32Array<ArrayBufferLike>>>, S.$Array<S.Finite>, never, never>>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float32Array.ts#L156)

Since v0.0.0

# validation

## Float32Arr

Schema that accepts native `Float32Array` instances.

This is useful for internal boundaries that already operate on typed arrays
and only need runtime schema validation plus reusable schema metadata.

**Example**

```ts
import * as S from "effect/Schema";
import { Float32Arr } from "@beep/schema/Float32Array";

const decodeFloat32Array = S.decodeUnknownSync(Float32Arr);
const value = decodeFloat32Array(new Float32Array([1, 2, 3]));

console.log(value.length); // 3
```

**Signature**

```ts
declare const Float32Arr: AnnotatedSchema<S.instanceOf<Float32Array<ArrayBuffer>, Float32Array<ArrayBufferLike>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float32Array.ts#L40)

Since v0.0.0

## Float32ArrayFromArray

Bidirectional schema that decodes arrays of numbers into `Float32Array`
values.

Decoding allocates a new `Float32Array` from the provided numeric array.
Encoding converts the typed array back into a standard array of numbers so it
can be transported through JSON-friendly boundaries.

**Example**

```ts
import * as S from "effect/Schema";
import { Float32ArrayFromArray } from "@beep/schema/Float32Array";

const decodeFloat32Array = S.decodeUnknownSync(Float32ArrayFromArray);
const encodeFloat32Array = S.encodeSync(Float32ArrayFromArray);

const value = decodeFloat32Array([0.5, 1.25, 2.75]);
const encoded = encodeFloat32Array(value);

console.log(value instanceof Float32Array); // true
console.log(encoded); // [0.5, 1.25, 2.75]
```

**Signature**

```ts
declare const Float32ArrayFromArray: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.instanceOf<Float32Array<ArrayBuffer>, Float32Array<ArrayBufferLike>>>, S.$Array<S.Finite>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float32Array.ts#L86)

Since v0.0.0