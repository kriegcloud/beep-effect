/**
 * @fileoverview
 * Organization service composition.
 *
 * @module @beep/iam-client/organization/service
 * @category Organization
 * @since 0.1.0
 */

import * as Crud from "./crud/mod.ts";
import * as Invitations from "./invitations/mod.ts";
import * as Members from "./members/mod.ts";

/**
 * Organization CRUD service methods.
 *
 * @category Organization/CRUD
 * @since 0.1.0
 */
export const Create = Crud.Create.Handler;
export const Delete = Crud.Delete.Handler;
export const GetFull = Crud.GetFull.Handler;
export const List = Crud.List.Handler;
export const SetActive = Crud.SetActive.Handler;
export const Update = Crud.Update.Handler;

/**
 * Organization invitation service methods.
 *
 * @category Organization/Invitations
 * @since 0.1.0
 */
export const AcceptInvitation = Invitations.Accept.Handler;
export const CancelInvitation = Invitations.Cancel.Handler;
export const CreateInvitation = Invitations.Create.Handler;
export const ListInvitations = Invitations.List.Handler;
export const RejectInvitation = Invitations.Reject.Handler;

/**
 * Organization member service methods.
 *
 * NOTE: There is no "addMember" method in Better Auth's organization client.
 * Members are added through the invitation flow: inviteMember → acceptInvitation
 *
 * @category Organization/Members
 * @since 0.1.0
 */
export const ListMembers = Members.List.Handler;
export const RemoveMember = Members.Remove.Handler;
export const UpdateMemberRole = Members.UpdateRole.Handler;
