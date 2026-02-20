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
 * The checkpoint record could not be found.
 *
 * Log Safety: SAFE
 */
export interface CheckpointRecordNotFound {
  errorCode: "NOT_FOUND";
  errorName: "CheckpointRecordNotFound";
  errorDescription: "The checkpoint record could not be found.";
  errorInstanceId: string;
  parameters: {
    recordRid: unknown;
  };
}

/**
 * The caller does not have permission to access the checkpoint record.
 *
 * Log Safety: SAFE
 */
export interface CheckpointRecordPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CheckpointRecordPermissionDenied";
  errorDescription:
    "The caller does not have permission to access the checkpoint record.";
  errorInstanceId: string;
  parameters: {
    recordRid: unknown;
  };
}

/**
 * The given Record could not be found.
 *
 * Log Safety: SAFE
 */
export interface RecordNotFound {
  errorCode: "NOT_FOUND";
  errorName: "RecordNotFound";
  errorDescription: "The given Record could not be found.";
  errorInstanceId: string;
  parameters: {
    recordRid: unknown;
  };
}

/**
 * Could not search the Record.
 *
 * Log Safety: SAFE
 */
export interface SearchRecordsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "SearchRecordsPermissionDenied";
  errorDescription: "Could not search the Record.";
  errorInstanceId: string;
  parameters: {};
}
