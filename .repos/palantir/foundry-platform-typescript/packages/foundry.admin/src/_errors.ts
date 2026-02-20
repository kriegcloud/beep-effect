/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * Could not add the EnrollmentRoleAssignment.
 *
 * Log Safety: SAFE
 */
export interface AddEnrollmentRoleAssignmentsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AddEnrollmentRoleAssignmentsPermissionDenied";
  errorDescription: "Could not add the EnrollmentRoleAssignment.";
  errorInstanceId: string;
  parameters: {
    enrollmentRid: unknown;
  };
}

/**
 * Could not add the GroupMember.
 *
 * Log Safety: SAFE
 */
export interface AddGroupMembersPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AddGroupMembersPermissionDenied";
  errorDescription: "Could not add the GroupMember.";
  errorInstanceId: string;
  parameters: {
    groupId: unknown;
  };
}

/**
 * Could not add the MarkingMember.
 *
 * Log Safety: UNSAFE
 */
export interface AddMarkingMembersPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AddMarkingMembersPermissionDenied";
  errorDescription: "Could not add the MarkingMember.";
  errorInstanceId: string;
  parameters: {
    markingId: unknown;
  };
}

/**
 * Could not add the MarkingRoleAssignment.
 *
 * Log Safety: UNSAFE
 */
export interface AddMarkingRoleAssignmentsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AddMarkingRoleAssignmentsPermissionDenied";
  errorDescription: "Could not add the MarkingRoleAssignment.";
  errorInstanceId: string;
  parameters: {
    markingId: unknown;
  };
}

/**
 * Could not add the OrganizationRoleAssignment.
 *
 * Log Safety: SAFE
 */
export interface AddOrganizationRoleAssignmentsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AddOrganizationRoleAssignmentsPermissionDenied";
  errorDescription: "Could not add the OrganizationRoleAssignment.";
  errorInstanceId: string;
  parameters: {
    organizationRid: unknown;
  };
}

/**
 * The given AuthenticationProvider could not be found.
 *
 * Log Safety: SAFE
 */
export interface AuthenticationProviderNotFound {
  errorCode: "NOT_FOUND";
  errorName: "AuthenticationProviderNotFound";
  errorDescription: "The given AuthenticationProvider could not be found.";
  errorInstanceId: string;
  parameters: {
    enrollmentRid: unknown;
    authenticationProviderRid: unknown;
  };
}

/**
 * Provider information for Principals in this Realm cannot be replaced.
 *
 * Log Safety: SAFE
 */
export interface CannotReplaceProviderInfoForPrincipalInProtectedRealm {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CannotReplaceProviderInfoForPrincipalInProtectedRealm";
  errorDescription:
    "Provider information for Principals in this Realm cannot be replaced.";
  errorInstanceId: string;
  parameters: {
    principalId: unknown;
    realm: unknown;
  };
}

/**
 * Could not create the Group.
 *
 * Log Safety: SAFE
 */
export interface CreateGroupPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateGroupPermissionDenied";
  errorDescription: "Could not create the Group.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * At least one ADMINISTER role assignment must be provided when creating a marking category.
 *
 * Log Safety: SAFE
 */
