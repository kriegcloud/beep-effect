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

import type * as _Core from "@osdk/foundry.core";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * Log Safety: SAFE
 */
export interface AddEnrollmentRoleAssignmentsRequest {
  roleAssignments: Array<_Core.RoleAssignmentUpdate>;
}

/**
 * Log Safety: SAFE
 */
export interface AddGroupMembersRequest {
  principalIds: Array<_Core.PrincipalId>;
  expiration?: GroupMembershipExpiration;
}

/**
 * Log Safety: SAFE
 */
export interface AddMarkingMembersRequest {
  principalIds: Array<_Core.PrincipalId>;
}

/**
 * Log Safety: SAFE
 */
export interface AddMarkingRoleAssignmentsRequest {
  roleAssignments: Array<MarkingRoleUpdate>;
}

/**
 * Log Safety: SAFE
 */
export interface AddOrganizationRoleAssignmentsRequest {
  roleAssignments: Array<_Core.RoleAssignmentUpdate>;
}

/**
 * Log Safety: UNSAFE
 */
export type AttributeName = LooselyBrandedString<"AttributeName">;

/**
 * Log Safety: UNSAFE
 */
export type AttributeValue = LooselyBrandedString<"AttributeValue">;

/**
 * Log Safety: UNSAFE
 */
export type AttributeValues = Array<AttributeValue>;

/**
 * Log Safety: UNSAFE
 */
export type AuthenticationProtocol =
  | ({ type: "saml" } & SamlAuthenticationProtocol)
  | ({ type: "oidc" } & OidcAuthenticationProtocol);

/**
 * Log Safety: UNSAFE
 */
export interface AuthenticationProvider {
  rid: AuthenticationProviderRid;
  name: AuthenticationProviderName;
  realm: _Core.Realm;
  enabled: AuthenticationProviderEnabled;
  supportedHosts: Array<HostName>;
  supportedUsernamePatterns: Array<string>;
  protocol: AuthenticationProtocol;
}

/**
 * Whether users can log in using this provider.
 *
 * Log Safety: SAFE
 */
export type AuthenticationProviderEnabled = boolean;

/**
 * Log Safety: SAFE
 */
export type AuthenticationProviderName = LooselyBrandedString<
  "AuthenticationProviderName"
>;

/**
 * Log Safety: SAFE
 */
export type AuthenticationProviderRid = LooselyBrandedString<
  "AuthenticationProviderRid"
>;

/**
 * Log Safety: UNSAFE
 */
export interface CertificateInfo {
  pemCertificate: string;
  commonName?: string;
  expiryDate: string;
  usageType: CertificateUsageType;
}

/**
 * Log Safety: SAFE
 */
export type CertificateUsageType = "ENCRYPTION" | "SIGNING" | "UNSPECIFIED";

/**
 * Log Safety: UNSAFE
 */
