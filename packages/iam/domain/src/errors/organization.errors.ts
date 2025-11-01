import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";
export const ORGANIZATION_ERROR_CODES = {
  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION: "You are not allowed to create a new organization",
  YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS: "You have reached the maximum number of organizations",
  ORGANIZATION_ALREADY_EXISTS: "Organization already exists",
  ORGANIZATION_NOT_FOUND: "Organization not found",
  USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION: "User is not a member of the organization",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION: "You are not allowed to update this organization",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION: "You are not allowed to delete this organization",
  NO_ACTIVE_ORGANIZATION: "No active organization",
  USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: "User is already a member of this organization",
  MEMBER_NOT_FOUND: "Member not found",
  ROLE_NOT_FOUND: "Role not found",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM: "You are not allowed to create a new team",
  TEAM_ALREADY_EXISTS: "Team already exists",
  TEAM_NOT_FOUND: "Team not found",
  YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER: "You cannot leave the organization as the only owner",
  YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER: "You cannot leave the organization without an owner",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER: "You are not allowed to delete this member",
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION: "You are not allowed to invite users to this organization",
  USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: "User is already invited to this organization",
  INVITATION_NOT_FOUND: "Invitation not found",
  YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION: "You are not the recipient of the invitation",
  EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION:
    "Email verification required before accepting or rejecting invitation",
  YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION: "You are not allowed to cancel this invitation",
  INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION: "Inviter is no longer a member of the organization",
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE: "You are not allowed to invite a user with this role",
  FAILED_TO_RETRIEVE_INVITATION: "Failed to retrieve invitation",
  YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_TEAMS: "You have reached the maximum number of teams",
  UNABLE_TO_REMOVE_LAST_TEAM: "Unable to remove last team",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER: "You are not allowed to update this member",
  ORGANIZATION_MEMBERSHIP_LIMIT_REACHED: "Organization membership limit reached",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION: "You are not allowed to create teams in this organization",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION: "You are not allowed to delete teams in this organization",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TEAM: "You are not allowed to update this team",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM: "You are not allowed to delete this team",
  INVITATION_LIMIT_REACHED: "Invitation limit reached",
  TEAM_MEMBER_LIMIT_REACHED: "Team member limit reached",
  USER_IS_NOT_A_MEMBER_OF_THE_TEAM: "User is not a member of the team",
  YOU_CAN_NOT_ACCESS_THE_MEMBERS_OF_THIS_TEAM: "You are not allowed to list the members of this team",
  YOU_DO_NOT_HAVE_AN_ACTIVE_TEAM: "You do not have an active team",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM_MEMBER: "You are not allowed to create a new member",
  YOU_ARE_NOT_ALLOWED_TO_REMOVE_A_TEAM_MEMBER: "You are not allowed to remove a team member",
  YOU_ARE_NOT_ALLOWED_TO_ACCESS_THIS_ORGANIZATION: "You are not allowed to access this organization as an owner",
  YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION: "You are not a member of this organization",
  MISSING_AC_INSTANCE:
    "Dynamic Access Control requires a pre-defined ac instance on the server auth plugin. Read server logs for more information",
  YOU_MUST_BE_IN_AN_ORGANIZATION_TO_CREATE_A_ROLE: "You must be in an organization to create a role",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_ROLE: "You are not allowed to create a role",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_A_ROLE: "You are not allowed to update a role",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_A_ROLE: "You are not allowed to delete a role",
  YOU_ARE_NOT_ALLOWED_TO_READ_A_ROLE: "You are not allowed to read a role",
  YOU_ARE_NOT_ALLOWED_TO_LIST_A_ROLE: "You are not allowed to list a role",
  YOU_ARE_NOT_ALLOWED_TO_GET_A_ROLE: "You are not allowed to get a role",
  TOO_MANY_ROLES: "This organization has too many roles",
  INVALID_RESOURCE: "The provided permission includes an invalid resource",
  ROLE_NAME_IS_ALREADY_TAKEN: "That role name is already taken",
  CANNOT_DELETE_A_PRE_DEFINED_ROLE: "Cannot delete a pre-defined role",
} as const;
export class YouAreNotAllowedToCreateANewOrganization extends S.TaggedError<YouAreNotAllowedToCreateANewOrganization>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToCreateANewOrganization"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION
  )
) {}

