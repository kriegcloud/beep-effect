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
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Ontologies.ListInterfaceTypesResponse>
> = [0, "/v2/ontologies/{0}/interfaceTypes", 2];

/**
 * Lists the interface types for the given Ontology.
 *
 * Each page may be smaller than the requested page size. However, it is guaranteed that if there are more
 * results available, at least one result will be present in the response.
 *
 * @beta
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/interfaceTypes
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,

    $queryParams?: {
      branch?: _Core.FoundryBranch | undefined;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Ontologies.ListInterfaceTypesResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,
    $queryParams?: {
      preview?: _Core.PreviewMode | undefined;
      branch?: _Core.FoundryBranch | undefined;
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
    },
  ) => Promise<_Ontologies.InterfaceType>
> = [0, "/v2/ontologies/{0}/interfaceTypes/{1}", 2];

/**
 * Gets a specific interface type with the given API name.
 *
 * @beta
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/interfaceTypes/{interfaceType}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,

    $queryParams?: {
      preview?: _Core.PreviewMode | undefined;
      branch?: _Core.FoundryBranch | undefined;
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
    },
  ]
): Promise<_Ontologies.InterfaceType> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _listObjectsForInterface: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,
    $queryParams: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      select: Array<_Ontologies.SelectedPropertyApiName>;
      orderBy?: _Ontologies.OrderBy | undefined;
      excludeRid?: boolean | undefined;
      snapshot?: boolean | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ) => Promise<_Ontologies.ListObjectsForInterfaceResponse>
> = [0, "/v2/ontologies/{0}/interfaces/{1}", 2];

/**
 * Lists the objects for the given Ontology and interface type.
 *
 * Note that this endpoint does not guarantee consistency, unless you use the snapshot flag specified below. Changes to the data could result in missing or
 * repeated objects in the response pages.
 *
 * For Object Storage V1 backed objects, this endpoint returns a maximum of 10,000 objects. After 10,000 objects have been returned and if more objects
 * are available, attempting to load another page will result in an `ObjectsExceededLimit` error being returned. There is no limit on Object Storage V2 backed objects.
 *
 * Each page may be smaller or larger than the requested page size. However, it
 * is guaranteed that if there are more results available, at least one result will be present
 * in the response.
 *
 * Note that null value properties will not be returned.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/interfaces/{interfaceType}
 */
export function listObjectsForInterface(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,

    $queryParams: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      select: Array<_Ontologies.SelectedPropertyApiName>;
      orderBy?: _Ontologies.OrderBy | undefined;
      excludeRid?: boolean | undefined;
      snapshot?: boolean | undefined;
      branch?: _Core.FoundryBranch | undefined;
    },
  ]
): Promise<_Ontologies.ListObjectsForInterfaceResponse> {
  return $foundryPlatformFetch($ctx, _listObjectsForInterface, ...args);
}

