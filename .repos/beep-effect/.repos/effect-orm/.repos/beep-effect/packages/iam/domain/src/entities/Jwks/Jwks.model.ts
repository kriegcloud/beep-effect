import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
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
    publicKey: BS.FieldSensitiveOptionOmittable(S.String),
    privateKey: BS.FieldSensitiveOptionOmittable(S.String),
  }),
  {
    title: "JWKS Model",
    description: "JWKS model representing JSON Web Key Sets for JWT signature verification.",
    schemaId: JwksModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}
