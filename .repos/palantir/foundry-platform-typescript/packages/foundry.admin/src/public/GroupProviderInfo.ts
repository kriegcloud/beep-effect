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

const _get: $FoundryPlatformMethod<
  (
    groupId: _Core.GroupId,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Admin.GroupProviderInfo>
> = [0, "/v2/admin/groups/{0}/providerInfo", 2];

/**
 * Get the GroupProviderInfo.
 *
 * @beta
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/groups/{groupId}/providerInfo
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    groupId: _Core.GroupId,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Admin.GroupProviderInfo> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _replace: $FoundryPlatformMethod<
  (
    groupId: _Core.GroupId,
    $body: _Admin.ReplaceGroupProviderInfoRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Admin.GroupProviderInfo>
> = [2, "/v2/admin/groups/{0}/providerInfo", 3];

/**
 * Replace the GroupProviderInfo.
 *
 * @beta
 *
 * Required Scopes: [api:admin-write]
 * URL: /v2/admin/groups/{groupId}/providerInfo
 */
export function replace(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    groupId: _Core.GroupId,
    $body: _Admin.ReplaceGroupProviderInfoRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Admin.GroupProviderInfo> {
  return $foundryPlatformFetch($ctx, _replace, ...args);
}
