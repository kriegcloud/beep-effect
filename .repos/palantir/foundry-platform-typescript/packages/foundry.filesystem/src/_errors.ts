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
 * The user is not authorized to add a a group to the parent group required to create the project from template.
 *
 * Log Safety: UNSAFE
 */
export interface AddGroupToParentGroupPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AddGroupToParentGroupPermissionDenied";
  errorDescription:
    "The user is not authorized to add a a group to the parent group required to create the project from template.";
  errorInstanceId: string;
  parameters: {
    parentGroupsWithoutPermission: unknown;
  };
}

/**
 * Could not addMarkings the Resource.
 *
 * Log Safety: UNSAFE
 */
export interface AddMarkingsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AddMarkingsPermissionDenied";
  errorDescription: "Could not addMarkings the Resource.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * Could not addOrganizations the Project.
 *
 * Log Safety: SAFE
 */
export interface AddOrganizationsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AddOrganizationsPermissionDenied";
  errorDescription: "Could not addOrganizations the Project.";
  errorInstanceId: string;
  parameters: {
    projectRid: unknown;
  };
}

/**
 * Could not add the ResourceRole.
 *
 * Log Safety: UNSAFE
 */
export interface AddResourceRolesPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AddResourceRolesPermissionDenied";
  errorDescription: "Could not add the ResourceRole.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * The given Resource is not a folder.
 *
 * Log Safety: SAFE
 */
export interface CreateFolderOutsideProjectNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CreateFolderOutsideProjectNotSupported";
  errorDescription: "The given Resource is not a folder.";
  errorInstanceId: string;
  parameters: {
    parentFolderRid: unknown;
  };
}

/**
 * Could not create the Folder.
 *
 * Log Safety: SAFE
 */
export interface CreateFolderPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateFolderPermissionDenied";
  errorDescription: "Could not create the Folder.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The user is not authorized to create the group in the organization required to create the project from template.
 *
 * Log Safety: SAFE
 */
export interface CreateGroupPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateGroupPermissionDenied";
  errorDescription:
    "The user is not authorized to create the group in the organization required to create the project from template.";
  errorInstanceId: string;
  parameters: {
    organizationsWithoutPermission: unknown;
  };
}

/**
 * Could not createFromTemplate the Project.
 *
 * Log Safety: SAFE
 */
export interface CreateProjectFromTemplatePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateProjectFromTemplatePermissionDenied";
  errorDescription: "Could not createFromTemplate the Project.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The create project request would create a project with no principal being granted an owner-like role. As a result, there would be no user with administrative privileges over the project. A role is defined to be owner-like if it has the compass:edit-project operation. In the common case of the default role-set, this is just the compass:manage role.
 *
 * Log Safety: SAFE
 */
export interface CreateProjectNoOwnerLikeRoleGrant {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CreateProjectNoOwnerLikeRoleGrant";
  errorDescription:
    "The create project request would create a project with no principal being granted an owner-like role. As a result, there would be no user with administrative privileges over the project. A role is defined to be owner-like if it has the compass:edit-project operation. In the common case of the default role-set, this is just the compass:manage role.";
  errorInstanceId: string;
  parameters: {
    grantedRoleIds: unknown;
    roleSetOwnerLikeRoleIds: unknown;
  };
}

/**
 * Could not create the Project.
 *
 * Log Safety: SAFE
 */
export interface CreateProjectPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateProjectPermissionDenied";
  errorDescription: "Could not create the Project.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not create the Space.
 *
 * Log Safety: SAFE
 */
export interface CreateSpacePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateSpacePermissionDenied";
  errorDescription: "Could not create the Space.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The requested default roles are not in the role set of the space for the project template.
 *
 * Log Safety: SAFE
 */
export interface DefaultRolesNotInSpaceRoleSet {
  errorCode: "INVALID_ARGUMENT";
  errorName: "DefaultRolesNotInSpaceRoleSet";
  errorDescription:
    "The requested default roles are not in the role set of the space for the project template.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not delete the Resource.
 *
 * Log Safety: UNSAFE
 */
export interface DeleteResourcePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteResourcePermissionDenied";
  errorDescription: "Could not delete the Resource.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * Could not delete the Space.
 *
 * Log Safety: SAFE
 */
export interface DeleteSpacePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteSpacePermissionDenied";
  errorDescription: "Could not delete the Space.";
  errorInstanceId: string;
  parameters: {
    spaceRid: unknown;
  };
}

/**
 * An enrollment was not found for the user.
 *
 * Log Safety: SAFE
 */
