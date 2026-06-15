---
title: HttpProtocol.schema.ts
nav_order: 118
parent: "@beep/schema"
---

## HttpProtocol.schema.ts overview

Module for HTTP protocol ("http" or "https").

Since v0.0.0

---
## Exports Grouped by Category
- [schemas](#schemas)
  - [Schema](#schema)
- [validation](#validation)
  - [HttpProtocol](#httpprotocol)
  - [HttpProtocol (type alias)](#httpprotocol-type-alias)
---

# schemas

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<LiteralKit<readonly ["http", "https"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpProtocol/HttpProtocol.schema.ts#L45)

Since v0.0.0

# validation

## HttpProtocol

An HTTP protocol ("http" or "https")

**Example**

```ts
import { HttpProtocol } from "@beep/schema/HttpProtocol"

console.log(HttpProtocol.Options)
```

**Signature**

```ts
declare const HttpProtocol: AnnotatedSchema<LiteralKit<readonly ["http", "https"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpProtocol/HttpProtocol.schema.ts#L25)

Since v0.0.0

## HttpProtocol (type alias)

{@inheritDoc HttpProtocol}

**Signature**

```ts
type HttpProtocol = typeof HttpProtocol.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpProtocol/HttpProtocol.schema.ts#L37)

Since v0.0.0