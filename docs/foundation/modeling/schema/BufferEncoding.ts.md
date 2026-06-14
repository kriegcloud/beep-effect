---
title: BufferEncoding.ts
nav_order: 7
parent: "@beep/schema"
---

## BufferEncoding.ts overview

A schema module for BufferEncoding string literal's

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [BufferEncoding (type alias)](#bufferencoding-type-alias)
- [validation](#validation)
  - [BuffEncoding](#buffencoding)
---

# models

## BufferEncoding (type alias)

{@inheritDoc BuffEncoding}

**Example**

```ts
import type { BufferEncoding } from "@beep/schema/BufferEncoding"

const enc: BufferEncoding = "hex"
```

**Signature**

```ts
type BufferEncoding = typeof BuffEncoding.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/BufferEncoding.ts#L59)

Since v0.0.0

# validation

## BuffEncoding

Schema for Node.js `BufferEncoding` string literals (`"utf8"`, `"hex"`, `"base64"`, etc.).

**Example**

```ts
import * as S from "effect/Schema"
import { BuffEncoding } from "@beep/schema/BufferEncoding"

const encoding = S.decodeUnknownSync(BuffEncoding)("utf8")
console.log(encoding) // "utf8"
```

**Signature**

```ts
declare const BuffEncoding: AnnotatedSchema<LiteralKit<readonly ["ascii", "utf8", "utf-8", "utf16le", "utf-16le", "ucs2", "ucs-2", "base64", "base64url", "latin1", "binary", "hex"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/BufferEncoding.ts#L27)

Since v0.0.0