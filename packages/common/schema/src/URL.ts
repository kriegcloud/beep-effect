/**
 * A module housing URL related schemas
 *
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { Brand, pipe, Result } from "effect";
import * as S from "effect/Schema";
import * as SchemaUtils from "./SchemaUtils/index.ts";
import { NonEmptyTrimmedStr } from "./String.ts";

const $I = $SchemaId.create("URL");
/**
 * A type guard for URL a URL encoded string
 *
 * @category Validation
 * @since 0.0.0
 */
const isURLStr = (u: unknown): u is URLStr =>
  S.is(NonEmptyTrimmedStr)(u) &&
  pipe(
    Result.try(() => new URL(u)),
    Result.isSuccess
  );

/**
 * A Schema filter for a URL encoded as a string
 *
 * @category Validation
 * @since 0.0.0
 */
const filterURLStr = S.makeFilter(isURLStr, {
  message: "URL must be a valid URL encoded string",
});

/**
 * A URL encoded string constructor
 *
 * @category Validation
 * @since 0.0.0
 */
const urlStr = Brand.check<URLStr>(filterURLStr);

/**
 * A branded schema for URL-encoded strings validated against `new URL()`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { URLStr } from "@beep/schema/URL"
 *
 * const url = S.decodeUnknownSync(URLStr)("https://example.com")
 * console.log(url)
 * ```
 *
 * @category Validation
 * @since 0.0.0
 */
export const URLStr = NonEmptyTrimmedStr.pipe(
  S.fromBrand("URLStr", urlStr),
  SchemaUtils.withStatics(() => ({
    filter: filterURLStr,
    is: isURLStr,
    make: urlStr,
  })),
  $I.annoteSchema("URLStr", {
    description: "A URL encoded as a string",
  })
);

/**
 * {@inheritDoc URLStr}
 *
 * @example
 * ```ts
 * import type { URLStr } from "@beep/schema/URL"
 *
 * const endpoint: URLStr = "https://api.example.com" as URLStr
 * ```
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type URLStr = Brand.Branded<NonEmptyTrimmedStr, "URLStr">;
