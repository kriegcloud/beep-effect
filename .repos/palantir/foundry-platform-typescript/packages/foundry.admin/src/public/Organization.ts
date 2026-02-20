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
import type * as _Admin from "../_components.js";

//

const _create: $FoundryPlatformMethod<
  (
    $body: _Admin.CreateOrganizationRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Admin.Organization>
> = [1, "/v2/admin/organizations", 3];

/**
 * Creates a new Organization.
 *
 * @alpha
 *
 * Required Scopes: [api:admin-write]
 * URL: /v2/admin/organizations
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _Admin.CreateOrganizationRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Admin.Organization> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    organizationRid: _Core.OrganizationRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Admin.Organization>
> = [0, "/v2/admin/organizations/{0}", 2];

/**
 * Get the Organization with the specified rid.
 *
 * @beta
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/organizations/{organizationRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    organizationRid: _Core.OrganizationRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Admin.Organization> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _replace: $FoundryPlatformMethod<
  (
    organizationRid: _Core.OrganizationRid,
    $body: _Admin.ReplaceOrganizationRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Admin.Organization>
> = [2, "/v2/admin/organizations/{0}", 3];

/**
 * Replace the Organization with the specified rid.
 *
 * @beta
 *
 * Required Scopes: [api:admin-write]
 * URL: /v2/admin/organizations/{organizationRid}
 */
export function replace(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    organizationRid: _Core.OrganizationRid,
    $body: _Admin.ReplaceOrganizationRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Admin.Organization> {
  return $foundryPlatformFetch($ctx, _replace, ...args);
}

const _listAvailableRoles: $FoundryPlatformMethod<
  (
    organizationRid: _Core.OrganizationRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Admin.ListAvailableOrganizationRolesResponse>
> = [0, "/v2/admin/organizations/{0}/listAvailableRoles", 2];

/**
 * List all roles that can be assigned to a principal for the given Organization.
 *
 * @beta
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/organizations/{organizationRid}/listAvailableRoles
 */
export function listAvailableRoles(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    organizationRid: _Core.OrganizationRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Admin.ListAvailableOrganizationRolesResponse> {
  return $foundryPlatformFetch($ctx, _listAvailableRoles, ...args);
}
