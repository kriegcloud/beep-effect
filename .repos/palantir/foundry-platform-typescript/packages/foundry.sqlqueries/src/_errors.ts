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
 * Could not cancel the SqlQuery.
 *
 * Log Safety: UNSAFE
 */
export interface CancelSqlQueryPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "CancelSqlQueryPermissionDenied";
  errorDescription: "Could not cancel the SqlQuery.";
  errorInstanceId: string;
  parameters: {
    sqlQueryId: unknown;
  };
}

/**
 * Could not execute the SqlQuery.
 *
 * Log Safety: SAFE
 */
export interface ExecuteSqlQueryPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ExecuteSqlQueryPermissionDenied";
  errorDescription: "Could not execute the SqlQuery.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not getResults the SqlQuery.
 *
 * Log Safety: UNSAFE
 */
export interface GetResultsSqlQueryPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetResultsSqlQueryPermissionDenied";
  errorDescription: "Could not getResults the SqlQuery.";
  errorInstanceId: string;
  parameters: {
    sqlQueryId: unknown;
  };
}

/**
 * Could not getStatus the SqlQuery.
 *
 * Log Safety: UNSAFE
 */
export interface GetStatusSqlQueryPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "GetStatusSqlQueryPermissionDenied";
  errorDescription: "Could not getStatus the SqlQuery.";
  errorInstanceId: string;
  parameters: {
    sqlQueryId: unknown;
  };
}

/**
 * The query was canceled.
 *
 * Log Safety: UNSAFE
 */
export interface QueryCanceled {
  errorCode: "INVALID_ARGUMENT";
  errorName: "QueryCanceled";
  errorDescription: "The query was canceled.";
  errorInstanceId: string;
  parameters: {
    queryId: unknown;
  };
}

/**
 * The query failed.
 *
 * Log Safety: UNSAFE
 */
export interface QueryFailed {
  errorCode: "INTERNAL";
  errorName: "QueryFailed";
  errorDescription: "The query failed.";
  errorInstanceId: string;
  parameters: {
    queryId: unknown;
    errorMessage: unknown;
  };
}

/**
 * The query cannot be parsed.
 *
 * Log Safety: UNSAFE
 */
export interface QueryParseError {
  errorCode: "INVALID_ARGUMENT";
  errorName: "QueryParseError";
  errorDescription: "The query cannot be parsed.";
  errorInstanceId: string;
  parameters: {
    errorMessage: unknown;
  };
}

/**
 * The provided token does not have permission to access the given query.
 *
 * Log Safety: UNSAFE
 */
export interface QueryPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "QueryPermissionDenied";
  errorDescription:
    "The provided token does not have permission to access the given query.";
  errorInstanceId: string;
  parameters: {
    queryId: unknown;
  };
}

/**
 * The query is running.
 *
 * Log Safety: UNSAFE
 */
export interface QueryRunning {
  errorCode: "INVALID_ARGUMENT";
  errorName: "QueryRunning";
  errorDescription: "The query is running.";
  errorInstanceId: string;
  parameters: {
    queryId: unknown;
  };
}

/**
 * The provided token does not have permission to access the inputs to the query.
 *
 * Log Safety: SAFE
 */
export interface ReadQueryInputsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ReadQueryInputsPermissionDenied";
  errorDescription:
    "The provided token does not have permission to access the inputs to the query.";
  errorInstanceId: string;
  parameters: {
    rids: unknown;
  };
}
