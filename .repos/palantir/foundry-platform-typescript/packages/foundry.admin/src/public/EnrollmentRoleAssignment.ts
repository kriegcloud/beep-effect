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
  ) => Promise<_Admin.ListEnrollmentRoleAssignmentsResponse>
> = [0, "/v2/admin/enrollments/{0}/roleAssignments", 2];

/**
 * List all principals who are assigned a role for the given Enrollment.
 *
 * @alpha
 *
 * Required Scopes: [api:admin-read]
 * URL: /v2/admin/enrollments/{enrollmentRid}/roleAssignments
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    enrollmentRid: _Core.EnrollmentRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Admin.ListEnrollmentRoleAssignmentsResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _add: $FoundryPlatformMethod<
  (
    enrollmentRid: _Core.EnrollmentRid,
    $body: _Admin.AddEnrollmentRoleAssignmentsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [1, "/v2/admin/enrollments/{0}/roleAssignments/add", 3];

/**
 * Assign roles to principals for the given Enrollment. At most 100 role assignments can be added in a single request.
 *
 * @alpha
 *
 * Required Scopes: [api:admin-write]
 * URL: /v2/admin/enrollments/{enrollmentRid}/roleAssignments/add
 */
export function add(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    enrollmentRid: _Core.EnrollmentRid,
    $body: _Admin.AddEnrollmentRoleAssignmentsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _add, ...args);
}

const _remove: $FoundryPlatformMethod<
  (
    enrollmentRid: _Core.EnrollmentRid,
    $body: _Admin.RemoveEnrollmentRoleAssignmentsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [1, "/v2/admin/enrollments/{0}/roleAssignments/remove", 3];

/**
 * Remove roles from principals for the given Enrollment. At most 100 role assignments can be removed in a single request.
 *
 * @alpha
 *
 * Required Scopes: [api:admin-write]
 * URL: /v2/admin/enrollments/{enrollmentRid}/roleAssignments/remove
 */
export function remove(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    enrollmentRid: _Core.EnrollmentRid,
    $body: _Admin.RemoveEnrollmentRoleAssignmentsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _remove, ...args);
}
