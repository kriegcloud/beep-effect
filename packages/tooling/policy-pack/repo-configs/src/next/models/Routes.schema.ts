/**
 * Schemas for Next.js custom route configuration objects.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
import { $RepoConfigsId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoConfigsId.create("next/models/Routes.schema");

/**
 * Literal discriminator values supported by Next.js route match predicates.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { RouteHasType } from "@beep/repo-configs/next/models/Routes.schema"
 *
 * const program = S.decodeUnknownEffect(RouteHasType)("header")
 * void Effect.runPromise(program)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const RouteHasType = LiteralKit(["header", "cookie", "query", "host"] as const).pipe(
  $I.annoteSchema("RouteHasType", {
    description: "Literal discriminator values supported by Next.js route match predicates.",
  })
);

/**
 * Literal discriminator values supported by Next.js route match predicates.
 *
 * @example
 * ```ts
 * import type { RouteHasType } from "@beep/repo-configs/next/models/Routes.schema"
 *
 * const type = "header" satisfies RouteHasType
 * void type
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type RouteHasType = typeof RouteHasType.Type;

/**
 * Match predicate used by Next.js rewrites, headers, redirects, and middleware.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { RouteHas } from "@beep/repo-configs/next/models/Routes.schema"
 *
 * const program = S.decodeUnknownEffect(RouteHas)({
 *   type: "header",
 *   key: "x-beep",
 *   value: "1"
 * })
 * void Effect.runPromise(program)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const RouteHas = RouteHasType.toTaggedUnion("type")({
  header: {
    key: S.String,
    value: S.optionalKey(S.String),
  },
  cookie: {
    key: S.String,
    value: S.optionalKey(S.String),
  },
  query: {
    key: S.String,
    value: S.optionalKey(S.String),
  },
  host: {
    key: S.optionalKey(S.Undefined),
    value: S.String,
  },
}).pipe(
  $I.annoteSchema("RouteHas", {
    description: "Match predicate used by Next.js rewrites, headers, redirects, and middleware.",
  })
);

/**
 * Match predicate used by Next.js rewrites, headers, redirects, and middleware.
 *
 * @example
 * ```ts
 * import type { RouteHas } from "@beep/repo-configs/next/models/Routes.schema"
 *
 * const predicate: RouteHas = { type: "host", value: "example.com" }
 * void predicate
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type RouteHas = typeof RouteHas.Type;

const RouteHasList = RouteHas.pipe(S.Array, S.mutable);

const RouteMatchFields = {
  has: S.optionalKey(RouteHasList),
  missing: S.optionalKey(RouteHasList),
};

const RouteBaseFields = {
  source: S.String,
  basePath: S.optionalKey(S.Literal(false)),
  locale: S.optionalKey(S.Literal(false)),
  ...RouteMatchFields,
};

const HeaderEntry = S.Struct({
  key: S.String,
  value: S.String,
});

const RedirectPermanent = S.Struct({
  ...RouteBaseFields,
  destination: S.String,
  priority: S.optionalKey(S.Boolean),
  statusCode: S.optionalKey(S.Never),
  permanent: S.Boolean,
});

const RedirectStatusCode = S.Struct({
  ...RouteBaseFields,
  destination: S.String,
  priority: S.optionalKey(S.Boolean),
  statusCode: S.Number,
  permanent: S.optionalKey(S.Never),
});

/**
 * User-facing Next.js rewrite route configuration.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { Rewrite } from "@beep/repo-configs/next/models/Routes.schema"
 *
 * const program = S.decodeUnknownEffect(Rewrite)({
 *   source: "/old",
 *   destination: "/new"
 * })
 * void Effect.runPromise(program)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const Rewrite = S.Struct({
  ...RouteBaseFields,
  destination: S.String,
}).pipe(
  $I.annoteSchema("Rewrite", {
    description: "User-facing Next.js rewrite route configuration.",
    documentation:
      "Models the public Next.js rewrite fields and omits internal routing fields such as internal and regex.",
  })
);

/**
 * User-facing Next.js rewrite route configuration.
 *
 * @example
 * ```ts
 * import type { Rewrite } from "@beep/repo-configs/next/models/Routes.schema"
 *
 * const rewrite: Rewrite = { source: "/old", destination: "/new" }
 * void rewrite
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Rewrite = typeof Rewrite.Type;

/**
 * User-facing Next.js response header route configuration.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { Header } from "@beep/repo-configs/next/models/Routes.schema"
 *
 * const program = S.decodeUnknownEffect(Header)({
 *   source: "/secure",
 *   headers: [{ key: "x-frame-options", value: "deny" }]
 * })
 * void Effect.runPromise(program)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const Header = S.Struct({
  ...RouteBaseFields,
  headers: HeaderEntry.pipe(S.Array, S.mutable),
}).pipe(
  $I.annoteSchema("Header", {
    description: "User-facing Next.js response header route configuration.",
    documentation: "Models the public Next.js header fields and omits internal routing fields such as internal.",
  })
);

/**
 * User-facing Next.js response header route configuration.
 *
 * @example
 * ```ts
 * import type { Header } from "@beep/repo-configs/next/models/Routes.schema"
 *
 * const header: Header = {
 *   source: "/secure",
 *   headers: [{ key: "x-frame-options", value: "deny" }]
 * }
 * void header
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Header = typeof Header.Type;

/**
 * User-facing Next.js redirect route configuration.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { Redirect } from "@beep/repo-configs/next/models/Routes.schema"
 *
 * const program = S.decodeUnknownEffect(Redirect)({
 *   source: "/old",
 *   destination: "/new",
 *   permanent: true
 * })
 * void Effect.runPromise(program)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const Redirect = S.Union([RedirectPermanent, RedirectStatusCode]).pipe(
  $I.annoteSchema("Redirect", {
    description: "User-facing Next.js redirect route configuration.",
    documentation: "Models the public Next.js redirect fields and omits internal routing fields such as internal.",
  })
);

/**
 * User-facing Next.js redirect route configuration.
 *
 * @example
 * ```ts
 * import type { Redirect } from "@beep/repo-configs/next/models/Routes.schema"
 *
 * const redirect: Redirect = {
 *   source: "/old",
 *   destination: "/new",
 *   statusCode: 307
 * }
 * void redirect
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Redirect = typeof Redirect.Type;

/**
 * Next.js middleware route matcher configuration.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { Middleware } from "@beep/repo-configs/next/models/Routes.schema"
 *
 * const program = S.decodeUnknownEffect(Middleware)({
 *   source: "/admin/:path*",
 *   locale: false
 * })
 * void Effect.runPromise(program)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const Middleware = S.Struct({
  source: S.String,
  locale: S.optionalKey(S.Literal(false)),
  ...RouteMatchFields,
}).pipe(
  $I.annoteSchema("Middleware", {
    description: "Next.js middleware route matcher configuration.",
  })
);

/**
 * Next.js middleware route matcher configuration.
 *
 * @example
 * ```ts
 * import type { Middleware } from "@beep/repo-configs/next/models/Routes.schema"
 *
 * const middleware: Middleware = { source: "/admin/:path*", locale: false }
 * void middleware
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Middleware = typeof Middleware.Type;
