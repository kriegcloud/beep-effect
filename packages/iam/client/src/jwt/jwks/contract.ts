/**
 * @fileoverview
 * JSON Web Key Set (JWKS) contract schemas for the IAM client.
 *
 * Defines the success response schema for retrieving the JWKS for token verification.
 * This is a public endpoint per RFC 7517.
 *
 * @module @beep/iam-client/jwt/jwks/contract
 * @category JWT/JWKS
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("jwt/jwks");

/**
 * JSON Web Key schema per RFC 7517.
 *
 * @category JWT/JWKS/Schemas
 * @since 0.1.0
 */
export const JsonWebKey = S.Struct({
  kty: S.String,
  kid: S.String, // RFC 7517 Key ID - intentionally S.String per IETF spec
  use: S.String,
  alg: S.String,
  // RSA key parameters
  n: S.optional(S.String),
  e: S.optional(S.String),
  // EC key parameters
  x: S.optional(S.String),
  y: S.optional(S.String),
  crv: S.optional(S.String),
}).annotations(
  $I.annotations("JsonWebKey", {
    description: "A JSON Web Key per RFC 7517.",
  })
);

export type JsonWebKey = S.Schema.Type<typeof JsonWebKey>;

/**
 * Success response with JWKS.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { JWKS } from "@beep/iam-client/jwt"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* JWKS.Handler
 *   console.log(`Found ${result.keys.length} keys`)
 * })
 * ```
 *
 * @category JWT/JWKS/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    keys: S.Array(JsonWebKey),
  },
  $I.annotations("Success", {
    description: "JSON Web Key Set for token verification.",
  })
) {}

/**
 * Contract wrapper for JWKS operations.
 *
 * No payload required - returns the public JWKS.
 *
 * @category JWT/JWKS/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("GetJWKS", {
  success: Success,
  error: Common.IamError,
});
