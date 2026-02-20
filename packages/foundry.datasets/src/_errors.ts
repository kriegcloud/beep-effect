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
 * Could not addBackingDatasets the View.
 *
 * Log Safety: SAFE
 */
export interface AddBackingDatasetsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AddBackingDatasetsPermissionDenied";
  errorDescription: "Could not addBackingDatasets the View.";
  errorInstanceId: string;
  parameters: {
    viewDatasetRid: unknown;
  };
}

/**
 * Could not addPrimaryKey the View.
 *
 * Log Safety: SAFE
 */
export interface AddPrimaryKeyPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AddPrimaryKeyPermissionDenied";
  errorDescription: "Could not addPrimaryKey the View.";
  errorInstanceId: string;
  parameters: {
    viewDatasetRid: unknown;
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
    branchName: unknown;
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
    branchName: unknown;
  };
}

/**
 * Could not build the Transaction.
 *
 * Log Safety: SAFE
 */
export interface BuildTransactionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "BuildTransactionPermissionDenied";
  errorDescription: "Could not build the Transaction.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    transactionRid: unknown;
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
    branchName: unknown;
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
    branchName: unknown;
  };
}

/**
 * Could not create the View.
 *
 * Log Safety: SAFE
 */
export interface CreateViewPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateViewPermissionDenied";
  errorDescription: "Could not create the View.";
  errorInstanceId: string;
  parameters: {};
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
   * The requested dataset view could not be found. A dataset view represents the effective file contents of a dataset
for a branch at a point in time, calculated from transactions (SNAPSHOT, APPEND, UPDATE, DELETE). The view may not
exist if the dataset has no transactions, contains no files, the branch is not valid, or the client token does not have access to it.
   *
   * Log Safety: UNSAFE
   */
export interface DatasetViewNotFound {
  errorCode: "NOT_FOUND";
  errorName: "DatasetViewNotFound";
  errorDescription:
    "The requested dataset view could not be found. A dataset view represents the effective file contents of a dataset for a branch at a point in time, calculated from transactions (SNAPSHOT, APPEND, UPDATE, DELETE). The view may not exist if the dataset has no transactions, contains no files, the branch is not valid, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branch: unknown;
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
    branchName: unknown;
  };
}

/**
 * Could not delete the File.
 *
 * Log Safety: UNSAFE
 */
export interface DeleteFilePermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "DeleteFilePermissionDenied";
  errorDescription: "Could not delete the File.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    filePath: unknown;
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
    branchName: unknown;
    transactionId: unknown;
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
 * The given File could not be found.
 *
 * Log Safety: UNSAFE
 */
export interface FileNotFound {
  errorCode: "NOT_FOUND";
  errorName: "FileNotFound";
  errorDescription: "The given File could not be found.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    filePath: unknown;
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
    branchName: unknown;
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
 * Could not transactions the Branch.
 *
 * Log Safety: UNSAFE
 */
export interface GetBranchTransactionHistoryPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetBranchTransactionHistoryPermissionDenied";
  errorDescription: "Could not transactions the Branch.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchName: unknown;
  };
}

/**
 * Could not getHealthCheckReports the Dataset.
 *
 * Log Safety: SAFE
 */
export interface GetDatasetHealthCheckReportsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetDatasetHealthCheckReportsPermissionDenied";
  errorDescription: "Could not getHealthCheckReports the Dataset.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * Could not getHealthChecks the Dataset.
 *
 * Log Safety: SAFE
 */
export interface GetDatasetHealthChecksPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetDatasetHealthChecksPermissionDenied";
  errorDescription: "Could not getHealthChecks the Dataset.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * Could not jobs the Dataset.
 *
 * Log Safety: SAFE
 */
export interface GetDatasetJobsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetDatasetJobsPermissionDenied";
  errorDescription: "Could not jobs the Dataset.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * Could not getSchedules the Dataset.
 *
 * Log Safety: SAFE
 */
