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
  ($body: _Datasets.CreateDatasetRequest) => Promise<_Datasets.Dataset>
> = [1, "/v2/datasets", 1];

/**
 * Creates a new Dataset. A default branch - `master` for most enrollments - will be created on the Dataset.
 *
 * @public
 *
 * Required Scopes: [api:datasets-write]
 * URL: /v2/datasets
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$body: _Datasets.CreateDatasetRequest]
): Promise<_Datasets.Dataset> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _get: $FoundryPlatformMethod<
  (datasetRid: _Core.DatasetRid) => Promise<_Datasets.Dataset>
> = [0, "/v2/datasets/{0}"];

/**
 * Get the Dataset with the specified rid.
 *
 * @public
 *
 * Required Scopes: [api:datasets-read]
 * URL: /v2/datasets/{datasetRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [datasetRid: _Core.DatasetRid]
): Promise<_Datasets.Dataset> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _getSchedules: $FoundryPlatformMethod<
  (
    datasetRid: _Core.DatasetRid,
    $queryParams?: {
      branchName?: _Core.BranchName | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Datasets.ListSchedulesResponse>
> = [0, "/v2/datasets/{0}/getSchedules", 2];

/**
 * Get the RIDs of the Schedules that target the given Dataset.
 *
 * Note: It may take up to an hour for recent changes to schedules to be reflected in this response,
 * especially for schedules managed by Marketplace. This operation will return outdated results in the
 * meantime.
 *
 * @beta
 *
 * Required Scopes: [api:orchestration-read, api:datasets-read]
 * URL: /v2/datasets/{datasetRid}/getSchedules
 */
