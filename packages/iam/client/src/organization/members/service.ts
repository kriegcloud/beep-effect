/**
 * @fileoverview
 * Organization members service composition.
 *
 * @module @beep/iam-client/organization/members/service
 * @category Organization/Members
 * @since 0.1.0
 */

import * as List from "./list/mod.ts";
import * as Remove from "./remove/mod.ts";
import * as UpdateRole from "./update-role/mod.ts";

/**
 * Organization members service methods.
 *
 * NOTE: There is no "addMember" method in Better Auth's organization client.
 * Members are added through the invitation flow: inviteMember → acceptInvitation
 *
 * @category Organization/Members
 * @since 0.1.0
 */
export const List_ = List.Handler;
export const Remove_ = Remove.Handler;
export const UpdateRole_ = UpdateRole.Handler;
