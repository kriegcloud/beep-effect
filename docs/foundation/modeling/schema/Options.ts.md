---
title: Options.ts
nav_order: 164
parent: "@beep/schema"
---

## Options.ts overview

Reusable schema constructors for boundaries that model absence with `Option`.

This module provides repository-named wrappers around Effect's option schema
helpers when the local codebase benefits from a more explicit boundary name.

Since v0.0.0

---
## Exports Grouped by Category
- [schemas](#schemas)
  - [OptionFromOptionalNullishKey](#optionfromoptionalnullishkey)
---

# schemas

## OptionFromOptionalNullishKey

Decodes an optional object key whose value may also be `null` or `undefined`
into a required `Option`.

This helper is a repository-named wrapper around
`S.OptionFromOptionalNullOr`. It is intended for object and class
fields where the boundary allows all common "missing" shapes:

- omitted key
- present key with `undefined`
- present key with `null`

Decoding turns each of those shapes into `None`. Any present non-nullish
value is decoded as `Some`.

Encoding is controlled by `options.onNoneEncoding`:

- `"omit"`: encode `None` by omitting the key
- `null`: encode `None` as `null`
- `undefined`: encode `None` as `undefined`

**Example**

```ts
import * as O from "effect/Option"
import * as S from "effect/Schema"
import { OptionFromOptionalNullishKey } from "@beep/schema"

const Payload = S.Struct({

})

const decode = S.decodeUnknownSync(Payload)

const missing = decode({})
const nullish = decode({ nickname: null })
const present = decode({ nickname: "beep" })

console.log([missing, nullish, present, O.none<string>()])
```

**Example**

```ts
import * as O from "effect/Option"
import * as S from "effect/Schema"
import { OptionFromOptionalNullishKey } from "@beep/schema"

const Payload = S.Struct({

})

const encode = S.encodeSync(Payload)

const encodedNone = encode({ homepage: O.none() })
const encodedSome = encode({ homepage: O.some(new URL("https://example.com")) })

console.log([encodedNone, encodedSome])
```

**Signature**

```ts
declare const OptionFromOptionalNullishKey: <Schema extends S.Top>(schema: Schema, options?: { readonly onNoneEncoding: "omit" | null | undefined; }) => S.OptionFromOptionalNullOr<Schema>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Options.ts#L78)

Since v0.0.0