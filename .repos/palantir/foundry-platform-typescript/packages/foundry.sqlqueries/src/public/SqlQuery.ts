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

import type {
  SharedClient as $OldClient,
  SharedClientContext as $OldClientContext,
} from "@osdk/shared.client";
import type {
  SharedClient as $Client,
  SharedClientContext as $ClientContext,
} from "@osdk/shared.client2";
import type { FoundryPlatformMethod as $FoundryPlatformMethod } from "@osdk/shared.net.platformapi";
import { foundryPlatformFetch as $foundryPlatformFetch } from "@osdk/shared.net.platformapi";
import type * as _SqlQueries from "../_components.js";

//

const _execute: $FoundryPlatformMethod<
  (
    $body: _SqlQueries.ExecuteSqlQueryRequest,
  ) => Promise<_SqlQueries.QueryStatus>
> = [1, "/v2/sqlQueries/execute", 1];

/**
 * Executes a new query. Only the user that invoked the query can operate on the query. The size of query
 * results are limited by default to 1 million rows. Contact your Palantir representative to discuss limit
 * increases.
 *
 * @public
 *
 * Required Scopes: [api:sql-queries-execute]
 * URL: /v2/sqlQueries/execute
 */
export function execute(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$body: _SqlQueries.ExecuteSqlQueryRequest]
): Promise<_SqlQueries.QueryStatus> {
  return $foundryPlatformFetch($ctx, _execute, ...args);
}

const _getStatus: $FoundryPlatformMethod<
  (sqlQueryId: _SqlQueries.SqlQueryId) => Promise<_SqlQueries.QueryStatus>
> = [0, "/v2/sqlQueries/{0}/getStatus"];

/**
 * Gets the status of a query.
 *
 * @public
 *
 * Required Scopes: [api:sql-queries-read]
 * URL: /v2/sqlQueries/{sqlQueryId}/getStatus
 */
export function getStatus(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [sqlQueryId: _SqlQueries.SqlQueryId]
): Promise<_SqlQueries.QueryStatus> {
  return $foundryPlatformFetch($ctx, _getStatus, ...args);
}

const _cancel: $FoundryPlatformMethod<
  (sqlQueryId: _SqlQueries.SqlQueryId) => Promise<void>
> = [1, "/v2/sqlQueries/{0}/cancel"];

/**
 * Cancels a query. If the query is no longer running this is effectively a no-op.
 *
 * @public
 *
 * Required Scopes: [api:sql-queries-execute]
 * URL: /v2/sqlQueries/{sqlQueryId}/cancel
 */
export function cancel(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [sqlQueryId: _SqlQueries.SqlQueryId]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _cancel, ...args);
}

const _getResults: $FoundryPlatformMethod<
  (sqlQueryId: _SqlQueries.SqlQueryId) => Promise<Response>
> = [0, "/v2/sqlQueries/{0}/getResults", , , "application/octet-stream"];

/**
 * Gets the results of a query. The results of the query are returned in the
 * [Apache Arrow](https://arrow.apache.org/) format.
 *
 * This endpoint implements long polling and requests will time out after one minute. They can be safely
 * retried while the query is still running.
 *
 * @public
 *
 * Required Scopes: [api:sql-queries-read]
 * URL: /v2/sqlQueries/{sqlQueryId}/getResults
 */
export function getResults(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [sqlQueryId: _SqlQueries.SqlQueryId]
): Promise<Response> {
  return $foundryPlatformFetch($ctx, _getResults, ...args);
}
