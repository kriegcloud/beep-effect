---
title: HttpMethod.schema.ts
nav_order: 116
parent: "@beep/schema"
---

## HttpMethod.schema.ts overview

HTTP method literal type kit.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [HttpMethod (type alias)](#httpmethod-type-alias)
- [schemas](#schemas)
  - [HttpMethod](#httpmethod)
  - [HttpMethod_](#httpmethod_)
  - [Literal](#literal)
  - [Schema](#schema)
---

# models

## HttpMethod (type alias)

Runtime type for supported HTTP method tokens.

**Signature**

```ts
type HttpMethod = typeof HttpMethod.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpMethod/HttpMethod.schema.ts#L99)

Since v0.0.0

# schemas

## HttpMethod

HTTP method schema with static helpers for body support and common aliases.

**Example**

```ts
import { HttpMethod } from "@beep/schema/HttpMethod"

console.log(HttpMethod.hasBody("POST"))
```

**Signature**

```ts
declare const HttpMethod: LiteralKit<readonly ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE"], undefined> & SchemaStatics<LiteralKit<readonly ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE"], undefined>> & LiteralKitStatics<readonly ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE"]> & { readonly hasBody: (method: HttpMethodValue) => method is WithBody; readonly all: HashSet.HashSet<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" | "TRACE">; readonly allShort: readonly [readonly ["GET", "get"], readonly ["POST", "post"], readonly ["PUT", "put"], readonly ["DELETE", "del"], readonly ["PATCH", "patch"], readonly ["HEAD", "head"], readonly ["OPTIONS", "options"], readonly ["TRACE", "trace"]]; readonly NoBody: LiteralKit<["GET", "HEAD", "OPTIONS", "TRACE"], undefined> & SchemaStatics<LiteralKit<["GET", "HEAD", "OPTIONS", "TRACE"], undefined>> & LiteralKitStatics<["GET", "HEAD", "OPTIONS", "TRACE"]>; readonly WithBody: LiteralKit<readonly ["POST" | "PUT" | "DELETE" | "PATCH", ...("POST" | "PUT" | "DELETE" | "PATCH")[]], undefined> & SchemaStatics<LiteralKit<readonly ["POST" | "PUT" | "DELETE" | "PATCH", ...("POST" | "PUT" | "DELETE" | "PATCH")[]], undefined>> & LiteralKitStatics<readonly ["POST" | "PUT" | "DELETE" | "PATCH", ...("POST" | "PUT" | "DELETE" | "PATCH")[]]>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpMethod/HttpMethod.schema.ts#L67)

Since v0.0.0

## HttpMethod_

Base literal kit for all supported HTTP method tokens.

**Example**

```ts
import { Literal } from "@beep/schema/HttpMethod"

console.log(Literal.Options)
```

**Signature**

```ts
declare const HttpMethod_: LiteralKit<readonly ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpMethod/HttpMethod.schema.ts#L28)

Since v0.0.0

## Literal

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Literal: LiteralKit<readonly ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpMethod/HttpMethod.schema.ts#L107)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: LiteralKit<readonly ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE"], undefined> & SchemaStatics<LiteralKit<readonly ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE"], undefined>> & LiteralKitStatics<readonly ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE"]> & { readonly hasBody: (method: HttpMethodValue) => method is WithBody; readonly all: HashSet.HashSet<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" | "TRACE">; readonly allShort: readonly [readonly ["GET", "get"], readonly ["POST", "post"], readonly ["PUT", "put"], readonly ["DELETE", "del"], readonly ["PATCH", "patch"], readonly ["HEAD", "head"], readonly ["OPTIONS", "options"], readonly ["TRACE", "trace"]]; readonly NoBody: LiteralKit<["GET", "HEAD", "OPTIONS", "TRACE"], undefined> & SchemaStatics<LiteralKit<["GET", "HEAD", "OPTIONS", "TRACE"], undefined>> & LiteralKitStatics<["GET", "HEAD", "OPTIONS", "TRACE"]>; readonly WithBody: LiteralKit<readonly ["POST" | "PUT" | "DELETE" | "PATCH", ...("POST" | "PUT" | "DELETE" | "PATCH")[]], undefined> & SchemaStatics<LiteralKit<readonly ["POST" | "PUT" | "DELETE" | "PATCH", ...("POST" | "PUT" | "DELETE" | "PATCH")[]], undefined>> & LiteralKitStatics<readonly ["POST" | "PUT" | "DELETE" | "PATCH", ...("POST" | "PUT" | "DELETE" | "PATCH")[]]>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpMethod/HttpMethod.schema.ts#L107)

Since v0.0.0