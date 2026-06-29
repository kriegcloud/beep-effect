---
name: effect-schema-v4
description: "Effect Schema v4 patterns for validation, encoding, decoding, transformations, classes, tagged unions, and error types. Use when working with Schema, Codec, Struct, TaggedUnion, TaggedClass, TaggedErrorClass, Schema.check, Schema.decodeTo, Schema.flip, Schema.tagDefaultOmit, optional fields, branding, or schema composition in Effect v4. Triggers on Schema.Struct, Schema.Codec, Schema.check, Schema.decodeTo, Schema.encodeTo, Schema.TaggedUnion, Schema.TaggedClass, Schema.TaggedErrorClass, Schema.Class, Schema.brand, Schema.declare, Schema.suspend, Schema.optional, Schema.optionalKey, Schema.fromJsonString, Schema.refine, Schema.flip, Schema.tagDefaultOmit, SchemaGetter, decodeUnknownSync, encodeSync."
---

# Effect Schema (v4)

Declarative validation, encoding, and decoding.

```ts
import { Option, Schema } from "effect";
```

## Type Architecture

Schema v4 has a type hierarchy with two key levels:

**`Schema<Type>`**: Tracks only the decoded type. Used when you only need
validation (type guards, assertions).

**`Codec<Type, Encoded, DecodingServices, EncodingServices>`**: Full
bidirectional schema. Tracks the decoded Type, the Encoded form, and
separate service requirements for each direction.

```ts
Schema.String; // Codec<string, string, never, never>
Schema.NumberFromString; // Codec<number, string, never, never>
```

Most schemas you write are `Codec`s. The `Schema<T>` supertype is useful
for functions that only need the decoded type.

### Why Two Service Channels?

Decode and encode can have different Effect service dependencies. A schema
that calls a database during decode but a cache during encode tracks both
independently:

```ts
const mySchema: Codec<User, UserDTO, DatabaseService, CacheService>;
```

Sync decode/encode functions (`decodeUnknownSync`, `encodeSync`) require
the relevant services channel to be `never`.

### Directional Views

- `Decoder<T, RD>`: only decode requirements
- `Encoder<E, RE>`: only encode requirements
- `Schema.toType(schema)`: schema where both Type and Encoded equal
  `S["Type"]`
- `Schema.toEncoded(schema)`: schema where both Type and Encoded equal
  `S["Encoded"]`

## Decoding and Encoding

### Sync (no service dependencies)

```ts
const result = Schema.decodeUnknownSync(Schema.NumberFromString)("42");
// 42

const encoded = Schema.encodeSync(Schema.NumberFromString)(42);
// "42"
```

Other sync variants: `decodeUnknownExit`, `decodeUnknownOption`,
`decodeSync`, `encodeUnknownSync`, `encodeUnknownExit`.

### Effectful (with service dependencies)

```ts
const result = yield * Schema.decodeUnknownEffect(mySchema)(input);
const encoded = yield * Schema.encodeEffect(mySchema)(value);
```

The `*Unknown*` variants accept `unknown` input. The non-Unknown variants
accept typed input (`S["Encoded"]` for decode, `S["Type"]` for encode).

### Type Guards and Assertions

```ts
const isString = Schema.is(Schema.String);
isString("hello"); // true
isString(42); // false

Schema.asserts(Schema.String)("hello"); // void (passes)
Schema.asserts(Schema.String)(42); // throws
```

Both require `DecodingServices: never` and validate against the decoded
Type.

## Struct

```ts
const User = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  email: Schema.String,
});
```

### Optional Fields

`optionalKey`: exact optional property (`{ age?: number }`):

```ts
const User = Schema.Struct({
  name: Schema.String,
  age: Schema.optionalKey(Schema.Number),
});
```

`optional`: optional with undefined (`{ age?: number | undefined }`):

```ts
const User = Schema.Struct({
  name: Schema.String,
  age: Schema.optional(Schema.Number),
});
```

### Defaults

`withDecodingDefault`: optional on encoded side, required on decoded side
with a default:

```ts
const User = Schema.Struct({
  role: Schema.String.pipe(
    Schema.withDecodingDefault(() => "user"),
  ),
});
// decode({ }) => { role: "user" }
// decode({ role: "admin" }) => { role: "admin" }
```

`withConstructorDefault`: optional in `makeUnsafe` and class construction. It does not apply during decode or encode:

```ts
const User = Schema.Struct({
  id: Schema.String.pipe(Schema.withConstructorDefault(() => Option.some(crypto.randomUUID()))),
  name: Schema.String,
});
```

Use `withDecodingDefault` or `withDecodingDefaultKey` when you need decode time defaults.

### Pick and Omit

Use `mapFields` with `Struct.pick` / `Struct.omit`:

