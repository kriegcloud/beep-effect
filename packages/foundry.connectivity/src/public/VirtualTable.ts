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
    $body: _Connectivity.CreateVirtualTableRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Connectivity.VirtualTable>
> = [1, "/v2/connectivity/connections/{0}/virtualTables", 3];

/**
 * Creates a new [Virtual Table](https://www.palantir.com/docs/foundry/data-integration/virtual-tables/) from an upstream table. The VirtualTable will be created
 * in the specified parent folder and can be queried through Foundry's data access APIs.
 *
 * @beta
 *
 * Required Scopes: [api:connectivity-virtual-table-write]
 * URL: /v2/connectivity/connections/{connectionRid}/virtualTables
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    connectionRid: _Connectivity.ConnectionRid,
    $body: _Connectivity.CreateVirtualTableRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Connectivity.VirtualTable> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}
