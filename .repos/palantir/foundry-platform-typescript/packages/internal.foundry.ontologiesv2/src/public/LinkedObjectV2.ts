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

const _listLinkedObjects: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    linkType: _Ontologies.LinkTypeApiName,
    $queryParams: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      select: Array<_Ontologies.SelectedPropertyApiName>;
      orderBy?: _Ontologies.OrderBy | undefined;
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      excludeRid?: boolean | undefined;
    },
  ) => Promise<_Ontologies.ListLinkedObjectsResponseV2>
> = [0, "/v2/ontologies/{0}/objects/{1}/{2}/links/{3}", 2];

/**
 * Lists the linked objects for a specific object and the given link type.
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
 * Third-party applications using this endpoint via OAuth2 must request the following operation scope: `api:ontologies-read`.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objects/{objectType}/{primaryKey}/links/{linkType}
 */
export function listLinkedObjects(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    linkType: _Ontologies.LinkTypeApiName,

    $queryParams: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      select: Array<_Ontologies.SelectedPropertyApiName>;
      orderBy?: _Ontologies.OrderBy | undefined;
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      excludeRid?: boolean | undefined;
    },
  ]
): Promise<_Ontologies.ListLinkedObjectsResponseV2> {
  return $foundryPlatformFetch($ctx, _listLinkedObjects, ...args);
}

const _getLinkedObject: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    linkType: _Ontologies.LinkTypeApiName,
    linkedObjectPrimaryKey: _Ontologies.PropertyValueEscapedString,
    $queryParams: {
      select: Array<_Ontologies.SelectedPropertyApiName>;
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      excludeRid?: boolean | undefined;
    },
  ) => Promise<_Ontologies.OntologyObjectV2>
> = [0, "/v2/ontologies/{0}/objects/{1}/{2}/links/{3}/{4}", 2];

/**
 * Get a specific linked object that originates from another object.
 *
 * If there is no link between the two objects, `LinkedObjectNotFound` is thrown.
 *
 * Third-party applications using this endpoint via OAuth2 must request the following operation scope: `api:ontologies-read`.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objects/{objectType}/{primaryKey}/links/{linkType}/{linkedObjectPrimaryKey}
 */
export function getLinkedObject(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    linkType: _Ontologies.LinkTypeApiName,
    linkedObjectPrimaryKey: _Ontologies.PropertyValueEscapedString,

    $queryParams: {
      select: Array<_Ontologies.SelectedPropertyApiName>;
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      excludeRid?: boolean | undefined;
    },
  ]
): Promise<_Ontologies.OntologyObjectV2> {
  return $foundryPlatformFetch($ctx, _getLinkedObject, ...args);
}
