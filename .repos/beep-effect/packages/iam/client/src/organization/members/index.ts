/**
 * @fileoverview
 * Public exports for Organization members submodule.
 *
 * NOTE: There is no "addMember" method in Better Auth's organization client.
 * Members are added through the invitation flow: inviteMember → acceptInvitation
 *
 * @module @beep/iam-client/organization/members
 * @category Organization/Members
 * @since 0.1.0
 */

export * as Members from "./mod.ts";
