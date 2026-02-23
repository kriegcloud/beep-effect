import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
/**
 * @description ScimProvider model representing a SCIM provider.
 * Maps to the `scimProvider` table in the database.
 */
export class Model extends M.Class<Model>(`ScimProviderModel`)(
  makeFields(IamEntityIds.ScimProviderId, {
    providerId: S.NonEmptyTrimmedString,
    scimToken: M.Sensitive(S.NonEmptyTrimmedString),
    organizationId: BS.FieldOptionOmittable(SharedEntityIds.OrganizationId),
  }),
  {
    title: "Scim Provider Model",
    description: `Scim Provider`,
    schemaId: Symbol.for("@beep/iam-domain/entities/ScimProviderModel"),
  }
) {
  static readonly utils = modelKit(Model);
}
