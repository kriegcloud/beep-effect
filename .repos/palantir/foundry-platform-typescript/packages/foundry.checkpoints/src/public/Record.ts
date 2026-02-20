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
import type * as _Checkpoints from "../_components.js";

//

const _get: $FoundryPlatformMethod<
  (
    recordRid: _Checkpoints.RecordRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Checkpoints._Record>
> = [0, "/v2/checkpoints/records/{0}", 2];

/**
 * Retrieve a single checkpoint record by id.
 *
 * @alpha
 *
 * Required Scopes: [api:checkpoints-read]
 * URL: /v2/checkpoints/records/{recordRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    recordRid: _Checkpoints.RecordRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Checkpoints._Record> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _getBatch: $FoundryPlatformMethod<
  (
    $body: Array<_Checkpoints.GetRecordsBatchRequestElement>,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Checkpoints.GetRecordsBatchResponse>
> = [1, "/v2/checkpoints/records/getBatch", 3];

/**
 * Fetch multiple checkpoint records in a single request. Records not found
 * or inaccessible to the user will be omitted from the response.
 *
 * The maximum batch size for this endpoint is 100.
 *
 * @alpha
 *
 * Required Scopes: [api:checkpoints-read]
 * URL: /v2/checkpoints/records/getBatch
 */
export function getBatch(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: Array<_Checkpoints.GetRecordsBatchRequestElement>,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Checkpoints.GetRecordsBatchResponse> {
  return $foundryPlatformFetch($ctx, _getBatch, ...args);
}

const _search: $FoundryPlatformMethod<
  (
    $body: _Checkpoints.SearchRecordsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Checkpoints.SearchCheckpointRecordsResponse>
> = [1, "/v2/checkpoints/records/search", 3];

/**
 * Search for checkpoint records.
 *
 * @alpha
 *
 * Required Scopes: [api:checkpoints-read]
 * URL: /v2/checkpoints/records/search
 */
export function search(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _Checkpoints.SearchRecordsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Checkpoints.SearchCheckpointRecordsResponse> {
  return $foundryPlatformFetch($ctx, _search, ...args);
}