export class YouHaveReachedTheMaximumNumberOfOrganizations extends S.TaggedError<YouHaveReachedTheMaximumNumberOfOrganizations>(
  "@beep/iam-domain/errors/organization/YouHaveReachedTheMaximumNumberOfOrganizations"
)(
  ...makeErrorProps("YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS")(
    ORGANIZATION_ERROR_CODES.YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS
  )
) {}

export class OrganizationAlreadyExists extends S.TaggedError<OrganizationAlreadyExists>(
  "@beep/iam-domain/errors/organization/OrganizationAlreadyExists"
)(...makeErrorProps("ORGANIZATION_ALREADY_EXISTS")(ORGANIZATION_ERROR_CODES.ORGANIZATION_ALREADY_EXISTS)) {}

export class OrganizationNotFound extends S.TaggedError<OrganizationNotFound>(
  "@beep/iam-domain/errors/organization/OrganizationNotFound"
)(...makeErrorProps("ORGANIZATION_NOT_FOUND")(ORGANIZATION_ERROR_CODES.ORGANIZATION_NOT_FOUND)) {}

export class UserIsNotAMemberOfTheOrganization extends S.TaggedError<UserIsNotAMemberOfTheOrganization>(
  "@beep/iam-domain/errors/organization/UserIsNotAMemberOfTheOrganization"
)(
  ...makeErrorProps("USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION")(
    ORGANIZATION_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION
  )
) {}

export class YouAreNotAllowedToUpdateThisOrganization extends S.TaggedError<YouAreNotAllowedToUpdateThisOrganization>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToUpdateThisOrganization"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION
  )
) {}

export class YouAreNotAllowedToDeleteThisOrganization extends S.TaggedError<YouAreNotAllowedToDeleteThisOrganization>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToDeleteThisOrganization"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION
  )
) {}

export class NoActiveOrganization extends S.TaggedError<NoActiveOrganization>(
  "@beep/iam-domain/errors/organization/NoActiveOrganization"
)(...makeErrorProps("NO_ACTIVE_ORGANIZATION")(ORGANIZATION_ERROR_CODES.NO_ACTIVE_ORGANIZATION)) {}

export class UserIsAlreadyAMemberOfThisOrganization extends S.TaggedError<UserIsAlreadyAMemberOfThisOrganization>(
  "@beep/iam-domain/errors/organization/UserIsAlreadyAMemberOfThisOrganization"
)(
  ...makeErrorProps("USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION")(
    ORGANIZATION_ERROR_CODES.USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION
  )
) {}

export class MemberNotFound extends S.TaggedError<MemberNotFound>(
  "@beep/iam-domain/errors/organization/MemberNotFound"
)(...makeErrorProps("MEMBER_NOT_FOUND")(ORGANIZATION_ERROR_CODES.MEMBER_NOT_FOUND)) {}

export class RoleNotFound extends S.TaggedError<RoleNotFound>("@beep/iam-domain/errors/organization/RoleNotFound")(
  ...makeErrorProps("ROLE_NOT_FOUND")(ORGANIZATION_ERROR_CODES.ROLE_NOT_FOUND)
) {}

export class YouAreNotAllowedToCreateANewTeam extends S.TaggedError<YouAreNotAllowedToCreateANewTeam>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToCreateANewTeam"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM
  )
) {}

export class TeamAlreadyExists extends S.TaggedError<TeamAlreadyExists>(
  "@beep/iam-domain/errors/organization/TeamAlreadyExists"
)(...makeErrorProps("TEAM_ALREADY_EXISTS")(ORGANIZATION_ERROR_CODES.TEAM_ALREADY_EXISTS)) {}

