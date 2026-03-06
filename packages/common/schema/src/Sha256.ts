/**
 * Branded schemas and transformation codecs for lowercase SHA-256 hex digests.
 *
 * @since 0.0.0
 * @module @beep/schema/Sha256
 */

import { $SchemaId } from "@beep/identity/packages";
import { Effect, Encoding, Option, Predicate as P, SchemaGetter, SchemaIssue } from "effect";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Sha256");

const sha256HexLowercaseRegExp = /^[0-9a-f]+$/;

const Sha256HexChecks = S.makeFilterGroup([
  S.isLengthBetween(64, 64, {
    title: "isSha256HexLength",
    description: "a SHA-256 hex digest with exactly 64 characters",
    message: "SHA-256 digest must be exactly 64 characters long",
  }),
  S.isPattern(sha256HexLowercaseRegExp, {
    title: "isLowercaseHex",
    description: "a lowercase hexadecimal string",
    message: "SHA-256 digest must contain only lowercase hexadecimal characters",
  }),
]);

const computeSha256Hex = (input: Uint8Array): Effect.Effect<string, SchemaIssue.Issue> =>
  Effect.tryPromise({
    // Web Crypto expects a BufferSource backed by ArrayBuffer, not a generic ArrayBufferLike view.
    try: () => globalThis.crypto.subtle.digest("SHA-256", Uint8Array.from(input)),
    catch: (cause) =>
      new SchemaIssue.InvalidValue(Option.some(input), {
        message: P.isError(cause) ? cause.message : "Failed to compute SHA-256 digest",
      }),
  }).pipe(Effect.map((buffer) => Encoding.encodeHex(new Uint8Array(buffer))));

/**
 * Branded schema for canonical lowercase SHA-256 hex digests.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Sha256Hex = S.String.check(Sha256HexChecks).pipe(
  S.brand("Sha256Hex"),
  S.annotate(
    $I.annote("Sha256Hex", {
      description: "A canonical lowercase SHA-256 hex digest.",
    })
  )
);

/**
 * Type for {@link Sha256Hex}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Sha256Hex = typeof Sha256Hex.Type;

/**
 * One-way schema that decodes a byte array into a canonical lowercase SHA-256
 * hex digest.
 *
 * Encoding back to the original bytes is intentionally forbidden because the
 * digest transform is not invertible.
 *
 * @since 0.0.0
 * @category Transformation
 */
export const Sha256HexFromBytes = S.Uint8Array.pipe(
  S.decodeTo(Sha256Hex, {
    decode: SchemaGetter.transformOrFail(computeSha256Hex),
    encode: SchemaGetter.forbidden(() => "Encoding Sha256Hex back to original bytes is not supported"),
  }),
  S.annotate(
    $I.annote("Sha256HexFromBytes", {
      description: "A one-way schema that hashes bytes into a canonical lowercase SHA-256 hex digest.",
    })
  )
);

/**
 * Type for {@link Sha256HexFromBytes}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Sha256HexFromBytes = typeof Sha256HexFromBytes.Type;

/**
 * One-way schema that decodes a hex-encoded byte string into a canonical
 * lowercase SHA-256 hex digest.
 *
 * This uses Effect's dedicated `Schema.Uint8ArrayFromHex` transport codec at
 * the boundary, then composes it with {@link Sha256HexFromBytes}.
 *
 * @since 0.0.0
 * @category Transformation
 */
export const Sha256HexFromHexBytes = S.Uint8ArrayFromHex.pipe(
  S.decodeTo(Sha256HexFromBytes),
  S.annotate(
    $I.annote("Sha256HexFromHexBytes", {
      description: "A one-way schema that hashes hex-encoded bytes into a canonical lowercase SHA-256 hex digest.",
    })
  )
);

/**
 * Type for {@link Sha256HexFromHexBytes}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Sha256HexFromHexBytes = typeof Sha256HexFromHexBytes.Type;
