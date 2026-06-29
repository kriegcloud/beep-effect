/**
 * W3C DID Core identifier schemas.
 *
 * @remarks
 * This module models the core DID string syntax from
 * {@link https://www.w3.org/TR/did-core/#did-syntax | W3C DID Core DID Syntax}.
 * DID URL path, query, and fragment forms are specified separately by
 * {@link https://www.w3.org/TR/did-core/#did-url-syntax | DID URL Syntax} and
 * are intentionally outside this schema.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Did");

const didSyntaxPattern =
  /^did:[a-z0-9]+:(?:(?:[A-Za-z0-9._-]|%[0-9A-Fa-f]{2})*:)*(?:[A-Za-z0-9._-]|%[0-9A-Fa-f]{2})+$/u;

const didSyntaxCheck = S.isPattern(didSyntaxPattern, {
  identifier: $I`DidSyntaxCheck`,
  title: "DID Syntax",
  description: "A Decentralized Identifier matching the W3C DID Core `did:<method-name>:<method-specific-id>` ABNF.",
  message: "DID must match W3C DID Core syntax: did:<lowercase-alphanumeric-method>:<method-specific-id>",
});

/**
 * Branded schema for W3C DID Core identifier strings.
 *
 * @remarks
 * The generic DID Core syntax is `did:<method-name>:<method-specific-id>`.
 * The `method-name` component is one or more lowercase ASCII letters or
 * digits. The `method-specific-id` component is non-empty and contains only
 * ASCII letters, digits, `.`, `-`, `_`, percent-encoded bytes, and colon
 * separators.
 *
 * This schema validates only the method-independent syntax from
 * {@link https://www.w3.org/TR/did-core/#did-syntax | W3C DID Core}. It does
 * not prove that the method is registered in the
 * {@link https://www.w3.org/TR/did-spec-registries/ | W3C DID Specification Registries}
 * or that the identifier resolves to a DID document.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { Did } from "@beep/schema/Did"
 *
 * const did = Effect.runSync(
 *   S.decodeUnknownEffect(Did)("did:example:123456789abcdefghi")
 * )
 *
 * console.log(did) // "did:example:123456789abcdefghi"
 * ```
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Did } from "@beep/schema/Did"
 *
 * const isDid = S.is(Did)
 *
 * console.log(isDid("did:example:123456789abcdefghi")) // true
 * console.log(isDid("did:example:123456789abcdefghi/path")) // false
 * ```
 *
 * @see {@link https://www.w3.org/TR/did-core/#did-syntax | W3C DID Core DID Syntax}
 * @see {@link https://www.w3.org/TR/did-core/#did-url-syntax | W3C DID Core DID URL Syntax}
 * @see {@link https://www.w3.org/TR/did-spec-registries/ | W3C DID Specification Registries}
 * @category identifiers
 * @since 0.0.0
 */
export const Did = S.String.check(didSyntaxCheck)
  .annotate({
    toArbitrary: () => (fc) => fc.stringMatching(didSyntaxPattern),
  })
  .pipe(
    S.brand("Did"),
    $I.annoteSchema("Did", {
      description:
        "A W3C DID Core Decentralized Identifier string constrained to generic DID syntax, excluding DID URL path, query, and fragment components.",
      documentation: "See W3C DID Core section 3.1, DID Syntax: https://www.w3.org/TR/did-core/#did-syntax",
    })
  );

/**
 * Type for {@link Did}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { Did, type Did as DidValue } from "@beep/schema/Did"
 *
 * const identifier: DidValue = Effect.runSync(
 *   S.decodeUnknownEffect(Did)("did:web:example.com")
 * )
 *
 * console.log(identifier) // "did:web:example.com"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Did = typeof Did.Type;

/**
 * Companion namespace for encoded DID type surfaces.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { Did, type Did as DidValue } from "@beep/schema/Did"
 *
 * const identifier: DidValue = Effect.runSync(
 *   S.decodeUnknownEffect(Did)("did:example:abc%3A123")
 * )
 * const encoded: Did.Encoded = Effect.runSync(S.encodeEffect(Did)(identifier))
 *
 * console.log(encoded) // "did:example:abc%3A123"
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export declare namespace Did {
  /**
   * Encoded string type for {@link Did}.
   *
   * @example
   * ```ts
   * import { Effect } from "effect"
   * import * as S from "effect/Schema"
   * import { Did } from "@beep/schema/Did"
   *
   * const decoded = Effect.runSync(S.decodeUnknownEffect(Did)("did:example:abc"))
   * const encoded: Did.Encoded = Effect.runSync(S.encodeEffect(Did)(decoded))
   *
   * console.log(encoded) // "did:example:abc"
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof Did.Encoded;
}
