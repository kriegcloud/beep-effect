/**
 * @module organization/_group
 *
 * Organization API group containing all organization-related endpoints.
 *
 * @category API Group
 * @since 1.0.0
 */

import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as AcceptInvitation from "./accept-invitation";
import * as AddTeamMember from "./add-team-member";
import * as CancelInvitation from "./cancel-invitation";
import * as CheckSlug from "./check-slug";
import * as Create from "./create";
import * as CreateRole from "./create-role";
import * as CreateTeam from "./create-team";
import * as Delete from "./delete";
import * as DeleteRole from "./delete-role";
import * as DeleteTeam from "./delete-team";
import * as GetActiveMember from "./get-active-member";
import * as GetActiveMemberRole from "./get-active-member-role";
import * as GetFullOrganization from "./get-full-organization";
import * as GetInvitation from "./get-invitation";
import * as GetRole from "./get-role";
import * as GetTeam from "./get-team";
import * as HasPermission from "./has-permission";
import * as InviteMember from "./invite-member";
import * as Leave from "./leave";
import * as List from "./list";
import * as ListInvitations from "./list-invitations";
import * as ListMembers from "./list-members";
import * as ListRoles from "./list-roles";
import * as ListTeamMembers from "./list-team-members";
import * as ListTeams from "./list-teams";
import * as ListUserInvitations from "./list-user-invitations";
import * as ListUserTeams from "./list-user-teams";
import * as RejectInvitation from "./reject-invitation";
import * as RemoveMember from "./remove-member";
import * as RemoveTeamMember from "./remove-team-member";
import * as SetActive from "./set-active";
import * as SetActiveTeam from "./set-active-team";
import * as Update from "./update";
import * as UpdateMemberRole from "./update-member-role";
import * as UpdateRole from "./update-role";
import * as UpdateTeam from "./update-team";

export class Group extends HttpApiGroup.make("organization")
  .prefix("/organization")
  // Invitation Management
  .add(AcceptInvitation.Contract)
  .add(CancelInvitation.Contract)
  .add(GetInvitation.Contract)
  .add(InviteMember.Contract)
  .add(ListInvitations.Contract)
  .add(ListUserInvitations.Contract)
  .add(RejectInvitation.Contract)
  // Organization CRUD
  .add(Create.Contract)
  .add(Delete.Contract)
  .add(Update.Contract)
  .add(GetFullOrganization.Contract)
  .add(List.Contract)
  .add(CheckSlug.Contract)
  .add(SetActive.Contract)
  // Member Management
  .add(GetActiveMember.Contract)
  .add(GetActiveMemberRole.Contract)
  .add(ListMembers.Contract)
  .add(RemoveMember.Contract)
  .add(UpdateMemberRole.Contract)
  .add(Leave.Contract)
  // Role Management
  .add(CreateRole.Contract)
  .add(DeleteRole.Contract)
  .add(GetRole.Contract)
  .add(ListRoles.Contract)
  .add(UpdateRole.Contract)
  .add(HasPermission.Contract)
  // Team Management
  .add(AddTeamMember.Contract)
  .add(CreateTeam.Contract)
  .add(DeleteTeam.Contract)
  .add(GetTeam.Contract)
  .add(ListTeams.Contract)
  .add(ListTeamMembers.Contract)
  .add(ListUserTeams.Contract)
  .add(RemoveTeamMember.Contract)
  .add(SetActiveTeam.Contract)
  .add(UpdateTeam.Contract)
  .prefix("/organization") {}

export {
  AcceptInvitation,
  AddTeamMember,
  CancelInvitation,
  CheckSlug,
  Create,
  CreateRole,
  CreateTeam,
  Delete,
  DeleteRole,
  DeleteTeam,
  GetActiveMember,
  GetActiveMemberRole,
  GetFullOrganization,
  GetInvitation,
  GetRole,
  GetTeam,
  HasPermission,
  InviteMember,
  Leave,
  List,
  ListInvitations,
  ListMembers,
  ListRoles,
  ListTeamMembers,
  ListTeams,
  ListUserInvitations,
  ListUserTeams,
  RejectInvitation,
  RemoveMember,
  RemoveTeamMember,
  SetActive,
  SetActiveTeam,
  Update,
  UpdateMemberRole,
  UpdateRole,
  UpdateTeam,
};
