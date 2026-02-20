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
import type * as _Orchestration from "../_components.js";

//

const _get: $FoundryPlatformMethod<
  (
    jobRid: _Core.JobRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Orchestration.Job>
> = [0, "/v2/orchestration/jobs/{0}", 2];

/**
 * Get the Job with the specified rid.
 *
 * @beta
 *
 * Required Scopes: [api:orchestration-read]
 * URL: /v2/orchestration/jobs/{jobRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    jobRid: _Core.JobRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Orchestration.Job> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _getBatch: $FoundryPlatformMethod<
  (
    $body: Array<_Orchestration.GetJobsBatchRequestElement>,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Orchestration.GetJobsBatchResponse>
> = [1, "/v2/orchestration/jobs/getBatch", 3];

/**
 * Execute multiple get requests on Job.
 *
 * The maximum batch size for this endpoint is 500.
 *
 * @beta
 *
 * Required Scopes: [api:orchestration-read]
 * URL: /v2/orchestration/jobs/getBatch
 */
export function getBatch(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: Array<_Orchestration.GetJobsBatchRequestElement>,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Orchestration.GetJobsBatchResponse> {
  return $foundryPlatformFetch($ctx, _getBatch, ...args);
}