export interface EnrollmentNotFound {
  errorCode: "NOT_FOUND";
  errorName: "EnrollmentNotFound";
  errorDescription: "An enrollment was not found for the user.";
  errorInstanceId: string;
  parameters: {
    enrollmentRid: unknown;
  };
}

/**
 * The given Folder could not be found.
 *
 * Log Safety: SAFE
 */
export interface FolderNotFound {
  errorCode: "NOT_FOUND";
  errorName: "FolderNotFound";
  errorDescription: "The given Folder could not be found.";
  errorInstanceId: string;
  parameters: {
    folderRid: unknown;
  };
}

/**
 * Performing this operation on an autosaved resource is not supported.
 *
 * Log Safety: UNSAFE
 */
export interface ForbiddenOperationOnAutosavedResource {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ForbiddenOperationOnAutosavedResource";
  errorDescription:
    "Performing this operation on an autosaved resource is not supported.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * Performing this operation on a hidden resource is not supported.
 *
 * Log Safety: UNSAFE
 */
export interface ForbiddenOperationOnHiddenResource {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ForbiddenOperationOnHiddenResource";
  errorDescription:
    "Performing this operation on a hidden resource is not supported.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * Could not getAccessRequirements the Resource.
 *
 * Log Safety: UNSAFE
 */
export interface GetAccessRequirementsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetAccessRequirementsPermissionDenied";
  errorDescription: "Could not getAccessRequirements the Resource.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * Could not getByPath the Resource.
 *
 * Log Safety: SAFE
 */
export interface GetByPathPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetByPathPermissionDenied";
  errorDescription: "Could not getByPath the Resource.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Getting the root folder as a resource is not supported.
 *
 * Log Safety: SAFE
 */
export interface GetRootFolderNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "GetRootFolderNotSupported";
  errorDescription: "Getting the root folder as a resource is not supported.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Getting a space as a resource is not supported.
 *
 * Log Safety: SAFE
 */
export interface GetSpaceResourceNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "GetSpaceResourceNotSupported";
  errorDescription: "Getting a space as a resource is not supported.";
  errorInstanceId: string;
  parameters: {
    spaceRid: unknown;
  };
}

/**
 * Either the user has not passed default roles for a template with suggested default roles, or has passed default roles for a template with fixed default roles.
 *
 * Log Safety: SAFE
 */
export interface InvalidDefaultRoles {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidDefaultRoles";
  errorDescription:
    "Either the user has not passed default roles for a template with suggested default roles, or has passed default roles for a template with fixed default roles.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Either the user has not passed a value for a template with unset project description, or has passed a value for a template with fixed project description.
 *
 * Log Safety: SAFE
 */
export interface InvalidDescription {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidDescription";
  errorDescription:
    "Either the user has not passed a value for a template with unset project description, or has passed a value for a template with fixed project description.";
  errorInstanceId: string;
  parameters: {};
}

/**
   * The display name of a Resource should not be exactly . or .., contain a forward slash / and must be
less than or equal to 700 characters.
   *
   * Log Safety: UNSAFE
   */
export interface InvalidDisplayName {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidDisplayName";
  errorDescription:
    "The display name of a Resource should not be exactly . or .., contain a forward slash / and must be less than or equal to 700 characters.";
  errorInstanceId: string;
  parameters: {
    displayName: unknown;
  };
}

/**
 * The given Resource is not a Folder.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidFolder {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidFolder";
  errorDescription: "The given Resource is not a Folder.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
   * Organizations on a project must also exist on the parent space. This error is thrown if the configuration
of a project's organizations (on creation or subsequently) results in the project being marked with either
no organizations in a marked space, or with an organization that is not present on the parent space.
   *
   * Log Safety: SAFE
   */
export interface InvalidOrganizationHierarchy {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidOrganizationHierarchy";
  errorDescription:
    "Organizations on a project must also exist on the parent space. This error is thrown if the configuration of a project's organizations (on creation or subsequently) results in the project being marked with either no organizations in a marked space, or with an organization that is not present on the parent space.";
  errorInstanceId: string;
  parameters: {
    organizationRids: unknown;
  };
}

/**
 * Either the user has not passed organizations for a template with suggested organizations, or has passed organization for a template with fixed organizations.
 *
 * Log Safety: SAFE
 */
export interface InvalidOrganizations {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidOrganizations";
  errorDescription:
    "Either the user has not passed organizations for a template with suggested organizations, or has passed organization for a template with fixed organizations.";
  errorInstanceId: string;
  parameters: {};
}

/**
   * The given path is invalid.
A valid path has all components separated by a single /.
   *
   * Log Safety: UNSAFE
   */
export interface InvalidPath {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidPath";
  errorDescription:
    "The given path is invalid. A valid path has all components separated by a single /.";
  errorInstanceId: string;
  parameters: {
    path: unknown;
  };
}

/**
 * The template requested for project creation contains principal IDs that do not exist.
 *
 * Log Safety: SAFE
 */
export interface InvalidPrincipalIdsForGroupTemplate {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidPrincipalIdsForGroupTemplate";
  errorDescription:
    "The template requested for project creation contains principal IDs that do not exist.";
  errorInstanceId: string;
  parameters: {
    invalidPrincipalIds: unknown;
  };
}

/**
 * A roleId referenced in either default roles or role grants does not exist in the project role set for the space.
 *
 * Log Safety: SAFE
 */
export interface InvalidRoleIds {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidRoleIds";
  errorDescription:
    "A roleId referenced in either default roles or role grants does not exist in the project role set for the space.";
  errorInstanceId: string;
  parameters: {
    requestedRoleIds: unknown;
  };
}

/**
 * A variable referenced in the request to create project from template is not defined on the template.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidVariable {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidVariable";
  errorDescription:
    "A variable referenced in the request to create project from template is not defined on the template.";
  errorInstanceId: string;
  parameters: {
    templateVariableId: unknown;
  };
}

/**
 * The value passed in the request to create project from template for an enum type variable is not a valid option.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidVariableEnumOption {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidVariableEnumOption";
  errorDescription:
    "The value passed in the request to create project from template for an enum type variable is not a valid option.";
  errorInstanceId: string;
  parameters: {
    variableId: unknown;
    invalidOption: unknown;
    validOptions: unknown;
  };
}

/**
 * A provided marking ID cannot be found.
 *
 * Log Safety: UNSAFE
 */
export interface MarkingNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarkingNotFound";
  errorDescription: "A provided marking ID cannot be found.";
  errorInstanceId: string;
  parameters: {
    markingIds: unknown;
  };
}

/**
 * A Display Name must be provided.
 *
 * Log Safety: SAFE
 */
export interface MissingDisplayName {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MissingDisplayName";
  errorDescription: "A Display Name must be provided.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * A variable defined on the template requested for project creation does not have a value set in the request.
 *
 * Log Safety: UNSAFE
 */
export interface MissingVariableValue {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MissingVariableValue";
  errorDescription:
    "A variable defined on the template requested for project creation does not have a value set in the request.";
  errorInstanceId: string;
  parameters: {
    templateVariableId: unknown;
  };
}

/**
 * The user is not authorized to apply at least one of the organization markings required to create the project from template.
 *
 * Log Safety: SAFE
 */
export interface NotAuthorizedToApplyOrganization {
  errorCode: "INVALID_ARGUMENT";
  errorName: "NotAuthorizedToApplyOrganization";
  errorDescription:
    "The user is not authorized to apply at least one of the organization markings required to create the project from template.";
  errorInstanceId: string;
  parameters: {
    organizationRids: unknown;
  };
}

/**
   * An organization cannot be removed from a project if it would result in a project with no organizations
under a space marked with an organization.
   *
   * Log Safety: SAFE
   */
export interface OrganizationCannotBeRemoved {
  errorCode: "INVALID_ARGUMENT";
  errorName: "OrganizationCannotBeRemoved";
  errorDescription:
    "An organization cannot be removed from a project if it would result in a project with no organizations under a space marked with an organization.";
  errorInstanceId: string;
  parameters: {
    organizationRids: unknown;
  };
}

/**
 * At least one of the organization markings associated with a passed organization is not applied on the requested space.
 *
 * Log Safety: SAFE
 */
export interface OrganizationMarkingNotOnSpace {
  errorCode: "INVALID_ARGUMENT";
  errorName: "OrganizationMarkingNotOnSpace";
  errorDescription:
    "At least one of the organization markings associated with a passed organization is not applied on the requested space.";
  errorInstanceId: string;
  parameters: {
    spaceRid: unknown;
    organizationRids: unknown;
  };
}

/**
   * Adding an organization marking as a regular marking is not supported. Use the organization endpoints on a
project resource instead.
   *
   * Log Safety: UNSAFE
   */
export interface OrganizationMarkingNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "OrganizationMarkingNotSupported";
  errorDescription:
    "Adding an organization marking as a regular marking is not supported. Use the organization endpoints on a project resource instead.";
  errorInstanceId: string;
  parameters: {
    markingIds: unknown;
  };
}

/**
 * At least one organization RID could not be found.
 *
 * Log Safety: SAFE
 */
export interface OrganizationsNotFound {
  errorCode: "NOT_FOUND";
  errorName: "OrganizationsNotFound";
  errorDescription: "At least one organization RID could not be found.";
  errorInstanceId: string;
  parameters: {
    organizationRids: unknown;
  };
}

/**
 * The given path could not be found.
 *
 * Log Safety: UNSAFE
 */
export interface PathNotFound {
  errorCode: "NOT_FOUND";
  errorName: "PathNotFound";
  errorDescription: "The given path could not be found.";
  errorInstanceId: string;
  parameters: {
    path: unknown;
  };
}

/**
 * Could not permanentlyDelete the Resource.
 *
 * Log Safety: UNSAFE
 */
export interface PermanentlyDeleteResourcePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "PermanentlyDeleteResourcePermissionDenied";
  errorDescription: "Could not permanentlyDelete the Resource.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * Project creation is not supported in the current user's space.
 *
 * Log Safety: SAFE
 */
export interface ProjectCreationNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ProjectCreationNotSupported";
  errorDescription:
    "Project creation is not supported in the current user's space.";
  errorInstanceId: string;
  parameters: {
    spaceRid: unknown;
  };
}

