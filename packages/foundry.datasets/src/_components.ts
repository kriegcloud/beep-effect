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
import type * as _DataHealth from "@osdk/foundry.datahealth";
import type * as _Filesystem from "@osdk/foundry.filesystem";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * Log Safety: UNSAFE
 */
export interface AddBackingDatasetsRequest {
  branch?: _Core.BranchName;
  backingDatasets: Array<ViewBackingDataset>;
}

/**
 * Log Safety: UNSAFE
 */
export interface AddPrimaryKeyRequest {
  branch?: _Core.BranchName;
  primaryKey: ViewPrimaryKey;
}

/**
 * Log Safety: UNSAFE
 */
export interface Branch {
  name: _Core.BranchName;
  transactionRid?: TransactionRid;
}

/**
 * The name of a Branch.
 *
 * Log Safety: UNSAFE
 */
export type BranchName = LooselyBrandedString<"BranchName">;

/**
 * Log Safety: UNSAFE
 */
export interface CreateBranchRequest {
  transactionRid?: TransactionRid;
  name: _Core.BranchName;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateDatasetRequest {
  parentFolderRid: _Filesystem.FolderRid;
  name: DatasetName;
}

/**
 * Log Safety: SAFE
 */
export interface CreateTransactionRequest {
  transactionType: TransactionType;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateViewRequest {
  parentFolderRid: _Filesystem.FolderRid;
  viewName: DatasetName;
  backingDatasets: Array<ViewBackingDataset>;
  branch?: _Core.BranchName;
  primaryKey?: ViewPrimaryKey;
}

/**
 * The dataframe reader used for reading the dataset schema.
 *
 * Log Safety: SAFE
 */
export type DataframeReader = "AVRO" | "CSV" | "PARQUET" | "DATASOURCE";

/**
 * Log Safety: UNSAFE
 */
export interface Dataset {
  rid: _Core.DatasetRid;
  name: DatasetName;
  parentFolderRid: _Filesystem.FolderRid;
}

/**
 * Log Safety: UNSAFE
 */
export type DatasetName = LooselyBrandedString<"DatasetName">;

/**
 * The Resource Identifier (RID) of a Dataset.
 *
 * Log Safety: SAFE
 */
export type DatasetRid = LooselyBrandedString<"DatasetRid">;

/**
 * Log Safety: UNSAFE
 */
export interface File {
  path: _Core.FilePath;
  transactionRid: TransactionRid;
  sizeBytes?: string;
  updatedTime: FileUpdatedTime;
}

/**
 * Log Safety: UNSAFE
 */
export type FileUpdatedTime = string;

/**
 * The unique resource identifier (RID) of a Folder.
 *
 * Log Safety: SAFE
 */
export type FolderRid = LooselyBrandedString<"FolderRid">;

/**
 * Log Safety: SAFE
 */
export interface GetDatasetJobsAndFilter {
  items: Array<GetDatasetJobsQuery>;
}

/**
 * Log Safety: SAFE
 */
export type GetDatasetJobsComparisonType = "GTE" | "LT";

/**
 * Log Safety: SAFE
 */
export interface GetDatasetJobsOrFilter {
  items: Array<GetDatasetJobsQuery>;
}

/**
 * Query for getting jobs on given dataset.
 *
 * Log Safety: SAFE
 */
export type GetDatasetJobsQuery =
  | ({ type: "or" } & GetDatasetJobsOrFilter)
  | ({ type: "and" } & GetDatasetJobsAndFilter)
  | ({ type: "timeFilter" } & GetDatasetJobsTimeFilter);

/**
 * Log Safety: SAFE
 */
export interface GetDatasetJobsRequest {
  where?: GetDatasetJobsQuery;
  orderBy: Array<GetDatasetJobsSort>;
}

/**
 * Log Safety: SAFE
 */
export interface GetDatasetJobsSort {
  sortType: GetDatasetJobsSortType;
  sortDirection: GetDatasetJobsSortDirection;
}

/**
 * Log Safety: SAFE
 */
export type GetDatasetJobsSortDirection = "ASCENDING" | "DESCENDING";

/**
 * Log Safety: SAFE
 */
export type GetDatasetJobsSortType = "BY_STARTED_TIME" | "BY_FINISHED_TIME";

/**
 * Log Safety: SAFE
 */
export interface GetDatasetJobsTimeFilter {
  field: GetDatasetJobsTimeFilterField;
  comparisonType: GetDatasetJobsComparisonType;
  value: string;
}

/**
 * Log Safety: SAFE
 */
export type GetDatasetJobsTimeFilterField = "SUBMITTED_TIME" | "FINISHED_TIME";

/**
 * Log Safety: UNSAFE
 */
export interface GetDatasetSchemaResponse {
  branchName: _Core.BranchName;
  endTransactionRid: TransactionRid;
  schema: _Core.DatasetSchema;
  versionId: _Core.VersionId;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetHealthCheckReportsResponse {
  data: Record<_Core.CheckRid, _DataHealth.CheckReport | undefined>;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetJobResponse {
  data: Array<JobDetails>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetSchemaDatasetsBatchRequestElement {
  endTransactionRid?: TransactionRid;
  datasetRid: _Core.DatasetRid;
  versionId?: _Core.VersionId;
  branchName?: _Core.BranchName;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetSchemaDatasetsBatchResponse {
  data: Record<_Core.DatasetRid, GetDatasetSchemaResponse>;
}

/**
 * Log Safety: SAFE
 */
export interface JobDetails {
  jobRid: _Core.JobRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListBranchesResponse {
  data: Array<Branch>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListFilesResponse {
  data: Array<File>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: SAFE
 */
export interface ListHealthChecksResponse {
  data: Array<_Core.CheckRid>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListSchedulesResponse {
  data: Array<_Core.ScheduleRid>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListTransactionsOfDatasetResponse {
  data: Array<Transaction>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListTransactionsResponse {
  data: Array<Transaction>;
  nextPageToken?: _Core.PageToken;
}

/**
 * The ID of a security marking.
 *
 * Log Safety: UNSAFE
 */
export type MarkingId = LooselyBrandedString<"MarkingId">;

/**
 * Picks the row with the highest value of a list of columns, compared in order.
 *
 * Log Safety: UNSAFE
 */
export interface PrimaryKeyLatestWinsResolutionStrategy {
  columns: Array<string>;
}

/**
 * Duplicate primary key values may exist within the dataset – resolution required.
 *
 * Log Safety: UNSAFE
 */
export interface PrimaryKeyResolutionDuplicate {
  deletionColumn?: string;
  resolutionStrategy: PrimaryKeyResolutionStrategy;
}

/**
 * Log Safety: UNSAFE
 */
export type PrimaryKeyResolutionStrategy = {
  type: "latestWins";
} & PrimaryKeyLatestWinsResolutionStrategy;

/**
 * Primary key values are unique within the dataset – no conflicts.
 *
 * Log Safety: SAFE
 */
export interface PrimaryKeyResolutionUnique {}

/**
 * Log Safety: UNSAFE
 */
export interface PutDatasetSchemaRequest {
  branchName?: _Core.BranchName;
  dataframeReader?: DataframeReader;
  endTransactionRid?: TransactionRid;
  schema: _Core.DatasetSchema;
}

/**
 * Log Safety: UNSAFE
 */
export interface RemoveBackingDatasetsRequest {
  branch?: _Core.BranchName;
  backingDatasets: Array<ViewBackingDataset>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ReplaceBackingDatasetsRequest {
  branch?: _Core.BranchName;
  backingDatasets: Array<ViewBackingDataset>;
}

/**
 * Format for tabular dataset export.
 *
 * Log Safety: SAFE
 */
export type TableExportFormat = "ARROW" | "CSV";

/**
 * Log Safety: UNSAFE
 */
export interface Transaction {
  rid: TransactionRid;
  transactionType: TransactionType;
  status: TransactionStatus;
  createdTime: TransactionCreatedTime;
  closedTime?: string;
}

/**
 * The timestamp when the transaction was created, in ISO 8601 timestamp format.
 *
 * Log Safety: UNSAFE
 */
export type TransactionCreatedTime = string;

/**
 * The Resource Identifier (RID) of a Transaction.
 *
 * Log Safety: SAFE
 */
export type TransactionRid = LooselyBrandedString<"TransactionRid">;

/**
 * The status of a Transaction.
 *
 * Log Safety: SAFE
 */
export type TransactionStatus = "ABORTED" | "COMMITTED" | "OPEN";

/**
 * The type of a Transaction.
 *
 * Log Safety: SAFE
 */
export type TransactionType = "APPEND" | "UPDATE" | "SNAPSHOT" | "DELETE";

/**
 * Log Safety: UNSAFE
 */
export interface View {
  viewName: DatasetName;
  datasetRid: _Core.DatasetRid;
  parentFolderRid: _Filesystem.FolderRid;
  branch?: _Core.BranchName;
  backingDatasets: Array<ViewBackingDataset>;
  primaryKey?: ViewPrimaryKey;
}

/**
 * One of the Datasets backing a View.
 *
 * Log Safety: UNSAFE
 */
export interface ViewBackingDataset {
  branch?: _Core.BranchName;
  datasetRid: _Core.DatasetRid;
  stopPropagatingMarkingIds: Array<_Core.MarkingId>;
}

/**
   * The primary key of the dataset. Primary keys are treated as guarantees provided by the creator of the
dataset.
   *
   * Log Safety: UNSAFE
   */
export interface ViewPrimaryKey {
  columns: Array<string>;
  resolution: ViewPrimaryKeyResolution;
}

/**
 * Specifies how primary key conflicts are resolved within the view.
 *
 * Log Safety: UNSAFE
 */
export type ViewPrimaryKeyResolution =
  | ({ type: "unique" } & PrimaryKeyResolutionUnique)
  | ({ type: "duplicate" } & PrimaryKeyResolutionDuplicate);
