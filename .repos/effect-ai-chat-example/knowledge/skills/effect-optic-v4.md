---
name: effect-optic-v4
description: "Effect Optic v4 patterns for immutable nested reads and updates, union narrowing, traversals, and Schema.toIso integration. Use when working with Optic, Optic.makeIso, Optic.makeLens, Optic.makePrism, Optic.key, Optic.optionalKey, Optic.at, Optic.check, Optic.tag, Optic.forEach, Optic.entries, Schema.toIso, or Schema.toIsoFocus in Effect v4. Triggers on Optic.id, getResult, replaceResult, modifyAll, some, none, success, failure, Schema.toIso, Schema.toIsoFocus."
---

# Effect Optic (v4 / effect-smol)

Optic is the immutable nested update tool for plain objects, records, tuples, arrays, and schema generated collection shapes.

```ts
import { Optic, Option, Result, Schema } from "effect";
```

## Core Hierarchy

- `Iso<S, A>`: lossless conversion. `get(s) -> A`, `set(a) -> S`
- `Lens<S, A>`: always focuses exactly one value. `get` always succeeds
- `Prism<S, A>`: focus may be absent on read. `set(a)` can still build `S`
- `Optional<S, A>`: both read and write can fail
- `Traversal<S, A>`: `Optional<S, ReadonlyArray<A>>` for zero or more matches

Composition weakens to the least powerful optic:

- `Iso + Iso = Iso`
- `Lens + Lens = Lens`
- `Prism + Prism = Prism`
- mixed composition usually becomes `Optional`

Start chains with `Optic.id<S>()`.

```ts
const _age = Optic.id<{ user: { age: number; }; }>()
  .key("user")
  .key("age");
```

## Constructors and Built Ins

### Constructors

- `Optic.makeIso(get, set)`
- `Optic.makeLens(get, replace)`
- `Optic.makePrism(getResult, set)`
- `Optic.fromChecks(...checks)`
- `Optic.makeOptional(getResult, replaceResult)`
- `Optic.id<S>()`

### Helpers

- `Optic.getAll(traversal)`
- `Optic.entries<A>()`
- `Optic.some()`
- `Optic.none()`
- `Optic.success()`
- `Optic.failure()`

## Failure Model

`replace` and `modify` are only forgiving when the final optic can actually fail on write, which mainly means `Optional` chains.

- `Iso.replace(a, s)` ignores `s` and uses `set(a)`
- `Prism.replace(a, s)` also ignores `s` and uses `set(a)`
- `Optional.replace(a, s)` falls back to the original source on failure

Use `getResult` and `replaceResult` when failure matters:

```ts
const _x = Optic.id<Record<string, number>>().at("x");

const value = _x.getResult({ x: 1 });
const updated = _x.replaceResult(2, { x: 1 });
```

- `getResult(s)` returns `Result.Success<A>` or `Result.Failure<string>`
- `replaceResult(a, s)` returns `Result.Success<S>` or `Result.Failure<string>`
- `replace(a, s)` and `modify(f)(s)` never report failure directly

This is a major gotcha. Do not use plain `replace` when you need to know whether an `Optional` chain actually matched.

## Path Access Patterns

### `key`

Use `.key(...)` for required struct fields, tuple elements, or optional fields where writing `undefined` should preserve the key.

```ts
type S = { readonly a?: number | undefined; };

const optic = Optic.id<S>().key("a");

optic.replace(undefined, {});
// { a: undefined }
```

Important behavior:

- `key` is a total lens at the type level
- runtime path reads are unchecked
- nested `.key(...).key(...)` can throw if runtime data does not match the expected shape
- `key` is not the safe choice for possibly missing record keys or array indices

### `optionalKey`

Use `.optionalKey(...)` when writing `undefined` should remove the property or element.

```ts
type S = { readonly a?: number; };

const optic = Optic.id<S>().optionalKey("a");

optic.replace(undefined, { a: 1 });
// {}
```

Important behavior:

