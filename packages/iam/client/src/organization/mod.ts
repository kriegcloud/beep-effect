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
export * as Crud from "./crud/mod.ts";
export * as Invitations from "./invitations/mod.ts";
// Layer and service exports
export {
  OrganizationCrudGroup,
  OrganizationGroup,
  OrganizationInvitationsGroup,
  OrganizationMembersGroup,
} from "./layer.ts";
export * as Members from "./members/mod.ts";
export * as Service from "./service.ts";
