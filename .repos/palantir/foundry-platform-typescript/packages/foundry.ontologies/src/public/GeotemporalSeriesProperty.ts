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

const _getGeotemporalSeriesLatestValue: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    propertyName: _Ontologies.PropertyApiName,
    $queryParams?: {
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
    },
  ) => Promise<_Ontologies.GeotemporalSeriesEntry | undefined>
> = [
  0,
  "/v2/ontologies/{0}/objects/{1}/{2}/geotemporalSeries/{3}/latestValue",
  2,
];

/**
 * Get the latest recorded location for a geotemporal series reference property.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objects/{objectType}/{primaryKey}/geotemporalSeries/{propertyName}/latestValue
 */
export function getGeotemporalSeriesLatestValue(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    propertyName: _Ontologies.PropertyApiName,

    $queryParams?: {
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
    },
  ]
): Promise<_Ontologies.GeotemporalSeriesEntry | undefined> {
  return $foundryPlatformFetch($ctx, _getGeotemporalSeriesLatestValue, ...args);
}

const _streamGeotemporalSeriesHistoricValues: $FoundryPlatformMethod<
  (
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    propertyName: _Ontologies.PropertyApiName,
    $body: _Ontologies.StreamGeotemporalSeriesValuesRequest,
    $queryParams?: {
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
    },
  ) => Promise<Response>
> = [
  1,
  "/v2/ontologies/{0}/objects/{1}/{2}/geotemporalSeries/{3}/streamHistoricValues",
  3,
  ,
  "*/*",
];

/**
 * Stream historic points of a geotemporal series reference property.
 *
 * @alpha
 *
 * Required Scopes: [api:ontologies-read]
 * URL: /v2/ontologies/{ontology}/objects/{objectType}/{primaryKey}/geotemporalSeries/{propertyName}/streamHistoricValues
 */
export function streamGeotemporalSeriesHistoricValues(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    ontology: _Ontologies.OntologyIdentifier,
    objectType: _Ontologies.ObjectTypeApiName,
    primaryKey: _Ontologies.PropertyValueEscapedString,
    propertyName: _Ontologies.PropertyApiName,
    $body: _Ontologies.StreamGeotemporalSeriesValuesRequest,
    $queryParams?: {
      sdkPackageRid?: _Ontologies.SdkPackageRid | undefined;
      sdkVersion?: _Ontologies.SdkVersion | undefined;
    },
  ]
): Promise<Response> {
  return $foundryPlatformFetch(
    $ctx,
    _streamGeotemporalSeriesHistoricValues,
    ...args,
  );
}
