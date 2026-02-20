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
    $body: _TargetWorkbench.CreateTargetRequest,
  ) => Promise<_TargetWorkbench.Target>
> = [1, "/v2/targetWorkbench/targets", 1];

/**
 * Create a Target.
 * Returns the RID of the created Target.
 *
 * If `sidc` field is specified and invalid according to MIL-STD-2525C specification,
 * an `InvalidSidc` error is thrown.
 *
 * @public
 *
 * Required Scopes: [api:target-write]
 * URL: /v2/targetWorkbench/targets
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$body: _TargetWorkbench.CreateTargetRequest]
): Promise<_TargetWorkbench.Target> {
  return $platformFetch($ctx, _create, ...args);
}

const _deleteTarget: $PlatformMethod<
  (
    targetRid: _TargetWorkbench.TargetRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [3, "/v2/targetWorkbench/targets/{0}", 2];

/**
 * Archive a Target by RID.
 * The user is required to have OWN permissions on the target.
 *
 * @beta
 *
 * Required Scopes: [api:target-write]
 * URL: /v2/targetWorkbench/targets/{targetRid}
 */
export function deleteTarget(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    targetRid: _TargetWorkbench.TargetRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $platformFetch($ctx, _deleteTarget, ...args);
}

const _modify: $PlatformMethod<
  (
    targetRid: _TargetWorkbench.TargetRid,
    $body: _TargetWorkbench.ModifyTargetRequest,
  ) => Promise<_TargetWorkbench.EmptySuccessResponse>
> = [2, "/v2/targetWorkbench/targets/{0}/modify", 1];

/**
 * Set current state of Target by RID.
 *
 * If `sidc` field is specified and invalid according to MIL-STD-2525C specification,
 * an `InvalidSidc` error is thrown.
 *
 * @public
 *
 * Required Scopes: [api:target-write]
 * URL: /v2/targetWorkbench/targets/{targetRid}/modify
 */
export function modify(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    targetRid: _TargetWorkbench.TargetRid,
    $body: _TargetWorkbench.ModifyTargetRequest,
  ]
): Promise<_TargetWorkbench.EmptySuccessResponse> {
  return $platformFetch($ctx, _modify, ...args);
}

const _load: $PlatformMethod<
  (
    targetRid: _TargetWorkbench.TargetRid,
  ) => Promise<_TargetWorkbench.LoadTargetResponse>
> = [0, "/v2/targetWorkbench/targets/{0}/load"];

/**
 * Load Target by RID.
 *
 * @public
 *
 * Required Scopes: [api:target-read]
 * URL: /v2/targetWorkbench/targets/{targetRid}/load
 */
export function load(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [targetRid: _TargetWorkbench.TargetRid]
): Promise<_TargetWorkbench.LoadTargetResponse> {
  return $platformFetch($ctx, _load, ...args);
}

const _setTargetColumn: $PlatformMethod<
  (
    targetRid: _TargetWorkbench.TargetRid,
    $body: _TargetWorkbench.SetTargetColumnTargetRequest,
  ) => Promise<_TargetWorkbench.EmptySuccessResponse>
> = [2, "/v2/targetWorkbench/targets/{0}/setTargetColumn", 1];

/**
 * Move a Target into a TargetBoardColumn from an old column.
 *
 * @public
 *
 * Required Scopes: [api:target-write]
 * URL: /v2/targetWorkbench/targets/{targetRid}/setTargetColumn
 */
export function setTargetColumn(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    targetRid: _TargetWorkbench.TargetRid,
    $body: _TargetWorkbench.SetTargetColumnTargetRequest,
  ]
): Promise<_TargetWorkbench.EmptySuccessResponse> {
  return $platformFetch($ctx, _setTargetColumn, ...args);
}

const _createTargetIntel: $PlatformMethod<
  (
    targetRid: _TargetWorkbench.TargetRid,
    $body: _TargetWorkbench.CreateTargetIntelTargetRequest,
  ) => Promise<_TargetWorkbench.EmptySuccessResponse>
> = [2, "/v2/targetWorkbench/targets/{0}/createTargetIntel", 1];

/**
 * Create Intel on Target by RID.
 *
 * @public
 *
 * Required Scopes: [api:target-write]
 * URL: /v2/targetWorkbench/targets/{targetRid}/createTargetIntel
 */
export function createTargetIntel(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    targetRid: _TargetWorkbench.TargetRid,
    $body: _TargetWorkbench.CreateTargetIntelTargetRequest,
  ]
): Promise<_TargetWorkbench.EmptySuccessResponse> {
  return $platformFetch($ctx, _createTargetIntel, ...args);
}

const _modifyTargetIntel: $PlatformMethod<
  (
    targetRid: _TargetWorkbench.TargetRid,
    $body: _TargetWorkbench.ModifyTargetIntelTargetRequest,
  ) => Promise<_TargetWorkbench.ModifyTargetIntelResponse>
> = [2, "/v2/targetWorkbench/targets/{0}/modifyTargetIntel", 1];

/**
 * Modify Intel on Target by RID and IntelId.
 *
 * @public
 *
 * Required Scopes: [api:target-write]
 * URL: /v2/targetWorkbench/targets/{targetRid}/modifyTargetIntel
 */
export function modifyTargetIntel(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    targetRid: _TargetWorkbench.TargetRid,
    $body: _TargetWorkbench.ModifyTargetIntelTargetRequest,
  ]
): Promise<_TargetWorkbench.ModifyTargetIntelResponse> {
  return $platformFetch($ctx, _modifyTargetIntel, ...args);
}

const _removeTargetIntel: $PlatformMethod<
  (
    targetRid: _TargetWorkbench.TargetRid,
    $body: _TargetWorkbench.RemoveTargetIntelTargetRequest,
  ) => Promise<_TargetWorkbench.EmptySuccessResponse>
> = [2, "/v2/targetWorkbench/targets/{0}/removeTargetIntel", 1];

/**
 * Remove Intel on Target by RID.
 *
 * @public
 *
 * Required Scopes: [api:target-write]
 * URL: /v2/targetWorkbench/targets/{targetRid}/removeTargetIntel
 */
export function removeTargetIntel(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    targetRid: _TargetWorkbench.TargetRid,
    $body: _TargetWorkbench.RemoveTargetIntelTargetRequest,
  ]
): Promise<_TargetWorkbench.EmptySuccessResponse> {
  return $platformFetch($ctx, _removeTargetIntel, ...args);
}
