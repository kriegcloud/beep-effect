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
   * Access requirements for a resource are composed of Markings and Organizations. Organizations are disjunctive,
while Markings are conjunctive.
   *
   * Log Safety: UNSAFE
   */
export interface AccessRequirements {
  organizations: Array<Organization>;
  markings: Array<Marking>;
}

/**
 * Log Safety: UNSAFE
 */
export interface AddMarkingsRequest {
  markingIds: Array<_Core.MarkingId>;
}

/**
 * Log Safety: SAFE
 */
export interface AddOrganizationsRequest {
  organizationRids: Array<_Core.OrganizationRid>;
}

/**
 * Log Safety: SAFE
 */
export interface AddResourceRolesRequest {
  roles: Array<ResourceRoleIdentifier>;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateFolderRequest {
  parentFolderRid: FolderRid;
  displayName: ResourceDisplayName;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateProjectFromTemplateRequest {
  templateRid: ProjectTemplateRid;
  variableValues: Record<
    ProjectTemplateVariableId,
    ProjectTemplateVariableValue
  >;
  defaultRoles?: Array<_Core.RoleId>;
  organizationRids?: Array<_Core.OrganizationRid>;
  projectDescription?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateProjectRequest {
  displayName: ResourceDisplayName;
  description?: string;
  spaceRid: SpaceRid;
  roleGrants: Record<_Core.RoleId, Array<PrincipalWithId>>;
  defaultRoles: Array<_Core.RoleId>;
  organizationRids: Array<_Core.OrganizationRid>;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateSpaceRequest {
  enrollmentRid: _Core.EnrollmentRid;
  usageAccountRid?: UsageAccountRid;
  fileSystemId?: FileSystemId;
  displayName: ResourceDisplayName;
  organizations: Array<_Core.OrganizationRid>;
  description?: string;
  deletionPolicyOrganizations: Array<_Core.OrganizationRid>;
  defaultRoleSetId?: _Core.RoleSetId;
}

/**
 * A principal representing all users of the platform.
 *
 * Log Safety: SAFE
 */
export interface Everyone {}

/**
 * The ID of the filesystem that will be used for all projects in the Space.
 *
 * Log Safety: SAFE
 */
export type FileSystemId = LooselyBrandedString<"FileSystemId">;

/**
 * Log Safety: UNSAFE
 */
export interface Folder {
  rid: FolderRid;
  displayName: ResourceDisplayName;
  description?: string;
  documentation?: string;
  path: ResourcePath;
  type: FolderType;
  createdBy: _Core.CreatedBy;
  updatedBy: _Core.UpdatedBy;
  createdTime: _Core.CreatedTime;
  updatedTime: _Core.UpdatedTime;
  trashStatus: TrashStatus;
  parentFolderRid: FolderRid;
  projectRid?: ProjectRid;
  spaceRid: SpaceRid;
}

/**
 * The unique resource identifier (RID) of a Folder.
 *
 * Log Safety: SAFE
 */
export type FolderRid = LooselyBrandedString<"FolderRid">;

/**
   * A folder can be a regular Folder, a
Project or a
Space.
   *
   * Log Safety: SAFE
   */
export type FolderType = "FOLDER" | "SPACE" | "PROJECT";

/**
 * Log Safety: UNSAFE
 */
export interface GetByPathResourcesBatchRequestElement {
  path: ResourcePath;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetByPathResourcesBatchResponse {
  data: Array<Resource>;
}

/**
 * Log Safety: SAFE
 */
export interface GetFoldersBatchRequestElement {
  folderRid: FolderRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetFoldersBatchResponse {
  data: Record<FolderRid, Folder>;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetResourcesBatchRequestElement {
  resourceRid: ResourceRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetResourcesBatchResponse {
  data: Record<ResourceRid, Resource>;
}

/**
   * Boolean flag to indicate if the marking is directly applied to the resource, or if it's applied
to a parent resource and inherited by the current resource.
   *
   * Log Safety: SAFE
   */
export type IsDirectlyApplied = boolean;

/**
 * Log Safety: UNSAFE
 */
export interface ListChildrenOfFolderResponse {
  data: Array<Resource>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListMarkingsOfResourceResponse {
  data: Array<_Core.MarkingId>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListOrganizationsOfProjectResponse {
  data: Array<_Core.OrganizationRid>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListResourceRolesResponse {
  data: Array<ResourceRole>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListSpacesResponse {
  data: Array<Space>;
  nextPageToken?: _Core.PageToken;
}

/**
   * Markings provide an additional level of access control for files,
folders, and Projects within Foundry. Markings define eligibility criteria that restrict visibility
and actions to users who meet those criteria. To access a resource, a user must be a member of all
Markings applied to a resource to access it.
   *
   * Log Safety: UNSAFE
   */
export interface Marking {
  markingId: _Core.MarkingId;
  isDirectlyApplied: IsDirectlyApplied;
}

/**
   * Organizations are access requirements applied to
Projects that enforce strict silos between groups of users and resources. Every user is a member of only
one Organization, but can be a guest member of multiple Organizations. In order to meet access requirements,
users must be a member or guest member of at least one Organization applied to a Project.
Organizations are inherited via the file hierarchy and direct dependencies.
   *
   * Log Safety: UNSAFE
   */
export interface Organization {
  markingId: _Core.MarkingId;
  organizationRid: _Core.OrganizationRid;
  isDirectlyApplied: IsDirectlyApplied;
}

/**
 * Represents a principal with just an ID, without the type.
 *
 * Log Safety: SAFE
 */
export interface PrincipalIdOnly {
  principalId: _Core.PrincipalId;
}

/**
 * Represents a user principal or group principal with an ID.
 *
 * Log Safety: SAFE
 */
export interface PrincipalWithId {
  principalId: _Core.PrincipalId;
  principalType: _Core.PrincipalType;
}

/**
 * Log Safety: UNSAFE
 */
export interface Project {
  rid: ProjectRid;
  displayName: ResourceDisplayName;
  description?: string;
  documentation?: string;
  path: ResourcePath;
  createdBy: _Core.CreatedBy;
  updatedBy: _Core.UpdatedBy;
  createdTime: _Core.CreatedTime;
  updatedTime: _Core.UpdatedTime;
  trashStatus: TrashStatus;
  spaceRid: SpaceRid;
}

/**
 * The unique resource identifier (RID) of a Project.
 *
 * Log Safety: SAFE
 */
export type ProjectRid = LooselyBrandedString<"ProjectRid">;

/**
 * The unique resource identifier (RID) of a project template.
 *
 * Log Safety: SAFE
 */
export type ProjectTemplateRid = LooselyBrandedString<"ProjectTemplateRid">;

/**
 * An identifier for a variable used in a project template.
 *
 * Log Safety: UNSAFE
 */
export type ProjectTemplateVariableId = LooselyBrandedString<
  "ProjectTemplateVariableId"
>;

/**
 * The value assigned to a variable used in a project template.
 *
 * Log Safety: UNSAFE
 */
export type ProjectTemplateVariableValue = LooselyBrandedString<
  "ProjectTemplateVariableValue"
>;

/**
 * Log Safety: UNSAFE
 */
export interface RemoveMarkingsRequest {
  markingIds: Array<_Core.MarkingId>;
}

/**
 * Log Safety: SAFE
 */
export interface RemoveOrganizationsRequest {
  organizationRids: Array<_Core.OrganizationRid>;
}

/**
 * Log Safety: SAFE
 */
export interface RemoveResourceRolesRequest {
  roles: Array<ResourceRoleIdentifier>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceProjectRequest {
  displayName: ResourceDisplayName;
  description?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceSpaceRequest {
  usageAccountRid?: UsageAccountRid;
  displayName: ResourceDisplayName;
  description?: string;
  defaultRoleSetId?: _Core.RoleSetId;
}

/**
 * Log Safety: UNSAFE
 */
export interface Resource {
  rid: ResourceRid;
  displayName: ResourceDisplayName;
  description?: string;
  documentation?: string;
  path: ResourcePath;
  type: ResourceType;
  createdBy: _Core.CreatedBy;
  updatedBy: _Core.UpdatedBy;
  createdTime: _Core.CreatedTime;
  updatedTime: _Core.UpdatedTime;
  trashStatus: TrashStatus;
  parentFolderRid: FolderRid;
  projectRid: ProjectRid;
  spaceRid: SpaceRid;
}

/**
 * The display name of the Resource
 *
 * Log Safety: UNSAFE
 */
export type ResourceDisplayName = LooselyBrandedString<"ResourceDisplayName">;

/**
 * The full path to the resource, including the resource name itself
 *
 * Log Safety: UNSAFE
 */
export type ResourcePath = LooselyBrandedString<"ResourcePath">;

/**
 * The unique resource identifier (RID) of a Resource.
 *
 * Log Safety: UNSAFE
 */
export type ResourceRid = LooselyBrandedString<"ResourceRid">;

/**
 * Log Safety: SAFE
 */
export interface ResourceRole {
  resourceRolePrincipal: ResourceRolePrincipal;
  roleId: _Core.RoleId;
}

/**
 * A role grant on a resource for add/remove operations that doesn't require specifying the principal type.
 *
 * Log Safety: SAFE
 */
export interface ResourceRoleIdentifier {
  resourceRolePrincipal: ResourceRolePrincipalIdentifier;
  roleId: _Core.RoleId;
}

/**
 * Log Safety: SAFE
 */
export type ResourceRolePrincipal =
  | ({ type: "principalWithId" } & PrincipalWithId)
  | ({ type: "everyone" } & Everyone);

/**
 * A principal for resource role operations that doesn't require specifying the principal type.
 *
 * Log Safety: SAFE
 */
export type ResourceRolePrincipalIdentifier =
  | ({ type: "principalIdOnly" } & PrincipalIdOnly)
  | ({ type: "everyone" } & Everyone);

/**
 * The type of the Resource derived from the Resource Identifier (RID).
 *
 * Log Safety: SAFE
 */
export type ResourceType =
  | "AIP_PROFILE"
  | "AIP_AGENTS_AGENT"
  | "AIP_AGENTS_SESSION"
  | "AIP_ASSIST_FLOW_CAPTURE"
  | "AIP_ASSIST_WALKTHROUGH"
  | "ARTIFACTS_REPOSITORY"
  | "BELLASO_CIPHER_CHANNEL"
  | "BELLASO_CIPHER_LICENSE"
  | "BLACKSMITH_DOCUMENT"
  | "BLOBSTER_ARCHIVE"
  | "BLOBSTER_AUDIO"
  | "BLOBSTER_BLOB"
  | "BLOBSTER_CODE"
  | "BLOBSTER_CONFIGURATION"
  | "BLOBSTER_DOCUMENT"
  | "BLOBSTER_IMAGE"
  | "BLOBSTER_JUPYTERNOTEBOOK"
  | "BLOBSTER_PDF"
  | "BLOBSTER_PRESENTATION"
  | "BLOBSTER_SPREADSHEET"
  | "BLOBSTER_VIDEO"
  | "BLOBSTER_XML"
  | "CARBON_WORKSPACE"
  | "COMPASS_FOLDER"
  | "COMPASS_WEB_LINK"
  | "CONTOUR_ANALYSIS"
  | "DATA_HEALTH_MONITORING_VIEW"
  | "DECISIONS_EXPLORATION"
  | "DREDDIE_PIPELINE"
  | "EDDIE_LOGIC"
  | "EDDIE_PIPELINE"
  | "FFORMS_FORM"
  | "FLOW_WORKFLOW"
  | "FOUNDRY_DATASET"
  | "FOUNDRY_DEPLOYED_APP"
  | "FOUNDRY_ACADEMY_TUTORIAL"
  | "FOUNDRY_CONTAINER_SERVICE_CONTAINER"
  | "FOUNDRY_ML_OBJECTIVE"
  | "FOUNDRY_TEMPLATES_TEMPLATE"
  | "FUSION_DOCUMENT"
  | "GEOTIME_CATALOG_INTEGRATION"
  | "GPS_VIEW"
  | "HUBBLE_EXPLORATION_LAYOUT"
  | "HYPERAUTO_INTEGRATION"
  | "LOGIC_FLOWS_CONNECTED_FLOW"
  | "MACHINERY_DOCUMENT"
  | "MAGRITTE_AGENT"
  | "MAGRITTE_DRIVER"
  | "MAGRITTE_EXPORT"
  | "MAGRITTE_SOURCE"
  | "MARKETPLACE_BLOCK_SET_INSTALLATION"
  | "MARKETPLACE_BLOCK_SET_REPO"
  | "MARKETPLACE_LOCAL"
  | "MARKETPLACE_REMOTE_STORE"
  | "MIO_MEDIA_SET"
  | "MODELS_MODEL"
  | "MODELS_MODEL_VERSION"
  | "MONOCLE_GRAPH"
  | "NOTEPAD_NOTEPAD"
  | "NOTEPAD_NOTEPAD_TEMPLATE"
  | "OBJECT_SENTINEL_MONITOR"
  | "OBJECT_SET_VERSIONED_OBJECT_SET"
  | "OPUS_GRAPH"
  | "OPUS_GRAPH_TEMPLATE"
  | "OPUS_MAP"
  | "OPUS_MAP_LAYER"
  | "OPUS_MAP_TEMPLATE"
  | "OPUS_SEARCH_AROUND"
  | "QUIVER_ANALYSIS"
  | "QUIVER_ARTIFACT"
  | "QUIVER_DASHBOARD"
  | "QUIVER_FUNCTION"
  | "QUIVER_OBJECT_SET_PATH"
  | "REPORT_REPORT"
  | "SLATE_DOCUMENT"
  | "SOLUTION_DESIGN_DIAGRAM"
  | "STEMMA_REPOSITORY"
  | "TABLES_TABLE"
  | "TAURUS_WORKFLOW"
  | "THIRD_PARTY_APPLICATIONS_APPLICATION"
  | "TIME_SERIES_CATALOG_SYNC"
  | "VECTOR_TEMPLATE"
  | "VECTOR_WORKBOOK"
  | "WORKSHOP_MODULE"
  | "WORKSHOP_STATE";

/**
 * Log Safety: UNSAFE
 */
export interface Space {
  rid: SpaceRid;
  displayName: ResourceDisplayName;
  description?: string;
  path: ResourcePath;
  fileSystemId: FileSystemId;
  usageAccountRid: UsageAccountRid;
  organizations: Array<_Core.OrganizationRid>;
  deletionPolicyOrganizations: Array<_Core.OrganizationRid>;
  defaultRoleSetId: _Core.RoleSetId;
  spaceMavenIdentifier?: SpaceMavenIdentifier;
}

/**
 * The maven identifier used as the prefix to the maven coordinate that uniquely identifies resources published from this space.
 *
 * Log Safety: UNSAFE
 */
export type SpaceMavenIdentifier = LooselyBrandedString<"SpaceMavenIdentifier">;

/**
 * The unique resource identifier (RID) of a Space.
 *
 * Log Safety: SAFE
 */
export type SpaceRid = LooselyBrandedString<"SpaceRid">;

/**
 * Log Safety: SAFE
 */
export type TrashStatus =
  | "DIRECTLY_TRASHED"
  | "ANCESTOR_TRASHED"
  | "NOT_TRASHED";

/**
 * The unique resource identifier (RID) of the usage account that will be used as a default on project creation.
 *
 * Log Safety: SAFE
 */
export type UsageAccountRid = LooselyBrandedString<"UsageAccountRid">;
