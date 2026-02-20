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
import type * as _Functions from "../_components.js";

//

const _get: $FoundryPlatformMethod<
  (
    queryApiName: _Functions.QueryApiName,
    $queryParams?: {
      version?: _Functions.FunctionVersion | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Functions.Query>
> = [0, "/v2/functions/queries/{0}", 2];

/**
 * Gets a specific query type with the given API name. By default, this gets the latest version of the query.
 *
 * @alpha
 *
 * Required Scopes: [api:functions-read]
 * URL: /v2/functions/queries/{queryApiName}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    queryApiName: _Functions.QueryApiName,

    $queryParams?: {
      version?: _Functions.FunctionVersion | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Functions.Query> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _getByRid: $FoundryPlatformMethod<
  (
    $body: _Functions.GetByRidQueriesRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Functions.Query>
> = [1, "/v2/functions/queries/getByRid", 3];

/**
 * Gets a specific query type with the given RID. By default, this gets the latest version of the query.
 *
 * @alpha
 *
 * Required Scopes: [api:functions-read]
 * URL: /v2/functions/queries/getByRid
 */
export function getByRid(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _Functions.GetByRidQueriesRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Functions.Query> {
  return $foundryPlatformFetch($ctx, _getByRid, ...args);
}

const _execute: $FoundryPlatformMethod<
  (
    queryApiName: _Functions.QueryApiName,
    $body: _Functions.ExecuteQueryRequest,
    $queryParams?: {
      transactionId?: _Functions.TransactionId | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
    $headerParams?: {
      attribution?: _Core.Attribution | undefined;
      traceParent?: _Core.TraceParent | undefined;
      traceState?: _Core.TraceState | undefined;
    },
  ) => Promise<_Functions.ExecuteQueryResponse>
> = [1, "/v2/functions/queries/{0}/execute", 7];

/**
 * Executes a Query using the given parameters. By default, this executes the latest version of the query.
 *
 * This endpoint is maintained for backward compatibility only.
 *
 * For all new implementations, use the `streamingExecute` endpoint, which supports all function types
 * and provides enhanced functionality.
 *
 * @alpha
 *
 * Required Scopes: [api:functions-read]
 * URL: /v2/functions/queries/{queryApiName}/execute
 */
export function execute(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    queryApiName: _Functions.QueryApiName,
    $body: _Functions.ExecuteQueryRequest,
    $queryParams?: {
      transactionId?: _Functions.TransactionId | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
    $headerParams?: {
      attribution?: _Core.Attribution | undefined;
      traceParent?: _Core.TraceParent | undefined;
      traceState?: _Core.TraceState | undefined;
    },
  ]
): Promise<_Functions.ExecuteQueryResponse> {
  return $foundryPlatformFetch($ctx, _execute, ...args);
}

const _streamingExecute: $FoundryPlatformMethod<
  (
    queryApiName: _Functions.QueryApiName,
    $body: _Functions.StreamingExecuteQueryRequest,
    $queryParams?: {
      transactionId?: _Functions.TransactionId | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
    $headerParams?: {
      attribution?: _Core.Attribution | undefined;
      traceParent?: _Core.TraceParent | undefined;
      traceState?: _Core.TraceState | undefined;
    },
  ) => Promise<Response>
> = [
  1,
  "/v2/functions/queries/{0}/streamingExecute",
  7,
  ,
  "application/octet-stream",
];

/**
 * Executes a Query using the given parameters, returning results as an NDJSON stream. By default, this executes the latest version of the query.
 *
 * This endpoint supports all Query functions. The endpoint name 'streamingExecute' refers to the NDJSON
 * streaming response format. Both streaming and non-streaming functions can use this endpoint.
 * Non-streaming functions return a single-line NDJSON response, while streaming functions return multi-line NDJSON responses.
 * This is the recommended endpoint for all query execution.
 *
 * The response is returned as a binary stream in NDJSON (Newline Delimited JSON) format, where each line
 * is a StreamingExecuteQueryResponse containing either a data batch or an error.
 *
 * For a function returning a list of 5 records with a batch size of 3, the response stream would contain
 * two lines. The first line contains the first 3 items, and the second line contains the remaining 2 items:
 *
 * ```
 * {"type":"data","value":[{"productId":"SKU-001","price":29.99},{"productId":"SKU-002","price":49.99},{"productId":"SKU-003","price":19.99}]}
 * {"type":"data","value":[{"productId":"SKU-004","price":39.99},{"productId":"SKU-005","price":59.99}]}
 * ```
 *
 * Each line is a separate JSON object followed by a newline character. Clients should parse the stream
 * line-by-line to process results as they arrive. If an error occurs during execution, the stream will
 * contain an error line:
 *
 * ```
 * {"type":"error","errorCode":"INVALID_ARGUMENT","errorName":"QueryRuntimeError","errorInstanceId":"3f8a9c7b-2e4d-4a1f-9b8c-7d6e5f4a3b2c","errorDescription":"Division by zero","parameters":{}}
 * ```
 *
 * @alpha
 *
 * Required Scopes: [api:functions-read]
 * URL: /v2/functions/queries/{queryApiName}/streamingExecute
 */
export function streamingExecute(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    queryApiName: _Functions.QueryApiName,
    $body: _Functions.StreamingExecuteQueryRequest,
    $queryParams?: {
      transactionId?: _Functions.TransactionId | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
    $headerParams?: {
      attribution?: _Core.Attribution | undefined;
      traceParent?: _Core.TraceParent | undefined;
      traceState?: _Core.TraceState | undefined;
    },
  ]
): Promise<Response> {
  return $foundryPlatformFetch($ctx, _streamingExecute, ...args);
}
