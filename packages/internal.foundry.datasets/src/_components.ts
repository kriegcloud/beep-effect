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

import type * as _Core from "@osdk/internal.foundry.core";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * A Branch of a Dataset.
 *
 * Log Safety: UNSAFE
 */
export interface Branch {
  branchId: BranchId;
  transactionRid?: TransactionRid;
}

/**
 * The identifier (name) of a Branch.
 *
 * Log Safety: UNSAFE
 */
export type BranchId = LooselyBrandedString<"BranchId">;

/**
 * Log Safety: UNSAFE
 */
export interface CreateBranchRequest {
  branchId: BranchId;
  transactionRid?: TransactionRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateDatasetRequest {
  name: DatasetName;
  parentFolderRid: _Core.FolderRid;
}

/**
 * Log Safety: SAFE
 */
export interface CreateTransactionRequest {
  transactionType?: TransactionType;
}

/**
 * Log Safety: UNSAFE
 */
export interface Dataset {
  rid: DatasetRid;
  name: DatasetName;
  parentFolderRid: _Core.FolderRid;
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
  updatedTime: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListBranchesResponse {
  nextPageToken?: _Core.PageToken;
  data: Array<Branch>;
}

/**
 * A page of Files and an optional page token that can be used to retrieve the next page.
 *
 * Log Safety: UNSAFE
 */
export interface ListFilesResponse {
  nextPageToken?: _Core.PageToken;
  data: Array<File>;
}

/**
 * A path in the Foundry file tree.
 *
 * Log Safety: UNSAFE
 */
export type ResourcePath = LooselyBrandedString<"ResourcePath">;

/**
 * Format for tabular dataset export.
 *
 * Log Safety: SAFE
 */
export type TableExportFormat = "ARROW" | "CSV";

/**
 * An operation that modifies the files within a dataset.
 *
 * Log Safety: UNSAFE
 */
export interface Transaction {
  rid: TransactionRid;
  transactionType: TransactionType;
  status: TransactionStatus;
  createdTime: string;
  closedTime?: string;
}

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
