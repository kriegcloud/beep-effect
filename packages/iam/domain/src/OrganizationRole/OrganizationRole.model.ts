import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const OrganizationRoleModelSchemaId = Symbol.for("@beep/iam-domain/OrganizationRoleModel");

/**
 * OAuth Consent model representing user consent for OAuth applications.
 * Maps to the `oauth_consent` table in the database.
 */
export class Model extends M.Class<Model>(`OrganizationRoleModel`)(
  {
    /** Primary key identifier for the OrganizationRole */
    id: M.Generated(IamEntityIds.OrganizationRoleId),

    /** The role name */
    role: S.NonEmptyString,

    /** The role permission */
    permission: S.NonEmptyString,

    // Default columns include organizationId
    ...Common.defaultColumns,
  },
  {
    title: "OAuth Consent Model",
    description: "OAuth Consent model representing user consent for OAuth applications.",
    schemaId: OrganizationRoleModelSchemaId,
  }
) {}
export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