export interface GetDatasetSchedulesPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetDatasetSchedulesPermissionDenied";
  errorDescription: "Could not getSchedules the Dataset.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * Could not getSchema the Dataset.
 *
 * Log Safety: SAFE
 */
export interface GetDatasetSchemaPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetDatasetSchemaPermissionDenied";
  errorDescription: "Could not getSchema the Dataset.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * Could not content the File.
 *
 * Log Safety: UNSAFE
 */
export interface GetFileContentPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetFileContentPermissionDenied";
  errorDescription: "Could not content the File.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    filePath: unknown;
  };
}

/**
   * One or more backing datasets do not live in the same project as the view. Either move the input datasets to
the same project as the view or add them as project references.
   *
   * Log Safety: SAFE
   */
export interface InputBackingDatasetNotInOutputViewProject {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InputBackingDatasetNotInOutputViewProject";
  errorDescription:
    "One or more backing datasets do not live in the same project as the view. Either move the input datasets to the same project as the view or add them as project references.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The requested branch name cannot be used. Branch names cannot be empty and must not look like RIDs or UUIDs.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidBranchName {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidBranchName";
  errorDescription:
    "The requested branch name cannot be used. Branch names cannot be empty and must not look like RIDs or UUIDs.";
  errorInstanceId: string;
  parameters: {
    branchName: unknown;
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
 * Either you do not have access to one or more of the backing datasets or it does not exist.
 *
 * Log Safety: SAFE
 */
export interface InvalidViewBackingDataset {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidViewBackingDataset";
  errorDescription:
    "Either you do not have access to one or more of the backing datasets or it does not exist.";
  errorInstanceId: string;
  parameters: {};
}

/**
   * The type of each referenced column in the primary key must be one of the following: BYTE, SHORT, DECIMAL,
INTEGER, LONG, STRING, BOOLEAN, TIMESTAMP or DATE.
   *
   * Log Safety: UNSAFE
   */
export interface InvalidViewPrimaryKeyColumnType {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidViewPrimaryKeyColumnType";
  errorDescription:
    "The type of each referenced column in the primary key must be one of the following: BYTE, SHORT, DECIMAL, INTEGER, LONG, STRING, BOOLEAN, TIMESTAMP or DATE.";
  errorInstanceId: string;
  parameters: {
    primaryKeyColumns: unknown;
    invalidColumns: unknown;
  };
}

/**
 * The deletion column must be a boolean.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidViewPrimaryKeyDeletionColumn {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidViewPrimaryKeyDeletionColumn";
  errorDescription: "The deletion column must be a boolean.";
  errorInstanceId: string;
  parameters: {
    deletionColumn: unknown;
    deletionColumnType: unknown;
  };
}

/**
 * Could not job the Transaction.
 *
 * Log Safety: SAFE
 */
export interface JobTransactionPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "JobTransactionPermissionDenied";
  errorDescription: "Could not job the Transaction.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    transactionRid: unknown;
  };
}

/**
 * Not all columns in the View's primary key are present in the dataset(s).
 *
 * Log Safety: UNSAFE
 */
export interface NotAllColumnsInPrimaryKeyArePresent {
  errorCode: "INVALID_ARGUMENT";
  errorName: "NotAllColumnsInPrimaryKeyArePresent";
  errorDescription:
    "Not all columns in the View's primary key are present in the dataset(s).";
  errorInstanceId: string;
  parameters: {
    primaryKeyColumns: unknown;
    missingColumns: unknown;
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
    branchName: unknown;
  };
}

/**
 * Could not putSchema the Dataset.
 *
 * Log Safety: SAFE
 */
export interface PutDatasetSchemaPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "PutDatasetSchemaPermissionDenied";
  errorDescription: "Could not putSchema the Dataset.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
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
    branchName: unknown;
  };
}

/**
 * The provided token does not have permission to read the given dataset as a table.
 *
 * Log Safety: SAFE
 */
export interface ReadTableDatasetPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReadTableDatasetPermissionDenied";
  errorDescription:
    "The provided token does not have permission to read the given dataset as a table.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * An error occurred while reading the table. Refer to the message for more details.
 *
 * Log Safety: UNSAFE
 */
