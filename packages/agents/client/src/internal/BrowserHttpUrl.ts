/**
 * Package-private browser HTTP URL resolution.
 *
 * @packageDocumentation
 * @category internal
 * @since 0.0.0
 */

import { $AgentsClientId } from "@beep/identity";
import { O, P, pipe, Str } from "@beep/utils";
import { dual } from "effect/Function";
import * as Result from "effect/Result";
import * as S from "effect/Schema";

const $I = $AgentsClientId.create("internal/BrowserHttpUrl");

class BrowserHttpLocation extends S.Opaque<BrowserHttpLocation, { readonly brand: unique symbol }>()(
  S.Struct({
    origin: S.String,
  }).pipe(
    $I.annoteSchema("BrowserHttpLocation", {
      description: "Browser location fields required for HTTP URL resolution.",
    })
  )
) {}

/**
 * Browser http runtime.
 *
 * @category models
 * @since 0.0.0
 */
class BrowserHttpRuntime extends S.Opaque<BrowserHttpRuntime, { readonly brand: unique symbol }>()(
  S.Struct({
    location: BrowserHttpLocation,
  }).pipe(
    $I.annoteSchema("BrowserHttpRuntime", {
      description: "Browser http runtime.",
    })
  )
) {}

interface ResolveBrowserHttpUrl {
  (runtime: typeof BrowserHttpRuntime.Encoded | undefined, path: `/${string}`): O.Option<string>;
  (path: `/${string}`): (runtime: typeof BrowserHttpRuntime.Encoded | undefined) => O.Option<string>;
}

/**
 * Resolve a root-relative path against an HTTP(S) browser origin.
 *
 * Missing runtimes, non-HTTP origins, and malformed origins resolve to
 * {@link O.none} so callers retain ownership of their fallback policy.
 *
 * @category internal
 * @since 0.0.0
 */
export const resolveBrowserHttpUrl: ResolveBrowserHttpUrl = dual(
  2,
  (runtime, path): O.Option<string> =>
    pipe(
      O.fromUndefinedOr(runtime),
      O.map((current) => current.location.origin),
      O.filter(P.or(Str.startsWith("http://"), Str.startsWith("https://"))),
      O.flatMap((origin) =>
        pipe(
          Result.try(() => new URL(path, origin).href),
          Result.getSuccess
        )
      )
    )
);