export class TeamNotFound extends S.TaggedError<TeamNotFound>("@beep/iam-domain/errors/organization/TeamNotFound")(
  ...makeErrorProps("TEAM_NOT_FOUND")(ORGANIZATION_ERROR_CODES.TEAM_NOT_FOUND)
) {}

export class YouCannotLeaveTheOrganizationAsTheOnlyOwner extends S.TaggedError<YouCannotLeaveTheOrganizationAsTheOnlyOwner>(
  "@beep/iam-domain/errors/organization/YouCannotLeaveTheOrganizationAsTheOnlyOwner"
)(
  ...makeErrorProps("YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER")(
    ORGANIZATION_ERROR_CODES.YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER
  )
) {}

export class YouCannotLeaveTheOrganizationWithoutAnOwner extends S.TaggedError<YouCannotLeaveTheOrganizationWithoutAnOwner>(
  "@beep/iam-domain/errors/organization/YouCannotLeaveTheOrganizationWithoutAnOwner"
)(
  ...makeErrorProps("YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER")(
    ORGANIZATION_ERROR_CODES.YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER
  )
) {}

export class YouAreNotAllowedToDeleteThisMember extends S.TaggedError<YouAreNotAllowedToDeleteThisMember>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToDeleteThisMember"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER
  )
) {}

export class YouAreNotAllowedToInviteUsersToThisOrganization extends S.TaggedError<YouAreNotAllowedToInviteUsersToThisOrganization>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToInviteUsersToThisOrganization"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION
  )
) {}

export class UserIsAlreadyInvitedToThisOrganization extends S.TaggedError<UserIsAlreadyInvitedToThisOrganization>(
  "@beep/iam-domain/errors/organization/UserIsAlreadyInvitedToThisOrganization"
)(
  ...makeErrorProps("USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION")(
    ORGANIZATION_ERROR_CODES.USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION
  )
) {}

export class InvitationNotFound extends S.TaggedError<InvitationNotFound>(
  "@beep/iam-domain/errors/organization/InvitationNotFound"
)(...makeErrorProps("INVITATION_NOT_FOUND")(ORGANIZATION_ERROR_CODES.INVITATION_NOT_FOUND)) {}

export class YouAreNotTheRecipientOfTheInvitation extends S.TaggedError<YouAreNotTheRecipientOfTheInvitation>(
  "@beep/iam-domain/errors/organization/YouAreNotTheRecipientOfTheInvitation"
)(
  ...makeErrorProps("YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION
  )
) {}

export class EmailVerificationRequiredBeforeAcceptingOrRejectingInvitation extends S.TaggedError<EmailVerificationRequiredBeforeAcceptingOrRejectingInvitation>(
  "@beep/iam-domain/errors/organization/EmailVerificationRequiredBeforeAcceptingOrRejectingInvitation"
)(
  ...makeErrorProps("EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION")(
    ORGANIZATION_ERROR_CODES.EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION
  )
) {}

export class YouAreNotAllowedToCancelThisInvitation extends S.TaggedError<YouAreNotAllowedToCancelThisInvitation>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToCancelThisInvitation"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION
  )
) {}

export class InviterIsNoLongerAMemberOfTheOrganization extends S.TaggedError<InviterIsNoLongerAMemberOfTheOrganization>(
  "@beep/iam-domain/errors/organization/InviterIsNoLongerAMemberOfTheOrganization"
)(
  ...makeErrorProps("INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION")(
    ORGANIZATION_ERROR_CODES.INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION
  )
) {}

export class YouAreNotAllowedToInviteUserWithThisRole extends S.TaggedError<YouAreNotAllowedToInviteUserWithThisRole>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToInviteUserWithThisRole"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE
  )
) {}

export class FailedToRetrieveInvitation extends S.TaggedError<FailedToRetrieveInvitation>(
  "@beep/iam-domain/errors/organization/FailedToRetrieveInvitation"
)(...makeErrorProps("FAILED_TO_RETRIEVE_INVITATION")(ORGANIZATION_ERROR_CODES.FAILED_TO_RETRIEVE_INVITATION)) {}

