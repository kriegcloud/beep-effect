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

const _list: $FoundryPlatformMethod<
  (
    modelStudioRid: _Models.ModelStudioRid,
    $queryParams?: {
      configVersion?: _Models.ModelStudioConfigVersionNumber | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Models.ListModelStudioRunsResponse>
> = [0, "/v2/models/modelStudios/{0}/runs", 2];

/**
 * Lists all runs for a Model Studio.
 *
 * @alpha
 *
 * Required Scopes: [api:models-read]
 * URL: /v2/models/modelStudios/{modelStudioRid}/runs
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    modelStudioRid: _Models.ModelStudioRid,

    $queryParams?: {
      configVersion?: _Models.ModelStudioConfigVersionNumber | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Models.ListModelStudioRunsResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}
