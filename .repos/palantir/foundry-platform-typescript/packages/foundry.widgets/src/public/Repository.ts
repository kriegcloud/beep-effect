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
import type * as _Widgets from "../_components.js";

//

const _get: $FoundryPlatformMethod<
  (
    repositoryRid: _Widgets.RepositoryRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Widgets.Repository>
> = [0, "/v2/widgets/repositories/{0}", 2];

/**
 * Get the Repository with the specified rid.
 *
 * @alpha
 *
 * Required Scopes: [api:widgets-read]
 * URL: /v2/widgets/repositories/{repositoryRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    repositoryRid: _Widgets.RepositoryRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Widgets.Repository> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _publish: $FoundryPlatformMethod<
  (
    repositoryRid: _Widgets.RepositoryRid,
    $body: Blob,
    $queryParams: {
      repositoryVersion: _Widgets.RepositoryVersion;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Widgets.Release>
> = [1, "/v2/widgets/repositories/{0}/publish", 3, "application/octet-stream"];

/**
 * Publish a new release of a widget set.
 *
 * @alpha
 *
 * Required Scopes: [api:widgets-write]
 * URL: /v2/widgets/repositories/{repositoryRid}/publish
 */
export function publish(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    repositoryRid: _Widgets.RepositoryRid,
    $body: Blob,
    $queryParams: {
      repositoryVersion: _Widgets.RepositoryVersion;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Widgets.Release> {
  return $foundryPlatformFetch($ctx, _publish, ...args);
}
