import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import { PolicyRecord } from "@beep/shared-domain/Policy";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
export const OrganizationRoleModelSchemaId = Symbol.for("@beep/iam-domain/OrganizationRoleModel");

/**
 * OAuth Consent model representing user consent for OAuth applications.
 * Maps to the `oauth_consent` table in the database.
 */
export class Model extends M.Class<Model>(`OrganizationRoleModel`)(
  makeFields(IamEntityIds.OrganizationRoleId, {
    /** The role name */
    role: S.NonEmptyString,

    /** The role permission */
    permission: BS.JsonFromStringOption(
      PolicyRecord.annotations({
        description: "Permissions granted to this API key",
      })
    ),

    organizationId: SharedEntityIds.OrganizationId,
  }),
  {
    title: "OAuth Consent Model",
    description: "OAuth Consent model representing user consent for OAuth applications.",
    schemaId: OrganizationRoleModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}
