---
title: TaggedErrorClass.errors.ts
nav_order: 209
parent: "@beep/schema"
---

## TaggedErrorClass.errors.ts overview

Typed tagged error class wrappers over Effect Schema classes.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [TaggedErrorClass](#taggederrorclass)
  - [TaggedErrorClassConstructor (type alias)](#taggederrorclassconstructor-type-alias)
- [models](#models)
  - [TaggedErrorClassFactory (interface)](#taggederrorclassfactory-interface)
  - [TaggedErrorClassFromFields (type alias)](#taggederrorclassfromfields-type-alias)
  - [TaggedErrorClassFromSchema (type alias)](#taggederrorclassfromschema-type-alias)
  - [TaggedErrorNewInput (type alias)](#taggederrornewinput-type-alias)
---

# constructors

## TaggedErrorClass

Create a tagged error class with `_tag` discrimination and constructor input inferred from the schema.

Wraps `S.TaggedErrorClass` and automatically prepends a `_tag` field while
preserving a typed `extend(...)` API for derived tagged error classes.

**Example**

```ts
import * as S from "effect/Schema"
import { Effect } from "effect"
import { TaggedErrorClass } from "@beep/schema"

class NotFound extends TaggedErrorClass<NotFound>()("NotFound", {
  message: S.String
}) {}

const err = NotFound.make({ message: "User not found" })

const program = Effect.fail(err)

console.log(program)
```

**Example**

```ts
import * as S from "effect/Schema"
import { Effect } from "effect"
import { TaggedErrorClass } from "@beep/schema"

class DbError extends TaggedErrorClass<DbError>()("DbError", {
  query: S.String
}) {}

const program = Effect.try({
  try: () => "ok",
  catch: () => DbError.make({ query: "select 1" })
})

console.log(program)
```

**Signature**

```ts
declare const TaggedErrorClass: TaggedErrorClassConstructor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/TaggedErrorClass/TaggedErrorClass.errors.ts#L294)

Since v0.0.0

## TaggedErrorClassConstructor (type alias)

Callable constructor type for building tagged error classes.

**Example**

```ts
import * as S from "effect/Schema"
import { TaggedErrorClass, type TaggedErrorClassConstructor } from "@beep/schema/TaggedErrorClass"

const makeTaggedErrorClass: TaggedErrorClassConstructor = TaggedErrorClass

class NotFound extends makeTaggedErrorClass<NotFound>()("NotFound", {
  message: S.String
}) {}

const error = NotFound.make({ message: "User not found" })

console.log(error)
```

**Signature**

```ts
type TaggedErrorClassConstructor = <Self, Brand = {}>(
  identifier?: undefined | string
) => TaggedErrorClassFactory<Self, Brand>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/TaggedErrorClass/TaggedErrorClass.errors.ts#L244)

Since v0.0.0

# models

## TaggedErrorClassFactory (interface)

Factory interface returned by `TaggedErrorClass` that accepts a tag, fields, and optional annotations.

**Example**

```ts
import * as S from "effect/Schema"
import { TaggedErrorClass, type TaggedErrorClassFactory } from "@beep/schema/TaggedErrorClass"

class NotFound extends TaggedErrorClass<NotFound>()("NotFound", {
  message: S.String
}) {}

const factory: TaggedErrorClassFactory<NotFound> = TaggedErrorClass<NotFound>()
const SameShapeError = factory("SameShapeError", {
  message: S.String
})
const original = NotFound.make({ message: "User not found" })
const error = new SameShapeError({ message: "User not found" })

console.log(original)
console.log(error)
```

**Signature**

```ts
export interface TaggedErrorClassFactory<Self, Brand = {}> {
  <Tag extends string, const Fields extends TaggedErrorFields>(
    tag: Tag,
    fields: Fields,
    annotations?: S.Annotations.Declaration<Self, readonly [TaggedStructFromFields<Tag, Fields>]>
  ): TaggedErrorClassFromFields<Self, Tag, Fields, Brand>;

  <Tag extends string, Schema extends TaggedErrorStruct>(
    tag: Tag,
    schema: Schema,
    annotations?: S.Annotations.Declaration<Self, readonly [TaggedStructFromSchema<Tag, Schema>]>
  ): TaggedErrorClassFromSchema<Self, Tag, Schema, Brand>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/TaggedErrorClass/TaggedErrorClass.errors.ts#L208)

Since v0.0.0

## TaggedErrorClassFromFields (type alias)

Tagged error class type derived from a fields object.

**Example**

```ts
import * as S from "effect/Schema"
import { TaggedErrorClass, type TaggedErrorClassFromFields } from "@beep/schema/TaggedErrorClass"

class NotFound extends TaggedErrorClass<NotFound>()("NotFound", {
  message: S.String
}) {}

type NotFoundClass = TaggedErrorClassFromFields<
  NotFound,
  "NotFound",
  { readonly message: typeof S.String }
>

const fromClass = (errorClass: NotFoundClass) => new errorClass({ message: "User not found" })
const error = fromClass(NotFound)

console.log(error)
```

**Signature**

```ts
type TaggedErrorClassFromFields<Self, Tag, Fields, Brand> = TaggedErrorClassWithExtend<TaggedErrorBase<Self, TaggedStructFromFields<Tag, Fields>, Brand>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/TaggedErrorClass/TaggedErrorClass.errors.ts#L143)

Since v0.0.0

## TaggedErrorClassFromSchema (type alias)

Tagged error class type derived from a struct schema.

**Example**

```ts
import * as S from "effect/Schema"
import { TaggedErrorClass, type TaggedErrorClassFromSchema } from "@beep/schema/TaggedErrorClass"

const NotFoundFields = S.Struct({
  message: S.String
})

class NotFound extends TaggedErrorClass<NotFound>()("NotFound", NotFoundFields) {}

type NotFoundClass = TaggedErrorClassFromSchema<NotFound, "NotFound", typeof NotFoundFields>

const fromClass = (errorClass: NotFoundClass) => new errorClass({ message: "User not found" })
const error = fromClass(NotFound)

console.log(error)
```

**Signature**

```ts
type TaggedErrorClassFromSchema<Self, Tag, Schema, Brand> = TaggedErrorClassWithExtend<TaggedErrorBase<Self, TaggedStructFromSchema<Tag, Schema>, Brand>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/TaggedErrorClass/TaggedErrorClass.errors.ts#L175)

Since v0.0.0

## TaggedErrorNewInput (type alias)

Input type for constructing a tagged error, omitting the discriminator `_tag`.

**Example**

```ts
import * as S from "effect/Schema"
import { TaggedErrorClass, type TaggedErrorNewInput } from "@beep/schema/TaggedErrorClass"

class NotFound extends TaggedErrorClass<NotFound>()("NotFound", {
  message: S.String
}) {}

const input: TaggedErrorNewInput<typeof NotFound> = {
  message: "User not found"
}
const error = NotFound.make(input)

console.log(error)
```

**Signature**

```ts
type TaggedErrorNewInput<ErrorClass> = Omit<
  S.Schema.Type<TaggedErrorSchema<ErrorClass>>,
  "_tag"
>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/TaggedErrorClass/TaggedErrorClass.errors.ts#L84)

Since v0.0.0