- object properties are deleted with `delete`
- array and tuple indices are removed with `splice`
- removing an array element shifts later indices left
- missing keys are still writable. `optic.replace(2, {})` becomes `{ a: 2 }`

### `at`

Use `.at(...)` for presence checked access to record keys and array indices.

```ts
const optic = Optic.id<ReadonlyArray<number>>().at(0);

optic.getResult([]);
// failure("Key 0 not found")
```

Important behavior:

- uses `Object.hasOwn`
- absent keys fail in both `getResult` and `replaceResult`
- plain `replace` still falls back to the original source on failure

## Narrowing and Validation

### `check`

Use `.check(...)` to append one or more schema checks.

```ts
const optic = Optic.id<number>()
  .check(Schema.isInt(), Schema.isGreaterThan(0));
```

Behavior:

- read side becomes prism like
- write side is identity. `set` does not validate
- multiple failing checks are accumulated into a newline joined string

### `refine`

Use `.refine(guard, annotations?)` for arbitrary type guard narrowing.

```ts
type S = { readonly _tag: "a"; } | { readonly _tag: "b"; readonly b: number; };

const _b = Optic.id<S>()
  .refine((s): s is Extract<S, { readonly _tag: "b"; }> => s._tag === "b", {
    expected: "\"b\" tag",
  })
  .key("b");
```

### `tag`

Use `.tag("MyTag")` as the common tagged union shorthand.

```ts
const _radius = Optic.id<
  | { readonly _tag: "Circle"; readonly radius: number; }
  | { readonly _tag: "Rect"; readonly width: number; }
>()
  .tag("Circle")
  .key("radius");
```

### `notUndefined`

Use `.notUndefined()` to turn `A | undefined` into a focusing prism.

```ts
const defined = Optic.id<number | undefined>().notUndefined();
```

## Struct Transforms

### `pick` and `omit`

These are whole object transforms, not collections of child optics.

```ts
const picked = Optic.id<{ a: string; b: number; c: boolean; }>().pick(["a", "c"]);
const omitted = Optic.id<{ a: string; b: number; c: boolean; }>().omit(["b"]);
```

Behavior:

- `pick` reads a subset and merges replacements back into the original object
- `omit` reads everything except the omitted keys and merges replacements back
- both are restricted away from union focuses at the type level

## Traversal Patterns

Use `.forEach(...)` on an array like focus. The callback receives `Optic.id<A>()` for each element.

```ts
type Post = { title: string; likes: number; };
type S = { user: { posts: ReadonlyArray<Post>; }; };

const _likes = Optic.id<S>()
  .key("user")
  .key("posts")
  .forEach((post) => post.key("likes").check(Schema.isGreaterThan(0)));
```

Two different update styles matter:

```ts
_likes.modify((likes) => likes.map((n) => n + 1));
_likes.modifyAll((like) => like + 1);
```

- `modify` receives the whole collected array of focused values
- `modifyAll` maps each focused value individually
- `forEach` skips elements whose inner optic does not focus
- `replaceResult` requires exactly as many replacement values as focusable elements
- traversal length mismatches fail with `each: replacement length mismatch: ...`
- writeback can also fail with `each: could not set element ${i}`

Use `Optic.getAll(traversal)` to extract matches as a fresh mutable array. It returns `[]` when traversal read fails.

## Record Traversal

Use `Optic.entries()` to turn a record into entry tuples, then traverse those tuples.

```ts
const optic = Optic.entries<number>()
  .forEach((entry) => entry.key(1).check(Schema.isGreaterThan(0)));
```

This is the main record traversal pattern in tests and docs.

## Built In Prisms

### `Option`

```ts
const someValue = Optic.id<Option.Option<number>>().compose(Optic.some());
const noneValue = Optic.id<Option.Option<number>>().compose(Optic.none());
```

- `Optic.some()` focuses `Some.value` and writes with `Option.some`
- `Optic.none()` focuses `undefined` for `None` and writes with `Option.none()`

### `Result`

