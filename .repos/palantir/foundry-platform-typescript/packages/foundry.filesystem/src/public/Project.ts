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
import type {
  SharedClient as $OldClient,
  SharedClientContext as $OldClientContext,
} from "@osdk/shared.client";
import type {
  SharedClient as $Client,
  SharedClientContext as $ClientContext,
} from "@osdk/shared.client2";
import type { FoundryPlatformMethod as $FoundryPlatformMethod } from "@osdk/shared.net.platformapi";
import { foundryPlatformFetch as $foundryPlatformFetch } from "@osdk/shared.net.platformapi";
import type * as _Filesystem from "../_components.js";

//

const _get: $FoundryPlatformMethod<
  (projectRid: _Filesystem.ProjectRid) => Promise<_Filesystem.Project>
> = [0, "/v2/filesystem/projects/{0}"];

/**
 * Get the Project with the specified rid.
 *
 * @public
 *
 * Required Scopes: [api:filesystem-read]
 * URL: /v2/filesystem/projects/{projectRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [projectRid: _Filesystem.ProjectRid]
): Promise<_Filesystem.Project> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _replace: $FoundryPlatformMethod<
  (
    projectRid: _Filesystem.ProjectRid,
    $body: _Filesystem.ReplaceProjectRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Filesystem.Project>
> = [2, "/v2/filesystem/projects/{0}", 3];

/**
 * Replace the Project with the specified rid.
 *
 * @alpha
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/projects/{projectRid}
 */
export function replace(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    projectRid: _Filesystem.ProjectRid,
    $body: _Filesystem.ReplaceProjectRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Filesystem.Project> {
  return $foundryPlatformFetch($ctx, _replace, ...args);
}

const _create: $FoundryPlatformMethod<
  (
    $body: _Filesystem.CreateProjectRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Filesystem.Project>
> = [1, "/v2/filesystem/projects/create", 3];

/**
 * Creates a new Project.
 *
 * Note that third-party applications using this endpoint via OAuth2 cannot be associated with an
 * Ontology SDK as this will reduce the scope of operations to only those within specified projects.
 * When creating the application, select "No, I won't use an Ontology SDK" on the Resources page.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/projects/create
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _Filesystem.CreateProjectRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Filesystem.Project> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _createFromTemplate: $FoundryPlatformMethod<
  (
    $body: _Filesystem.CreateProjectFromTemplateRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Filesystem.Project>
> = [1, "/v2/filesystem/projects/createFromTemplate", 3];

/**
 * Creates a project from a project template.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/projects/createFromTemplate
 */
export function createFromTemplate(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _Filesystem.CreateProjectFromTemplateRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Filesystem.Project> {
  return $foundryPlatformFetch($ctx, _createFromTemplate, ...args);
}

const _addOrganizations: $FoundryPlatformMethod<
  (
    projectRid: _Filesystem.ProjectRid,
    $body: _Filesystem.AddOrganizationsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [1, "/v2/filesystem/projects/{0}/addOrganizations", 3];

/**
 * Adds a list of Organizations to a Project.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/projects/{projectRid}/addOrganizations
 */
export function addOrganizations(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    projectRid: _Filesystem.ProjectRid,
    $body: _Filesystem.AddOrganizationsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _addOrganizations, ...args);
}

const _removeOrganizations: $FoundryPlatformMethod<
  (
    projectRid: _Filesystem.ProjectRid,
    $body: _Filesystem.RemoveOrganizationsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [1, "/v2/filesystem/projects/{0}/removeOrganizations", 3];

/**
 * Removes Organizations from a Project.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/projects/{projectRid}/removeOrganizations
 */
export function removeOrganizations(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    projectRid: _Filesystem.ProjectRid,
    $body: _Filesystem.RemoveOrganizationsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _removeOrganizations, ...args);
}

const _organizations: $FoundryPlatformMethod<
  (
    projectRid: _Filesystem.ProjectRid,
    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Filesystem.ListOrganizationsOfProjectResponse>
> = [0, "/v2/filesystem/projects/{0}/organizations", 2];

/**
 * List of Organizations directly applied to a Project. The number of Organizations on a Project is
 * typically small so the `pageSize` and `pageToken` parameters are not required.
 *
 * @beta
 *
 * Required Scopes: []
 * URL: /v2/filesystem/projects/{projectRid}/organizations
 */
export function organizations(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    projectRid: _Filesystem.ProjectRid,

    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Filesystem.ListOrganizationsOfProjectResponse> {
  return $foundryPlatformFetch($ctx, _organizations, ...args);
}
