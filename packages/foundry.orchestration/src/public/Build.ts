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
  (buildRid: _Core.BuildRid) => Promise<_Orchestration.Build>
> = [0, "/v2/orchestration/builds/{0}"];

/**
 * Get the Build with the specified rid.
 *
 * @public
 *
 * Required Scopes: [api:orchestration-read]
 * URL: /v2/orchestration/builds/{buildRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [buildRid: _Core.BuildRid]
): Promise<_Orchestration.Build> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _getBatch: $FoundryPlatformMethod<
  (
    $body: Array<_Orchestration.GetBuildsBatchRequestElement>,
  ) => Promise<_Orchestration.GetBuildsBatchResponse>
> = [1, "/v2/orchestration/builds/getBatch", 1];

/**
 * Execute multiple get requests on Build.
 *
 * The maximum batch size for this endpoint is 100.
 *
 * @public
 *
 * Required Scopes: [api:orchestration-read]
 * URL: /v2/orchestration/builds/getBatch
 */
export function getBatch(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$body: Array<_Orchestration.GetBuildsBatchRequestElement>]
): Promise<_Orchestration.GetBuildsBatchResponse> {
  return $foundryPlatformFetch($ctx, _getBatch, ...args);
}

const _create: $FoundryPlatformMethod<
  ($body: _Orchestration.CreateBuildRequest) => Promise<_Orchestration.Build>
> = [1, "/v2/orchestration/builds/create", 1];

/**
 * @public
 *
 * Required Scopes: [api:orchestration-write]
 * URL: /v2/orchestration/builds/create
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$body: _Orchestration.CreateBuildRequest]
): Promise<_Orchestration.Build> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _cancel: $FoundryPlatformMethod<
  (buildRid: _Core.BuildRid) => Promise<void>
> = [1, "/v2/orchestration/builds/{0}/cancel"];

/**
 * Request a cancellation for all unfinished jobs in a build. The build's status will not update immediately. This endpoint is asynchronous and a success response indicates that the cancellation request has been acknowledged and the build is expected to be canceled soon. If the build has already finished or finishes shortly after the request and before the cancellation, the build will not change.
 *
 * @public
 *
 * Required Scopes: [api:orchestration-write]
 * URL: /v2/orchestration/builds/{buildRid}/cancel
 */
export function cancel(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [buildRid: _Core.BuildRid]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _cancel, ...args);
}

const _search: $FoundryPlatformMethod<
  (
    $body: _Orchestration.SearchBuildsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Orchestration.SearchBuildsResponse>
> = [1, "/v2/orchestration/builds/search", 3];

/**
 * Search for Builds.
 *
 * @alpha
 *
 * Required Scopes: [api:orchestration-read]
 * URL: /v2/orchestration/builds/search
 */
export function search(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _Orchestration.SearchBuildsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Orchestration.SearchBuildsResponse> {
  return $foundryPlatformFetch($ctx, _search, ...args);
}

const _jobs: $FoundryPlatformMethod<
  (
    buildRid: _Core.BuildRid,
    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
    },
  ) => Promise<_Orchestration.ListJobsOfBuildResponse>
> = [0, "/v2/orchestration/builds/{0}/jobs", 2];

/**
 * Get the Jobs in the Build.
 *
 * @public
 *
 * Required Scopes: [api:orchestration-read]
 * URL: /v2/orchestration/builds/{buildRid}/jobs
 */
export function jobs(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    buildRid: _Core.BuildRid,

    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
    },
  ]
): Promise<_Orchestration.ListJobsOfBuildResponse> {
  return $foundryPlatformFetch($ctx, _jobs, ...args);
}
