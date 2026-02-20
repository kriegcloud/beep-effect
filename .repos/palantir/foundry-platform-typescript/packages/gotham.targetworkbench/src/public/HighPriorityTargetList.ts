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

import type * as _Core from "@osdk/gotham.core";
import type {
  SharedClient as $OldClient,
  SharedClientContext as $OldClientContext,
} from "@osdk/shared.client";
import type {
  SharedClient as $Client,
  SharedClientContext as $ClientContext,
} from "@osdk/shared.client2";
import type { FoundryPlatformMethod as $PlatformMethod } from "@osdk/shared.net.platformapi";
import { foundryPlatformFetch as $platformFetch } from "@osdk/shared.net.platformapi";
import type * as _TargetWorkbench from "../_components.js";

//

const _create: $PlatformMethod<
  (
    $body: _TargetWorkbench.CreateHighPriorityTargetListRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_TargetWorkbench.HighPriorityTargetList>
> = [1, "/v2/targetWorkbench/highPriorityTargetLists", 3];

/**
 * Create a High Priority Target List.
 *
 * @beta
 *
 * Required Scopes: [api:target-write]
 * URL: /v2/targetWorkbench/highPriorityTargetLists
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _TargetWorkbench.CreateHighPriorityTargetListRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_TargetWorkbench.HighPriorityTargetList> {
  return $platformFetch($ctx, _create, ...args);
}

const _modify: $PlatformMethod<
  (
    highPriorityTargetListRid: _TargetWorkbench.HighPriorityTargetListRid,
    $body: _TargetWorkbench.ModifyHighPriorityTargetListRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_TargetWorkbench.EmptySuccessResponse>
> = [2, "/v2/targetWorkbench/highPriorityTargetLists/{0}/modify", 3];

/**
 * Modify a High Priority Target (HPTL) List by RID.
 *
 * Sets the current state of a HPTL. Any fields not supplied, except target board, will result in removal if there was a value present.
 * Trying to set target board to empty when there is already a value will result in an INVALID\_ARGUMENT exception.
 * You cannot modify the target board field if a value is already set.
 *
 * @beta
 *
 * Required Scopes: [api:target-write]
 * URL: /v2/targetWorkbench/highPriorityTargetLists/{highPriorityTargetListRid}/modify
 */
export function modify(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    highPriorityTargetListRid: _TargetWorkbench.HighPriorityTargetListRid,
    $body: _TargetWorkbench.ModifyHighPriorityTargetListRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_TargetWorkbench.EmptySuccessResponse> {
  return $platformFetch($ctx, _modify, ...args);
}

const _load: $PlatformMethod<
  (
    highPriorityTargetListRid: _TargetWorkbench.HighPriorityTargetListRid,
  ) => Promise<_TargetWorkbench.LoadHighPriorityTargetListResponse>
> = [0, "/v2/targetWorkbench/highPriorityTargetLists/{0}/load"];

/**
 * Load a High Priority Target List by RID.
 *
 * @public
 *
 * Required Scopes: [api:target-read]
 * URL: /v2/targetWorkbench/highPriorityTargetLists/{highPriorityTargetListRid}/load
 */
export function load(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    highPriorityTargetListRid: _TargetWorkbench.HighPriorityTargetListRid,
  ]
): Promise<_TargetWorkbench.LoadHighPriorityTargetListResponse> {
  return $platformFetch($ctx, _load, ...args);
}