```ts
import { Struct } from "effect";

const NameOnly = User.mapFields(Struct.pick(["name"]));
const WithoutAge = User.mapFields(Struct.omit(["age"]));
```

### Field Assignment

Add fields to an existing struct:

```ts
const WithTimestamp = User.mapFields(Struct.assign({
  createdAt: Schema.Date,
}));
```

## Tagged Structs

`Schema.tag` makes `_tag` optional in construction but required in
decode/encode. `Schema.tagDefaultOmit` also makes it optional in decode
and omits it from encode output:

```ts
const Circle = Schema.Struct({
  _tag: Schema.tag("Circle"),
  radius: Schema.Number,
});

const CircleApi = Schema.Struct({
  _tag: Schema.tagDefaultOmit("Circle"),
  radius: Schema.Number,
});
```

| Function                     | Construction | Decode input | Encode output |
| ---------------------------- | ------------ | ------------ | ------------- |
| `Schema.tag("X")`            | optional     | required     | included      |
| `Schema.tagDefaultOmit("X")` | optional     | optional     | omitted       |

Shorthand:

```ts
const Circle = Schema.TaggedStruct("Circle", {
  radius: Schema.Number,
});
```

## TaggedUnion

Discriminated union with built-in pattern matching:

```ts
const Shape = Schema.TaggedUnion({
  Circle: { radius: Schema.Number },
  Square: { side: Schema.Number },
});
```

Pattern matching:

```ts
Shape.match(value, {
  Circle: (c) => Math.PI * c.radius ** 2,
  Square: (s) => s.side ** 2,
});
```

Type guards:

```ts
Shape.guards.Circle(value);

Shape.isAnyOf(["Circle", "Square"])(value);
```

Access individual cases:

```ts
Shape.cases.Circle; // TaggedStruct schema
```

`Schema.toTaggedUnion("_tag")` adds the same utilities to an existing
`Union`.

## Union

```ts
const StringOrNumber = Schema.Union([Schema.String, Schema.Number]);
```

Default mode is `"anyOf"` (first match wins). Use `{ mode: "oneOf" }` for
exact match.

## Classes

### `Schema.Class`

Schema-validated class with Data equality:

```ts
class User extends Schema.Class<User>("User")({
  name: Schema.String,
  age: Schema.Number,
}) {}

const user = new User({ name: "Alice", age: 30 });
```

### `Schema.TaggedClass`

Class with automatic `_tag`:

```ts
class Circle extends Schema.TaggedClass<Circle>()("Circle", {
  radius: Schema.Number,
}) {}

const c = new Circle({ radius: 5 });
c._tag; // "Circle"
```

### `Schema.TaggedErrorClass`

Yieldable error with schema validation:

```ts
class NotFoundError extends Schema.TaggedErrorClass<NotFoundError>()(
  "NotFoundError",
  { id: Schema.String },
) {}

yield * new NotFoundError({ id: "123" });
```

Zero-field variant:

```ts
class UnauthorizedError extends Schema.TaggedErrorClass<UnauthorizedError>()(
  "UnauthorizedError",
  {},
) {}
```

### Extending Classes

```ts
class Animal extends Schema.Class<Animal>("Animal")({
  name: Schema.String,
}) {}

class Dog extends Animal.extend<Dog>("Dog")({
  breed: Schema.String,
}) {}
```

## Checks and Validation

`Schema.check` appends validation rules. Replaces v3's `Schema.filter`:

```ts
const PositiveInt = Schema.Number.check(
  Schema.isInt(),
  Schema.isGreaterThan(0),
);

const ShortString = Schema.String.check(
  Schema.isMinLength(1),
  Schema.isMaxLength(100),
);
```

Built-in check constructors:

| Check                             | Description                    |
| --------------------------------- | ------------------------------ |
| `isMinLength(n)`                  | String/array minimum length    |
| `isMaxLength(n)`                  | String/array maximum length    |
| `isNonEmpty()`                    | Non-empty string/array         |
| `isTrimmed()`                     | No leading/trailing whitespace |
| `isPattern(regex)`                | Regex match                    |
| `isGreaterThan(n)`                | Number > n                     |
| `isLessThan(n)`                   | Number < n                     |
| `isBetween({ minimum, maximum })` | Number in range                |
| `isInt()`                         | Integer                        |
| `isFinite()`                      | Finite number                  |
| `isUUID(version?)`                | UUID (optional version 1-8)    |
| `isULID()`                        | ULID                           |

### Custom Checks

```ts
const isEven = Schema.makeFilter<number>(
  (n) => n % 2 === 0 ? undefined : "Expected an even number",
);

const EvenNumber = Schema.Number.check(isEven);
```

