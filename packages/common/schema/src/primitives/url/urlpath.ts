/**
 * Schema for validating Next.js-style URL pathnames (dynamic segments, static assets, and optional query strings).
 *
 * Ensures all values start with `/`, contain only safe characters, and optionally append query parameters compliant with RFC3986 safe sets.
 *
 * @example
 * import { URLPath } from "@beep/schema/primitives/url/urlpath";
 *
 * URLPath.make("/dashboard/settings?tab=general");
 *
 * @category Primitives/Misc
 * @since 0.1.0
 */
import { makeBranded } from "@beep/schema/core/utils/brands";
import type { StringTypes } from "@beep/types";
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as regexes from "../../internal/regex/regexes";
import { Id } from "./_id";

const pathExamples = [
  "/icons/navbar/ic-lock.svg",
  "/api/users/123",
  "/dashboard/settings",
  "/_next/static/chunks/123.js",
  "/",
  "/auth/verify/email?token=example",
] as const satisfies readonly [`/${string}`, ...`/${string}`[]];

/**
 * URLPath schema enforcing `/segment/segment` patterns with safe optional query parameters.
 *
 * @example
 * import { URLPath } from "@beep/schema/primitives/url/urlpath";
 *
 * const path = URLPath.make("/api/users/[id]");
 *
 * @category Primitives/Misc
 * @since 0.1.0
 */
export class URLPath extends S.TemplateLiteral("/", S.String)
  .pipe(
    S.pattern(regexes.URL_PATH_WITH_OPTIONAL_RFC3986_QUERY_REGEXP),
    S.annotations({
      title: "Next.js Path",
      description: "A valid Next.js pathname including static assets, API routes, and App Router pages.",
      examples: pathExamples,
      arbitrary: () => (fc) => {
        const segments = fc.array(
          fc.oneof(
            fc.constantFrom("icons", "api", "dashboard", "users", "_next", "static"),
            fc
              .stringMatching(regexes.URL_PATH_SEGMENT_SAFE_CHARS_REGEXP)
              .filter((segment) => segment.length > 0 && segment.length < 20)
          ),
          { minLength: 0, maxLength: 4 }
        );

        const filename = fc.option(
          fc.oneof(
            fc.constantFrom("ic-lock.svg", "favicon.ico", "index.js", "page.tsx"),
            fc.stringMatching(regexes.URL_PATH_FILENAME_WITH_EXTENSION_REGEXP).filter((segment) => segment.length < 30)
          ),
          { nil: undefined }
        );

        const queryParams = fc.option(
          fc
            .array(
              fc
                .record({
                  key: fc
                    .stringMatching(regexes.URL_QUERY_PARAM_KEY_TOKEN_REGEXP)
                    .filter((value) => value.length > 0 && value.length < 20),
                  value: fc
                    .stringMatching(regexes.URL_QUERY_PARAM_VALUE_RFC3986_SAFE_REGEXP)
                    .filter((value) => value.length > 0 && value.length < 50),
                })
                .map(({ key, value }) => `${key}=${value}`),
              { minLength: 1, maxLength: 3 }
            )
            .map((params) => A.join("&")(params)),
          { nil: undefined }
        );

        return fc.tuple(segments, filename, queryParams).map(([segs, file, query]) => {
          const joinedSegments = A.join("/")(segs);
          const needsSlashBetween = segs.length > 0 && file ? "/" : "";
          const base = Str.concat(`${joinedSegments}${needsSlashBetween}${file ?? ""}`)("/");
          const normalized = base === "//" ? "/" : base;
          return makeBranded(query ? `${normalized}?${query}` : normalized);
        });
      },
    }),
    S.brand("URLPath")
  )
  .annotations(
    Id.annotations("urlpath/URLPath", {
      description: "A valid Next.js pathname that always starts with `/` and contains safe characters.",
    })
  ) {
  /** Determines whether the provided input is a branded URL path. */
  static readonly is = S.is(URLPath);
}

/**
 * Namespace exposing helper types for {@link URLPath}.
 *
 * @example
 * import type { URLPath } from "@beep/schema/primitives/url/urlpath";
 *
 * type Path = URLPath.Type;
 *
 * @category Primitives/Misc
 * @since 0.1.0
 */
export declare namespace URLPath {
  /**
   * Runtime type for {@link URLPath}.
   *
   * @example
   * import type { URLPath } from "@beep/schema/primitives/url/urlpath";
   *
   * let value: URLPath.Type;
   *
   * @category Primitives/Misc
   * @since 0.1.0
   */
  export type Type = typeof URLPath.Type;
  /**
   * Encoded type for {@link URLPath}.
   *
   * @example
   * import type { URLPath } from "@beep/schema/primitives/url/urlpath";
   *
   * let encoded: URLPath.Encoded;
   *
   * @category Primitives/Misc
   * @since 0.1.0
   */
  export type Encoded = typeof URLPath.Encoded;
  /**
   * Branded helper used by downstream entities.
   *
   * @example
   * import type { StringTypes } from "@beep/types";
   * import type { URLPath } from "@beep/schema/primitives/url/urlpath";
   *
   * type BrandedPath = URLPath.Branded<StringTypes.NonEmptyString>;
   *
   * @category Primitives/Misc
   * @since 0.1.0
   */
  export type Branded<Value extends StringTypes.NonEmptyString> = B.Branded<Value, "URLPath">;
}
