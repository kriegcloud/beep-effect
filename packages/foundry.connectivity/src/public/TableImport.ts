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
import type * as _Connectivity from "../_components.js";

//

const _create: $FoundryPlatformMethod<
  (
    connectionRid: _Connectivity.ConnectionRid,
    $body: _Connectivity.CreateTableImportRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Connectivity.TableImport>
> = [1, "/v2/connectivity/connections/{0}/tableImports", 3];

/**
 * Creates a new TableImport.
 *
 * @beta
 *
 * Required Scopes: [api:connectivity-table-import-write]
 * URL: /v2/connectivity/connections/{connectionRid}/tableImports
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    connectionRid: _Connectivity.ConnectionRid,
    $body: _Connectivity.CreateTableImportRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Connectivity.TableImport> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _deleteTableImport: $FoundryPlatformMethod<
  (
    connectionRid: _Connectivity.ConnectionRid,
    tableImportRid: _Connectivity.TableImportRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [3, "/v2/connectivity/connections/{0}/tableImports/{1}", 2];

/**
 * Delete the TableImport with the specified RID.
 * Deleting the table import does not delete the destination dataset but the dataset will no longer
 * be updated by this import.
 *
 * @beta
 *
 * Required Scopes: [api:connectivity-table-import-write]
 * URL: /v2/connectivity/connections/{connectionRid}/tableImports/{tableImportRid}
 */
export function deleteTableImport(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    connectionRid: _Connectivity.ConnectionRid,
    tableImportRid: _Connectivity.TableImportRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _deleteTableImport, ...args);
}

const _list: $FoundryPlatformMethod<
  (
    connectionRid: _Connectivity.ConnectionRid,
    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Connectivity.ListTableImportsResponse>
> = [0, "/v2/connectivity/connections/{0}/tableImports", 2];

/**
 * Lists all table imports defined for this connection.
 * Only table imports that the user has permissions to view will be returned.
 *
 * @beta
 *
 * Required Scopes: [api:connectivity-table-import-read]
 * URL: /v2/connectivity/connections/{connectionRid}/tableImports
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    connectionRid: _Connectivity.ConnectionRid,

    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Connectivity.ListTableImportsResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    connectionRid: _Connectivity.ConnectionRid,
    tableImportRid: _Connectivity.TableImportRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Connectivity.TableImport>
> = [0, "/v2/connectivity/connections/{0}/tableImports/{1}", 2];

/**
 * Get the TableImport with the specified rid.
 *
 * @beta
 *
 * Required Scopes: [api:connectivity-table-import-read]
 * URL: /v2/connectivity/connections/{connectionRid}/tableImports/{tableImportRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    connectionRid: _Connectivity.ConnectionRid,
    tableImportRid: _Connectivity.TableImportRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Connectivity.TableImport> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _replace: $FoundryPlatformMethod<
  (
    connectionRid: _Connectivity.ConnectionRid,
    tableImportRid: _Connectivity.TableImportRid,
    $body: _Connectivity.ReplaceTableImportRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Connectivity.TableImport>
> = [2, "/v2/connectivity/connections/{0}/tableImports/{1}", 3];

/**
 * Replace the TableImport with the specified rid.
 *
 * @beta
 *
 * Required Scopes: [api:connectivity-table-import-write]
 * URL: /v2/connectivity/connections/{connectionRid}/tableImports/{tableImportRid}
 */
export function replace(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    connectionRid: _Connectivity.ConnectionRid,
    tableImportRid: _Connectivity.TableImportRid,
    $body: _Connectivity.ReplaceTableImportRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Connectivity.TableImport> {
  return $foundryPlatformFetch($ctx, _replace, ...args);
}

const _execute: $FoundryPlatformMethod<
  (
    connectionRid: _Connectivity.ConnectionRid,
    tableImportRid: _Connectivity.TableImportRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Core.BuildRid>
> = [1, "/v2/connectivity/connections/{0}/tableImports/{1}/execute", 2];

/**
 * Executes the TableImport, which runs asynchronously as a [Foundry Build](https://www.palantir.com/docs/foundry/data-integration/builds/).
 * The returned BuildRid can be used to check the status via the Orchestration API.
 *
 * @beta
 *
 * Required Scopes: [api:connectivity-table-import-execute]
 * URL: /v2/connectivity/connections/{connectionRid}/tableImports/{tableImportRid}/execute
 */
export function execute(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    connectionRid: _Connectivity.ConnectionRid,
    tableImportRid: _Connectivity.TableImportRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Core.BuildRid> {
  return $foundryPlatformFetch($ctx, _execute, ...args);
}
