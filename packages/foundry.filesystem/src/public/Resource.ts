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

const _deleteResource: $FoundryPlatformMethod<
  (
    resourceRid: _Filesystem.ResourceRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [3, "/v2/filesystem/resources/{0}", 2];

/**
 * Move the given resource to the trash. Following this operation, the resource can be restored, using the
 * `restore` operation, or permanently deleted using the `permanentlyDelete` operation.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/resources/{resourceRid}
 */
export function deleteResource(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    resourceRid: _Filesystem.ResourceRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _deleteResource, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    resourceRid: _Filesystem.ResourceRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Filesystem.Resource>
> = [0, "/v2/filesystem/resources/{0}", 2];

/**
 * Get the Resource with the specified rid.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-read]
 * URL: /v2/filesystem/resources/{resourceRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    resourceRid: _Filesystem.ResourceRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Filesystem.Resource> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _getBatch: $FoundryPlatformMethod<
  (
    $body: Array<_Filesystem.GetResourcesBatchRequestElement>,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Filesystem.GetResourcesBatchResponse>
> = [1, "/v2/filesystem/resources/getBatch", 3];

/**
 * Fetches multiple resources in a single request.
 * Returns a map from RID to the corresponding resource. If a resource does not exist, or if it is a root folder or space, its RID will not be included in the map.
 * At most 1,000 resources should be requested at once.
 *
 * The maximum batch size for this endpoint is 1000.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-read]
 * URL: /v2/filesystem/resources/getBatch
 */
export function getBatch(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: Array<_Filesystem.GetResourcesBatchRequestElement>,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Filesystem.GetResourcesBatchResponse> {
  return $foundryPlatformFetch($ctx, _getBatch, ...args);
}

const _getByPath: $FoundryPlatformMethod<
  ($queryParams: {
    path: _Filesystem.ResourcePath;
    preview?: _Core.PreviewMode | undefined;
  }) => Promise<_Filesystem.Resource>
> = [0, "/v2/filesystem/resources/getByPath", 2];

/**
 * Get a Resource by its absolute path.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-read]
 * URL: /v2/filesystem/resources/getByPath
 */
export function getByPath(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $queryParams: {
      path: _Filesystem.ResourcePath;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Filesystem.Resource> {
  return $foundryPlatformFetch($ctx, _getByPath, ...args);
}

const _getByPathBatch: $FoundryPlatformMethod<
  (
    $body: Array<_Filesystem.GetByPathResourcesBatchRequestElement>,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Filesystem.GetByPathResourcesBatchResponse>
> = [1, "/v2/filesystem/resources/getByPathBatch", 3];

/**
 * Gets multiple Resources by their absolute paths.
 * Returns a list of resources. If a path does not exist, is inaccessible, or refers to
 * a root folder or space, it will not be included in the response.
 * At most 1,000 paths should be requested at once.
 *
 * The maximum batch size for this endpoint is 1000.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-read]
 * URL: /v2/filesystem/resources/getByPathBatch
 */
export function getByPathBatch(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: Array<_Filesystem.GetByPathResourcesBatchRequestElement>,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Filesystem.GetByPathResourcesBatchResponse> {
  return $foundryPlatformFetch($ctx, _getByPathBatch, ...args);
}

const _restore: $FoundryPlatformMethod<
  (
    resourceRid: _Filesystem.ResourceRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [1, "/v2/filesystem/resources/{0}/restore", 2];

/**
 * Restore the given resource and any directly trashed ancestors from the trash. If the resource is not
 * trashed, this operation will be ignored.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/resources/{resourceRid}/restore
 */
export function restore(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    resourceRid: _Filesystem.ResourceRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _restore, ...args);
}

const _permanentlyDelete: $FoundryPlatformMethod<
  (
    resourceRid: _Filesystem.ResourceRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [1, "/v2/filesystem/resources/{0}/permanentlyDelete", 2];

/**
 * Permanently delete the given resource from the trash. If the Resource is not directly trashed, a
 * `ResourceNotTrashed` error will be thrown.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/resources/{resourceRid}/permanentlyDelete
 */
export function permanentlyDelete(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    resourceRid: _Filesystem.ResourceRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _permanentlyDelete, ...args);
}

const _addMarkings: $FoundryPlatformMethod<
  (
    resourceRid: _Filesystem.ResourceRid,
    $body: _Filesystem.AddMarkingsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [1, "/v2/filesystem/resources/{0}/addMarkings", 3];

/**
 * Adds a list of Markings to a resource.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/resources/{resourceRid}/addMarkings
 */
export function addMarkings(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    resourceRid: _Filesystem.ResourceRid,
    $body: _Filesystem.AddMarkingsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _addMarkings, ...args);
}

const _removeMarkings: $FoundryPlatformMethod<
  (
    resourceRid: _Filesystem.ResourceRid,
    $body: _Filesystem.RemoveMarkingsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [1, "/v2/filesystem/resources/{0}/removeMarkings", 3];

/**
 * Removes Markings from a resource.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/resources/{resourceRid}/removeMarkings
 */
export function removeMarkings(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    resourceRid: _Filesystem.ResourceRid,
    $body: _Filesystem.RemoveMarkingsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _removeMarkings, ...args);
}

const _getAccessRequirements: $FoundryPlatformMethod<
  (
    resourceRid: _Filesystem.ResourceRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Filesystem.AccessRequirements>
> = [0, "/v2/filesystem/resources/{0}/getAccessRequirements", 2];

/**
 * Returns a list of access requirements a user needs in order to view a resource. Access requirements are
 * composed of Organizations and Markings, and can either be applied directly to the resource or inherited.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-read]
 * URL: /v2/filesystem/resources/{resourceRid}/getAccessRequirements
 */
export function getAccessRequirements(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    resourceRid: _Filesystem.ResourceRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Filesystem.AccessRequirements> {
  return $foundryPlatformFetch($ctx, _getAccessRequirements, ...args);
}

const _markings: $FoundryPlatformMethod<
  (
    resourceRid: _Filesystem.ResourceRid,
    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Filesystem.ListMarkingsOfResourceResponse>
> = [0, "/v2/filesystem/resources/{0}/markings", 2];

/**
 * List of Markings directly applied to a resource. The number of Markings on a resource is typically small
 * so the `pageSize` and `pageToken` parameters are not required.
 *
 * @beta
 *
 * Required Scopes: []
 * URL: /v2/filesystem/resources/{resourceRid}/markings
 */
export function markings(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    resourceRid: _Filesystem.ResourceRid,

    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Filesystem.ListMarkingsOfResourceResponse> {
  return $foundryPlatformFetch($ctx, _markings, ...args);
}
