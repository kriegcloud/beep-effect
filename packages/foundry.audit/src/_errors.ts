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
 * Could not content the LogFile.
 *
 * Log Safety: SAFE
 */
export interface GetLogFileContentPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetLogFileContentPermissionDenied";
  errorDescription: "Could not content the LogFile.";
  errorInstanceId: string;
  parameters: {
    organizationRid: unknown;
    logFileId: unknown;
  };
}

/**
 * The provided token does not have permission to list audit log files.
 *
 * Log Safety: SAFE
 */
export interface ListLogFilesPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ListLogFilesPermissionDenied";
  errorDescription:
    "The provided token does not have permission to list audit log files.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Start date is required to list audit log files.
 *
 * Log Safety: SAFE
 */
export interface MissingStartDate {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MissingStartDate";
  errorDescription: "Start date is required to list audit log files.";
  errorInstanceId: string;
  parameters: {};
}