Return `undefined` or `true` to pass. Return `false`, a string, an Issue,
or `{ path, message }` to fail.

### Refinements (Narrowing)

`Schema.refine` narrows the type via a type guard:

```ts
interface NonEmptyString extends string {
  readonly NonEmptyString: unique symbol;
}

const NonEmptyString = Schema.String.pipe(
  Schema.refine(
    (s): s is NonEmptyString => s.length > 0,
  ),
);
```

## Transformations

### `Schema.decodeTo`

The primary transformation API. Transforms from one schema to another:

```ts
import { SchemaGetter as Getter } from "effect";

const StringToNumber = Schema.String.pipe(
  Schema.decodeTo(Schema.Number, {
    decode: Getter.transform((s) => parseInt(s, 10)),
    encode: Getter.transform((n) => String(n)),
  }),
);
```

`decodeTo(to, { decode, encode })`: Result has `Type = to["Type"]`,
`Encoded = from["Encoded"]`.

### `Schema.encodeTo`

Inverse perspective of `decodeTo`:

```ts
const NumberToString = Schema.Number.pipe(
  Schema.encodeTo(Schema.String, {
    decode: Getter.transform((n) => String(n)),
    encode: Getter.transform((s) => parseInt(s, 10)),
  }),
);
```

### `Schema.decode` / `Schema.encode`

Same-schema transformations (Type stays the same shape):

```ts
const Trimmed = Schema.String.pipe(
  Schema.decode({
    decode: Getter.transform((s) => s.trim()),
    encode: Getter.passthrough(),
  }),
);
```

### `Schema.flip`

Swaps Type and Encoded (and their service channels):

```ts
const StringFromNumber = Schema.flip(Schema.NumberFromString);
// Type: string, Encoded: number
```

Double flip cancels out.

### SchemaGetter Primitives

The `SchemaGetter` module provides composable transformation building
blocks:

```ts
import { SchemaGetter as Getter } from "effect";
```

| Getter                        | Description                             |
| ----------------------------- | --------------------------------------- |
| `Getter.passthrough()`        | Identity (no-op)                        |
| `Getter.transform(f)`         | Pure transformation                     |
| `Getter.transformOrFail(f)`   | Effectful, can fail with Issue          |
| `Getter.transformOptional(f)` | `Option -> Option` control              |
| `Getter.withDefault(f)`       | Replace None/undefined with default     |
| `Getter.required()`           | Fail if None (missing key)              |
| `Getter.omit()`               | Always return None (remove from output) |
| `Getter.succeed(value)`       | Constant value                          |

## Branding

Add phantom type brands:

```ts
const UserId = Schema.String.pipe(Schema.brand("UserId"));
type UserId = typeof UserId.Type;
```

With runtime validation via `Brand.check`:

```ts
import { Brand } from "effect";

type PositiveInt = number & Brand.Brand<"PositiveInt">;
const PositiveInt = Brand.check<PositiveInt>(Schema.isInt(), Schema.isGreaterThan(0));
const PositiveIntSchema = Schema.Number.pipe(Schema.fromBrand("PositiveInt", PositiveInt));
```

## Built-in Schemas

### Primitives

`String`, `Number`, `Boolean`, `BigInt`, `Symbol`, `Null`, `Undefined`,
`Void`, `Never`, `Any`, `Unknown`

### Refined

`Finite`, `Int`, `NonEmptyString`, `Char`, `Trimmed`

### Transformations

`NumberFromString`, `FiniteFromString`, `Trim`

### Instances

`Date` (any Date including invalid), `DateValid` (valid only), `Duration`,
`BigDecimal`, `Uint8Array`

### Wrappers

`NullOr(S)`, `UndefinedOr(S)`, `NullishOr(S)`, `Option(S)`,
`Array(S)`, `NonEmptyArray(S)`, `mutable(S)`

### JSON

`Schema.fromJsonString` parses a JSON string then validates with the given
schema:

```ts
const UserFromJson = Schema.fromJsonString(User);
// Codec<User, string>: JSON string -> validated User
```

`Schema.toCodecJson` converts a schema to produce JSON-safe encodings
(e.g., `Date` -> ISO string, `BigInt` -> string):

```ts
const UserJsonCodec = Schema.toCodecJson(User);
// Codec<User, unknown>: JSON-safe encoding
```

The canonical pattern for full JSON string round-trips (used by
KeyValueStore and persistence layers):

```ts
const serializer = Schema.toCodecJson(User);
const codec = Schema.fromJsonString(serializer);
// Codec<User, string>: JSON string -> parse -> JSON-safe decode -> User

const decoded = Schema.decodeUnknownSync(codec)(
  "{\"name\":\"Alice\",\"createdAt\":\"2024-01-01T00:00:00.000Z\"}",
);
const encoded = Schema.encodeSync(codec)(user); // JSON string with JSON-safe values
```

