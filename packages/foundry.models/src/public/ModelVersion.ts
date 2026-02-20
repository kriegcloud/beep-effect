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
    modelRid: _Models.ModelRid,
    $body: _Models.CreateModelVersionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Models.ModelVersion>
> = [1, "/v2/models/{0}/versions", 3];

/**
 * Creates a new Model Version on an existing model.
 *
 * @alpha
 *
 * Required Scopes: [api:models-write]
 * URL: /v2/models/{modelRid}/versions
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    modelRid: _Models.ModelRid,
    $body: _Models.CreateModelVersionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Models.ModelVersion> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _list: $FoundryPlatformMethod<
  (
    modelRid: _Models.ModelRid,
    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Models.ListModelVersionsResponse>
> = [0, "/v2/models/{0}/versions", 2];

/**
 * Lists all Model Versions for a given Model.
 *
 * @alpha
 *
 * Required Scopes: [api:models-read]
 * URL: /v2/models/{modelRid}/versions
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    modelRid: _Models.ModelRid,

    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Models.ListModelVersionsResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    modelRid: _Models.ModelRid,
    modelVersionRid: _Models.ModelVersionRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Models.ModelVersion>
> = [0, "/v2/models/{0}/versions/{1}", 2];

/**
 * Retrieves a Model Version by its Resource Identifier (RID).
 *
 * @alpha
 *
 * Required Scopes: [api:models-read]
 * URL: /v2/models/{modelRid}/versions/{modelVersionRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    modelRid: _Models.ModelRid,
    modelVersionRid: _Models.ModelVersionRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Models.ModelVersion> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}
