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

const _getFirstPoint: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    property: _Ontologies.PropertyApiName,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
    },
  ) => Promise<_Ontologies.TimeSeriesPoint | undefined>
> = [0, "/v2/ontologies/{0}/objects/{1}/{2}/timeseries/{3}/firstPoint", 2];

/**
 * Get the first point of a time series property.
 *
 * Third-party applications using this endpoint via OAuth2 must request the
 * following operation scopes: `api:ontologies-read`.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objects/{objectType}/{primaryKey}/timeseries/{property}/firstPoint
 */
export function getFirstPoint(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    property: _Ontologies.PropertyApiName,

    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
    },
  ]
): Promise<_Ontologies.TimeSeriesPoint | undefined> {
  return $foundryPlatformFetch($ctx, _getFirstPoint, ...args);
}

const _getLastPoint: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    property: _Ontologies.PropertyApiName,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
    },
  ) => Promise<_Ontologies.TimeSeriesPoint | undefined>
> = [0, "/v2/ontologies/{0}/objects/{1}/{2}/timeseries/{3}/lastPoint", 2];

/**
 * Get the last point of a time series property.
 *
 * Third-party applications using this endpoint via OAuth2 must request the
 * following operation scopes: `api:ontologies-read`.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objects/{objectType}/{primaryKey}/timeseries/{property}/lastPoint
 */
export function getLastPoint(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    property: _Ontologies.PropertyApiName,

    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
    },
  ]
): Promise<_Ontologies.TimeSeriesPoint | undefined> {
  return $foundryPlatformFetch($ctx, _getLastPoint, ...args);
}

const _streamPoints: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    property: _Ontologies.PropertyApiName,
    $body: _Ontologies.StreamTimeSeriesPointsRequest,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      format?: _Ontologies.StreamingOutputFormat | undefined;
    },
  ) => Promise<Response>
> = [
  1,
  "/v2/ontologies/{0}/objects/{1}/{2}/timeseries/{3}/streamPoints",
  3,
  ,
  "*/*",
];

/**
 * Stream all of the points of a time series property.
 *
 * Third-party applications using this endpoint via OAuth2 must request the
 * following operation scopes: `api:ontologies-read`.
 *
 * @public
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objects/{objectType}/{primaryKey}/timeseries/{property}/streamPoints
 */
export function streamPoints(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    property: _Ontologies.PropertyApiName,
    $body: _Ontologies.StreamTimeSeriesPointsRequest,
    $queryParams?: {
      artifactRepository?: _Ontologies.ArtifactRepositoryRid | undefined;
      packageName?: _Ontologies.SdkPackageName | undefined;
      format?: _Ontologies.StreamingOutputFormat | undefined;
    },
  ]
): Promise<Response> {
  return $foundryPlatformFetch($ctx, _streamPoints, ...args);
}
