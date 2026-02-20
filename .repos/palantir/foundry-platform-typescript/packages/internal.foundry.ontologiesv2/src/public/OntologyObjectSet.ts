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
import type * as _Ontologies from "@osdk/internal.foundry.ontologies";
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

//

const _createTemporary: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    $body: _Ontologies.CreateTemporaryObjectSetRequestV2,
  ) => Promise<_Ontologies.CreateTemporaryObjectSetResponseV2>
> = [1, "/v2/ontologies/{0}/objectSets/createTemporary", 1];

/**
 * Creates a temporary `ObjectSet` from the given definition.
 *
 * Third-party applications using this endpoint via OAuth2 must request the
 * following operation scopes: `api:ontologies-read api:ontologies-write`.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read, api:ontologies-write]
 * URL: /v2/ontologies/{ontology}/objectSets/createTemporary
 */
export function createTemporary(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    $body: _Ontologies.CreateTemporaryObjectSetRequestV2,
  ]
): Promise<_Ontologies.CreateTemporaryObjectSetResponseV2> {
  return $foundryPlatformFetch($ctx, _createTemporary, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectSetRid: _Ontologies.ObjectSetRid,
  ) => Promise<_Ontologies.ObjectSet>
> = [0, "/v2/ontologies/{0}/objectSets/{1}"];

/**
 * Gets the definition of the `ObjectSet` with the given RID.
 *
 * Third-party applications using this endpoint via OAuth2 must request the following operation scope: `api:ontologies-read`.
 *
 * @alpha
 *
 * Required Scopes: []
 * URL: /v2/ontologies/{ontology}/objectSets/{objectSetRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectSetRid: _Ontologies.ObjectSetRid,
  ]
): Promise<_Ontologies.ObjectSet> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _load: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    $body: _Ontologies.LoadObjectSetRequestV2,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
    },
  ) => Promise<_Ontologies.LoadObjectSetResponseV2>
> = [1, "/v2/ontologies/{0}/objectSets/loadObjects", 3];

/**
 * Load the ontology objects present in the `ObjectSet` from the provided object set definition.
 *
 * For Object Storage V1 backed objects, this endpoint returns a maximum of 10,000 objects. After 10,000 objects have been returned and if more objects
 * are available, attempting to load another page will result in an `ObjectsExceededLimit` error being returned. There is no limit on Object Storage V2 backed objects.
 *
 * Note that null value properties will not be returned.
 *
 * Third-party applications using this endpoint via OAuth2 must request the following operation scope: `api:ontologies-read`.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objectSets/loadObjects
 */
export function load(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    $body: _Ontologies.LoadObjectSetRequestV2,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
    },
  ]
): Promise<_Ontologies.LoadObjectSetResponseV2> {
  return $foundryPlatformFetch($ctx, _load, ...args);
}

const _loadMultipleObjectTypes: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    $body: _Ontologies.LoadObjectSetV2MultipleObjectTypesRequest,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Ontologies.LoadObjectSetV2MultipleObjectTypesResponse>
> = [1, "/v2/ontologies/{0}/objectSets/loadObjectsMultipleObjectTypes", 3];

/**
 * Load the ontology objects present in the `ObjectSet` from the provided object set definition. The resulting
 * objects may be scoped to an object type, in which all the selected properties on the object type are returned, or scoped
 * to an interface, in which only the object type properties that implement the properties of any interfaces in its
 * scope are returned. For objects that are scoped to an interface in the result, a mapping from interface to
 * object implementation is returned in order to interpret the objects as the interfaces that they implement.
 *
 * For Object Storage V1 backed objects, this endpoint returns a maximum of 10,000 objects. After 10,000 objects have been returned and if more objects
 * are available, attempting to load another page will result in an `ObjectsExceededLimit` error being returned. There is no limit on Object Storage V2 backed objects.
 *
 * Note that null value properties will not be returned. In addition, property metadata (rid, apiName, and primaryKey)
 * will be prefixed with '$' instead of '\_\_' as is the case in `loadObjects`.
 *
 * Third-party applications using this endpoint via OAuth2 must request the following operation scope: `api:ontologies-read`.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objectSets/loadObjectsMultipleObjectTypes
 */
export function loadMultipleObjectTypes(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    $body: _Ontologies.LoadObjectSetV2MultipleObjectTypesRequest,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Ontologies.LoadObjectSetV2MultipleObjectTypesResponse> {
  return $foundryPlatformFetch($ctx, _loadMultipleObjectTypes, ...args);
}

const _loadObjectsOrInterfaces: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    $body: _Ontologies.LoadObjectSetV2ObjectsOrInterfacesRequest,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_Ontologies.LoadObjectSetV2ObjectsOrInterfacesResponse>
> = [1, "/v2/ontologies/{0}/objectSets/loadObjectsOrInterfaces", 3];

/**
 * Load the ontology objects present in the `ObjectSet` from the provided object set definition. If the requested
 * object set contains interfaces and the object can be viewed as an interface, it will contain the properties
 * defined by the interface. If not, it will contain the properties defined by its object type. This allows directly
 * loading all objects of an interface where all objects are viewed as the interface, for example.
 *
 * Note that the result object set cannot contain a mix of objects with "interface" properties and "object type"
 * properties. Attempting to load an object set like this will result in an error.
 *
 * For Object Storage V1 backed objects, this endpoint returns a maximum of 10,000 objects. After 10,000 objects have been returned and if more objects
 * are available, attempting to load another page will result in an `ObjectsExceededLimit` error being returned. There is no limit on Object Storage V2 backed objects.
 *
 * Note that null value properties will not be returned. In addition, property metadata (rid, apiName, and primaryKey)
 * will be prefixed with '$' instead of '\_\_' as is the case in `/loadObjects`.
 *
 * Third-party applications using this endpoint via OAuth2 must request the following operation scope: `api:ontologies-read`.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objectSets/loadObjectsOrInterfaces
 */
export function loadObjectsOrInterfaces(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    $body: _Ontologies.LoadObjectSetV2ObjectsOrInterfacesRequest,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Ontologies.LoadObjectSetV2ObjectsOrInterfacesResponse> {
  return $foundryPlatformFetch($ctx, _loadObjectsOrInterfaces, ...args);
}

const _aggregate: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    $body: _Ontologies.AggregateObjectSetRequestV2,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
    },
  ) => Promise<_Ontologies.AggregateObjectsResponseV2>
> = [1, "/v2/ontologies/{0}/objectSets/aggregate", 3];

/**
 * Aggregates the ontology objects present in the `ObjectSet` from the provided object set definition.
 *
 * Third-party applications using this endpoint via OAuth2 must request the following operation scope: `api:ontologies-read`.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objectSets/aggregate
 */
export function aggregate(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    $body: _Ontologies.AggregateObjectSetRequestV2,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
    },
  ]
): Promise<_Ontologies.AggregateObjectsResponseV2> {
  return $foundryPlatformFetch($ctx, _aggregate, ...args);
}
