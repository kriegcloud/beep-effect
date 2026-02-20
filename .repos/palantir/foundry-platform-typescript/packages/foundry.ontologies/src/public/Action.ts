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
import type * as _Ontologies from "../_components.js";

//

const _apply: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    action: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.ApplyActionRequestV2,
    $queryParams?: {
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
      transactionId?: _Ontologies.OntologyTransactionId | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ) => Promise<_Ontologies.SyncApplyActionResponseV2>
> = [1, "/v2/ontologies/{0}/actions/{1}/apply", 3];

/**
 * Applies an action using the given parameters.
 *
 * Changes to objects or links stored in Object Storage V1 are eventually consistent and may take some time to be visible.
 * Edits to objects or links in Object Storage V2 will be visible immediately after the action completes.
 *
 * Note that a 200 HTTP status code only indicates that the request was received and processed by the server.
 * See the validation result in the response body to determine if the action was applied successfully.
 *
 * Note that [parameter default values](https://www.palantir.com/docs/foundry/action-types/parameters-default-value/) are not currently supported by
 * this endpoint.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read, api:ontologies-write]
 * URL: /v2/ontologies/{ontology}/actions/{action}/apply
 */
export function apply(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    action: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.ApplyActionRequestV2,
    $queryParams?: {
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
      transactionId?: _Ontologies.OntologyTransactionId | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ]
): Promise<_Ontologies.SyncApplyActionResponseV2> {
  return $foundryPlatformFetch($ctx, _apply, ...args);
}

const _applyAsync: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    action: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.AsyncApplyActionRequestV2,
    $queryParams?: {
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ) => Promise<_Ontologies.AsyncApplyActionResponseV2>
> = [1, "/v2/ontologies/{0}/actions/{1}/applyAsync", 3];

/**
 * Applies an action using the given parameters.
 *
 * Changes to objects or links stored in Object Storage V1 are eventually consistent and may take some time to be visible.
 * Edits to objects or links in Object Storage V2 will be visible immediately after the action completes.
 *
 * Note that [parameter default values](https://www.palantir.com/docs/foundry/action-types/parameters-default-value/) are not currently supported by
 * this endpoint.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read, api:ontologies-write]
 * URL: /v2/ontologies/{ontology}/actions/{action}/applyAsync
 */
export function applyAsync(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    action: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.AsyncApplyActionRequestV2,
    $queryParams?: {
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ]
): Promise<_Ontologies.AsyncApplyActionResponseV2> {
  return $foundryPlatformFetch($ctx, _applyAsync, ...args);
}

const _applyBatch: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    action: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.BatchApplyActionRequestV2,
    $queryParams?: {
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ) => Promise<_Ontologies.BatchApplyActionResponseV2>
> = [1, "/v2/ontologies/{0}/actions/{1}/applyBatch", 3];

/**
 * Applies multiple actions (of the same Action Type) using the given parameters.
 *
 * Changes to objects or links stored in Object Storage V1 are eventually consistent and may take some time to be visible.
 * Edits to objects or links in Object Storage V2 will be visible immediately after the action completes.
 *
 * Up to 20 actions may be applied in one call. Actions that only modify objects in Object Storage v2 and do not
 * call Functions may receive a higher limit.
 *
 * Note that [notifications](https://www.palantir.com/docs/foundry/action-types/notifications/) are not currently supported by this endpoint.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read, api:ontologies-write]
 * URL: /v2/ontologies/{ontology}/actions/{action}/applyBatch
 */
export function applyBatch(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    action: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.BatchApplyActionRequestV2,
    $queryParams?: {
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ]
): Promise<_Ontologies.BatchApplyActionResponseV2> {
  return $foundryPlatformFetch($ctx, _applyBatch, ...args);
}

const _applyWithOverrides: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    action: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.ApplyActionWithOverridesRequest,
    $queryParams?: {
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
      transactionId?: _Ontologies.OntologyTransactionId | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ) => Promise<_Ontologies.SyncApplyActionResponseV2>
> = [1, "/v2/ontologies/{0}/actions/{1}/applyWithOverrides", 3];

/**
 * Same as regular apply action operation, but allows specifying overrides for UniqueIdentifier and
 * CurrentTime generated action parameters.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read, api:ontologies-write]
 * URL: /v2/ontologies/{ontology}/actions/{action}/applyWithOverrides
 */
export function applyWithOverrides(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    action: _Ontologies.ActionTypeApiName,
    $body: _Ontologies.ApplyActionWithOverridesRequest,
    $queryParams?: {
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
      transactionId?: _Ontologies.OntologyTransactionId | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ]
): Promise<_Ontologies.SyncApplyActionResponseV2> {
  return $foundryPlatformFetch($ctx, _applyWithOverrides, ...args);
}
