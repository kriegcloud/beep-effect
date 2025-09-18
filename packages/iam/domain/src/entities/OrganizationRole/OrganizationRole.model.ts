import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
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
    permission: S.NonEmptyString,

    organizationId: SharedEntityIds.OrganizationId,
  }),
  {
    title: "OAuth Consent Model",
    description: "OAuth Consent model representing user consent for OAuth applications.",
    schemaId: OrganizationRoleModelSchemaId,
  }
) {}
