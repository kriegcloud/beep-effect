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

import type * as _Core from "@osdk/internal.foundry.core";
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
import type * as _Ontologies from "../_components.js";

//

const _apply: $FoundryPlatformMethod<
  (
    ontologyRid: _Ontologies.OntologyRid,
    actionType: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.ApplyActionRequest,
  ) => Promise<_Ontologies.ApplyActionResponse>
> = [1, "/v1/ontologies/{0}/actions/{1}/apply", 1];

/**
 * Applies an action using the given parameters.
 *
 * Changes to objects or links stored in Object Storage V1 are eventually consistent and may take some time to be visible.
 * Edits to objects or links in Object Storage V2 will be visible immediately after the action completes.
 *
 * Note that [parameter default values](https://www.palantir.com/docs/foundry/action-types/parameters-default-value/) are not currently supported by
 * this endpoint.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read, api:ontologies-write]
 * URL: /v1/ontologies/{ontologyRid}/actions/{actionType}/apply
 */
export function apply(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontologyRid: _Ontologies.OntologyRid,
    actionType: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.ApplyActionRequest,
  ]
): Promise<_Ontologies.ApplyActionResponse> {
  return $foundryPlatformFetch($ctx, _apply, ...args);
}

const _applyBatch: $FoundryPlatformMethod<
  (
    ontologyRid: _Ontologies.OntologyRid,
    actionType: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.BatchApplyActionRequest,
  ) => Promise<_Ontologies.BatchApplyActionResponse>
> = [1, "/v1/ontologies/{0}/actions/{1}/applyBatch", 1];

/**
 * Applies multiple actions (of the same Action Type) using the given parameters.
 * Changes to objects or links stored in Object Storage V1 are eventually consistent and may take some time to be visible.
 * Edits to objects or links in Object Storage V2 will be visible immediately after the action completes.
 *
 * Up to 20 actions may be applied in one call. Actions that only modify objects in Object Storage v2 and do not
 * call Functions may receive a higher limit.
 *
 * Note that [parameter default values](https://www.palantir.com/docs/foundry/action-types/parameters-default-value/) and
 * [notifications](https://www.palantir.com/docs/foundry/action-types/notifications/) are not currently supported by this endpoint.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read, api:ontologies-write]
 * URL: /v1/ontologies/{ontologyRid}/actions/{actionType}/applyBatch
 */
export function applyBatch(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontologyRid: _Ontologies.OntologyRid,
    actionType: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.BatchApplyActionRequest,
  ]
): Promise<_Ontologies.BatchApplyActionResponse> {
  return $foundryPlatformFetch($ctx, _applyBatch, ...args);
}

const _applyAsync: $FoundryPlatformMethod<
  (
    ontologyRid: _Ontologies.OntologyRid,
    actionType: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.AsyncApplyActionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [1, "/v1/ontologies/{0}/actions/{1}/applyAsync", 3];

/**
 * Applies an action asynchronously using the given parameters.
 *
 * Changes to objects or links stored in Object Storage V1 are eventually consistent and may take some time to be visible.
 * Edits to objects or links in Object Storage V2 will be visible immediately after the action completes.
 *
 * Note that [parameter default values](https://www.palantir.com/docs/foundry/action-types/parameters-default-value/) are not currently
 * supported by this endpoint.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read, api:ontologies-write]
 * URL: /v1/ontologies/{ontologyRid}/actions/{actionType}/applyAsync
 */
export function applyAsync(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontologyRid: _Ontologies.OntologyRid,
    actionType: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.AsyncApplyActionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _applyAsync, ...args);
}

const _getOperationStatus: $FoundryPlatformMethod<
  (
    ontologyRid: _Ontologies.OntologyRid,
    actionType: _Ontologies.ActionTypeApiName,
    actionRid: _Ontologies.ActionRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Ontologies.AsyncActionOperation>
> = [0, "/v1/ontologies/{0}/actions/{1}/applyAsync/{2}", 2];

/**
 * @alpha
 *
 * Required Scopes: [api:ontologies-read, api:ontologies-write]
 * URL: /v1/ontologies/{ontologyRid}/actions/{actionType}/applyAsync/{actionRid}
 */
export function getOperationStatus(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontologyRid: _Ontologies.OntologyRid,
    actionType: _Ontologies.ActionTypeApiName,
    actionRid: _Ontologies.ActionRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Ontologies.AsyncActionOperation> {
  return $foundryPlatformFetch($ctx, _getOperationStatus, ...args);
}

const _validate: $FoundryPlatformMethod<
  (
    ontologyRid: _Ontologies.OntologyRid,
    actionType: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.ValidateActionRequest,
  ) => Promise<_Ontologies.ValidateActionResponse>
> = [1, "/v1/ontologies/{0}/actions/{1}/validate", 1];

/**
 * Validates if an action can be run with the given set of parameters.
 * The response contains the evaluation of parameters and **submission criteria**
 * that determine if the request is `VALID` or `INVALID`.
 * For performance reasons, validations will not consider existing objects or other data in Foundry.
 * For example, the uniqueness of a primary key or the existence of a user ID will not be checked.
 * Note that [parameter default values](https://www.palantir.com/docs/foundry/action-types/parameters-default-value/) are not currently supported by
 * this endpoint. Unspecified parameters will be given a default value of `null`.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v1/ontologies/{ontologyRid}/actions/{actionType}/validate
 */
export function validate(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontologyRid: _Ontologies.OntologyRid,
    actionType: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.ValidateActionRequest,
  ]
): Promise<_Ontologies.ValidateActionResponse> {
  return $foundryPlatformFetch($ctx, _validate, ...args);
}