/**
 * The requested display name for the created project is already being used in the space.
 *
 * Log Safety: UNSAFE
 */
export interface ProjectNameAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "ProjectNameAlreadyExists";
  errorDescription:
    "The requested display name for the created project is already being used in the space.";
  errorInstanceId: string;
  parameters: {
    displayName: unknown;
    spaceRid: unknown;
  };
}

/**
 * The given Project could not be found.
 *
 * Log Safety: SAFE
 */
export interface ProjectNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ProjectNotFound";
  errorDescription: "The given Project could not be found.";
  errorInstanceId: string;
  parameters: {
    projectRid: unknown;
  };
}

/**
 * The project template RID referenced cannot be found.
 *
 * Log Safety: SAFE
 */
export interface ProjectTemplateNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ProjectTemplateNotFound";
  errorDescription: "The project template RID referenced cannot be found.";
  errorInstanceId: string;
  parameters: {
    projectTemplateRid: unknown;
  };
}

/**
 * Could not removeMarkings the Resource.
 *
 * Log Safety: UNSAFE
 */
export interface RemoveMarkingsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RemoveMarkingsPermissionDenied";
  errorDescription: "Could not removeMarkings the Resource.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * Could not removeOrganizations the Project.
 *
 * Log Safety: SAFE
 */
export interface RemoveOrganizationsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RemoveOrganizationsPermissionDenied";
  errorDescription: "Could not removeOrganizations the Project.";
  errorInstanceId: string;
  parameters: {
    projectRid: unknown;
  };
}

