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

const _get: $FoundryPlatformMethod<
  (
    checkRid: _Core.CheckRid,
    checkReportRid: _Core.CheckReportRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_DataHealth.CheckReport>
> = [0, "/v2/dataHealth/checks/{0}/checkReports/{1}", 2];

/**
 * Get the CheckReport with the specified rid.
 *
 * @beta
 *
 * Required Scopes: [api:data-health-read]
 * URL: /v2/dataHealth/checks/{checkRid}/checkReports/{checkReportRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    checkRid: _Core.CheckRid,
    checkReportRid: _Core.CheckReportRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_DataHealth.CheckReport> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _getLatest: $FoundryPlatformMethod<
  (
    checkRid: _Core.CheckRid,
    $queryParams?: {
      limit?: _DataHealth.CheckReportLimit | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_DataHealth.GetLatestCheckReportsResponse>
> = [0, "/v2/dataHealth/checks/{0}/checkReports/getLatest", 2];

/**
 * Get the most recent check reports for this Check. Reports are returned
 * in reverse chronological order (most recent first).
 *
 * @beta
 *
 * Required Scopes: [api:data-health-read]
 * URL: /v2/dataHealth/checks/{checkRid}/checkReports/getLatest
 */
export function getLatest(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    checkRid: _Core.CheckRid,

    $queryParams?: {
      limit?: _DataHealth.CheckReportLimit | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_DataHealth.GetLatestCheckReportsResponse> {
  return $foundryPlatformFetch($ctx, _getLatest, ...args);
}