export interface CreateGroupRequest {
  name: GroupName;
  organizations: Array<_Core.OrganizationRid>;
  description?: string;
  attributes: Record<AttributeName, AttributeValues>;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateMarkingCategoryRequest {
  initialPermissions: MarkingCategoryPermissions;
  name: MarkingCategoryName;
  description: MarkingCategoryDescription;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateMarkingRequest {
  initialRoleAssignments: Array<MarkingRoleUpdate>;
  initialMembers: Array<_Core.PrincipalId>;
  name: MarkingName;
  description?: string;
  categoryId: MarkingCategoryId;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateOrganizationRequest {
  administrators: Array<_Core.PrincipalId>;
  enrollmentRid: _Core.EnrollmentRid;
  name: OrganizationName;
  host?: HostName;
  description?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface Enrollment {
  rid: _Core.EnrollmentRid;
  name: EnrollmentName;
  createdTime?: _Core.CreatedTime;
}

/**
 * Log Safety: UNSAFE
 */
export type EnrollmentName = LooselyBrandedString<"EnrollmentName">;

/**
 * Log Safety: SAFE
 */
export interface EnrollmentRoleAssignment {
  principalType: _Core.PrincipalType;
  principalId: _Core.PrincipalId;
  roleId: _Core.RoleId;
}

/**
 * Log Safety: SAFE
 */
export interface GetGroupsBatchRequestElement {
  groupId: _Core.GroupId;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetGroupsBatchResponse {
  data: Record<_Core.GroupId, Group>;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetMarkingsBatchRequestElement {
  markingId: _Core.MarkingId;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetMarkingsBatchResponse {
  data: Record<_Core.MarkingId, Marking>;
}

/**
 * Log Safety: SAFE
 */
export interface GetRolesBatchRequestElement {
  roleId: _Core.RoleId;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetRolesBatchResponse {
  data: Record<_Core.RoleId, Role>;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetUserMarkingsResponse {
  view: Array<_Core.MarkingId>;
}

/**
 * Log Safety: SAFE
 */
export interface GetUsersBatchRequestElement {
  userId: _Core.UserId;
  status?: _Core.UserStatus;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetUsersBatchResponse {
  data: Record<_Core.UserId, User>;
}

/**
 * Log Safety: UNSAFE
 */
export interface Group {
  id: _Core.GroupId;
  name: GroupName;
  description?: string;
  realm: _Core.Realm;
  organizations: Array<_Core.OrganizationRid>;
  attributes: Record<AttributeName, AttributeValues>;
}

/**
 * Log Safety: SAFE
 */
export interface GroupMember {
  principalType: _Core.PrincipalType;
  principalId: _Core.PrincipalId;
}

/**
 * Log Safety: SAFE
 */
export interface GroupMembership {
  groupId: _Core.GroupId;
}

/**
 * Log Safety: SAFE
 */
export type GroupMembershipExpiration = string;

/**
 * Log Safety: SAFE
 */
export interface GroupMembershipExpirationPolicy {
  maximumValue?: GroupMembershipExpiration;
  maximumDuration?: _Core.DurationSeconds;
}

/**
 * The name of the Group.
 *
 * Log Safety: UNSAFE
 */
export type GroupName = LooselyBrandedString<"GroupName">;

/**
 * Log Safety: UNSAFE
 */
export interface GroupProviderInfo {
  providerId: ProviderId;
}

/**
 * Log Safety: UNSAFE
 */
export interface GroupSearchFilter {
  type: PrincipalFilterType;
  value: string;
}

/**
 * Log Safety: SAFE
 */
export interface Host {
  hostName: HostName;
}

/**
 * Log Safety: SAFE
 */
export type HostName = LooselyBrandedString<"HostName">;

/**
 * Log Safety: UNSAFE
 */
export interface ListAuthenticationProvidersResponse {
  data: Array<AuthenticationProvider>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListAvailableOrganizationRolesResponse {
  data: Array<_Core.Role>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListDeletedUsersResponse {
  data: Array<User>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListEnrollmentRoleAssignmentsResponse {
  data: Array<EnrollmentRoleAssignment>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListGroupMembershipsResponse {
  data: Array<GroupMembership>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListGroupMembersResponse {
  data: Array<GroupMember>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListGroupsResponse {
  data: Array<Group>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListHostsResponse {
  data: Array<Host>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListMarkingCategoriesResponse {
  data: Array<MarkingCategory>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListMarkingMembersResponse {
  data: Array<MarkingMember>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListMarkingRoleAssignmentsResponse {
  data: Array<MarkingRoleAssignment>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListMarkingsResponse {
  data: Array<Marking>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListOrganizationRoleAssignmentsResponse {
  data: Array<OrganizationRoleAssignment>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListUsersResponse {
  data: Array<User>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface Marking {
  id: _Core.MarkingId;
  categoryId: MarkingCategoryId;
  name: MarkingName;
  description?: string;
  organization?: _Core.OrganizationRid;
  createdTime: _Core.CreatedTime;
  createdBy?: _Core.CreatedBy;
}

/**
 * Log Safety: UNSAFE
 */
export interface MarkingCategory {
  id: MarkingCategoryId;
  name: MarkingCategoryName;
  description: MarkingCategoryDescription;
  categoryType: MarkingCategoryType;
  markingType: MarkingType;
  markings: Array<_Core.MarkingId>;
  createdTime: _Core.CreatedTime;
  createdBy?: _Core.CreatedBy;
}

/**
 * Log Safety: UNSAFE
 */
export type MarkingCategoryDescription = LooselyBrandedString<
  "MarkingCategoryDescription"
>;

/**
   * The ID of a marking category. For user-created categories, this will be a UUID. Markings associated with
Organizations are placed in a category with ID "Organization".
   *
   * Log Safety: SAFE
   */
export type MarkingCategoryId = LooselyBrandedString<"MarkingCategoryId">;

/**
 * Log Safety: UNSAFE
 */
export type MarkingCategoryName = LooselyBrandedString<"MarkingCategoryName">;

/**
 * Log Safety: SAFE
 */
export interface MarkingCategoryPermissions {
  organizationRids: Array<_Core.OrganizationRid>;
  roles: Array<MarkingCategoryRoleAssignment>;
  isPublic: MarkingCategoryPermissionsIsPublic;
}

/**
 * If true, all users who are members of at least one of the Organizations from organizationRids can view the Markings in the category. If false, only users who are explicitly granted the VIEW role can view the Markings in the category.
 *
 * Log Safety: SAFE
 */
export type MarkingCategoryPermissionsIsPublic = boolean;

/**
   * Represents the operations that a user can perform with regards to a Marking Category.

ADMINISTER: The user can update a Marking Category's metadata and permissions
VIEW: The user can view the Marking Category and the Markings within it.

NOTE: Permissions to administer or view a Marking Category do not confer any permissions to administer or view data protected by the Markings within that category.
   *
   * Log Safety: SAFE
   */
export type MarkingCategoryRole = "ADMINISTER" | "VIEW";

/**
 * Log Safety: SAFE
 */
export interface MarkingCategoryRoleAssignment {
  role: MarkingCategoryRole;
  principalId: _Core.PrincipalId;
}

/**
 * Log Safety: SAFE
 */
export type MarkingCategoryType = "CONJUNCTIVE" | "DISJUNCTIVE";

/**
 * Log Safety: SAFE
 */
export interface MarkingMember {
  principalType: _Core.PrincipalType;
  principalId: _Core.PrincipalId;
}

/**
 * Log Safety: UNSAFE
 */
export type MarkingName = LooselyBrandedString<"MarkingName">;

/**
   * Represents the operations that a user can perform with regards to a Marking.

ADMINISTER: The user can add and remove members from the Marking, update Marking Role Assignments, and change Marking metadata.
DECLASSIFY: The user can remove the Marking from resources in the platform and stop the propagation of the Marking during a transform.
USE: The user can apply the marking to resources in the platform.
   *
   * Log Safety: SAFE
   */
export type MarkingRole = "ADMINISTER" | "DECLASSIFY" | "USE";

/**
 * Log Safety: SAFE
 */
export interface MarkingRoleAssignment {
  principalType: _Core.PrincipalType;
  principalId: _Core.PrincipalId;
  role: MarkingRole;
}

/**
 * Log Safety: SAFE
 */
export interface MarkingRoleUpdate {
  role: MarkingRole;
  principalId: _Core.PrincipalId;
}

/**
 * Log Safety: SAFE
 */
export type MarkingType = "MANDATORY" | "CBAC";

/**
 * Log Safety: SAFE
 */
export interface OidcAuthenticationProtocol {}

/**
 * Log Safety: UNSAFE
 */
export interface Organization {
  rid: _Core.OrganizationRid;
  name: OrganizationName;
  description?: string;
  markingId: _Core.MarkingId;
  host?: HostName;
}

/**
 * Log Safety: UNSAFE
 */
export type OrganizationName = LooselyBrandedString<"OrganizationName">;

/**
 * Log Safety: SAFE
 */
export interface OrganizationRoleAssignment {
  principalType: _Core.PrincipalType;
  principalId: _Core.PrincipalId;
  roleId: _Core.RoleId;
}

/**
 * Log Safety: UNSAFE
 */
export interface PreregisterGroupRequest {
  name: GroupName;
  organizations: Array<_Core.OrganizationRid>;
}

/**
 * Log Safety: UNSAFE
 */
export interface PreregisterUserRequest {
  username: UserUsername;
  organization: _Core.OrganizationRid;
  givenName?: string;
  familyName?: string;
  email?: string;
  attributes?: Record<AttributeName, AttributeValues>;
}

/**
 * Log Safety: SAFE
 */
export type PrincipalFilterType = "queryString";

/**
 * A value that uniquely identifies a User or Group in an external authentication provider. This value is determined by the external authentication provider and must be unique per Realm.
 *
 * Log Safety: UNSAFE
 */
export type ProviderId = LooselyBrandedString<"ProviderId">;

/**
 * Log Safety: SAFE
 */
export interface RemoveEnrollmentRoleAssignmentsRequest {
  roleAssignments: Array<_Core.RoleAssignmentUpdate>;
}

/**
 * Log Safety: SAFE
 */
export interface RemoveGroupMembersRequest {
  principalIds: Array<_Core.PrincipalId>;
}

/**
 * Log Safety: SAFE
 */
export interface RemoveMarkingMembersRequest {
  principalIds: Array<_Core.PrincipalId>;
}

/**
 * Log Safety: SAFE
 */
export interface RemoveMarkingRoleAssignmentsRequest {
  roleAssignments: Array<MarkingRoleUpdate>;
}

/**
 * Log Safety: SAFE
 */
export interface RemoveOrganizationRoleAssignmentsRequest {
  roleAssignments: Array<_Core.RoleAssignmentUpdate>;
}

/**
 * Log Safety: SAFE
 */
export interface ReplaceGroupMembershipExpirationPolicyRequest {
  maximumDuration?: _Core.DurationSeconds;
  maximumValue?: GroupMembershipExpiration;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceGroupProviderInfoRequest {
  providerId: ProviderId;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceMarkingRequest {
  name: MarkingName;
  description?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceOrganizationRequest {
  name: OrganizationName;
  host?: HostName;
  description?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceUserProviderInfoRequest {
  providerId: ProviderId;
}

/**
 * Log Safety: UNSAFE
 */
export interface Role {
  id: _Core.RoleId;
  displayName: RoleDisplayName;
  description: RoleDescription;
  operations: Array<string>;
  canAssigns: Array<_Core.RoleId>;
}

/**
 * Log Safety: UNSAFE
 */
export type RoleDescription = LooselyBrandedString<"RoleDescription">;

/**
 * Log Safety: UNSAFE
 */
export type RoleDisplayName = LooselyBrandedString<"RoleDisplayName">;

/**
 * Log Safety: UNSAFE
 */
export interface SamlAuthenticationProtocol {
  serviceProviderMetadata: SamlServiceProviderMetadata;
}

/**
 * Information that describes a Foundry Authentication Provider as a SAML service provider. All information listed here is generated by Foundry.
 *
 * Log Safety: UNSAFE
 */
export interface SamlServiceProviderMetadata {
  entityId: string;
  metadataUrl: string;
  acsUrls: Array<string>;
  logoutUrls: Array<string>;
  certificates: Array<CertificateInfo>;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchGroupsRequest {
  where: GroupSearchFilter;
  pageSize?: _Core.PageSize;
  pageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchGroupsResponse {
  data: Array<Group>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchUsersRequest {
  where: UserSearchFilter;
  pageSize?: _Core.PageSize;
  pageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchUsersResponse {
  data: Array<User>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface User {
  id: _Core.UserId;
  username: UserUsername;
  givenName?: string;
  familyName?: string;
  email?: string;
  realm: _Core.Realm;
  organization?: _Core.OrganizationRid;
  status: _Core.UserStatus;
  attributes: Record<AttributeName, AttributeValues>;
}

/**
 * Log Safety: UNSAFE
 */
export interface UserProviderInfo {
  providerId: ProviderId;
}

/**
 * Log Safety: UNSAFE
 */
export interface UserSearchFilter {
  type: PrincipalFilterType;
  value: string;
}

/**
 * The Foundry username of the User. This is unique within the realm.
 *
 * Log Safety: UNSAFE
 */
export type UserUsername = LooselyBrandedString<"UserUsername">;