```ts
const ok = Optic.id<Result.Result<number, string>>().compose(Optic.success());
const err = Optic.id<Result.Result<number, string>>().compose(Optic.failure());
```

- `Optic.success()` focuses `Result.Success.success` and writes with `Result.succeed`
- `Optic.failure()` focuses `Result.Failure.failure` and writes with `Result.fail`

## Schema Integration

`Schema.toIso(schema)` is a major feature. It builds an `Iso` over the schema specific optic representation.

```ts
class Value extends Schema.Class<Value>("Value")({
  a: Schema.DateValid,
}) {}

const optic = Schema.toIso(Value).key("a");
```

Use `Schema.toIsoFocus(schema)` for reusable item level focus inside larger schema generated containers.

```ts
const item = Schema.toIsoFocus(Value).key("a");
```

Patterns covered in tests:

- classes, `Schema.toType`, and `Schema.toEncoded`
- brands and write side validation
- tuples, arrays, non empty arrays, tuple with rest
- structs, records, struct with rest
- unions and recursive `Schema.suspend`
- custom codec isos via `Schema.overrideToCodecIso`
- `Schema.flip`, `Schema.Opaque`, and `Schema.Error`
- `Option`, `Result`, `Cause`, `Exit`
- `ReadonlySet`, `ReadonlyMap`, `HashMap`
- native class schemas

Important behavior:

- schema generated optics can throw on invalid writes if the schema enforces invariants
- branded schemas preserve validation on write
- tuple entry access in schema generated tests uses string keys like `"0"` and `"1"`

## Limitations and Gotchas

- only plain objects, null prototype objects, and arrays are cloneable during path updates
- class instances throw on `replace` and `modify`
- the error text says null prototype objects are not supported, but tests show they are supported
- no op updates may still allocate a new root
- `key`, `optionalKey`, `at`, `pick`, and `omit` are intentionally rejected on union focuses at the type level
- `replace` and `modify` silently keep the original source on focus failure
- `check` and `refine` turn schema issues into strings, not structured issues

## APIs To Reach For First

1. `Optic.id<S>()` to start any chain
2. `.key(...)` for guaranteed struct and tuple paths
3. `.at(...)` for presence checked record and array access
4. `.optionalKey(...)` when `undefined` should delete or splice
5. `.tag(...)`, `.refine(...)`, `.check(...)`, `.notUndefined()` for narrowing
6. `.forEach(...)` plus `.modifyAll(...)` for filtered collection updates
7. `Optic.entries()` for record traversal
8. `Schema.toIso(...)` and `Schema.toIsoFocus(...)` for schema derived optics

## Quick Reference

| Task                                       | Pattern                                               |
| ------------------------------------------ | ----------------------------------------------------- |
| Start an optic chain                       | `Optic.id<S>()`                                       |
| Required field or tuple element            | `.key("field")` / `.key(0)`                           |
| Optional field but keep `undefined`        | `.key("field")`                                       |
| Optional field and drop on `undefined`     | `.optionalKey("field")`                               |
| Presence checked record key or array index | `.at("field")` / `.at(0)`                             |
| Narrow tagged union                        | `.tag("Variant")`                                     |
| Narrow by guard                            | `.refine(guard, annotations?)`                        |
| Validate focused value                     | `.check(Schema.isGreaterThan(0))`                     |
| Remove `undefined` from focus              | `.notUndefined()`                                     |
| Update subset of fields                    | `.pick(["a", "c"])`                                   |
| Update all but some fields                 | `.omit(["b"])`                                        |
| Traverse matching array values             | `.forEach((item) => ...)`                             |
| Map each focused traversal value           | `.modifyAll((a) => ...)`                              |
| Collect traversal values                   | `Optic.getAll(traversal)`                             |
| Traverse records                           | `Optic.entries().forEach((entry) => entry.key(1)...)` |
| Focus `Option.Some`                        | `Optic.some()`                                        |
| Focus `Result.Success`                     | `Optic.success()`                                     |
| Build schema driven optic                  | `Schema.toIso(schema)`                                |
