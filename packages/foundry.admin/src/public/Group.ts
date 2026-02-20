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
import type * as _Admin from "../_components.js";

//

const _create: $FoundryPlatformMethod<
  ($body: _Admin.CreateGroupRequest) => Promise<_Admin.Group>
> = [1, "/v2/admin/groups", 1];

/**
 * Creates a new Group.
 *
 * @public
 *
 * Required Scopes: [api:admin-write]
 * URL: /v2/admin/groups
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$body: _Admin.CreateGroupRequest]
): Promise<_Admin.Group> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _deleteGroup: $FoundryPlatformMethod<
  (groupId: _Core.GroupId) => Promise<void>
> = [3, "/v2/admin/groups/{0}"];

/**
 * Delete the Group with the specified id.
 *
 * @public
 *
 * Required Scopes: [api:admin-write]
 * URL: /v2/admin/groups/{groupId}
 */
export function deleteGroup(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [groupId: _Core.GroupId]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _deleteGroup, ...args);
}

const _list: $FoundryPlatformMethod<
  ($queryParams?: {
    pageSize?: _Core.PageSize | undefined;
    pageToken?: _Core.PageToken | undefined;
  }) => Promise<_Admin.ListGroupsResponse>
> = [0, "/v2/admin/groups", 2];

/**
 * Lists all Groups.
 *
 * This is a paged endpoint. Each page may be smaller or larger than the requested page size. However, it is guaranteed that if there are more results available, the `nextPageToken` field will be populated. To get the next page, make the same request again, but set the value of the `pageToken` query parameter to be value of the `nextPageToken` value of the previous response. If there is no `nextPageToken` field in the response, you are on the last page.
 *
 * @public
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/groups
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
    },
  ]
): Promise<_Admin.ListGroupsResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _get: $FoundryPlatformMethod<
  (groupId: _Core.GroupId) => Promise<_Admin.Group>
> = [0, "/v2/admin/groups/{0}"];

/**
 * Get the Group with the specified id.
 *
 * @public
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/groups/{groupId}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [groupId: _Core.GroupId]
): Promise<_Admin.Group> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _getBatch: $FoundryPlatformMethod<
  (
    $body: Array<_Admin.GetGroupsBatchRequestElement>,
  ) => Promise<_Admin.GetGroupsBatchResponse>
> = [1, "/v2/admin/groups/getBatch", 1];

/**
 * Execute multiple get requests on Group.
 *
 * The maximum batch size for this endpoint is 500.
 *
 * @public
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/groups/getBatch
 */
export function getBatch(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$body: Array<_Admin.GetGroupsBatchRequestElement>]
): Promise<_Admin.GetGroupsBatchResponse> {
  return $foundryPlatformFetch($ctx, _getBatch, ...args);
}

const _search: $FoundryPlatformMethod<
  ($body: _Admin.SearchGroupsRequest) => Promise<_Admin.SearchGroupsResponse>
> = [1, "/v2/admin/groups/search", 1];

/**
 * Perform a case-insensitive prefix search for groups based on group name.
 *
 * @public
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/groups/search
 */
export function search(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$body: _Admin.SearchGroupsRequest]
): Promise<_Admin.SearchGroupsResponse> {
  return $foundryPlatformFetch($ctx, _search, ...args);
}
