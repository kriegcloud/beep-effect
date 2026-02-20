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
import type * as _Models from "../_components.js";

//

const _create: $FoundryPlatformMethod<
  (
    $body: _Models.CreateModelStudioRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Models.ModelStudio>
> = [1, "/v2/models/modelStudios", 3];

/**
 * Creates a new Model Studio.
 *
 * @alpha
 *
 * Required Scopes: [api:models-write]
 * URL: /v2/models/modelStudios
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _Models.CreateModelStudioRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Models.ModelStudio> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    modelStudioRid: _Models.ModelStudioRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Models.ModelStudio>
> = [0, "/v2/models/modelStudios/{0}", 2];

/**
 * Gets details about a Model Studio by its RID.
 *
 * @alpha
 *
 * Required Scopes: [api:models-read]
 * URL: /v2/models/modelStudios/{modelStudioRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    modelStudioRid: _Models.ModelStudioRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Models.ModelStudio> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _launch: $FoundryPlatformMethod<
  (
    modelStudioRid: _Models.ModelStudioRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Models.ModelStudioRun>
> = [1, "/v2/models/modelStudios/{0}/launch", 2];

/**
 * Launches a new training run for the Model Studio using the latest configuration version.
 *
 * @alpha
 *
 * Required Scopes: [api:models-write]
 * URL: /v2/models/modelStudios/{modelStudioRid}/launch
 */
export function launch(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    modelStudioRid: _Models.ModelStudioRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Models.ModelStudioRun> {
  return $foundryPlatformFetch($ctx, _launch, ...args);
}
