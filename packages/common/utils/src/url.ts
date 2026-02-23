import { $UtilsId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { thunk } from "./thunk";

const $I = $UtilsId.create("@beep/utils/url");

const PLACEHOLDER_BASE_URL = "https://localhost:9999";
const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
const TRAILING_SLASH_URL_REGEX = /\/(?:[?#].*)?$/;

export type QueryParams = Record<string, string | number | null | undefined> | URLSearchParams;

/**
 * Safely but conveniently build a URLSearchParams instance from a given
 * dictionary of values. For example:
 *
 *   {
 *     "foo": "bar+qux/baz",
 *     "empty": "",
 *     "n": 42,
 *     "nope": undefined,
 *     "alsonope": null,
 *   }
 *
 * Will produce a value that will get serialized as
 * `foo=bar%2Bqux%2Fbaz&empty=&n=42`.
 *
 * Notice how the number is converted to its string representation
 * automatically and the `null`/`undefined` values simply don't end up in the
 * URL.
 */
export const toURLSearchParams = (params: Record<string, string | number | null | undefined>): URLSearchParams => {
  const result = new URLSearchParams();
  F.pipe(
    params,
    R.toEntries,
    A.forEach(([key, value]) => {
      if (P.isNotNullable(value)) {
        result.set(key, value.toString());
      }
    })
  );
  return result;
};

/**
 * Concatenates a path to an existing URL.
 */
export const urlJoin = (baseUrl: string | URL, path: string, params?: undefined | QueryParams): string => {
  const url = new URL(path, baseUrl);
  if (P.isNotUndefined(params)) {
    url.search = (params instanceof URLSearchParams ? params : toURLSearchParams(params)).toString();
  }

  return url.toString();
};

/**
 * A string that is guaranteed to be URL safe (where all arguments are properly
 * encoded), only obtainable as the result of using `url` template strings.
 */
export class URLSafeString extends S.String.pipe(S.brand("URLSafeString")).annotations(
  $I.annotations("URLSafeString", {
    description:
      "A string that is guaranteed to be URL safe (where all arguments are properly encoded), only obtainable as the result of using `url` template strings.",
  })
) {}

export declare namespace URLSafeString {
  export type Type = typeof URLSafeString.Type;
  export type Encoded = typeof URLSafeString.Encoded;
}
// export type URLSafeString = B.Brand<string, "URLSafeString">;

/**
 * Builds a URL where each "hole" in the template string will automatically be
 * encodeURIComponent()-escaped, so it's impossible to build invalid URLs.
 */

export const url = (strings: TemplateStringsArray, ...values: Array<string>): URLSafeString.Type =>
  F.pipe(
    strings,
    A.reduce("", (result, str, i) => result + encodeURIComponent(values[i - 1] ?? Str.empty) + str),
    URLSafeString.make
  );

/**
 * Sanitize a URL (normalize www URLs, handle relative URLs, prevent XSS attacks, etc.)
 *
 * Accepted URLs:
 * - Absolute URLs with an http or https protocol (e.g. https://liveblocks.io)
 * - Absolute URLs with a `www` prefix (e.g. www.liveblocks.io)
 * - Relative URLs (e.g. /path/to/page)
 * - Hash-only URLs (e.g. #hash)
 *
 * The presence/absence of trailing slashes is preserved.
 * Rejected URLs are returned as `null`.
 */
export const sanitizeUrl = (url: string): string | null => {
  // If the URL starts with "www.", normalize it as an HTTPS URL
  if (F.pipe(url, Str.startsWith("www."))) {
    url = `https://${url}`;
  }

  // Fast path for hash-only URLs
  if (url === "#") return url;

  const absoluteUrlOpt = S.decodeUnknownOption(S.String.pipe(S.pattern(ABSOLUTE_URL_REGEX)))(url);

  const urlObject = F.pipe(
    absoluteUrlOpt,
    O.match({
      onNone: thunk(new URL(url, PLACEHOLDER_BASE_URL)),
      onSome: thunk(new URL(url)),
    })
  );

  // Only allow http and https protocols
  if (urlObject.protocol !== "http:" && urlObject.protocol !== "https:") return null;

  const trailingSlashOpt = S.decodeUnknownOption(S.String.pipe(S.pattern(TRAILING_SLASH_URL_REGEX)))(url);

  // Instead of using URL.toString(), we rebuild the URL manually
  // to preserve the presence/absence of trailing slashes.
  const sanitizedUrl = F.pipe(
    Match.value({ absoluteUrlOpt, urlObject, trailingSlashOpt }),
    Match.when(
      ({ urlObject }) => urlObject.pathname === "/",
      ({ absoluteUrlOpt, urlObject, trailingSlashOpt }) => {
        // Domain-only URLs always have their pathname set to "/"
        const origin = O.isSome(absoluteUrlOpt) ? urlObject.origin : Str.empty;
        const pathname = O.isSome(trailingSlashOpt) ? "/" : Str.empty;
        return `${origin}${pathname}${urlObject.search}${urlObject.hash}`;
      }
    ),
    Match.orElse(({ absoluteUrlOpt, urlObject, trailingSlashOpt }) => {
      // URLs with a path
      const origin = O.isSome(absoluteUrlOpt) ? urlObject.origin : Str.empty;
      const pathname = Match.value({
        hasTrailingSlash: O.isSome(trailingSlashOpt),
        endsWithSlash: F.pipe(urlObject.pathname, Str.endsWith("/")),
      }).pipe(
        Match.when(
          ({ hasTrailingSlash, endsWithSlash }) => hasTrailingSlash && !endsWithSlash,
          thunk(`${urlObject.pathname}/`)
        ),
        Match.orElse(thunk(urlObject.pathname))
      );
      return `${origin}${pathname}${urlObject.search}${urlObject.hash}`;
    })
  );

  return F.pipe(sanitizedUrl, Match.value, Match.when(Str.isEmpty, F.constNull), Match.orElse(thunk(sanitizedUrl)));
};

/**
 * Construct a URL with optional parameters and hash.
 */
export const generateUrl = (
  url: string,
  params?: undefined | Record<string, string | number | undefined>,
  hash?: undefined | string
): string => {
  const absoluteOpt = S.decodeUnknownOption(S.String.pipe(S.pattern(ABSOLUTE_URL_REGEX)))(url);
  const urlObject = new URL(url, O.isSome(absoluteOpt) ? undefined : PLACEHOLDER_BASE_URL);

  if (P.isNotUndefined(params)) {
    F.pipe(
      params,
      R.toEntries,
      A.forEach(([param, value]) => {
        if (P.isNotNullable(value)) {
          urlObject.searchParams.set(param, String(value));
        }
      })
    );
  }

  if (!urlObject.hash && P.isNotUndefined(hash)) {
    urlObject.hash = `#${hash}`;
  }

  return O.isSome(absoluteOpt) ? urlObject.href : F.pipe(urlObject.href, Str.replace(PLACEHOLDER_BASE_URL, Str.empty));
};

/**
 * Check if a string is a valid URL.
 */
export const isUrl = (str: string): boolean => F.pipe(O.liftThrowable(thunk(new URL(str)))(), O.isSome);
