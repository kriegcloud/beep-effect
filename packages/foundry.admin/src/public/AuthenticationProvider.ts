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

const _list: $FoundryPlatformMethod<
  (
    enrollmentRid: _Core.EnrollmentRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Admin.ListAuthenticationProvidersResponse>
> = [0, "/v2/admin/enrollments/{0}/authenticationProviders", 2];

/**
 * Lists all AuthenticationProviders.
 *
 * @beta
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/enrollments/{enrollmentRid}/authenticationProviders
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    enrollmentRid: _Core.EnrollmentRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Admin.ListAuthenticationProvidersResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    enrollmentRid: _Core.EnrollmentRid,
    authenticationProviderRid: _Admin.AuthenticationProviderRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Admin.AuthenticationProvider>
> = [0, "/v2/admin/enrollments/{0}/authenticationProviders/{1}", 2];

/**
 * Get the AuthenticationProvider with the specified rid.
 *
 * @beta
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/enrollments/{enrollmentRid}/authenticationProviders/{authenticationProviderRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    enrollmentRid: _Core.EnrollmentRid,
    authenticationProviderRid: _Admin.AuthenticationProviderRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Admin.AuthenticationProvider> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _preregisterUser: $FoundryPlatformMethod<
  (
    enrollmentRid: _Core.EnrollmentRid,
    authenticationProviderRid: _Admin.AuthenticationProviderRid,
    $body: _Admin.PreregisterUserRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Core.PrincipalId>
> = [
  1,
  "/v2/admin/enrollments/{0}/authenticationProviders/{1}/preregisterUser",
  3,
];

/**
 * Register a User with a given username before they log in to the platform for the first time through this
 * Authentication Provider. Preregistered users can be assigned to groups and roles prior to first login.
 *
 * @beta
 *
 * Required Scopes: [api:admin-write]
 * URL: /v2/admin/enrollments/{enrollmentRid}/authenticationProviders/{authenticationProviderRid}/preregisterUser
 */
export function preregisterUser(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    enrollmentRid: _Core.EnrollmentRid,
    authenticationProviderRid: _Admin.AuthenticationProviderRid,
    $body: _Admin.PreregisterUserRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Core.PrincipalId> {
  return $foundryPlatformFetch($ctx, _preregisterUser, ...args);
}

const _preregisterGroup: $FoundryPlatformMethod<
  (
    enrollmentRid: _Core.EnrollmentRid,
    authenticationProviderRid: _Admin.AuthenticationProviderRid,
    $body: _Admin.PreregisterGroupRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Core.PrincipalId>
> = [
  1,
  "/v2/admin/enrollments/{0}/authenticationProviders/{1}/preregisterGroup",
  3,
];

/**
 * Register a Group with a given name before any users with this group log in through this Authentication Provider.
 * Preregistered groups can be used anywhere other groups are used in the platform.
 *
 * @beta
 *
 * Required Scopes: [api:admin-write]
 * URL: /v2/admin/enrollments/{enrollmentRid}/authenticationProviders/{authenticationProviderRid}/preregisterGroup
 */
export function preregisterGroup(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    enrollmentRid: _Core.EnrollmentRid,
    authenticationProviderRid: _Admin.AuthenticationProviderRid,
    $body: _Admin.PreregisterGroupRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Core.PrincipalId> {
  return $foundryPlatformFetch($ctx, _preregisterGroup, ...args);
}
