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

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * The provided token does not have permission to abort the given transaction on the given dataset.
 *
 * Log Safety: SAFE
 */
export interface AbortTransactionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AbortTransactionPermissionDenied";
  errorDescription:
    "The provided token does not have permission to abort the given transaction on the given dataset.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    transactionRid: unknown;
  };
}

/**
 * The branch cannot be created because a branch with that name already exists.
 *
 * Log Safety: UNSAFE
 */
export interface BranchAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "BranchAlreadyExists";
  errorDescription:
    "The branch cannot be created because a branch with that name already exists.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchId: unknown;
  };
}

/**
 * The requested branch could not be found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface BranchNotFound {
  errorCode: "NOT_FOUND";
  errorName: "BranchNotFound";
  errorDescription:
    "The requested branch could not be found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchId: unknown;
  };
}

/**
 * The dataset contains column types that are not supported.
 *
 * Log Safety: SAFE
 */
export interface ColumnTypesNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ColumnTypesNotSupported";
  errorDescription: "The dataset contains column types that are not supported.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * The provided token does not have permission to commit the given transaction on the given dataset.
 *
 * Log Safety: SAFE
 */
export interface CommitTransactionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CommitTransactionPermissionDenied";
  errorDescription:
    "The provided token does not have permission to commit the given transaction on the given dataset.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    transactionRid: unknown;
  };
}

/**
 * The provided token does not have permission to create a branch of this dataset.
 *
 * Log Safety: UNSAFE
 */
export interface CreateBranchPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateBranchPermissionDenied";
  errorDescription:
    "The provided token does not have permission to create a branch of this dataset.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchId: unknown;
  };
}

/**
 * The provided token does not have permission to create a dataset in this folder.
 *
 * Log Safety: UNSAFE
 */
export interface CreateDatasetPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateDatasetPermissionDenied";
  errorDescription:
    "The provided token does not have permission to create a dataset in this folder.";
  errorInstanceId: string;
  parameters: {
    parentFolderRid: unknown;
    name: unknown;
  };
}

/**
 * The provided token does not have permission to create a transaction on this dataset.
 *
 * Log Safety: UNSAFE
 */
export interface CreateTransactionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateTransactionPermissionDenied";
  errorDescription:
    "The provided token does not have permission to create a transaction on this dataset.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchId: unknown;
  };
}

/**
 * The requested dataset could not be found, or the client token does not have access to it.
 *
 * Log Safety: SAFE
 */
export interface DatasetNotFound {
  errorCode: "NOT_FOUND";
  errorName: "DatasetNotFound";
  errorDescription:
    "The requested dataset could not be found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * The dataset does not support being read.
 *
 * Log Safety: SAFE
 */
export interface DatasetReadNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "DatasetReadNotSupported";
  errorDescription: "The dataset does not support being read.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * The provided token does not have permission to delete the given branch from this dataset.
 *
 * Log Safety: UNSAFE
 */
export interface DeleteBranchPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteBranchPermissionDenied";
  errorDescription:
    "The provided token does not have permission to delete the given branch from this dataset.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchId: unknown;
  };
}

/**
 * todo
 *
 * Log Safety: UNSAFE
 */
export interface DeleteSchemaPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteSchemaPermissionDenied";
  errorDescription: "todo";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchId: unknown;
    transactionRid: unknown;
  };
}

/**
 * The given file path already exists in the dataset and transaction.
 *
 * Log Safety: UNSAFE
 */
export interface FileAlreadyExists {
  errorCode: "NOT_FOUND";
  errorName: "FileAlreadyExists";
  errorDescription:
    "The given file path already exists in the dataset and transaction.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    transactionRid: unknown;
    path: unknown;
  };
}

/**
 * The requested file could not be found on the given branch, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface FileNotFoundOnBranch {
  errorCode: "NOT_FOUND";
  errorName: "FileNotFoundOnBranch";
  errorDescription:
    "The requested file could not be found on the given branch, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchId: unknown;
    path: unknown;
  };
}

/**
 * The requested file could not be found on the given transaction range, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface FileNotFoundOnTransactionRange {
  errorCode: "NOT_FOUND";
  errorName: "FileNotFoundOnTransactionRange";
  errorDescription:
    "The requested file could not be found on the given transaction range, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    startTransactionRid: unknown;
    endTransactionRid: unknown;
    path: unknown;
  };
}

/**
 * The requested branch name cannot be used. Branch names cannot be empty and must not look like RIDs or UUIDs.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidBranchId {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidBranchId";
  errorDescription:
    "The requested branch name cannot be used. Branch names cannot be empty and must not look like RIDs or UUIDs.";
  errorInstanceId: string;
  parameters: {
    branchId: unknown;
  };
}

/**
 * The given transaction type is not valid. Valid transaction types are SNAPSHOT, UPDATE, APPEND, and DELETE.
 *
 * Log Safety: SAFE
 */
export interface InvalidTransactionType {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidTransactionType";
  errorDescription:
    "The given transaction type is not valid. Valid transaction types are SNAPSHOT, UPDATE, APPEND, and DELETE.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    transactionRid: unknown;
    transactionType: unknown;
  };
}

/**
 * A transaction is already open on this dataset and branch. A branch of a dataset can only have one open transaction at a time.
 *
 * Log Safety: UNSAFE
 */
export interface OpenTransactionAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "OpenTransactionAlreadyExists";
  errorDescription:
    "A transaction is already open on this dataset and branch. A branch of a dataset can only have one open transaction at a time.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchId: unknown;
  };
}

/**
 * todo
 *
 * Log Safety: UNSAFE
 */
export interface PutSchemaPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "PutSchemaPermissionDenied";
  errorDescription: "todo";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchId: unknown;
  };
}

/**
 * The provided token does not have permission to read the given dataset as a table.
 *
 * Log Safety: SAFE
 */
export interface ReadTablePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReadTablePermissionDenied";
  errorDescription:
    "The provided token does not have permission to read the given dataset as a table.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * A schema could not be found for the given dataset and branch, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface SchemaNotFound {
  errorCode: "NOT_FOUND";
  errorName: "SchemaNotFound";
  errorDescription:
    "A schema could not be found for the given dataset and branch, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchId: unknown;
    transactionRid: unknown;
  };
}

/**
 * The given transaction has not been committed.
 *
 * Log Safety: SAFE
 */
export interface TransactionNotCommitted {
  errorCode: "INVALID_ARGUMENT";
  errorName: "TransactionNotCommitted";
  errorDescription: "The given transaction has not been committed.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    transactionRid: unknown;
    transactionStatus: unknown;
  };
}

/**
 * The requested transaction could not be found on the dataset, or the client token does not have access to it.
 *
 * Log Safety: SAFE
 */
export interface TransactionNotFound {
  errorCode: "NOT_FOUND";
  errorName: "TransactionNotFound";
  errorDescription:
    "The requested transaction could not be found on the dataset, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    transactionRid: unknown;
  };
}

/**
 * The given transaction is not open.
 *
 * Log Safety: SAFE
 */
export interface TransactionNotOpen {
  errorCode: "INVALID_ARGUMENT";
  errorName: "TransactionNotOpen";
  errorDescription: "The given transaction is not open.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    transactionRid: unknown;
    transactionStatus: unknown;
  };
}

/**
 * The provided token does not have permission to upload the given file to the given dataset and transaction.
 *
 * Log Safety: UNSAFE
 */
export interface UploadFilePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "UploadFilePermissionDenied";
  errorDescription:
    "The provided token does not have permission to upload the given file to the given dataset and transaction.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    transactionRid: unknown;
    path: unknown;
  };
}