/**
 * Could not remove the ResourceRole.
 *
 * Log Safety: UNSAFE
 */
export interface RemoveResourceRolesPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RemoveResourceRolesPermissionDenied";
  errorDescription: "Could not remove the ResourceRole.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * Could not replace the Project.
 *
 * Log Safety: SAFE
 */
export interface ReplaceProjectPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReplaceProjectPermissionDenied";
  errorDescription: "Could not replace the Project.";
  errorInstanceId: string;
  parameters: {
    projectRid: unknown;
  };
}

/**
 * Could not replace the Space.
 *
 * Log Safety: SAFE
 */
export interface ReplaceSpacePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReplaceSpacePermissionDenied";
  errorDescription: "Could not replace the Space.";
  errorInstanceId: string;
  parameters: {
    spaceRid: unknown;
  };
}

/**
 * The spaceRid provided is for a reserved space in Foundry which cannot be replaced.
 *
 * Log Safety: SAFE
 */
export interface ReservedSpaceCannotBeReplaced {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ReservedSpaceCannotBeReplaced";
  errorDescription:
    "The spaceRid provided is for a reserved space in Foundry which cannot be replaced.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The provided resource name is already in use by another resource in the same folder.
 *
 * Log Safety: UNSAFE
 */
export interface ResourceNameAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "ResourceNameAlreadyExists";
  errorDescription:
    "The provided resource name is already in use by another resource in the same folder.";
  errorInstanceId: string;
  parameters: {
    parentFolderRid: unknown;
    displayName: unknown;
  };
}

/**
 * The Resource is not directly trashed.
 *
 * Log Safety: UNSAFE
 */