export interface CreateMarkingCategoryMissingInitialAdminRole {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CreateMarkingCategoryMissingInitialAdminRole";
  errorDescription:
    "At least one ADMINISTER role assignment must be provided when creating a marking category.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * At least one organization must be provided when creating a marking category.
 *
 * Log Safety: SAFE
 */
export interface CreateMarkingCategoryMissingOrganization {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CreateMarkingCategoryMissingOrganization";
  errorDescription:
    "At least one organization must be provided when creating a marking category.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not create the MarkingCategory.
 *
 * Log Safety: SAFE
 */
export interface CreateMarkingCategoryPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateMarkingCategoryPermissionDenied";
  errorDescription: "Could not create the MarkingCategory.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * At least one ADMINISTER role assignment must be provided when creating a marking.
 *
 * Log Safety: SAFE
 */
export interface CreateMarkingMissingInitialAdminRole {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CreateMarkingMissingInitialAdminRole";
  errorDescription:
    "At least one ADMINISTER role assignment must be provided when creating a marking.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not create the Marking.
 *
 * Log Safety: SAFE
 */
export interface CreateMarkingPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateMarkingPermissionDenied";
  errorDescription: "Could not create the Marking.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * At least one organization:administrator role grant must be provided when creating a organization.
 *
 * Log Safety: SAFE
 */
export interface CreateOrganizationMissingInitialAdminRole {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CreateOrganizationMissingInitialAdminRole";
  errorDescription:
    "At least one organization:administrator role grant must be provided when creating a organization.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not create the Organization.
 *
 * Log Safety: SAFE
 */
export interface CreateOrganizationPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateOrganizationPermissionDenied";
  errorDescription: "Could not create the Organization.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not delete the Group.
 *
 * Log Safety: SAFE
 */
export interface DeleteGroupPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteGroupPermissionDenied";
  errorDescription: "Could not delete the Group.";
  errorInstanceId: string;
  parameters: {
    groupId: unknown;
  };
}

/**
 * Could not delete the User.
 *
 * Log Safety: SAFE
 */
export interface DeleteUserPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteUserPermissionDenied";
  errorDescription: "Could not delete the User.";
  errorInstanceId: string;
  parameters: {
    userId: unknown;
  };
}

/**
 * The given Enrollment could not be found.
 *
 * Log Safety: SAFE
 */
export interface EnrollmentNotFound {
  errorCode: "NOT_FOUND";
  errorName: "EnrollmentNotFound";
  errorDescription: "The given Enrollment could not be found.";
  errorInstanceId: string;
  parameters: {
    enrollmentRid: unknown;
  };
}

/**
 * One of the provided role IDs was not found.
 *
 * Log Safety: SAFE
 */
export interface EnrollmentRoleNotFound {
  errorCode: "NOT_FOUND";
  errorName: "EnrollmentRoleNotFound";
  errorDescription: "One of the provided role IDs was not found.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not getCurrent the Enrollment.
 *
 * Log Safety: SAFE
 */
export interface GetCurrentEnrollmentPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetCurrentEnrollmentPermissionDenied";
  errorDescription: "Could not getCurrent the Enrollment.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not getCurrent the User.
 *
 * Log Safety: SAFE
 */
export interface GetCurrentUserPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetCurrentUserPermissionDenied";
  errorDescription: "Could not getCurrent the User.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The provided token does not have permission to view the provider information for the given group.
 *
 * Log Safety: SAFE
 */
export interface GetGroupProviderInfoPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetGroupProviderInfoPermissionDenied";
  errorDescription:
    "The provided token does not have permission to view the provider information for the given group.";
  errorInstanceId: string;
  parameters: {
    groupId: unknown;
  };
}

/**
 * The provided token does not have permission to view the marking category.
 *
 * Log Safety: SAFE
 */
export interface GetMarkingCategoryPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetMarkingCategoryPermissionDenied";
  errorDescription:
    "The provided token does not have permission to view the marking category.";
  errorInstanceId: string;
  parameters: {
    markingCategoryId: unknown;
  };
}

/**
 * The provided token does not have permission to view the marking.
 *
 * Log Safety: UNSAFE
 */
export interface GetMarkingPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetMarkingPermissionDenied";
  errorDescription:
    "The provided token does not have permission to view the marking.";
  errorInstanceId: string;
  parameters: {
    markingId: unknown;
  };
}

/**
 * Could not getMarkings the User.
 *
 * Log Safety: SAFE
 */
export interface GetMarkingsUserPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetMarkingsUserPermissionDenied";
  errorDescription: "Could not getMarkings the User.";
  errorInstanceId: string;
  parameters: {
    userId: unknown;
  };
}

/**
 * Could not profilePicture the User.
 *
 * Log Safety: SAFE
 */
export interface GetProfilePictureOfUserPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetProfilePictureOfUserPermissionDenied";
  errorDescription: "Could not profilePicture the User.";
  errorInstanceId: string;
  parameters: {
    userId: unknown;
  };
}

/**
 * The provided token does not have permission to view the provider information for the given user.
 *
 * Log Safety: SAFE
 */
export interface GetUserProviderInfoPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetUserProviderInfoPermissionDenied";
  errorDescription:
    "The provided token does not have permission to view the provider information for the given user.";
  errorInstanceId: string;
  parameters: {
    userId: unknown;
  };
}

/**
 * The given GroupMembershipExpirationPolicy could not be found.
 *
 * Log Safety: SAFE
 */
export interface GroupMembershipExpirationPolicyNotFound {
  errorCode: "NOT_FOUND";
  errorName: "GroupMembershipExpirationPolicyNotFound";
  errorDescription:
    "The given GroupMembershipExpirationPolicy could not be found.";
  errorInstanceId: string;
  parameters: {
    groupId: unknown;
  };
}

/**
 * A group with this name already exists
 *
 * Log Safety: UNSAFE
 */
export interface GroupNameAlreadyExists {
  errorCode: "INVALID_ARGUMENT";
  errorName: "GroupNameAlreadyExists";
  errorDescription: "A group with this name already exists";
  errorInstanceId: string;
  parameters: {
    groupName: unknown;
  };
}

/**
 * The given Group could not be found.
 *
 * Log Safety: SAFE
 */
export interface GroupNotFound {
  errorCode: "NOT_FOUND";
  errorName: "GroupNotFound";
  errorDescription: "The given Group could not be found.";
  errorInstanceId: string;
  parameters: {
    groupId: unknown;
  };
}

/**
 * The given GroupProviderInfo could not be found.
 *
 * Log Safety: SAFE
 */
export interface GroupProviderInfoNotFound {
  errorCode: "NOT_FOUND";
  errorName: "GroupProviderInfoNotFound";
  errorDescription: "The given GroupProviderInfo could not be found.";
  errorInstanceId: string;
  parameters: {
    groupId: unknown;
  };
}

/**
 * The member expiration you provided does not conform to the Group's requirements for member expirations.
 *
 * Log Safety: SAFE
 */
export interface InvalidGroupMembershipExpiration {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidGroupMembershipExpiration";
  errorDescription:
    "The member expiration you provided does not conform to the Group's requirements for member expirations.";
  errorInstanceId: string;
  parameters: {
    groupId: unknown;
    earliestExpiration: unknown;
    maximumDuration: unknown;
    maximumValue: unknown;
  };
}

/**
 * At least one Organization RID must be provided for a group
 *
 * Log Safety: SAFE
 */
export interface InvalidGroupOrganizations {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidGroupOrganizations";
  errorDescription:
    "At least one Organization RID must be provided for a group";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The provided hostname must be a valid domain name. The only allowed characters are letters, numbers, periods, and hyphens.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidHostName {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidHostName";
  errorDescription:
    "The provided hostname must be a valid domain name. The only allowed characters are letters, numbers, periods, and hyphens.";
  errorInstanceId: string;
  parameters: {
    invalidHostName: unknown;
  };
}

/**
 * The user's profile picture is not a valid image
 *
 * Log Safety: SAFE
 */
export interface InvalidProfilePicture {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidProfilePicture";
  errorDescription: "The user's profile picture is not a valid image";
  errorInstanceId: string;
  parameters: {
    userId: unknown;
  };
}

/**
 * Could not listAvailableRoles the Organization.
 *
 * Log Safety: SAFE
 */
export interface ListAvailableRolesOrganizationPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ListAvailableRolesOrganizationPermissionDenied";
  errorDescription: "Could not listAvailableRoles the Organization.";
  errorInstanceId: string;
  parameters: {
    organizationRid: unknown;
  };
}

/**
 * The provided token does not have permission to list assigned roles for this enrollment.
 *
 * Log Safety: SAFE
 */
export interface ListEnrollmentRoleAssignmentsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ListEnrollmentRoleAssignmentsPermissionDenied";
  errorDescription:
    "The provided token does not have permission to list assigned roles for this enrollment.";
  errorInstanceId: string;
  parameters: {
    enrollmentRid: unknown;
  };
}

/**
 * You do not have permission to list hosts for this enrollment
 *
 * Log Safety: SAFE
 */
export interface ListHostsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ListHostsPermissionDenied";
  errorDescription:
    "You do not have permission to list hosts for this enrollment";
  errorInstanceId: string;
  parameters: {
    enrollmentRid: unknown;
  };
}

/**
 * The provided token does not have permission to list the members of this marking.
 *
 * Log Safety: UNSAFE
 */
export interface ListMarkingMembersPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ListMarkingMembersPermissionDenied";
  errorDescription:
    "The provided token does not have permission to list the members of this marking.";
  errorInstanceId: string;
  parameters: {
    markingId: unknown;
  };
}

/**
 * The provided token does not have permission to list assigned roles for this marking.
 *
 * Log Safety: UNSAFE
 */
export interface ListMarkingRoleAssignmentsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ListMarkingRoleAssignmentsPermissionDenied";
  errorDescription:
    "The provided token does not have permission to list assigned roles for this marking.";
  errorInstanceId: string;
  parameters: {
    markingId: unknown;
  };
}

/**
 * The provided token does not have permission to list assigned roles for this organization.
 *
 * Log Safety: SAFE
 */
export interface ListOrganizationRoleAssignmentsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ListOrganizationRoleAssignmentsPermissionDenied";
  errorDescription:
    "The provided token does not have permission to list assigned roles for this organization.";
  errorInstanceId: string;
  parameters: {
    organizationRid: unknown;
  };
}

/**
 * The given MarkingCategory could not be found.
 *
 * Log Safety: SAFE
 */
export interface MarkingCategoryNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarkingCategoryNotFound";
  errorDescription: "The given MarkingCategory could not be found.";
  errorInstanceId: string;
  parameters: {
    markingCategoryId: unknown;
  };
}

/**
 * A marking with the same name already exists in the category.
 *
 * Log Safety: UNSAFE
 */
export interface MarkingNameInCategoryAlreadyExists {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MarkingNameInCategoryAlreadyExists";
  errorDescription:
    "A marking with the same name already exists in the category.";
  errorInstanceId: string;
  parameters: {
    displayName: unknown;
    categoryId: unknown;
  };
}

/**
 * The marking name is empty.
 *
 * Log Safety: SAFE
 */
export interface MarkingNameIsEmpty {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MarkingNameIsEmpty";
  errorDescription: "The marking name is empty.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The given Marking could not be found.
 *
 * Log Safety: UNSAFE
 */
export interface MarkingNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarkingNotFound";
  errorDescription: "The given Marking could not be found.";
  errorInstanceId: string;
  parameters: {
    markingId: unknown;
  };
}

/**
 * An organization with the same name already exists.
 *
 * Log Safety: UNSAFE
 */
export interface OrganizationNameAlreadyExists {
  errorCode: "INVALID_ARGUMENT";
  errorName: "OrganizationNameAlreadyExists";
  errorDescription: "An organization with the same name already exists.";
  errorInstanceId: string;
  parameters: {
    displayName: unknown;
  };
}

/**
 * The given Organization could not be found.
 *
 * Log Safety: SAFE
 */
export interface OrganizationNotFound {
  errorCode: "NOT_FOUND";
  errorName: "OrganizationNotFound";
  errorDescription: "The given Organization could not be found.";
  errorInstanceId: string;
  parameters: {
    organizationRid: unknown;
  };
}

/**
 * Could not preregisterGroup the AuthenticationProvider.
 *
 * Log Safety: SAFE
 */
