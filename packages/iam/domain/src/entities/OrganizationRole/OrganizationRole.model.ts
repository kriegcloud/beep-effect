import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import { PolicyRecord } from "@beep/shared-domain/Policy";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OrganizationRole/OrganizationRole.model");

/**
 * Organization Role model representing roles within organizations.
 * Maps to the `organization_role` table in the database.
 */
export class Model extends M.Class<Model>($I`OrganizationRoleModel`)(
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
  $I.annotations("OrganizationRoleModel", {
    title: "Organization Role Model",
    description: "Organization Role model representing roles within organizations.",
  })
) {
  static readonly utils = modelKit(Model);
}