const _search: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,
    $body: _Ontologies.SearchObjectsForInterfaceRequest,
    $queryParams?: {
      branch?: _Core.FoundryBranch | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Ontologies.SearchObjectsResponseV2>
> = [1, "/v2/ontologies/{0}/interfaces/{1}/search", 3];

/**
 * :::callout{theme=warning title=Warning}
 * This endpoint will be removed once TS OSDK is updated to use `objectSets/loadObjects` with interface object
 * sets.
 * :::
 * Search for objects in the specified ontology and interface type. Any properties specified in the "where" or
 * "orderBy" parameters must be shared property type API names defined on the interface. The following search
 * queries are supported:
 *
 * | Query type                              | Description                                                                                                       | Supported Types                 |
 * |-----------------------------------------|-------------------------------------------------------------------------------------------------------------------|---------------------------------|
 * | lt                                      | The provided property is less than the provided value.                                                            | number, string, date, timestamp |
 * | gt                                      | The provided property is greater than the provided value.                                                         | number, string, date, timestamp |
 * | lte                                     | The provided property is less than or equal to the provided value.                                                | number, string, date, timestamp |
 * | gte                                     | The provided property is greater than or equal to the provided value.                                             | number, string, date, timestamp |
 * | eq                                      | The provided property is exactly equal to the provided value.                                                     | number, string, date, timestamp |
 * | isNull                                  | The provided property is (or is not) null.                                                                        | all                             |
 * | contains                                | The provided property contains the provided value.                                                                | array                           |
 * | not                                     | The sub-query does not match.                                                                                     | N/A (applied on a query)        |
 * | and                                     | All the sub-queries match.                                                                                        | N/A (applied on queries)        |
 * | or                                      | At least one of the sub-queries match.                                                                            | N/A (applied on queries)        |
 * | startsWith                              | The provided property starts with the provided term.                                                              | string                          |
 * | containsAllTermsInOrderPrefixLastTerm   | The provided property contains all the terms provided in order. The last term can be a partial prefix match.      | string                          |
 * | containsAllTermsInOrder                 | The provided property contains the provided terms as a substring.                                                 | string                          |
 * | containsAnyTerm                         | The provided property contains at least one of the terms separated by whitespace.                                 | string                          |
 * | containsAllTerms                        | The provided property contains all the terms separated by whitespace.                                             | string                          |
 *
 * Queries can be at most three levels deep. By default, terms are separated by whitespace or punctuation (`?!,:;-[](){}'"~`). Periods (`.`) on their own are ignored.
 * Partial terms are not matched by terms filters except where explicitly noted.
 *
 * Attempting to use an unsupported query will result in a validation error. Third-party applications using this
 * endpoint via OAuth2 must request the following operation scope: `api:ontologies-read`.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/interfaces/{interfaceType}/search
 */
export function search(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,
    $body: _Ontologies.SearchObjectsForInterfaceRequest,
    $queryParams?: {
      branch?: _Core.FoundryBranch | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Ontologies.SearchObjectsResponseV2> {
  return $foundryPlatformFetch($ctx, _search, ...args);
}

const _aggregate: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,
    $body: _Ontologies.AggregateObjectsRequestV2,
    $queryParams?: {
      branch?: _Core.FoundryBranch | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Ontologies.AggregateObjectsResponseV2>
> = [1, "/v2/ontologies/{0}/interfaces/{1}/aggregate", 3];

/**
 * :::callout{theme=warning title=Warning}
 * This endpoint will be removed once TS OSDK is updated to use `objectSets/aggregate` with interface object
 * sets.
 * :::
 * Perform functions on object fields in the specified ontology and of the specified interface type. Any
 * properties specified in the query must be shared property type API names defined on the interface.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/interfaces/{interfaceType}/aggregate
 */
export function aggregate(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,
    $body: _Ontologies.AggregateObjectsRequestV2,
    $queryParams?: {
      branch?: _Core.FoundryBranch | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Ontologies.AggregateObjectsResponseV2> {
  return $foundryPlatformFetch($ctx, _aggregate, ...args);
}

const _listOutgoingInterfaceLinkTypes: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,
    $queryParams?: { branch?: _Core.FoundryBranch | undefined },
  ) => Promise<_Ontologies.ListOutgoingInterfaceLinkTypesResponse>
> = [0, "/v2/ontologies/{0}/interfaceTypes/{1}/outgoingLinkTypes", 2];

/**
 * List the outgoing interface link types for an interface type.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/interfaceTypes/{interfaceType}/outgoingLinkTypes
 */
export function listOutgoingInterfaceLinkTypes(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,

    $queryParams?: { branch?: _Core.FoundryBranch | undefined },
  ]
): Promise<_Ontologies.ListOutgoingInterfaceLinkTypesResponse> {
  return $foundryPlatformFetch($ctx, _listOutgoingInterfaceLinkTypes, ...args);
}

const _getOutgoingInterfaceLinkType: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,
    interfaceLinkType: _Ontologies.InterfaceLinkTypeApiName,
    $queryParams?: { branch?: _Core.FoundryBranch | undefined },
  ) => Promise<_Ontologies.InterfaceLinkType>
> = [0, "/v2/ontologies/{0}/interfaceTypes/{1}/outgoingLinkTypes/{2}", 2];

/**
 * Get an outgoing interface link type for an interface type.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/interfaceTypes/{interfaceType}/outgoingLinkTypes/{interfaceLinkType}
 */
export function getOutgoingInterfaceLinkType(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,
    interfaceLinkType: _Ontologies.InterfaceLinkTypeApiName,

    $queryParams?: { branch?: _Core.FoundryBranch | undefined },
  ]
): Promise<_Ontologies.InterfaceLinkType> {
  return $foundryPlatformFetch($ctx, _getOutgoingInterfaceLinkType, ...args);
}

const _listInterfaceLinkedObjects: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,
    interfaceLinkType: _Ontologies.InterfaceLinkTypeApiName,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    $queryParams: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      select: Array<_Ontologies.SelectedPropertyApiName>;
      orderBy?: _Ontologies.OrderBy | undefined;
      excludeRid?: boolean | undefined;
      snapshot?: boolean | undefined;
      branch?: _Core.FoundryBranch | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Ontologies.ListInterfaceLinkedObjectsResponse>
> = [0, "/v2/ontologies/{0}/interfaces/{1}/{2}/{3}/links/{4}", 2];

/**
 * Lists the linked objects for a specific object and the given interface link type.
 *
 * Note that this endpoint does not guarantee consistency. Changes to the data could result in missing or
 * repeated objects in the response pages.
 *
 * For Object Storage V1 backed objects, this endpoint returns a maximum of 10,000 objects. After 10,000 objects have been returned and if more objects
 * are available, attempting to load another page will result in an `ObjectsExceededLimit` error being returned. There is no limit on Object Storage V2 backed objects.
 *
 * Each page may be smaller or larger than the requested page size. However, it
 * is guaranteed that if there are more results available, at least one result will be present
 * in the response.
 *
 * Note that null value properties will not be returned.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/interfaces/{interfaceType}/{objectType}/{primaryKey}/links/{interfaceLinkType}
 */
export function listInterfaceLinkedObjects(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    interfaceType: _Ontologies.InterfaceTypeApiName,
    interfaceLinkType: _Ontologies.InterfaceLinkTypeApiName,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,

    $queryParams: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      select: Array<_Ontologies.SelectedPropertyApiName>;
      orderBy?: _Ontologies.OrderBy | undefined;
      excludeRid?: boolean | undefined;
      snapshot?: boolean | undefined;
      branch?: _Core.FoundryBranch | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Ontologies.ListInterfaceLinkedObjectsResponse> {
  return $foundryPlatformFetch($ctx, _listInterfaceLinkedObjects, ...args);
}