`fromJsonString` alone does NOT apply JSON-safe transformations. If your
schema has `Date`, `BigInt`, or other non-JSON types, wrap with
`toCodecJson` first.

### UUID and ULID

Not standalone schemas. Apply as checks:

```ts
const UUID = Schema.String.check(Schema.isUUID(4));
const ULID = Schema.String.check(Schema.isULID());
```

## Literals and Enums

```ts
const Admin = Schema.Literal("admin");

const Role = Schema.Literals(["admin", "user", "guest"]);

const Direction = Schema.Enum(MyTsEnum);

const Greeting = Schema.TemplateLiteral(["Hello, ", Schema.String]);
```

## Recursive Schemas

Use `Schema.suspend` with an explicit type annotation:

```ts
interface Category {
  readonly name: string;
  readonly children: ReadonlyArray<Category>;
}

const Category: Schema.Codec<Category> = Schema.Struct({
  name: Schema.String,
  children: Schema.Array(Schema.suspend(() => Category)),
});
```

## Custom Schemas

### `Schema.declare`

For non-parametric custom types:

```ts
const MyDate = Schema.declare(
  (u): u is Date => u instanceof Date && !isNaN(u.getTime()),
);
```

### `Schema.instanceOf`

Shorthand for `declare` with instanceof check:

```ts
const MyRegExp = Schema.instanceOf(RegExp);
```

## Tips for Generic Schema Helpers

When writing generic functions over schemas, use `Schema.Top` as the
constraint (the widest schema type):

```ts
const withTimestamp = <S extends Schema.Struct<Schema.Struct.Fields>>(
  schema: S,
) =>
  schema.mapFields(Struct.assign({
    createdAt: Schema.Date,
    updatedAt: Schema.Date,
  }));
```

For transformation helpers, compose with `decodeTo` / `encodeTo` and
`SchemaGetter` primitives:

```ts
const nullable = <S extends Schema.Top>(schema: S) =>
  Schema.NullOr(schema).pipe(
    Schema.decodeTo(Schema.Option(Schema.toType(schema)), {
      decode: Getter.transformOptional((opt) =>
        opt.pipe(Option.map((v) => v === null ? Option.none() : Option.some(v)))
      ),
      encode: Getter.transform(Option.getOrNull),
    }),
  );
```

Use `Schema.toType(schema)` and `Schema.toEncoded(schema)` to derive
schemas from only one side of a Codec. This is essential in transformations
where the target schema needs to reference the source's Type or Encoded
without carrying the full bidirectional structure.

## Quick Reference

| Task                 | Pattern                                              |
| -------------------- | ---------------------------------------------------- |
| Decode from unknown  | `Schema.decodeUnknownSync(schema)(input)`            |
| Decode (effectful)   | `Schema.decodeUnknownEffect(schema)(input)`          |
| Encode               | `Schema.encodeSync(schema)(value)`                   |
| Type guard           | `Schema.is(schema)(value)`                           |
| Assertion            | `Schema.asserts(schema)(value)`                      |
| Add validation       | `schema.check(Schema.isMinLength(1))`                |
| Custom check         | `Schema.makeFilter(fn)`                              |
| Narrow type          | `Schema.refine(guard)(schema)`                       |
| Transform            | `from.pipe(Schema.decodeTo(to, { decode, encode }))` |
| Swap directions      | `Schema.flip(schema)`                                |
| Optional property    | `Schema.optionalKey(schema)`                         |
| Default on decode    | `Schema.withDecodingDefault(() => val)`              |
| Constructor default  | `Schema.withConstructorDefault(() => val)`           |
| Tagged struct        | `Schema.TaggedStruct("Tag", fields)`                 |
| Tagged union         | `Schema.TaggedUnion({ A: fields, B: fields })`       |
| Pattern match        | `taggedUnion.match(value, handlers)`                 |
| Tagged class         | `Schema.TaggedClass<Self>()("Tag", fields)`          |
| Error class          | `Schema.TaggedErrorClass<Self>()("Tag", fields)`     |
| Brand                | `Schema.brand("Name")`                               |
| Recursive            | `Schema.suspend(() => schema)`                       |
| From JSON string     | `Schema.fromJsonString(schema)`                      |
| JSON-safe codec      | `Schema.toCodecJson(schema)`                         |
| Full JSON round-trip | `Schema.fromJsonString(Schema.toCodecJson(schema))`  |
| Pick fields          | `struct.mapFields(Struct.pick(["a"]))`               |
| Omit fields          | `struct.mapFields(Struct.omit(["b"]))`               |
| Omit _tag on encode  | `Schema.tagDefaultOmit("tag")`                       |
