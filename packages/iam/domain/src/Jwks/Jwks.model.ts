import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const JwksModelSchemaId = Symbol.for("@beep/iam-domain/JwksModel");

/**
 * JWKS model representing JSON Web Key Sets for JWT signature verification.
 * Maps to the `jwks` table in the database.
 */
export class Model extends M.Class<Model>(`JwksModel`)(
  makeFields(IamEntityIds.JwksId, {
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
    expiresAt: BS.FieldOptionOmittable(
      BS.DateTimeFromDate({
        description: "When this key expires and should no longer be used",
      })
    ),

    /** Whether the key is currently active */
    active: S.Boolean.annotations({
      description: "Whether this key is currently active for use",
    }),
  }),
  {
    title: "JWKS Model",
    description: "JWKS model representing JSON Web Key Sets for JWT signature verification.",
    schemaId: JwksModelSchemaId,
  }
) {}

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
