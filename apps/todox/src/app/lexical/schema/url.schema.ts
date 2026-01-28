/**
 * URL validation schemas for Lexical utilities.
 *
 * @since 0.1.0
 */
import { $TodoxId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $TodoxId.create("lexical/schema/url");

/**
 * Supported URL protocols for safe links.
 *
 * @since 0.1.0
 */
export const SupportedProtocol = S.Literal("http:", "https:", "mailto:", "sms:", "tel:").annotations(
  $I.annotations("SupportedProtocol", {
    description: "Supported URL protocols for safe links",
  })
);

export declare namespace SupportedProtocol {
  export type Type = typeof SupportedProtocol.Type;
}

/**
 * URL validation pattern.
 * Matches common URL formats including protocol, domain, path, query, and fragment.
 *
 * @since 0.1.0
 */
export const UrlPattern = S.String.pipe(
  S.pattern(
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??[-+=&;%@.\w_]*#?\w*)?)/
  ),
  S.annotations(
    $I.annotations("UrlPattern", {
      description: "Valid URL pattern matching common URL formats",
    })
  )
);

export declare namespace UrlPattern {
  export type Type = typeof UrlPattern.Type;
}

/**
 * A URL string that has been sanitized for safe use.
 * Branded type to prevent accidental use of unsanitized URLs.
 *
 * @since 0.1.0
 */
export class SanitizedUrl extends S.Class<SanitizedUrl>($I`SanitizedUrl`)(
  {
    value: S.String.annotations({
      description: "The sanitized URL string",
    }),
  },
  $I.annotations("SanitizedUrl", {
    description: "A URL string that has been sanitized for safe use in the editor",
  })
) {}

/**
 * URL validation result - either a valid URL or the about:blank fallback.
 *
 * @since 0.1.0
 */
export const UrlValidationResult = S.Union(SanitizedUrl, S.Literal("about:blank")).annotations(
  $I.annotations("UrlValidationResult", {
    description: "Result of URL validation - sanitized URL or fallback",
  })
);

export declare namespace UrlValidationResult {
  export type Type = typeof UrlValidationResult.Type;
}
