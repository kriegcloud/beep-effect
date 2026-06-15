---
title: Float16Array.ts
nav_order: 92
parent: "@beep/schema"
---

## Float16Array.ts overview

Schemas and model-field helpers for working with `globalThis.Float16Array`
values.

Use this module when the domain model should keep native `Float16Array`
instances, but JSON create and update payloads still need a plain array-of-
numbers representation.

This module requires a runtime that exposes `globalThis.Float16Array`.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Float16Arr (type alias)](#float16arr-type-alias)
  - [Float16ArrayFromArray (type alias)](#float16arrayfromarray-type-alias)
  - [Float16ArrayFromArray (namespace)](#float16arrayfromarray-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
- [schemas](#schemas)
  - [Float16ArrayField](#float16arrayfield)
- [validation](#validation)
  - [Float16Arr](#float16arr)
  - [Float16ArrayFromArray](#float16arrayfromarray)
  - [isFloat16Array](#isfloat16array)
---

# models

## Float16Arr (type alias)

Type for `Float16Arr`.

**Signature**

```ts
type Float16Arr = typeof Float16Arr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float16Array.ts#L105)

Since v0.0.0

## Float16ArrayFromArray (type alias)

Type for `Float16ArrayFromArray`.

**Signature**

```ts
type Float16ArrayFromArray = typeof Float16ArrayFromArray.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float16Array.ts#L156)

Since v0.0.0

## Float16ArrayFromArray (namespace)

Namespace members for `Float16ArrayFromArray`.

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float16Array.ts#L164)

Since v0.0.0

### Encoded (type alias)

Encoded representation accepted by `Float16ArrayFromArray`.

This stays as a plain array of numbers so JSON payloads can represent
typed-array content without a custom wire format.

**Example**

```ts
import { type Float16ArrayFromArray } from "@beep/schema/Float16Array";

const payload: Float16ArrayFromArray.Encoded = [0.5, 1.25, 2.75];

console.log(payload.length); // 3
```

**Signature**

```ts
type Encoded = typeof Float16ArrayFromArray.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float16Array.ts#L182)

Since v0.0.0

# schemas

## Float16ArrayField

Model field helper for storing `Float16Array` values in variant-based model
schemas.

Database-facing `insert` and `update` variants require native
`Float16Array` instances, while `jsonCreate` and `jsonUpdate` accept plain
numeric arrays through `Float16ArrayFromArray`. This field does not
define a `json` variant, allowing read-side JSON serialization to be chosen
explicitly by the surrounding model.

**Example**

```ts
import { Float16ArrayField } from "@beep/schema/Float16Array";

console.log(Float16ArrayField.schemas.insert.ast._tag);
```

**Signature**

```ts
declare const Float16ArrayField: Field<{ readonly insert: AnnotatedSchema<S.declare<Float16Array<ArrayBufferLike>, Float16Array<ArrayBufferLike>>>; readonly update: AnnotatedSchema<S.declare<Float16Array<ArrayBufferLike>, Float16Array<ArrayBufferLike>>>; readonly jsonCreate: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.declare<Float16Array<ArrayBufferLike>, Float16Array<ArrayBufferLike>>>, S.$Array<S.Finite>, never, never>>; readonly jsonUpdate: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.declare<Float16Array<ArrayBufferLike>, Float16Array<ArrayBufferLike>>>, S.$Array<S.Finite>, never, never>>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float16Array.ts#L205)

Since v0.0.0

# validation

## Float16Arr

Schema that accepts native `Float16Array` instances.

This is useful for internal boundaries that already operate on typed arrays
and only need runtime schema validation plus reusable schema metadata.

**Example**

```ts
import * as S from "effect/Schema";
import { Float16Arr } from "@beep/schema/Float16Array";

const decodeFloat16Array = S.decodeUnknownSync(Float16Arr);
const value = decodeFloat16Array(new Float16Array([1, 2, 3]));

console.log(value.length); // 3
```

**Signature**

```ts
declare const Float16Arr: AnnotatedSchema<S.declare<Float16Array<ArrayBufferLike>, Float16Array<ArrayBufferLike>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float16Array.ts#L82)

Since v0.0.0

## Float16ArrayFromArray

Bidirectional schema that decodes arrays of numbers into `Float16Array`
values.

Decoding allocates a new `Float16Array` from the provided numeric array.
Encoding converts the typed array back into a standard array of numbers so it
can be transported through JSON-friendly boundaries.

**Example**

```ts
import * as S from "effect/Schema";
import { Float16ArrayFromArray } from "@beep/schema/Float16Array";

const decodeFloat16Array = S.decodeUnknownSync(Float16ArrayFromArray);
const encodeFloat16Array = S.encodeSync(Float16ArrayFromArray);

const value = decodeFloat16Array([0.5, 1.25, 2.75]);
const encoded = encodeFloat16Array(value);

console.log(value instanceof Float16Array); // true
console.log(encoded); // [0.5, 1.25, 2.75]
```

**Signature**

```ts
declare const Float16ArrayFromArray: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.declare<Float16Array<ArrayBufferLike>, Float16Array<ArrayBufferLike>>>, S.$Array<S.Finite>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float16Array.ts#L132)

Since v0.0.0

## isFloat16Array

Float16Array type guard.

**Example**

```ts
import { isFloat16Array } from "@beep/schema/Float16Array";

const value = new Float16Array([1, 2, 3]);
console.log(isFloat16Array(value));
```

**Signature**

```ts
declare const isFloat16Array: (u: unknown) => u is Float16Array<ArrayBufferLike>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Float16Array.ts#L60)

Since v0.0.0