export interface PreregisterGroupPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "PreregisterGroupPermissionDenied";
  errorDescription: "Could not preregisterGroup the AuthenticationProvider.";
  errorInstanceId: string;
  parameters: {
    enrollmentRid: unknown;
    authenticationProviderRid: unknown;
  };
}

/**
 * Could not preregisterUser the AuthenticationProvider.
 *
 * Log Safety: SAFE
 */
export interface PreregisterUserPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "PreregisterUserPermissionDenied";
  errorDescription: "Could not preregisterUser the AuthenticationProvider.";
  errorInstanceId: string;
  parameters: {
    enrollmentRid: unknown;
    authenticationProviderRid: unknown;
  };
}

/**
 * A principal (User or Group) with the given PrincipalId could not be found
 *
 * Log Safety: SAFE
 */
export interface PrincipalNotFound {
  errorCode: "NOT_FOUND";
  errorName: "PrincipalNotFound";
  errorDescription:
    "A principal (User or Group) with the given PrincipalId could not be found";
  errorInstanceId: string;
  parameters: {
    principalId: unknown;
  };
}

/**
 * The user has not set a profile picture
 *
 * Log Safety: SAFE
 */
export interface ProfilePictureNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ProfilePictureNotFound";
  errorDescription: "The user has not set a profile picture";
  errorInstanceId: string;
  parameters: {
    userId: unknown;
  };
}

/**
 * The Profile service is unexpectedly not present.
 *
 * Log Safety: SAFE
 */
export interface ProfileServiceNotPresent {
  errorCode: "INTERNAL";
  errorName: "ProfileServiceNotPresent";
  errorDescription: "The Profile service is unexpectedly not present.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not remove the EnrollmentRoleAssignment.
 *
 * Log Safety: SAFE
 */
export interface RemoveEnrollmentRoleAssignmentsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RemoveEnrollmentRoleAssignmentsPermissionDenied";
  errorDescription: "Could not remove the EnrollmentRoleAssignment.";
  errorInstanceId: string;
  parameters: {
    enrollmentRid: unknown;
  };
}

/**
 * Could not remove the GroupMember.
 *
 * Log Safety: SAFE
 */
export interface RemoveGroupMembersPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RemoveGroupMembersPermissionDenied";
  errorDescription: "Could not remove the GroupMember.";
  errorInstanceId: string;
  parameters: {
    groupId: unknown;
  };
}

/**
 * Could not remove the MarkingMember.
 *
 * Log Safety: UNSAFE
 */
export interface RemoveMarkingMembersPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RemoveMarkingMembersPermissionDenied";
  errorDescription: "Could not remove the MarkingMember.";
  errorInstanceId: string;
  parameters: {
    markingId: unknown;
  };
}

/**
 * Could not remove the MarkingRoleAssignment.
 *
 * Log Safety: UNSAFE
 */
export interface RemoveMarkingRoleAssignmentsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RemoveMarkingRoleAssignmentsPermissionDenied";
  errorDescription: "Could not remove the MarkingRoleAssignment.";
  errorInstanceId: string;
  parameters: {
    markingId: unknown;
  };
}

/**
 * You cannot remove all administrators from a marking.
 *
 * Log Safety: UNSAFE
 */
export interface RemoveMarkingRoleAssignmentsRemoveAllAdministratorsNotAllowed {
  errorCode: "INVALID_ARGUMENT";
  errorName: "RemoveMarkingRoleAssignmentsRemoveAllAdministratorsNotAllowed";
  errorDescription: "You cannot remove all administrators from a marking.";
  errorInstanceId: string;
  parameters: {
    markingId: unknown;
    currentAdministrators: unknown;
  };
}

/**
 * Could not remove the OrganizationRoleAssignment.
 *
 * Log Safety: SAFE
 */
export interface RemoveOrganizationRoleAssignmentsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RemoveOrganizationRoleAssignmentsPermissionDenied";
  errorDescription: "Could not remove the OrganizationRoleAssignment.";
  errorInstanceId: string;
  parameters: {
    organizationRid: unknown;
  };
}