export interface ReadTableError {
  errorCode: "INTERNAL";
  errorName: "ReadTableError";
  errorDescription:
    "An error occurred while reading the table. Refer to the message for more details.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    message: unknown;
  };
}

/**
   * The request to read the table generates a result that exceeds the allowed number of rows. For datasets not
stored as Parquet there is a limit of 1 million rows. For datasets stored as Parquet there is no limit.
   *
   * Log Safety: SAFE
   */
export interface ReadTableRowLimitExceeded {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ReadTableRowLimitExceeded";
  errorDescription:
    "The request to read the table generates a result that exceeds the allowed number of rows. For datasets not stored as Parquet there is a limit of 1 million rows. For datasets stored as Parquet there is no limit.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * The request to read the table timed out.
 *
 * Log Safety: SAFE
 */
export interface ReadTableTimeout {
  errorCode: "TIMEOUT";
  errorName: "ReadTableTimeout";
  errorDescription: "The request to read the table timed out.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * Could not removeBackingDatasets the View.
 *
 * Log Safety: SAFE
 */
export interface RemoveBackingDatasetsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RemoveBackingDatasetsPermissionDenied";
  errorDescription: "Could not removeBackingDatasets the View.";
  errorInstanceId: string;
  parameters: {
    viewDatasetRid: unknown;
  };
}

/**
 * Could not replaceBackingDatasets the View.
 *
 * Log Safety: SAFE
 */
export interface ReplaceBackingDatasetsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReplaceBackingDatasetsPermissionDenied";
  errorDescription: "Could not replaceBackingDatasets the View.";
  errorInstanceId: string;
  parameters: {
    viewDatasetRid: unknown;
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
    branchName: unknown;
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

/**
 * Failed to delete dataset following View creation failure.
 *
 * Log Safety: SAFE
 */
export interface ViewDatasetCleanupFailed {
  errorCode: "INTERNAL";
  errorName: "ViewDatasetCleanupFailed";
  errorDescription: "Failed to delete dataset following View creation failure.";
  errorInstanceId: string;
  parameters: {
    viewDatasetRid: unknown;
  };
}

/**
   * The requested View could not be found. Either the view does not exist, the branch is not valid or the
client token does not have access to it.
   *
   * Log Safety: UNSAFE
   */
export interface ViewNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ViewNotFound";
  errorDescription:
    "The requested View could not be found. Either the view does not exist, the branch is not valid or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    viewDatasetRid: unknown;
    branch: unknown;
  };
}

/**
 * A primary key already exits.
 *
 * Log Safety: SAFE
 */
export interface ViewPrimaryKeyCannotBeModified {
  errorCode: "CONFLICT";
  errorName: "ViewPrimaryKeyCannotBeModified";
  errorDescription: "A primary key already exits.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The deletion column is not present in the dataset.
 *
 * Log Safety: UNSAFE
 */
export interface ViewPrimaryKeyDeletionColumnNotInDatasetSchema {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ViewPrimaryKeyDeletionColumnNotInDatasetSchema";
  errorDescription: "The deletion column is not present in the dataset.";
  errorInstanceId: string;
  parameters: {
    deletionColumn: unknown;
  };
}

/**
 * No columns were provided as part of the primary key
 *
 * Log Safety: SAFE
 */
export interface ViewPrimaryKeyMustContainAtLeastOneColumn {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ViewPrimaryKeyMustContainAtLeastOneColumn";
  errorDescription: "No columns were provided as part of the primary key";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Cannot add a primary key to a View that does not have any backing datasets.
 *
 * Log Safety: SAFE
 */
export interface ViewPrimaryKeyRequiresBackingDatasets {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ViewPrimaryKeyRequiresBackingDatasets";
  errorDescription:
    "Cannot add a primary key to a View that does not have any backing datasets.";
  errorInstanceId: string;
  parameters: {};
}
