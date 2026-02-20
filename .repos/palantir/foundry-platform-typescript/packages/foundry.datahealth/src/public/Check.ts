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
import type * as _DataHealth from "../_components.js";

//

const _create: $FoundryPlatformMethod<
  (
    $body: _DataHealth.CreateCheckRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_DataHealth.Check>
> = [1, "/v2/dataHealth/checks", 3];

/**
 * Creates a new Check.
 *
 * @beta
 *
 * Required Scopes: [api:data-health-write]
 * URL: /v2/dataHealth/checks
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _DataHealth.CreateCheckRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_DataHealth.Check> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _deleteCheck: $FoundryPlatformMethod<
  (
    checkRid: _Core.CheckRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [3, "/v2/dataHealth/checks/{0}", 2];

/**
 * Delete the Check with the specified rid.
 *
 * @beta
 *
 * Required Scopes: [api:data-health-write]
 * URL: /v2/dataHealth/checks/{checkRid}
 */
export function deleteCheck(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    checkRid: _Core.CheckRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _deleteCheck, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    checkRid: _Core.CheckRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_DataHealth.Check>
> = [0, "/v2/dataHealth/checks/{0}", 2];

/**
 * Get the Check with the specified rid.
 *
 * @beta
 *
 * Required Scopes: [api:data-health-read]
 * URL: /v2/dataHealth/checks/{checkRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    checkRid: _Core.CheckRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_DataHealth.Check> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _replace: $FoundryPlatformMethod<
  (
    checkRid: _Core.CheckRid,
    $body: _DataHealth.ReplaceCheckRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_DataHealth.Check>
> = [2, "/v2/dataHealth/checks/{0}", 3];

/**
 * Replace the Check with the specified rid. Changing the type of a check after it has been created is not supported.
 *
 * @beta
 *
 * Required Scopes: [api:data-health-write]
 * URL: /v2/dataHealth/checks/{checkRid}
 */
export function replace(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    checkRid: _Core.CheckRid,
    $body: _DataHealth.ReplaceCheckRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_DataHealth.Check> {
  return $foundryPlatformFetch($ctx, _replace, ...args);
}
