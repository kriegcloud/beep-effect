/**
 * @fileoverview
 * Organization members module.
 *
 * NOTE: There is no "addMember" method in Better Auth's organization client.
 * Members are added through the invitation flow: inviteMember → acceptInvitation
 *
 * @module @beep/iam-client/organization/members
 * @category Organization/Members
 * @since 0.1.0
 */

export { OrganizationMembersGroup } from "./layer.ts";
export * as List from "./list/mod.ts";
export * as Remove from "./remove/mod.ts";
export * as Service from "./service.ts";
export * as UpdateRole from "./update-role/mod.ts";