/**
 * Could not replace the GroupMembershipExpirationPolicy.
 *
 * Log Safety: SAFE
 */
export interface ReplaceGroupMembershipExpirationPolicyPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReplaceGroupMembershipExpirationPolicyPermissionDenied";
  errorDescription: "Could not replace the GroupMembershipExpirationPolicy.";
  errorInstanceId: string;
  parameters: {
    groupId: unknown;
  };
}

/**
 * Could not replace the GroupProviderInfo.
 *
 * Log Safety: SAFE
 */
export interface ReplaceGroupProviderInfoPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReplaceGroupProviderInfoPermissionDenied";
  errorDescription: "Could not replace the GroupProviderInfo.";
  errorInstanceId: string;
  parameters: {
    groupId: unknown;
  };
}

/**
 * Could not replace the Marking.
 *
 * Log Safety: UNSAFE
 */
export interface ReplaceMarkingPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReplaceMarkingPermissionDenied";
  errorDescription: "Could not replace the Marking.";
  errorInstanceId: string;
  parameters: {
    markingId: unknown;
  };
}

/**
 * Could not replace the Organization.
 *
 * Log Safety: SAFE
 */
export interface ReplaceOrganizationPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReplaceOrganizationPermissionDenied";
  errorDescription: "Could not replace the Organization.";
  errorInstanceId: string;
  parameters: {
    organizationRid: unknown;
  };
}

/**
 * Could not replace the UserProviderInfo.
 *
 * Log Safety: SAFE
 */
export interface ReplaceUserProviderInfoPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReplaceUserProviderInfoPermissionDenied";
  errorDescription: "Could not replace the UserProviderInfo.";
  errorInstanceId: string;
  parameters: {
    userId: unknown;
  };
}

/**
 * Could not revokeAllTokens the User.
 *
 * Log Safety: SAFE
 */
export interface RevokeAllTokensUserPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RevokeAllTokensUserPermissionDenied";
  errorDescription: "Could not revokeAllTokens the User.";
  errorInstanceId: string;
  parameters: {
    userId: unknown;
  };
}

/**
 * The given Role could not be found.
 *
 * Log Safety: SAFE
 */
export interface RoleNotFound {
  errorCode: "NOT_FOUND";
  errorName: "RoleNotFound";
  errorDescription: "The given Role could not be found.";
  errorInstanceId: string;
  parameters: {
    roleId: unknown;
  };
}

/**
 * Could not search the Group.
 *
 * Log Safety: SAFE
 */
export interface SearchGroupsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "SearchGroupsPermissionDenied";
  errorDescription: "Could not search the Group.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not search the User.
 *
 * Log Safety: SAFE
 */
export interface SearchUsersPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "SearchUsersPermissionDenied";
  errorDescription: "Could not search the User.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The user is deleted.
 *
 * Log Safety: SAFE
 */
export interface UserDeleted {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UserDeleted";
  errorDescription: "The user is deleted.";
  errorInstanceId: string;
  parameters: {
    principalId: unknown;
  };
}

/**
 * The user is an active user.
 *
 * Log Safety: SAFE
 */
export interface UserIsActive {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UserIsActive";
  errorDescription: "The user is an active user.";
  errorInstanceId: string;
  parameters: {
    principalId: unknown;
  };
}

/**
 * The given User could not be found.
 *
 * Log Safety: SAFE
 */
export interface UserNotFound {
  errorCode: "NOT_FOUND";
  errorName: "UserNotFound";
  errorDescription: "The given User could not be found.";
  errorInstanceId: string;
  parameters: {
    userId: unknown;
  };
}

/**
 * The given UserProviderInfo could not be found.
 *
 * Log Safety: SAFE
 */
export interface UserProviderInfoNotFound {
  errorCode: "NOT_FOUND";
  errorName: "UserProviderInfoNotFound";
  errorDescription: "The given UserProviderInfo could not be found.";
  errorInstanceId: string;
  parameters: {
    userId: unknown;
  };
}