export function getSchedules(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    datasetRid: _Core.DatasetRid,

    $queryParams?: {
      branchName?: _Core.BranchName | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Datasets.ListSchedulesResponse> {
  return $foundryPlatformFetch($ctx, _getSchedules, ...args);
}

const _getHealthChecks: $FoundryPlatformMethod<
  (
    datasetRid: _Core.DatasetRid,
    $queryParams?: {
      branchName?: _Core.BranchName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Datasets.ListHealthChecksResponse>
> = [0, "/v2/datasets/{0}/getHealthChecks", 2];

/**
 * Get the RIDs of the Data Health Checks that are configured for the given Dataset.
 *
 * @beta
 *
 * Required Scopes: [api:data-health-read, api:datasets-read]
 * URL: /v2/datasets/{datasetRid}/getHealthChecks
 */
export function getHealthChecks(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    datasetRid: _Core.DatasetRid,

    $queryParams?: {
      branchName?: _Core.BranchName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Datasets.ListHealthChecksResponse> {
  return $foundryPlatformFetch($ctx, _getHealthChecks, ...args);
}

const _getHealthCheckReports: $FoundryPlatformMethod<
  (
    datasetRid: _Core.DatasetRid,
    $queryParams?: {
      branchName?: _Core.BranchName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Datasets.GetHealthCheckReportsResponse>
> = [0, "/v2/datasets/{0}/getHealthCheckReports", 2];

/**
 * Get the most recent Data Health Check report for each check configured on the given Dataset.
 * Returns one report per check, representing the current health status of the dataset.
 *
 * To get the list of checks configured on a Dataset, use
 * [Get Dataset Health Checks](https://www.palantir.com/docs/foundry/api/datasets/get-dataset-health-checks/).
 * For the full report history of a specific check, use
 * [Get Latest Check Reports](https://www.palantir.com/docs/foundry/api/v2/data-health-v2-resources/checks/get-latest-check-reports).
 *
 * @beta
 *
 * Required Scopes: [api:data-health-read, api:datasets-read]
 * URL: /v2/datasets/{datasetRid}/getHealthCheckReports
 */
export function getHealthCheckReports(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    datasetRid: _Core.DatasetRid,

    $queryParams?: {
      branchName?: _Core.BranchName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Datasets.GetHealthCheckReportsResponse> {
  return $foundryPlatformFetch($ctx, _getHealthCheckReports, ...args);
}

const _readTable: $FoundryPlatformMethod<
  (
    datasetRid: _Core.DatasetRid,
    $queryParams: {
      branchName?: _Core.BranchName | undefined;
      startTransactionRid?: _Datasets.TransactionRid | undefined;
      endTransactionRid?: _Datasets.TransactionRid | undefined;
      format: _Datasets.TableExportFormat;
      columns: Array<string>;
      rowLimit?: number | undefined;
    },
  ) => Promise<Response>
> = [0, "/v2/datasets/{0}/readTable", 2, , "application/octet-stream"];

/**
 * Gets the content of a dataset as a table in the specified format.
 *
 * This endpoint currently does not support views (virtual datasets composed of other datasets).
 *
 * @public
 *
 * Required Scopes: [api:datasets-read]
 * URL: /v2/datasets/{datasetRid}/readTable
 */
export function readTable(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    datasetRid: _Core.DatasetRid,

    $queryParams: {
      branchName?: _Core.BranchName | undefined;
      startTransactionRid?: _Datasets.TransactionRid | undefined;
      endTransactionRid?: _Datasets.TransactionRid | undefined;
      format: _Datasets.TableExportFormat;
      columns: Array<string>;
      rowLimit?: number | undefined;
    },
  ]
): Promise<Response> {
  return $foundryPlatformFetch($ctx, _readTable, ...args);
}

const _getSchema: $FoundryPlatformMethod<
  (
    datasetRid: _Core.DatasetRid,
    $queryParams?: {
      branchName?: _Core.BranchName | undefined;
      endTransactionRid?: _Datasets.TransactionRid | undefined;
      versionId?: _Core.VersionId | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Datasets.GetDatasetSchemaResponse>
> = [0, "/v2/datasets/{0}/getSchema", 2];

/**
 * Gets a dataset's schema. If no `endTransactionRid` is provided, the latest committed version will be used.
 *
 * @beta
 *
 * Required Scopes: [api:datasets-read]
 * URL: /v2/datasets/{datasetRid}/getSchema
 */
export function getSchema(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    datasetRid: _Core.DatasetRid,

    $queryParams?: {
      branchName?: _Core.BranchName | undefined;
      endTransactionRid?: _Datasets.TransactionRid | undefined;
      versionId?: _Core.VersionId | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Datasets.GetDatasetSchemaResponse> {
  return $foundryPlatformFetch($ctx, _getSchema, ...args);
}

const _getSchemaBatch: $FoundryPlatformMethod<
  (
    $body: Array<_Datasets.GetSchemaDatasetsBatchRequestElement>,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Datasets.GetSchemaDatasetsBatchResponse>
> = [1, "/v2/datasets/getSchemaBatch", 3];

/**
 * Fetch schemas for multiple datasets in a single request. Datasets not found
 * or inaccessible to the user will be omitted from the response.
 *
 * The maximum batch size for this endpoint is 1000.
 *
 * @beta
 *
 * Required Scopes: [api:datasets-read]
 * URL: /v2/datasets/getSchemaBatch
 */
export function getSchemaBatch(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: Array<_Datasets.GetSchemaDatasetsBatchRequestElement>,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Datasets.GetSchemaDatasetsBatchResponse> {
  return $foundryPlatformFetch($ctx, _getSchemaBatch, ...args);
}

const _putSchema: $FoundryPlatformMethod<
  (
    datasetRid: _Core.DatasetRid,
    $body: _Datasets.PutDatasetSchemaRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Datasets.GetDatasetSchemaResponse>
> = [2, "/v2/datasets/{0}/putSchema", 3];

/**
 * Adds a schema on an existing dataset using a PUT request.
 *
 * @beta
 *
 * Required Scopes: [api:datasets-write]
 * URL: /v2/datasets/{datasetRid}/putSchema
 */
export function putSchema(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    datasetRid: _Core.DatasetRid,
    $body: _Datasets.PutDatasetSchemaRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Datasets.GetDatasetSchemaResponse> {
  return $foundryPlatformFetch($ctx, _putSchema, ...args);
}

const _jobs: $FoundryPlatformMethod<
  (
    datasetRid: _Core.DatasetRid,
    $body: _Datasets.GetDatasetJobsRequest,
    $queryParams?: {
      branchName?: _Core.BranchName | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Datasets.GetJobResponse>
> = [1, "/v2/datasets/{0}/jobs", 3];

/**
 * Get the RIDs of the Jobs for the given dataset. By default, returned Jobs are sorted in descending order by the Job start time.
 *
 * @beta
 *
 * Required Scopes: [api:datasets-read]
 * URL: /v2/datasets/{datasetRid}/jobs
 */
export function jobs(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    datasetRid: _Core.DatasetRid,
    $body: _Datasets.GetDatasetJobsRequest,
    $queryParams?: {
      branchName?: _Core.BranchName | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Datasets.GetJobResponse> {
  return $foundryPlatformFetch($ctx, _jobs, ...args);
}

const _transactions: $FoundryPlatformMethod<
  (
    datasetRid: _Core.DatasetRid,
    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Datasets.ListTransactionsOfDatasetResponse>
> = [0, "/v2/datasets/{0}/transactions", 2];

/**
 * Get the Transaction history for the given Dataset. When requesting all transactions, the endpoint returns them in reverse chronological order.
 *
 * @beta
 *
 * Required Scopes: [api:datasets-read]
 * URL: /v2/datasets/{datasetRid}/transactions
 */
export function transactions(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    datasetRid: _Core.DatasetRid,

    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Datasets.ListTransactionsOfDatasetResponse> {
  return $foundryPlatformFetch($ctx, _transactions, ...args);
}
