import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * JWKS model representing JSON Web Key Sets for JWT signature verification.
 * Maps to the `jwks` table in the database.
 */
export class Model extends M.Class<Model>(`Jwks.Model`)({
  /** Primary key identifier for the JWKS */
  id: M.Generated(IamEntityIds.JwksId),

  /** Key ID (kid) from the JWK */
  keyId: S.NonEmptyString.annotations({
    description: "The key ID (kid) from the JSON Web Key",
  }),

  /** The complete JWK as JSON */
  publicKey: S.String.annotations({
    description: "The complete JSON Web Key as a JSON string",
  }),

  /** Algorithm used with this key */
  algorithm: S.NonEmptyString.annotations({
    description: "The algorithm intended for use with the key",
    examples: ["RS256", "ES256", "HS256"],
  }),

  /** Key usage */
  usage: S.Literal("sig", "enc").annotations({
    description: "Intended usage of the key (signature or encryption)",
  }),

  /** When the key expires */
  expiresAt: M.FieldOption(
    Common.DateTimeFromDate({
      description: "When this key expires and should no longer be used",
    })
  ),

  /** Whether the key is currently active */
  active: S.Boolean.annotations({
    description: "Whether this key is currently active for use",
  }),

  // Simple audit columns
  ...Common.globalColumns,
}) {}