export class YouHaveReachedTheMaximumNumberOfTeams extends S.TaggedError<YouHaveReachedTheMaximumNumberOfTeams>(
  "@beep/iam-domain/errors/organization/YouHaveReachedTheMaximumNumberOfTeams"
)(
  ...makeErrorProps("YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_TEAMS")(
    ORGANIZATION_ERROR_CODES.YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_TEAMS
  )
) {}

export class UnableToRemoveLastTeam extends S.TaggedError<UnableToRemoveLastTeam>(
  "@beep/iam-domain/errors/organization/UnableToRemoveLastTeam"
)(...makeErrorProps("UNABLE_TO_REMOVE_LAST_TEAM")(ORGANIZATION_ERROR_CODES.UNABLE_TO_REMOVE_LAST_TEAM)) {}

export class YouAreNotAllowedToUpdateThisMember extends S.TaggedError<YouAreNotAllowedToUpdateThisMember>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToUpdateThisMember"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER
  )
) {}

export class OrganizationMembershipLimitReached extends S.TaggedError<OrganizationMembershipLimitReached>(
  "@beep/iam-domain/errors/organization/OrganizationMembershipLimitReached"
)(
  ...makeErrorProps("ORGANIZATION_MEMBERSHIP_LIMIT_REACHED")(
    ORGANIZATION_ERROR_CODES.ORGANIZATION_MEMBERSHIP_LIMIT_REACHED
  )
) {}

export class YouAreNotAllowedToCreateTeamsInThisOrganization extends S.TaggedError<YouAreNotAllowedToCreateTeamsInThisOrganization>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToCreateTeamsInThisOrganization"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION
  )
) {}

export class YouAreNotAllowedToDeleteTeamsInThisOrganization extends S.TaggedError<YouAreNotAllowedToDeleteTeamsInThisOrganization>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToDeleteTeamsInThisOrganization"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION
  )
) {}

export class YouAreNotAllowedToUpdateThisTeam extends S.TaggedError<YouAreNotAllowedToUpdateThisTeam>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToUpdateThisTeam"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TEAM")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TEAM
  )
) {}

export class YouAreNotAllowedToDeleteThisTeam extends S.TaggedError<YouAreNotAllowedToDeleteThisTeam>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToDeleteThisTeam"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM
  )
) {}

export class InvitationLimitReached extends S.TaggedError<InvitationLimitReached>(
  "@beep/iam-domain/errors/organization/InvitationLimitReached"
)(...makeErrorProps("INVITATION_LIMIT_REACHED")(ORGANIZATION_ERROR_CODES.INVITATION_LIMIT_REACHED)) {}

export class TeamMemberLimitReached extends S.TaggedError<TeamMemberLimitReached>(
  "@beep/iam-domain/errors/organization/TeamMemberLimitReached"
)(...makeErrorProps("TEAM_MEMBER_LIMIT_REACHED")(ORGANIZATION_ERROR_CODES.TEAM_MEMBER_LIMIT_REACHED)) {}

export class UserIsNotAMemberOfTheTeam extends S.TaggedError<UserIsNotAMemberOfTheTeam>(
  "@beep/iam-domain/errors/organization/UserIsNotAMemberOfTheTeam"
)(...makeErrorProps("USER_IS_NOT_A_MEMBER_OF_THE_TEAM")(ORGANIZATION_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_TEAM)) {}

export class YouCanNotAccessTheMembersOfThisTeam extends S.TaggedError<YouCanNotAccessTheMembersOfThisTeam>(
  "@beep/iam-domain/errors/organization/YouCanNotAccessTheMembersOfThisTeam"
)(
  ...makeErrorProps("YOU_CAN_NOT_ACCESS_THE_MEMBERS_OF_THIS_TEAM")(
    ORGANIZATION_ERROR_CODES.YOU_CAN_NOT_ACCESS_THE_MEMBERS_OF_THIS_TEAM
  )
) {}

