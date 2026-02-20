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

const _list: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    $queryParams?: {
      branch?: _Core.FoundryBranch | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
    },
  ) => Promise<_Ontologies.ListObjectTypesV2Response>
> = [0, "/v2/ontologies/{0}/objectTypes", 2];

/**
 * Lists the object types for the given Ontology.
 *
 * Each page may be smaller or larger than the requested page size. However, it is guaranteed that if there are
 * more results available, at least one result will be present in the
 * response.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objectTypes
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,

    $queryParams?: {
      branch?: _Core.FoundryBranch | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
    },
  ]
): Promise<_Ontologies.ListObjectTypesV2Response> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    $queryParams?: { branch?: _Core.FoundryBranch | undefined },
  ) => Promise<_Ontologies.ObjectTypeV2>
> = [0, "/v2/ontologies/{0}/objectTypes/{1}", 2];

/**
 * Gets a specific object type with the given API name.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objectTypes/{objectType}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,

    $queryParams?: { branch?: _Core.FoundryBranch | undefined },
  ]
): Promise<_Ontologies.ObjectTypeV2> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _getFullMetadata: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    $queryParams?: {
      preview?: _Core.PreviewMode | undefined;
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ) => Promise<_Ontologies.ObjectTypeFullMetadata>
> = [0, "/v2/ontologies/{0}/objectTypes/{1}/fullMetadata", 2];

/**
 * Gets the full metadata for a specific object type with the given API name.
 *
 * @beta
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objectTypes/{objectType}/fullMetadata
 */
export function getFullMetadata(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,

    $queryParams?: {
      preview?: _Core.PreviewMode | undefined;
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ]
): Promise<_Ontologies.ObjectTypeFullMetadata> {
  return $foundryPlatformFetch($ctx, _getFullMetadata, ...args);
}

const _getEditsHistory: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    $body: _Ontologies.ObjectTypeEditsHistoryRequest,
    $queryParams?: { branch?: _Core.FoundryBranch | undefined },
  ) => Promise<_Ontologies.ObjectTypeEditsHistoryResponse>
> = [1, "/v2/ontologies/{0}/objectTypes/{1}/editsHistory", 3];

/**
 * Returns the history of edits (additions, modifications, deletions) for objects of a
 * specific object type. This endpoint provides visibility into all actions that have
 * modified objects of this type.
 *
 * The edits are returned in reverse chronological order (most recent first).
 *
 * WARNING: right now this endpoint works only if you pass in an object primary key, i.e. it does not function
 * as a global object type edits history. Global object type edits history is currently under development.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objectTypes/{objectType}/editsHistory
 */
export function getEditsHistory(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    $body: _Ontologies.ObjectTypeEditsHistoryRequest,
    $queryParams?: { branch?: _Core.FoundryBranch | undefined },
  ]
): Promise<_Ontologies.ObjectTypeEditsHistoryResponse> {
  return $foundryPlatformFetch($ctx, _getEditsHistory, ...args);
}

const _listOutgoingLinkTypes: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    $queryParams?: {
      branch?: _Core.FoundryBranch | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
    },
  ) => Promise<_Ontologies.ListOutgoingLinkTypesResponseV2>
> = [0, "/v2/ontologies/{0}/objectTypes/{1}/outgoingLinkTypes", 2];

/**
 * List the outgoing links for an object type.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objectTypes/{objectType}/outgoingLinkTypes
 */
export function listOutgoingLinkTypes(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,

    $queryParams?: {
      branch?: _Core.FoundryBranch | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
    },
  ]
): Promise<_Ontologies.ListOutgoingLinkTypesResponseV2> {
  return $foundryPlatformFetch($ctx, _listOutgoingLinkTypes, ...args);
}

const _getOutgoingLinkType: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    linkType: _Ontologies.LinkTypeApiName,
    $queryParams?: { branch?: _Core.FoundryBranch | undefined },
  ) => Promise<_Ontologies.LinkTypeSideV2>
> = [0, "/v2/ontologies/{0}/objectTypes/{1}/outgoingLinkTypes/{2}", 2];

/**
 * Get an outgoing link for an object type.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objectTypes/{objectType}/outgoingLinkTypes/{linkType}
 */
export function getOutgoingLinkType(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    linkType: _Ontologies.LinkTypeApiName,

    $queryParams?: { branch?: _Core.FoundryBranch | undefined },
  ]
): Promise<_Ontologies.LinkTypeSideV2> {
  return $foundryPlatformFetch($ctx, _getOutgoingLinkType, ...args);
}
