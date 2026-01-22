/**
 * @fileoverview
 * Organization module.
 *
 * @module @beep/iam-client/organization
 * @category Organization
 * @since 0.1.0
 */

// Shared schemas
export * from "./_common/index.ts";

// Submodules
export * as Access from "./access/mod.ts";
export * as Crud from "./crud/mod.ts";
export * as Invitations from "./invitations/mod.ts";
export * as Members from "./members/mod.ts";
export * as Roles from "./roles/mod.ts";
export * as Teams from "./teams/mod.ts";

// Layer and service exports
export {
	OrganizationAccessGroup,
	OrganizationCrudGroup,
	OrganizationGroup,
	OrganizationInvitationsGroup,
	OrganizationMembersGroup,
	OrganizationRolesGroup,
	OrganizationTeamsGroup,
} from "./layer.ts";
export * as Service from "./service.ts";