export class YouDoNotHaveAnActiveTeam extends S.TaggedError<YouDoNotHaveAnActiveTeam>(
  "@beep/iam-domain/errors/organization/YouDoNotHaveAnActiveTeam"
)(...makeErrorProps("YOU_DO_NOT_HAVE_AN_ACTIVE_TEAM")(ORGANIZATION_ERROR_CODES.YOU_DO_NOT_HAVE_AN_ACTIVE_TEAM)) {}

export class YouAreNotAllowedToCreateANewTeamMember extends S.TaggedError<YouAreNotAllowedToCreateANewTeamMember>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToCreateANewTeamMember"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM_MEMBER")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM_MEMBER
  )
) {}

export class YouAreNotAllowedToRemoveATeamMember extends S.TaggedError<YouAreNotAllowedToRemoveATeamMember>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToRemoveATeamMember"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_REMOVE_A_TEAM_MEMBER")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_REMOVE_A_TEAM_MEMBER
  )
) {}

export class YouAreNotAllowedToAccessThisOrganization extends S.TaggedError<YouAreNotAllowedToAccessThisOrganization>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToAccessThisOrganization"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_ACCESS_THIS_ORGANIZATION")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_ACCESS_THIS_ORGANIZATION
  )
) {}

export class YouAreNotAMemberOfThisOrganization extends S.TaggedError<YouAreNotAMemberOfThisOrganization>(
  "@beep/iam-domain/errors/organization/YouAreNotAMemberOfThisOrganization"
)(
  ...makeErrorProps("YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION
  )
) {}

export class MissingAcInstance extends S.TaggedError<MissingAcInstance>(
  "@beep/iam-domain/errors/organization/MissingAcInstance"
)(...makeErrorProps("MISSING_AC_INSTANCE")(ORGANIZATION_ERROR_CODES.MISSING_AC_INSTANCE)) {}

export class YouMustBeInAnOrganizationToCreateARole extends S.TaggedError<YouMustBeInAnOrganizationToCreateARole>(
  "@beep/iam-domain/errors/organization/YouMustBeInAnOrganizationToCreateARole"
)(
  ...makeErrorProps("YOU_MUST_BE_IN_AN_ORGANIZATION_TO_CREATE_A_ROLE")(
    ORGANIZATION_ERROR_CODES.YOU_MUST_BE_IN_AN_ORGANIZATION_TO_CREATE_A_ROLE
  )
) {}

export class YouAreNotAllowedToCreateARole extends S.TaggedError<YouAreNotAllowedToCreateARole>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToCreateARole"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_CREATE_A_ROLE")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_CREATE_A_ROLE
  )
) {}

export class YouAreNotAllowedToUpdateARole extends S.TaggedError<YouAreNotAllowedToUpdateARole>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToUpdateARole"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_UPDATE_A_ROLE")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_UPDATE_A_ROLE
  )
) {}

export class YouAreNotAllowedToDeleteARole extends S.TaggedError<YouAreNotAllowedToDeleteARole>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToDeleteARole"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_DELETE_A_ROLE")(
    ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_DELETE_A_ROLE
  )
) {}

export class YouAreNotAllowedToReadARole extends S.TaggedError<YouAreNotAllowedToReadARole>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToReadARole"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_READ_A_ROLE")(ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_READ_A_ROLE)
) {}

export class YouAreNotAllowedToListARole extends S.TaggedError<YouAreNotAllowedToListARole>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToListARole"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_LIST_A_ROLE")(ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_LIST_A_ROLE)
) {}

