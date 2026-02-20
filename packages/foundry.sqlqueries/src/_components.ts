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

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * Log Safety: SAFE
 */
export interface CanceledQueryStatus {}

/**
 * Log Safety: UNSAFE
 */
export interface ExecuteSqlQueryRequest {
  query: string;
  fallbackBranchIds?: Array<_Core.BranchName>;
}

/**
 * Log Safety: UNSAFE
 */
export interface FailedQueryStatus {
  errorMessage: string;
}

/**
 * Log Safety: UNSAFE
 */
export type QueryStatus =
  | ({ type: "running" } & RunningQueryStatus)
  | ({ type: "canceled" } & CanceledQueryStatus)
  | ({ type: "failed" } & FailedQueryStatus)
  | ({ type: "succeeded" } & SucceededQueryStatus);

/**
 * Log Safety: UNSAFE
 */
export interface RunningQueryStatus {
  queryId: SqlQueryId;
}

/**
 * Log Safety: UNSAFE
 */
export interface SqlQuery {
  id: SqlQueryId;
}

/**
 * The identifier of a SQL Query.
 *
 * Log Safety: UNSAFE
 */
export type SqlQueryId = LooselyBrandedString<"SqlQueryId">;

/**
 * Log Safety: UNSAFE
 */
export interface SucceededQueryStatus {
  queryId: SqlQueryId;
}
