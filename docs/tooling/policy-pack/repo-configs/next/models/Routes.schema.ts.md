---
title: Routes.schema.ts
nav_order: 18
parent: "@beep/repo-configs"
---

## Routes.schema.ts overview

Schemas for Next.js custom route configuration objects.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Header (type alias)](#header-type-alias)
  - [Middleware (type alias)](#middleware-type-alias)
  - [Redirect (type alias)](#redirect-type-alias)
  - [Rewrite (type alias)](#rewrite-type-alias)
  - [RouteHas (type alias)](#routehas-type-alias)
  - [RouteHasType (type alias)](#routehastype-type-alias)
- [schemas](#schemas)
  - [Header](#header)
  - [Middleware](#middleware)
  - [Redirect](#redirect)
  - [Rewrite](#rewrite)
  - [RouteHas](#routehas)
  - [RouteHasType](#routehastype)
---

# models

## Header (type alias)

User-facing Next.js response header route configuration.

**Example**

```ts
import type { Header } from "@beep/repo-configs/next/models/Routes.schema"
const header: Header = {
  source: "/secure",
  headers: [{ key: "x-frame-options", value: "deny" }]
}
console.log(header)
```

**Signature**

```ts
type Header = typeof Header.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Routes.schema.ts#L268)

Since v0.0.0

## Middleware (type alias)

Next.js middleware route matcher configuration.

**Example**

```ts
import type { Middleware } from "@beep/repo-configs/next/models/Routes.schema"
const middleware: Middleware = { source: "/admin/:path*", locale: false }
console.log(middleware)
```

**Signature**

```ts
type Middleware = typeof Middleware.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Routes.schema.ts#L344)

Since v0.0.0

## Redirect (type alias)

User-facing Next.js redirect route configuration.

**Example**

```ts
import type { Redirect } from "@beep/repo-configs/next/models/Routes.schema"
const redirect: Redirect = {
  source: "/old",
  destination: "/new",
  statusCode: 307
}
console.log(redirect)
```

**Signature**

```ts
type Redirect = typeof Redirect.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Routes.schema.ts#L311)

Since v0.0.0

## Rewrite (type alias)

User-facing Next.js rewrite route configuration.

**Example**

```ts
import type { Rewrite } from "@beep/repo-configs/next/models/Routes.schema"
const rewrite: Rewrite = { source: "/old", destination: "/new" }
console.log(rewrite)
```

**Signature**

```ts
type Rewrite = typeof Rewrite.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Routes.schema.ts#L232)

Since v0.0.0

## RouteHas (type alias)

Match predicate used by Next.js rewrites, headers, redirects, and middleware.

**Example**

```ts
import type { RouteHas } from "@beep/repo-configs/next/models/Routes.schema"
const predicate: RouteHas = { type: "host", value: "example.com" }
console.log(predicate)
```

**Signature**

```ts
type RouteHas = typeof RouteHas.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Routes.schema.ts#L100)

Since v0.0.0

## RouteHasType (type alias)

Literal discriminator values supported by Next.js route match predicates.

**Example**

```ts
import type { RouteHasType } from "@beep/repo-configs/next/models/Routes.schema"
const type = "header" satisfies RouteHasType
console.log(type)
```

**Signature**

```ts
type RouteHasType = typeof RouteHasType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Routes.schema.ts#L45)

Since v0.0.0

# schemas

## Header

User-facing Next.js response header route configuration.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { Header } from "@beep/repo-configs/next/models/Routes.schema"
const program = S.decodeUnknownEffect(Header)({
  source: "/secure",
  headers: [{ key: "x-frame-options", value: "deny" }]
})
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const Header: typeof HeaderRoute
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Routes.schema.ts#L251)

Since v0.0.0

## Middleware

Next.js middleware route matcher configuration.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { Middleware } from "@beep/repo-configs/next/models/Routes.schema"
const program = S.decodeUnknownEffect(Middleware)({
  source: "/admin/:path*",
  locale: false
})
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const Middleware: typeof MiddlewareRoute
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Routes.schema.ts#L330)

Since v0.0.0

## Redirect

User-facing Next.js redirect route configuration.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { Redirect } from "@beep/repo-configs/next/models/Routes.schema"
const program = S.decodeUnknownEffect(Redirect)({
  source: "/old",
  destination: "/new",
  permanent: true
})
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const Redirect: AnnotatedSchema<S.Union<readonly [typeof RedirectPermanent, typeof RedirectStatusCode]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Routes.schema.ts#L288)

Since v0.0.0

## Rewrite

User-facing Next.js rewrite route configuration.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { Rewrite } from "@beep/repo-configs/next/models/Routes.schema"
const program = S.decodeUnknownEffect(Rewrite)({
  source: "/old",
  destination: "/new"
})
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const Rewrite: typeof RewriteRoute
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Routes.schema.ts#L218)

Since v0.0.0

## RouteHas

Match predicate used by Next.js rewrites, headers, redirects, and middleware.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { RouteHas } from "@beep/repo-configs/next/models/Routes.schema"
const program = S.decodeUnknownEffect(RouteHas)({
  type: "header",
  key: "x-beep",
  value: "1"
})
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const RouteHas: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.tag<"header">; readonly key: S.String; readonly value: S.optionalKey<S.String>; }> & { readonly Type: { readonly type: "header"; }; }, S.Struct<{ readonly type: S.tag<"cookie">; readonly key: S.String; readonly value: S.optionalKey<S.String>; }> & { readonly Type: { readonly type: "cookie"; }; }, S.Struct<{ readonly type: S.tag<"query">; readonly key: S.String; readonly value: S.optionalKey<S.String>; }> & { readonly Type: { readonly type: "query"; }; }, S.Struct<{ readonly type: S.tag<"host">; readonly key: S.optionalKey<S.Undefined>; readonly value: S.String; }> & { readonly Type: { readonly type: "host"; }; }]> & TaggedUnionUtils<"type", readonly [S.Struct<{ readonly type: S.tag<"header">; readonly key: S.String; readonly value: S.optionalKey<S.String>; }> & { readonly Type: { readonly type: "header"; }; }, S.Struct<{ readonly type: S.tag<"cookie">; readonly key: S.String; readonly value: S.optionalKey<S.String>; }> & { readonly Type: { readonly type: "cookie"; }; }, S.Struct<{ readonly type: S.tag<"query">; readonly key: S.String; readonly value: S.optionalKey<S.String>; }> & { readonly Type: { readonly type: "query"; }; }, S.Struct<{ readonly type: S.tag<"host">; readonly key: S.optionalKey<S.Undefined>; readonly value: S.String; }> & { readonly Type: { readonly type: "host"; }; }], [S.Struct<{ readonly type: S.tag<"header">; readonly key: S.String; readonly value: S.optionalKey<S.String>; }> & { readonly Type: { readonly type: "header"; }; }, S.Struct<{ readonly type: S.tag<"cookie">; readonly key: S.String; readonly value: S.optionalKey<S.String>; }> & { readonly Type: { readonly type: "cookie"; }; }, S.Struct<{ readonly type: S.tag<"query">; readonly key: S.String; readonly value: S.optionalKey<S.String>; }> & { readonly Type: { readonly type: "query"; }; }, S.Struct<{ readonly type: S.tag<"host">; readonly key: S.optionalKey<S.Undefined>; readonly value: S.String; }> & { readonly Type: { readonly type: "host"; }; }]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Routes.schema.ts#L65)

Since v0.0.0

## RouteHasType

Literal discriminator values supported by Next.js route match predicates.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { RouteHasType } from "@beep/repo-configs/next/models/Routes.schema"
const program = S.decodeUnknownEffect(RouteHasType)("header")
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const RouteHasType: AnnotatedSchema<LiteralKit<readonly ["header", "cookie", "query", "host"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/Routes.schema.ts#L27)

Since v0.0.0