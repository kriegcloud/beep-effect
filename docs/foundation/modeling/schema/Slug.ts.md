---
title: Slug.ts
nav_order: 202
parent: "@beep/schema"
---

## Slug.ts overview

Branded schema for canonical lowercase slugs safe for a single URL path
segment.

**Example**

```ts
```typescript
import * as S from "effect/Schema";
import { Slug } from "@beep/schema/Slug";

const slug = S.decodeUnknownSync(Slug)("my-post-2");
console.log(slug);
```
```

Since v0.0.0

---
## Exports Grouped by Category
  - [SlugFromStr](#slugfromstr)
- [models](#models)
  - [Slug (type alias)](#slug-type-alias)
---

# constructors

## Slug

Branded schema for canonical lowercase kebab-case slugs.

Validates that a string is non-empty, uses only lowercase ASCII letters,
digits, and hyphens, and does not start or end with a hyphen or contain
repeated hyphens.

**Example**

```ts
import * as S from "effect/Schema"
import { Slug } from "@beep/schema/Slug"

const decode = S.decodeUnknownSync(Slug)

const slug = decode("my-post-2")
console.log(slug) // "my-post-2"
```

**Signature**

```ts
declare const Slug: AnnotatedSchema<S.brand<S.NonEmptyString, "Slug">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Slug.ts#L83)

Since v0.0.0

## SlugFromStr

Non-empty string schema used as the source input for `Slug`.

**Example**

```ts
import { SlugFromStr } from "@beep/schema/Slug"
import * as S from "effect/Schema"

const input = S.decodeUnknownSync(SlugFromStr)("my-post")
console.log(input)
```

**Signature**

```ts
declare const SlugFromStr: S.NonEmptyString
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Slug.ts#L113)

Since v0.0.0

# models

## Slug (type alias)

Branded slug string type extracted from `Slug`.

**Signature**

```ts
type Slug = typeof Slug.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Slug.ts#L96)

Since v0.0.0