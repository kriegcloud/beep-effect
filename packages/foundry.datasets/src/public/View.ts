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
import type * as _Datasets from "../_components.js";

//

const _create: $FoundryPlatformMethod<
  (
    $body: _Datasets.CreateViewRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Datasets.View>
> = [1, "/v2/datasets/views", 3];

/**
 * Create a new View.
 *
 * @beta
 *
 * Required Scopes: [api:datasets-write]
 * URL: /v2/datasets/views
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _Datasets.CreateViewRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Datasets.View> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    viewDatasetRid: _Core.DatasetRid,
    $queryParams?: {
      branch?: _Core.BranchName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Datasets.View>
> = [0, "/v2/datasets/views/{0}", 2];

/**
 * Get metadata for a View.
 *
 * @beta
 *
 * Required Scopes: []
 * URL: /v2/datasets/views/{viewDatasetRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    viewDatasetRid: _Core.DatasetRid,

    $queryParams?: {
      branch?: _Core.BranchName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Datasets.View> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _addBackingDatasets: $FoundryPlatformMethod<
  (
    viewDatasetRid: _Core.DatasetRid,
    $body: _Datasets.AddBackingDatasetsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Datasets.View>
> = [1, "/v2/datasets/views/{0}/addBackingDatasets", 3];

/**
 * Adds one or more backing datasets to a View. Any duplicates with the same dataset RID and branch name are
 * ignored.
 *
 * @beta
 *
 * Required Scopes: [api:datasets-write]
 * URL: /v2/datasets/views/{viewDatasetRid}/addBackingDatasets
 */
export function addBackingDatasets(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    viewDatasetRid: _Core.DatasetRid,
    $body: _Datasets.AddBackingDatasetsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Datasets.View> {
  return $foundryPlatformFetch($ctx, _addBackingDatasets, ...args);
}

const _replaceBackingDatasets: $FoundryPlatformMethod<
  (
    viewDatasetRid: _Core.DatasetRid,
    $body: _Datasets.ReplaceBackingDatasetsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Datasets.View>
> = [2, "/v2/datasets/views/{0}/replaceBackingDatasets", 3];

/**
 * Replaces the backing datasets for a View. Removing any backing dataset triggers a
 * [SNAPSHOT](https://www.palantir.com/docs/foundry/data-integration/datasets#snapshot) transaction the next time the View is updated.
 *
 * @beta
 *
 * Required Scopes: [api:datasets-write]
 * URL: /v2/datasets/views/{viewDatasetRid}/replaceBackingDatasets
 */
export function replaceBackingDatasets(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    viewDatasetRid: _Core.DatasetRid,
    $body: _Datasets.ReplaceBackingDatasetsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Datasets.View> {
  return $foundryPlatformFetch($ctx, _replaceBackingDatasets, ...args);
}

const _removeBackingDatasets: $FoundryPlatformMethod<
  (
    viewDatasetRid: _Core.DatasetRid,
    $body: _Datasets.RemoveBackingDatasetsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Datasets.View>
> = [1, "/v2/datasets/views/{0}/removeBackingDatasets", 3];

/**
 * Removes specified backing datasets from a View. Removing a dataset triggers a
 * [SNAPSHOT](https://www.palantir.com/docs/foundry/data-integration/datasets#snapshot) transaction on the next update. If a
 * specified dataset does not exist, no error is thrown.
 *
 * @beta
 *
 * Required Scopes: [api:datasets-write]
 * URL: /v2/datasets/views/{viewDatasetRid}/removeBackingDatasets
 */
export function removeBackingDatasets(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    viewDatasetRid: _Core.DatasetRid,
    $body: _Datasets.RemoveBackingDatasetsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Datasets.View> {
  return $foundryPlatformFetch($ctx, _removeBackingDatasets, ...args);
}

const _addPrimaryKey: $FoundryPlatformMethod<
  (
    viewDatasetRid: _Core.DatasetRid,
    $body: _Datasets.AddPrimaryKeyRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Datasets.View>
> = [1, "/v2/datasets/views/{0}/addPrimaryKey", 3];

/**
 * Adds a primary key to a View that does not already have one. Primary keys are treated as
 * guarantees provided by the creator of the dataset.
 *
 * @beta
 *
 * Required Scopes: [api:datasets-write]
 * URL: /v2/datasets/views/{viewDatasetRid}/addPrimaryKey
 */
export function addPrimaryKey(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    viewDatasetRid: _Core.DatasetRid,
    $body: _Datasets.AddPrimaryKeyRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Datasets.View> {
  return $foundryPlatformFetch($ctx, _addPrimaryKey, ...args);
}
