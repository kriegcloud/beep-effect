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
import type * as _Audit from "../_components.js";

//

const _list: $FoundryPlatformMethod<
  (
    organizationRid: _Core.OrganizationRid,
    $queryParams?: {
      startDate?: string | undefined;
      endDate?: string | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
    },
  ) => Promise<_Audit.ListLogFilesResponse>
> = [0, "/v2/audit/organizations/{0}/logFiles", 2];

/**
 * Lists all LogFiles.
 *
 * This is a paged endpoint. Each page may be smaller or larger than the requested page size. However, it is guaranteed that if there are more results available, the `nextPageToken` field will be populated. To get the next page, make the same request again, but set the value of the `pageToken` query parameter to be value of the `nextPageToken` value of the previous response. If there is no `nextPageToken` field in the response, you are on the last page.
 *
 * @public
 *
 * Required Scopes: [api:audit-read]
 * URL: /v2/audit/organizations/{organizationRid}/logFiles
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    organizationRid: _Core.OrganizationRid,

    $queryParams?: {
      startDate?: string | undefined;
      endDate?: string | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
    },
  ]
): Promise<_Audit.ListLogFilesResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _content: $FoundryPlatformMethod<
  (
    organizationRid: _Core.OrganizationRid,
    logFileId: _Audit.FileId,
  ) => Promise<Response>
> = [
  0,
  "/v2/audit/organizations/{0}/logFiles/{1}/content",
  ,
  ,
  "application/octet-stream",
];

/**
 * @public
 *
 * Required Scopes: [api:audit-read]
 * URL: /v2/audit/organizations/{organizationRid}/logFiles/{logFileId}/content
 */
export function content(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [organizationRid: _Core.OrganizationRid, logFileId: _Audit.FileId]
): Promise<Response> {
  return $foundryPlatformFetch($ctx, _content, ...args);
}
