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
   * This feature is only supported in preview mode. Please use preview=true in the query
parameters to call this endpoint.
   *
   * Log Safety: SAFE
   */
export interface ApiFeaturePreviewUsageOnly {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ApiFeaturePreviewUsageOnly";
  errorDescription:
    "This feature is only supported in preview mode. Please use preview=true in the query parameters to call this endpoint.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * You are not allowed to use Palantir APIs.
 *
 * Log Safety: SAFE
 */
export interface ApiUsageDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ApiUsageDenied";
  errorDescription: "You are not allowed to use Palantir APIs.";
  errorInstanceId: string;
  parameters: {
    missingScope: unknown;
  };
}

/**
 * The submitted batch request was too large.
 *
 * Log Safety: SAFE
 */
export interface BatchRequestSizeExceededLimit {
  errorCode: "INVALID_ARGUMENT";
  errorName: "BatchRequestSizeExceededLimit";
  errorDescription: "The submitted batch request was too large.";
  errorInstanceId: string;
  parameters: {
    maximumBatchSize: unknown;
    providedBatchSize: unknown;
  };
}

/**
 * The requested folder could not be found, or the client token does not have access to it.
 *
 * Log Safety: SAFE
 */
export interface FolderNotFound {
  errorCode: "NOT_FOUND";
  errorName: "FolderNotFound";
  errorDescription:
    "The requested folder could not be found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    folderRid: unknown;
  };
}

/**
 * The requested foundry branch could not be found, or the client token does not have access to it.
 *
 * Log Safety: SAFE
 */
export interface FoundryBranchNotFound {
  errorCode: "NOT_FOUND";
  errorName: "FoundryBranchNotFound";
  errorDescription:
    "The requested foundry branch could not be found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    branch: unknown;
  };
}

/**
 * The provided AND filter should have at least one sub-filter.
 *
 * Log Safety: SAFE
 */
export interface InvalidAndFilter {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidAndFilter";
  errorDescription:
    "The provided AND filter should have at least one sub-filter.";
  errorInstanceId: string;
  parameters: {};
}

/**
   * The attribution provided in the header could not be parsed to a valid RID, or to a comma separated list of
valid RIDs.
   *
   * Log Safety: UNSAFE
   */
export interface InvalidAttributionHeader {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidAttributionHeader";
  errorDescription:
    "The attribution provided in the header could not be parsed to a valid RID, or to a comma separated list of valid RIDs.";
  errorInstanceId: string;
  parameters: {
    header: unknown;
  };
}

/**
 * The change data capture configuration is invalid.
 *
 * Log Safety: SAFE
 */
export interface InvalidChangeDataCaptureConfiguration {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidChangeDataCaptureConfiguration";
  errorDescription: "The change data capture configuration is invalid.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The field schema failed validations
 *
 * Log Safety: UNSAFE
 */
export interface InvalidFieldSchema {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidFieldSchema";
  errorDescription: "The field schema failed validations";
  errorInstanceId: string;
  parameters: {
    fieldName: unknown;
    message: unknown;
  };
}

/**
 * The provided file path is invalid. Check that the path does not start with a leading slash.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidFilePath {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidFilePath";
  errorDescription:
    "The provided file path is invalid. Check that the path does not start with a leading slash.";
  errorInstanceId: string;
  parameters: {
    filePath: unknown;
  };
}

/**
 * The provided filter value is invalid.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidFilterValue {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidFilterValue";
  errorDescription: "The provided filter value is invalid.";
  errorInstanceId: string;
  parameters: {
    field: unknown;
    value: unknown;
    expectedType: unknown;
  };
}

/**
 * The provided OR filter should have at least one sub-filter.
 *
 * Log Safety: SAFE
 */
export interface InvalidOrFilter {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidOrFilter";
  errorDescription:
    "The provided OR filter should have at least one sub-filter.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The provided page size was zero or negative. Page sizes must be greater than zero.
 *
 * Log Safety: SAFE
 */
export interface InvalidPageSize {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidPageSize";
  errorDescription:
    "The provided page size was zero or negative. Page sizes must be greater than zero.";
  errorInstanceId: string;
  parameters: {
    pageSize: unknown;
  };
}

/**
 * The provided page token is invalid.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidPageToken {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidPageToken";
  errorDescription: "The provided page token is invalid.";
  errorInstanceId: string;
  parameters: {
    pageToken: unknown;
  };
}

/**
 * The given parameters are individually valid but cannot be used in the given combination.
 *
 * Log Safety: SAFE
 */
export interface InvalidParameterCombination {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidParameterCombination";
  errorDescription:
    "The given parameters are individually valid but cannot be used in the given combination.";
  errorInstanceId: string;
  parameters: {
    validCombinations: unknown;
    providedParameters: unknown;
  };
}

/**
 * The schema failed validations
 *
 * Log Safety: UNSAFE
 */
export interface InvalidSchema {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidSchema";
  errorDescription: "The schema failed validations";
  errorInstanceId: string;
  parameters: {
    errorType: unknown;
    message: unknown;
  };
}

/**
 * The time zone is invalid.
 *
 * Log Safety: SAFE
 */
export interface InvalidTimeZone {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidTimeZone";
  errorDescription: "The time zone is invalid.";
  errorInstanceId: string;
  parameters: {
    timeZone: unknown;
  };
}

/**
 * Batch requests must contain at least one element.
 *
 * Log Safety: SAFE
 */
export interface MissingBatchRequest {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MissingBatchRequest";
  errorDescription: "Batch requests must contain at least one element.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * A post body is required for this endpoint, but was not found in the request.
 *
 * Log Safety: SAFE
 */
export interface MissingPostBody {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MissingPostBody";
  errorDescription:
    "A post body is required for this endpoint, but was not found in the request.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The caller does not have DECLASSIFY permission on these markings or the markings do not exist.
 *
 * Log Safety: UNSAFE
 */
export interface NotAuthorizedToDeclassifyMarkings {
  errorCode: "PERMISSION_DENIED";
  errorName: "NotAuthorizedToDeclassifyMarkings";
  errorDescription:
    "The caller does not have DECLASSIFY permission on these markings or the markings do not exist.";
  errorInstanceId: string;
  parameters: {
    markingIds: unknown;
  };
}

/**
 * The provided resource name is already in use by another resource in the same folder.
 *
 * Log Safety: UNSAFE
 */
export interface ResourceNameAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "ResourceNameAlreadyExists";
  errorDescription:
    "The provided resource name is already in use by another resource in the same folder.";
  errorInstanceId: string;
  parameters: {
    parentFolderRid: unknown;
    resourceName: unknown;
  };
}

/**
 * The requested schema could not be converted into a stream schema.
 *
 * Log Safety: SAFE
 */
export interface SchemaIsNotStreamSchema {
  errorCode: "INVALID_ARGUMENT";
  errorName: "SchemaIsNotStreamSchema";
  errorDescription:
    "The requested schema could not be converted into a stream schema.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * An unknown distance unit was provided.
 *
 * Log Safety: UNSAFE
 */
export interface UnknownDistanceUnit {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UnknownDistanceUnit";
  errorDescription: "An unknown distance unit was provided.";
  errorInstanceId: string;
  parameters: {
    unknownUnit: unknown;
    knownUnits: unknown;
  };
}