export class YouAreNotAllowedToGetARole extends S.TaggedError<YouAreNotAllowedToGetARole>(
  "@beep/iam-domain/errors/organization/YouAreNotAllowedToGetARole"
)(...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_GET_A_ROLE")(ORGANIZATION_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_GET_A_ROLE)) {}

export class TooManyRoles extends S.TaggedError<TooManyRoles>("@beep/iam-domain/errors/organization/TooManyRoles")(
  ...makeErrorProps("TOO_MANY_ROLES")(ORGANIZATION_ERROR_CODES.TOO_MANY_ROLES)
) {}

export class InvalidResource extends S.TaggedError<InvalidResource>(
  "@beep/iam-domain/errors/organization/InvalidResource"
)(...makeErrorProps("INVALID_RESOURCE")(ORGANIZATION_ERROR_CODES.INVALID_RESOURCE)) {}

export class RoleNameIsAlreadyTaken extends S.TaggedError<RoleNameIsAlreadyTaken>(
  "@beep/iam-domain/errors/organization/RoleNameIsAlreadyTaken"
)(...makeErrorProps("ROLE_NAME_IS_ALREADY_TAKEN")(ORGANIZATION_ERROR_CODES.ROLE_NAME_IS_ALREADY_TAKEN)) {}

export class CannotDeleteAPreDefinedRole extends S.TaggedError<CannotDeleteAPreDefinedRole>(
  "@beep/iam-domain/errors/organization/CannotDeleteAPreDefinedRole"
)(...makeErrorProps("CANNOT_DELETE_A_PRE_DEFINED_ROLE")(ORGANIZATION_ERROR_CODES.CANNOT_DELETE_A_PRE_DEFINED_ROLE)) {}

export class OrganizationErrors extends S.Union(
  YouAreNotAllowedToCreateANewOrganization,
  YouHaveReachedTheMaximumNumberOfOrganizations,
  OrganizationAlreadyExists,
  OrganizationNotFound,
  UserIsNotAMemberOfTheOrganization,
  YouAreNotAllowedToUpdateThisOrganization,
  YouAreNotAllowedToDeleteThisOrganization,
  NoActiveOrganization,
  UserIsAlreadyAMemberOfThisOrganization,
  MemberNotFound,
  RoleNotFound,
  YouAreNotAllowedToCreateANewTeam,
  TeamAlreadyExists,
  TeamNotFound,
  YouCannotLeaveTheOrganizationAsTheOnlyOwner,
  YouCannotLeaveTheOrganizationWithoutAnOwner,
  YouAreNotAllowedToDeleteThisMember,
  YouAreNotAllowedToInviteUsersToThisOrganization,
  UserIsAlreadyInvitedToThisOrganization,
  InvitationNotFound,
  YouAreNotTheRecipientOfTheInvitation,
  EmailVerificationRequiredBeforeAcceptingOrRejectingInvitation,
  YouAreNotAllowedToCancelThisInvitation,
  InviterIsNoLongerAMemberOfTheOrganization,
  YouAreNotAllowedToInviteUserWithThisRole,
  FailedToRetrieveInvitation,
  YouHaveReachedTheMaximumNumberOfTeams,
  UnableToRemoveLastTeam,
  YouAreNotAllowedToUpdateThisMember,
  OrganizationMembershipLimitReached,
  YouAreNotAllowedToCreateTeamsInThisOrganization,
  YouAreNotAllowedToDeleteTeamsInThisOrganization,
  YouAreNotAllowedToUpdateThisTeam,
  YouAreNotAllowedToDeleteThisTeam,
  InvitationLimitReached,
  TeamMemberLimitReached,
  UserIsNotAMemberOfTheTeam,
  YouCanNotAccessTheMembersOfThisTeam,
  YouDoNotHaveAnActiveTeam,
  YouAreNotAllowedToCreateANewTeamMember,
  YouAreNotAllowedToRemoveATeamMember,
  YouAreNotAllowedToAccessThisOrganization,
  YouAreNotAMemberOfThisOrganization,
  MissingAcInstance,
  YouMustBeInAnOrganizationToCreateARole,
  YouAreNotAllowedToCreateARole,
  YouAreNotAllowedToUpdateARole,
  YouAreNotAllowedToDeleteARole,
  YouAreNotAllowedToReadARole,
  YouAreNotAllowedToListARole,
  YouAreNotAllowedToGetARole,
  TooManyRoles,
  InvalidResource,
  RoleNameIsAlreadyTaken,
  CannotDeleteAPreDefinedRole
) {}

export declare namespace OrganizationErrors {
  export type Type = typeof OrganizationErrors.Type;
  export type Encoded = typeof OrganizationErrors.Encoded;
}
