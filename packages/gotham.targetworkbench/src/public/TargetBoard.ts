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
    $body: _TargetWorkbench.CreateTargetBoardRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_TargetWorkbench.TargetBoard>
> = [1, "/v2/targetWorkbench/targetBoards", 3];

/**
 * By default, create a TargetBoard with default columns: IDENTIFIED TARGET, PRIORITIZED TARGET, IN COORDINATION, IN EXECUTION, COMPLETE.
 * Returns the RID of the created TargetBoard.
 * The `security.spaceRid` field defaults to your user's space if there is only one. Use the List Spaces endpoint at `/api/v2/filesystem/spaces` to get the spaces your user has access to.
 *
 * @beta
 *
 * Required Scopes: [api:target-write]
 * URL: /v2/targetWorkbench/targetBoards
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _TargetWorkbench.CreateTargetBoardRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_TargetWorkbench.TargetBoard> {
  return $platformFetch($ctx, _create, ...args);
}

const _deleteTargetBoard: $PlatformMethod<
  (
    targetBoardRid: _TargetWorkbench.TargetBoardRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [3, "/v2/targetWorkbench/targetBoards/{0}", 2];

/**
 * Archive a Target Board by RID.
 * The user is required to have OWN permissions on the target.
 *
 * @beta
 *
 * Required Scopes: [api:target-write]
 * URL: /v2/targetWorkbench/targetBoards/{targetBoardRid}
 */
export function deleteTargetBoard(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    targetBoardRid: _TargetWorkbench.TargetBoardRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $platformFetch($ctx, _deleteTargetBoard, ...args);
}

const _modify: $PlatformMethod<
  (
    targetBoardRid: _TargetWorkbench.TargetBoardRid,
    $body: _TargetWorkbench.ModifyTargetBoardRequest,
  ) => Promise<_TargetWorkbench.EmptySuccessResponse>
> = [2, "/v2/targetWorkbench/targetBoards/{0}/modify", 1];

/**
 * Modify a Target Board by RID.
 *
 * Sets the current state of a Collection. Any fields, except `hptl`, not supplied will result in
 * removal if there was a value present. Trying to set `hptl` to empty when there's already a value will
 * result in an INVALID\_ARGUMENT exception. You cannot modify the `hptl` field if a value is already set.
 * Fields that are not supported by the OpenAPI layer will remain unmodified.
 *
 * @public
 *
 * Required Scopes: [api:target-write]
 * URL: /v2/targetWorkbench/targetBoards/{targetBoardRid}/modify
 */
export function modify(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    targetBoardRid: _TargetWorkbench.TargetBoardRid,
    $body: _TargetWorkbench.ModifyTargetBoardRequest,
  ]
): Promise<_TargetWorkbench.EmptySuccessResponse> {
  return $platformFetch($ctx, _modify, ...args);
}

const _load: $PlatformMethod<
  (
    targetBoardRid: _TargetWorkbench.TargetBoardRid,
  ) => Promise<_TargetWorkbench.LoadTargetBoardResponse>
> = [0, "/v2/targetWorkbench/targetBoards/{0}/load"];

/**
 * Load Target Board by RID.
 *
 * @public
 *
 * Required Scopes: [api:target-read]
 * URL: /v2/targetWorkbench/targetBoards/{targetBoardRid}/load
 */
export function load(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [targetBoardRid: _TargetWorkbench.TargetBoardRid]
): Promise<_TargetWorkbench.LoadTargetBoardResponse> {
  return $platformFetch($ctx, _load, ...args);
}
