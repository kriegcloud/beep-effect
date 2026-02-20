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
  ($queryParams?: {
    pageSize?: _Core.PageSize | undefined;
    pageToken?: _Core.PageToken | undefined;
    preview?: _Core.PreviewMode | undefined;
  }) => Promise<_Models.ListModelStudioTrainersResponse>
> = [0, "/v2/models/modelStudioTrainers", 2];

/**
 * Lists all available trainers for Model Studios.
 *
 * @alpha
 *
 * Required Scopes: [api:models-read]
 * URL: /v2/models/modelStudioTrainers
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Models.ListModelStudioTrainersResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    modelStudioTrainerTrainerId: _Models.TrainerId,
    $queryParams?: {
      version?: _Models.TrainerVersion | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Models.ModelStudioTrainer>
> = [0, "/v2/models/modelStudioTrainers/{0}", 2];

/**
 * Gets details about a specific trainer by its ID and optional version.
 *
 * @alpha
 *
 * Required Scopes: [api:models-read]
 * URL: /v2/models/modelStudioTrainers/{modelStudioTrainerTrainerId}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    modelStudioTrainerTrainerId: _Models.TrainerId,

    $queryParams?: {
      version?: _Models.TrainerVersion | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Models.ModelStudioTrainer> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}
