/**
 * @fileoverview
 * Organization layer composition.
 *
 * @module @beep/iam-client/organization/layer
 * @category Organization
 * @since 0.1.0
 */

import { OrganizationAccessGroup } from "./access/layer.ts";
import { OrganizationCrudGroup } from "./crud/layer.ts";
import { OrganizationInvitationsGroup } from "./invitations/layer.ts";
import { OrganizationMembersGroup } from "./members/layer.ts";
import { OrganizationRolesGroup } from "./roles/layer.ts";
import { OrganizationTeamsGroup } from "./teams/layer.ts";

/**
 * Combined organization wrapper group.
 *
 * @category Organization
 * @since 0.1.0
 */
export const OrganizationGroup = OrganizationCrudGroup.merge(
	OrganizationInvitationsGroup,
	OrganizationMembersGroup,
	OrganizationAccessGroup,
	OrganizationRolesGroup,
	OrganizationTeamsGroup,
);

// Re-export submodule groups for granular access
export { OrganizationAccessGroup } from "./access/layer.ts";
export { OrganizationCrudGroup } from "./crud/layer.ts";
export { OrganizationInvitationsGroup } from "./invitations/layer.ts";
export { OrganizationMembersGroup } from "./members/layer.ts";
export { OrganizationRolesGroup } from "./roles/layer.ts";
export { OrganizationTeamsGroup } from "./teams/layer.ts";
