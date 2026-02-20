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

const _create: $FoundryPlatformMethod<
  (
    $body: _Filesystem.CreateSpaceRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Filesystem.Space>
> = [1, "/v2/filesystem/spaces", 3];

/**
 * Creates a new Space.
 *
 * @alpha
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/spaces
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _Filesystem.CreateSpaceRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Filesystem.Space> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _deleteSpace: $FoundryPlatformMethod<
  (
    spaceRid: _Filesystem.SpaceRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [3, "/v2/filesystem/spaces/{0}", 2];

/**
 * Delete the space. This will only work if the Space is empty, meaning any Projects or Resources have been deleted first.
 *
 * @alpha
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/spaces/{spaceRid}
 */
export function deleteSpace(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    spaceRid: _Filesystem.SpaceRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _deleteSpace, ...args);
}

const _list: $FoundryPlatformMethod<
  ($queryParams?: {
    pageSize?: _Core.PageSize | undefined;
    pageToken?: _Core.PageToken | undefined;
    preview?: _Core.PreviewMode | undefined;
  }) => Promise<_Filesystem.ListSpacesResponse>
> = [0, "/v2/filesystem/spaces", 2];

/**
 * Lists all Spaces.
 *
 * This is a paged endpoint. Each page may be smaller or larger than the requested page size. However, it is guaranteed that if there are more results available, the `nextPageToken` field will be populated. To get the next page, make the same request again, but set the value of the `pageToken` query parameter to be value of the `nextPageToken` value of the previous response. If there is no `nextPageToken` field in the response, you are on the last page.
 *
 * @beta
 *
 * Required Scopes: [api:filesystem-read]
 * URL: /v2/filesystem/spaces
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Filesystem.ListSpacesResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    spaceRid: _Filesystem.SpaceRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Filesystem.Space>
> = [0, "/v2/filesystem/spaces/{0}", 2];

/**
 * Get the Space with the specified rid.
 *
 * @alpha
 *
 * Required Scopes: [api:filesystem-read]
 * URL: /v2/filesystem/spaces/{spaceRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    spaceRid: _Filesystem.SpaceRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Filesystem.Space> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _replace: $FoundryPlatformMethod<
  (
    spaceRid: _Filesystem.SpaceRid,
    $body: _Filesystem.ReplaceSpaceRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Filesystem.Space>
> = [2, "/v2/filesystem/spaces/{0}", 3];

/**
 * Replace the Space with the specified rid.
 *
 * @alpha
 *
 * Required Scopes: [api:filesystem-write]
 * URL: /v2/filesystem/spaces/{spaceRid}
 */
export function replace(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    spaceRid: _Filesystem.SpaceRid,
    $body: _Filesystem.ReplaceSpaceRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Filesystem.Space> {
  return $foundryPlatformFetch($ctx, _replace, ...args);
}
