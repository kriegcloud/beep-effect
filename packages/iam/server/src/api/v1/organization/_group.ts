/**
 * @module organization/_group
 *
 * Organization API routes implementation.
 *
 * @category Routes
 * @since 1.0.0
 */

import { IamApi, type IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-server";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
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

export type Service = HttpApiGroup.ApiGroup<"iam", "iam.organization">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(IamApi, "iam.organization", (h) =>
  h
    // Invitation Management
    .handle("accept-invitation", AcceptInvitation.Handler)
    .handle("cancel-invitation", CancelInvitation.Handler)
    .handle("get-invitation", GetInvitation.Handler)
    .handle("invite-member", InviteMember.Handler)
    .handle("list-invitations", ListInvitations.Handler)
    .handle("list-user-invitations", ListUserInvitations.Handler)
    .handle("reject-invitation", RejectInvitation.Handler)
    // Organization CRUD
    .handle("create", Create.Handler)
    .handle("delete", Delete.Handler)
    .handle("update", Update.Handler)
    .handle("get-full-organization", GetFullOrganization.Handler)
    .handle("list", List.Handler)
    .handle("check-slug", CheckSlug.Handler)
    .handle("set-active", SetActive.Handler)
    // Member Management
    .handle("get-active-member", GetActiveMember.Handler)
    .handle("get-active-member-role", GetActiveMemberRole.Handler)
    .handle("list-members", ListMembers.Handler)
    .handle("remove-member", RemoveMember.Handler)
    .handle("update-member-role", UpdateMemberRole.Handler)
    .handle("leave", Leave.Handler)
    // Role Management
    .handle("create-role", CreateRole.Handler)
    .handle("delete-role", DeleteRole.Handler)
    .handle("get-role", GetRole.Handler)
    .handle("list-roles", ListRoles.Handler)
    .handle("update-role", UpdateRole.Handler)
    .handle("has-permission", HasPermission.Handler)
    // Team Management
    .handle("add-team-member", AddTeamMember.Handler)
    .handle("create-team", CreateTeam.Handler)
    .handle("remove-team", DeleteTeam.Handler)
    .handle("get-team", GetTeam.Handler)
    .handle("list-teams", ListTeams.Handler)
    .handle("list-team-members", ListTeamMembers.Handler)
    .handle("list-user-teams", ListUserTeams.Handler)
    .handle("remove-team-member", RemoveTeamMember.Handler)
    .handle("set-active-team", SetActiveTeam.Handler)
    .handle("update-team", UpdateTeam.Handler)
);
