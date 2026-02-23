import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Jwks/Jwks.model");

/**
 * JWKS model representing JSON Web Key Sets for JWT signature verification.
 * Maps to the `jwks` table in the database.
 */
export class Model extends M.Class<Model>($I`JwksModel`)(
  makeFields(IamEntityIds.JwksId, {
    /** Key ID (kid) from the JWK */
    publicKey: BS.FieldSensitiveOptionOmittable(S.String),
    privateKey: BS.FieldSensitiveOptionOmittable(S.String),
  }),
  $I.annotations("JwksModel", {
    title: "JWKS Model",
    description: "JWKS model representing JSON Web Key Sets for JWT signature verification.",
  })
) {
  static readonly utils = modelKit(Model);
}
