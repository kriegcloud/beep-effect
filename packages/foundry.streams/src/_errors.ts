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
 * Cannot create a streaming dataset in a user folder.
 *
 * Log Safety: SAFE
 */
export interface CannotCreateStreamingDatasetInUserFolder {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CannotCreateStreamingDatasetInUserFolder";
  errorDescription: "Cannot create a streaming dataset in a user folder.";
  errorInstanceId: string;
  parameters: {
    parentFolderRid: unknown;
  };
}

/**
 * Cannot write to a stream that is in the trash.
 *
 * Log Safety: SAFE
 */
export interface CannotWriteToTrashedStream {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CannotWriteToTrashedStream";
  errorDescription: "Cannot write to a stream that is in the trash.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
  };
}

/**
 * Could not create the Dataset.
 *
 * Log Safety: SAFE
 */
export interface CreateStreamingDatasetPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateStreamingDatasetPermissionDenied";
  errorDescription: "Could not create the Dataset.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not create the Stream.
 *
 * Log Safety: UNSAFE
 */
export interface CreateStreamPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CreateStreamPermissionDenied";
  errorDescription: "Could not create the Stream.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    streamBranchName: unknown;
  };
}

/**
 * The byte stream could not be processed.
 *
 * Log Safety: SAFE
 */
export interface FailedToProcessBinaryRecord {
  errorCode: "INTERNAL";
  errorName: "FailedToProcessBinaryRecord";
  errorDescription: "The byte stream could not be processed.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not getEndOffsets the Stream.
 *
 * Log Safety: UNSAFE
 */
export interface GetEndOffsetsForStreamPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetEndOffsetsForStreamPermissionDenied";
  errorDescription: "Could not getEndOffsets the Stream.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    streamBranchName: unknown;
  };
}

/**
 * Could not getRecords the Stream.
 *
 * Log Safety: UNSAFE
 */
export interface GetRecordsFromStreamPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetRecordsFromStreamPermissionDenied";
  errorDescription: "Could not getRecords the Stream.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    streamBranchName: unknown;
  };
}

/**
 * The requested stream exists but is invalid, as it does not have a schema.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidStreamNoSchema {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidStreamNoSchema";
  errorDescription:
    "The requested stream exists but is invalid, as it does not have a schema.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchName: unknown;
    viewRid: unknown;
  };
}

/**
 * The stream type is invalid.
 *
 * Log Safety: SAFE
 */
export interface InvalidStreamType {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidStreamType";
  errorDescription: "The stream type is invalid.";
  errorInstanceId: string;
  parameters: {
    streamType: unknown;
  };
}

/**
 * Could not publishBinaryRecord the Stream.
 *
 * Log Safety: UNSAFE
 */
export interface PublishBinaryRecordToStreamPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "PublishBinaryRecordToStreamPermissionDenied";
  errorDescription: "Could not publishBinaryRecord the Stream.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    streamBranchName: unknown;
  };
}

/**
 * Could not publishRecords the Stream.
 *
 * Log Safety: UNSAFE
 */
export interface PublishRecordsToStreamPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "PublishRecordsToStreamPermissionDenied";
  errorDescription: "Could not publishRecords the Stream.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    streamBranchName: unknown;
  };
}

/**
 * Could not publishRecord the Stream.
 *
 * Log Safety: UNSAFE
 */
export interface PublishRecordToStreamPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "PublishRecordToStreamPermissionDenied";
  errorDescription: "Could not publishRecord the Stream.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    streamBranchName: unknown;
  };
}

/**
 * A provided record does not match the stream schema
 *
 * Log Safety: UNSAFE
 */
export interface RecordDoesNotMatchStreamSchema {
  errorCode: "INVALID_ARGUMENT";
  errorName: "RecordDoesNotMatchStreamSchema";
  errorDescription: "A provided record does not match the stream schema";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    branchName: unknown;
    viewRid: unknown;
  };
}

/**
 * A record is too large to be published to the stream. On most enrollments, the maximum record size is 1MB.
 *
 * Log Safety: SAFE
 */
export interface RecordTooLarge {
  errorCode: "REQUEST_ENTITY_TOO_LARGE";
  errorName: "RecordTooLarge";
  errorDescription:
    "A record is too large to be published to the stream. On most enrollments, the maximum record size is 1MB.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not reset the Stream.
 *
 * Log Safety: UNSAFE
 */
export interface ResetStreamPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ResetStreamPermissionDenied";
  errorDescription: "Could not reset the Stream.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    streamBranchName: unknown;
  };
}

/**
 * The given Stream could not be found.
 *
 * Log Safety: UNSAFE
 */
export interface StreamNotFound {
  errorCode: "NOT_FOUND";
  errorName: "StreamNotFound";
  errorDescription: "The given Stream could not be found.";
  errorInstanceId: string;
  parameters: {
    datasetRid: unknown;
    streamBranchName: unknown;
  };
}

/**
 * No view for the provided view RID provided could be found.
 *
 * Log Safety: SAFE
 */
export interface ViewNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ViewNotFound";
  errorDescription:
    "No view for the provided view RID provided could be found.";
  errorInstanceId: string;
  parameters: {
    viewRid: unknown;
  };
}
