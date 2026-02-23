/**
 * BaseRole - Base role for organization membership
 *
 * Defines the hierarchical access levels within an organization:
 * - 'owner': Organization creator/owner with full access, can delete org and transfer ownership
 * - 'admin': Organization administrator with full data operations and member management
 * - 'member': Standard user with access based on functional roles assigned
 * - 'viewer': Read-only access to view data and reports only
 *
 * @module authorization/BaseRole
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("authorization/BaseRole");

/**
 * BaseRole - The base role assigned to a user within an organization
 *
 * This determines the user's default permission set in that organization.
 * Functional roles can then be added to grant additional capabilities.
 */
export class BaseRole extends BS.StringLiteralKit("owner", "admin", "member", "viewer").annotations(
  $I.annotations("BaseRole", {
    description: "The base role assigned to a user within an organization, determining their default permissions",
  })
) {}

/**
 * The BaseRole type
 */
export declare namespace BaseRole {
  export type Type = typeof BaseRole.Type;
}

/**
 * Type guard for BaseRole using S.is
 */
export const isBaseRole = S.is(BaseRole);
