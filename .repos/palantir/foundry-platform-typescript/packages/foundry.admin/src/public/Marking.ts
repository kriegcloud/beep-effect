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
  ($body: _Admin.CreateMarkingRequest) => Promise<_Admin.Marking>
> = [1, "/v2/admin/markings", 1];

/**
 * Creates a new Marking.
 *
 * @public
 *
 * Required Scopes: [api:admin-write]
 * URL: /v2/admin/markings
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$body: _Admin.CreateMarkingRequest]
): Promise<_Admin.Marking> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _list: $FoundryPlatformMethod<
  ($queryParams?: {
    pageSize?: _Core.PageSize | undefined;
    pageToken?: _Core.PageToken | undefined;
  }) => Promise<_Admin.ListMarkingsResponse>
> = [0, "/v2/admin/markings", 2];

/**
 * Maximum page size 100.
 *
 * @public
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/markings
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
    },
  ]
): Promise<_Admin.ListMarkingsResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _get: $FoundryPlatformMethod<
  (markingId: _Core.MarkingId) => Promise<_Admin.Marking>
> = [0, "/v2/admin/markings/{0}"];

/**
 * Get the Marking with the specified id.
 *
 * @public
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/markings/{markingId}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [markingId: _Core.MarkingId]
): Promise<_Admin.Marking> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _getBatch: $FoundryPlatformMethod<
  (
    $body: Array<_Admin.GetMarkingsBatchRequestElement>,
  ) => Promise<_Admin.GetMarkingsBatchResponse>
> = [1, "/v2/admin/markings/getBatch", 1];

/**
 * Execute multiple get requests on Marking.
 *
 * The maximum batch size for this endpoint is 500.
 *
 * @public
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/markings/getBatch
 */
export function getBatch(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$body: Array<_Admin.GetMarkingsBatchRequestElement>]
): Promise<_Admin.GetMarkingsBatchResponse> {
  return $foundryPlatformFetch($ctx, _getBatch, ...args);
}

const _replace: $FoundryPlatformMethod<
  (
    markingId: _Core.MarkingId,
    $body: _Admin.ReplaceMarkingRequest,
  ) => Promise<_Admin.Marking>
> = [2, "/v2/admin/markings/{0}", 1];

/**
 * Replace the Marking with the specified id.
 *
 * @public
 *
 * Required Scopes: [api:admin-write]
 * URL: /v2/admin/markings/{markingId}
 */
export function replace(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [markingId: _Core.MarkingId, $body: _Admin.ReplaceMarkingRequest]
): Promise<_Admin.Marking> {
  return $foundryPlatformFetch($ctx, _replace, ...args);
}
