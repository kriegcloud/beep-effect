---
title: RegExp.ts
nav_order: 181
parent: "@beep/schema"
---

## RegExp.ts overview

Branded schema and one-way transform for JavaScript regular expression
pattern strings.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [RegExpFromStr (type alias)](#regexpfromstr-type-alias)
  - [RegExpStr (type alias)](#regexpstr-type-alias)
- [validation](#validation)
  - [RegExpFromStr](#regexpfromstr)
  - [RegExpStr](#regexpstr)
---

# models

## RegExpFromStr (type alias)

Type for `RegExpFromStr`.

**Example**

```ts
import type { RegExpFromStr } from "@beep/schema/RegExp"

const re: RegExpFromStr = /hello/ as RegExpFromStr
```

**Signature**

```ts
type RegExpFromStr = typeof RegExpFromStr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/RegExp.ts#L130)

Since v0.0.0

## RegExpStr (type alias)

Type for `RegExpStr`.

**Example**

```ts
import type { RegExpStr } from "@beep/schema/RegExp"

const pattern: RegExpStr = "\\d+" as RegExpStr
```

**Signature**

```ts
type RegExpStr = typeof RegExpStr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/RegExp.ts#L78)

Since v0.0.0

# validation

## RegExpFromStr

One-way schema that decodes a valid pattern string into a JavaScript `RegExp` object.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { RegExpFromStr } from "@beep/schema/RegExp"

const program = S.decodeUnknownEffect(RegExpFromStr)("[a-z]+")
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const RegExpFromStr: AnnotatedSchema<S.decodeTo<S.RegExp, S.brand<S.String, "RegExpStr"> & SchemaStatics<S.brand<S.String, "RegExpStr">>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/RegExp.ts#L104)

Since v0.0.0

## RegExpStr

Branded schema for strings that can be converted directly to a JavaScript `RegExp`.

**Example**

```ts
import * as S from "effect/Schema"
import { RegExpStr } from "@beep/schema/RegExp"

const pattern = S.decodeUnknownSync(RegExpStr)("^[a-z]+$")
console.log(pattern) // "^[a-z]+$"
```

**Signature**

```ts
declare const RegExpStr: AnnotatedSchema<S.brand<S.String, "RegExpStr">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/RegExp.ts#L58)

Since v0.0.0