export interface ResourceNotDirectlyTrashed {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ResourceNotDirectlyTrashed";
  errorDescription: "The Resource is not directly trashed.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * The given Resource could not be found.
 *
 * Log Safety: UNSAFE
 */
export interface ResourceNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ResourceNotFound";
  errorDescription: "The given Resource could not be found.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * The Resource should be directly trashed before being permanently deleted.
 *
 * Log Safety: UNSAFE
 */
export interface ResourceNotTrashed {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ResourceNotTrashed";
  errorDescription:
    "The Resource should be directly trashed before being permanently deleted.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * Could not restore the Resource.
 *
 * Log Safety: UNSAFE
 */
export interface RestoreResourcePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RestoreResourcePermissionDenied";
  errorDescription: "Could not restore the Resource.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * The role set provided in the request to create or replace a space could not be found.
 *
 * Log Safety: SAFE
 */
export interface RoleSetNotFound {
  errorCode: "NOT_FOUND";
  errorName: "RoleSetNotFound";
  errorDescription:
    "The role set provided in the request to create or replace a space could not be found.";
  errorInstanceId: string;
  parameters: {
    roleSetRid: unknown;
  };
}

/**
 * An internal error occurred when trying to create or replace the space.
 *
 * Log Safety: SAFE
 */
export interface SpaceInternalError {
  errorCode: "INTERNAL";
  errorName: "SpaceInternalError";
  errorDescription:
    "An internal error occurred when trying to create or replace the space.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * An invalid argument was provided in the request to create or replace a space.
 *
 * Log Safety: SAFE
 */
export interface SpaceInvalidArgument {
  errorCode: "INVALID_ARGUMENT";
  errorName: "SpaceInvalidArgument";
  errorDescription:
    "An invalid argument was provided in the request to create or replace a space.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The provided space name is invalid. It may be a reserved name or contain invalid characters.
 *
 * Log Safety: SAFE
 */
export interface SpaceNameInvalid {
  errorCode: "INVALID_ARGUMENT";
  errorName: "SpaceNameInvalid";
  errorDescription:
    "The provided space name is invalid. It may be a reserved name or contain invalid characters.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The space cannot be deleted because it contains resources.
 *
 * Log Safety: SAFE
 */
export interface SpaceNotEmpty {
  errorCode: "INTERNAL";
  errorName: "SpaceNotEmpty";
  errorDescription:
    "The space cannot be deleted because it contains resources.";
  errorInstanceId: string;
  parameters: {
    spaceRid: unknown;
  };
}

/**
 * The given Space could not be found.
 *
 * Log Safety: SAFE
 */
export interface SpaceNotFound {
  errorCode: "NOT_FOUND";
  errorName: "SpaceNotFound";
  errorDescription: "The given Space could not be found.";
  errorInstanceId: string;
  parameters: {
    spaceRid: unknown;
  };
}

/**
 * Creating the project from template would attempt to create new groups with names conflicting either with other new groups, or existing groups.
 *
 * Log Safety: UNSAFE
 */
export interface TemplateGroupNameConflict {
  errorCode: "CONFLICT";
  errorName: "TemplateGroupNameConflict";
  errorDescription:
    "Creating the project from template would attempt to create new groups with names conflicting either with other new groups, or existing groups.";
  errorInstanceId: string;
  parameters: {
    conflictingGroupNames: unknown;
  };
}

/**
 * Creating the project from template would attempt to create new markings with names conflicting either with other new markings, or existing markings.
 *
 * Log Safety: UNSAFE
 */
export interface TemplateMarkingNameConflict {
  errorCode: "CONFLICT";
  errorName: "TemplateMarkingNameConflict";
  errorDescription:
    "Creating the project from template would attempt to create new markings with names conflicting either with other new markings, or existing markings.";
  errorInstanceId: string;
  parameters: {
    conflictingMarkingNames: unknown;
  };
}

/**
 * Auto-saved Resources cannot be trashed.
 *
 * Log Safety: UNSAFE
 */
export interface TrashingAutosavedResourcesNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "TrashingAutosavedResourcesNotSupported";
  errorDescription: "Auto-saved Resources cannot be trashed.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * Hidden Resources cannot be trashed.
 *
 * Log Safety: UNSAFE
 */
export interface TrashingHiddenResourcesNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "TrashingHiddenResourcesNotSupported";
  errorDescription: "Hidden Resources cannot be trashed.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * Spaces cannot be trashed.
 *
 * Log Safety: UNSAFE
 */
export interface TrashingSpaceNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "TrashingSpaceNotSupported";
  errorDescription: "Spaces cannot be trashed.";
  errorInstanceId: string;
  parameters: {
    resourceRid: unknown;
  };
}

/**
 * The Usage Accounts service is unexpectedly not present.
 *
 * Log Safety: SAFE
 */
export interface UsageAccountServiceIsNotPresent {
  errorCode: "INTERNAL";
  errorName: "UsageAccountServiceIsNotPresent";
  errorDescription: "The Usage Accounts service is unexpectedly not present.";
  errorInstanceId: string;
  parameters: {};
}
