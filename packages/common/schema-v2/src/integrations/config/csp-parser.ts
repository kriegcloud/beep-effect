/**
 * Content Security Policy parsing helpers used by the config integration.
 *
 * Translates serialized CSP strings into HashMaps keyed by directive names, following the W3C parsing algorithm.
 *
 * @example
 * import { fromString } from "@beep/schema-v2/integrations/config/csp-parser";
 *
 * const directives = fromString("default-src 'self'; script-src 'unsafe-inline'");
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
import * as regexes from "@beep/schema-v2/internal/regex/regexes";
import type { UnsafeTypes } from "@beep/types";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

/**
 * HashMap representation of a parsed Content Security Policy.
 *
 * Keys are normalized directive names (lowercase) and each value is the list of directive tokens captured from the
 * serialized policy.
 *
 * @example
 * import { fromString } from "@beep/schema-v2/integrations/config/csp-parser";
 *
 * const directives = fromString("default-src 'self'; script-src 'unsafe-inline'");
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export type CspMap = HashMap.HashMap<string, ReadonlyArray<string>>;

const call = <F extends UnsafeTypes.UnsafeFn>(fn: F): ReturnType<F> => fn();

const PolicyToken = S.Array(S.NonEmptyTrimmedString.pipe(S.pattern(regexes.ASCII)));

/**
 * Parses a serialized Content Security Policy via the [official spec](https://w3c.github.io/webappsec-csp/#parse-serialized-policy).
 *
 * Returns a HashMap keyed by directive name so higher-level schemas can perform validation and normalization.
 *
 * @example
 * import { fromString } from "@beep/schema-v2/integrations/config/csp-parser";
 *
 * const directives = fromString("default-src 'self'; object-src 'none'");
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export const fromString = (policy: string): CspMap => {
  let map = F.pipe(HashMap.empty<Lowercase<string>, Array<string>>, call);

  const policy_directives = Str.split(";")(policy);

  // "For each token returned by strictly splitting serialized on the
  // U+003B SEMICOLON character (;):"
  for (let token of policy_directives) {
    // "1. Strip leading and trailing ASCII whitespace from token."
    token = F.pipe(
      token,
      Str.replace(regexes.ASCII_WHITESPACE_AT_START, ""),
      Str.replace(regexes.ASCII_WHITESPACE_AT_END, "")
    );
    // "2. If token is an empty string, or if token is not an ASCII string,
    //     continue."
    if (!S.is(PolicyToken)(token)) continue;

    // We do these at the same time:
    // "3. Let directive name be the result of collecting a sequence of
    //     code points from token which are not ASCII whitespace."
    // "6. Let directive value be the result of splitting token on
    //     ASCII whitespace."
    const [rawDirectiveName, ...directiveValue] = Str.split(regexes.ASCII_WHITESPACE)(token);

    // "4. Set directive name to be the result of running ASCII lowercase on
    //     directive name."
    const directiveName = O.fromNullable(rawDirectiveName).pipe(O.getOrThrow, Str.toLowerCase);

    // "5. If policy's directive set contains a directive whose name is
    //     directive name, continue."
    if (HashMap.has(directiveName)(map)) continue;

    // "7. Let directive be a new directive whose name is directive name, and
    //     value is directive value."
    // "8. Append directive to policy's directive set."
    map = HashMap.set(directiveName, directiveValue)(map);
  }

  return map;
};
