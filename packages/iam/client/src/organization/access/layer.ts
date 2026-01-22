/**
 * @fileoverview
 * Organization access layer composition.
 *
 * Includes utility methods for organization access control:
 * - Slug validation
 * - Invitation retrieval
 * - Member access and permissions
 *
 * @module @beep/iam-client/organization/access/layer
 * @category Organization/Access
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import * as CheckSlug from "../check-slug/mod.ts";
import * as GetActiveMember from "../get-active-member/mod.ts";
import * as GetActiveMemberRole from "../get-active-member-role/mod.ts";
import * as GetInvitation from "../get-invitation/mod.ts";
import * as HasPermission from "../has-permission/mod.ts";
import * as Leave from "../leave/mod.ts";
import * as ListUserInvitations from "../list-user-invitations/mod.ts";

/**
 * Organization access wrapper group.
 *
 * NOTE: There is no "addMember" method in Better Auth's organization client.
 * Members are added through the invitation flow: inviteMember → acceptInvitation
 *
 * @category Organization/Access
 * @since 0.1.0
 */
export const OrganizationAccessGroup = Wrap.WrapperGroup.make(
  CheckSlug.Contract.Wrapper,
  GetInvitation.Contract.Wrapper,
  ListUserInvitations.Contract.Wrapper,
  GetActiveMember.Contract.Wrapper,
  GetActiveMemberRole.Contract.Wrapper,
  Leave.Contract.Wrapper,
  HasPermission.Contract.Wrapper
);

/**
 * Organization access layer with implemented handlers.
 *
 * @category Organization/Access
 * @since 0.1.0
 */
export const layer = OrganizationAccessGroup.toLayer({
  CheckSlug: CheckSlug.Handler,
  GetInvitation: GetInvitation.Handler,
  ListUserInvitations: ListUserInvitations.Handler,
  GetActiveMember: GetActiveMember.Handler,
  GetActiveMemberRole: GetActiveMemberRole.Handler,
  Leave: Leave.Handler,
  HasPermission: HasPermission.Handler,
});
