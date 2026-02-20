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

import type * as _Core from "@osdk/gotham.core";
import type {
  SharedClient as $OldClient,
  SharedClientContext as $OldClientContext,
} from "@osdk/shared.client";
import type {
  SharedClient as $Client,
  SharedClientContext as $ClientContext,
} from "@osdk/shared.client2";
import type { FoundryPlatformMethod as $PlatformMethod } from "@osdk/shared.net.platformapi";
import { foundryPlatformFetch as $platformFetch } from "@osdk/shared.net.platformapi";
import type * as _Gaia from "../_components.js";

//

const _search: $PlatformMethod<
  ($queryParams: {
    mapName: _Gaia.GaiaMapName;
    pageSize?: _Core.PageSize | undefined;
    pageToken?: _Gaia.PageToken | undefined;
    preview?: _Core.PreviewMode | undefined;
  }) => Promise<_Gaia.SearchMapsResponse>
> = [0, "/v2/gaia/maps/search", 2];

/**
 * Retrieves all published maps containing the mapName (does not have to be exact).
 *
 * @beta
 *
 * Required Scopes: [api:map-read]
 * URL: /v2/gaia/maps/search
 */
export function search(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $queryParams: {
      mapName: _Gaia.GaiaMapName;
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Gaia.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_Gaia.SearchMapsResponse> {
  return $platformFetch($ctx, _search, ...args);
}

const _addArtifactsTo: $PlatformMethod<
  (
    mapRid: _Gaia.GaiaMapRid,
    $body: _Gaia.AddArtifactsToMapRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Gaia.AddArtifactsToMapResponse>
> = [1, "/v2/gaia/maps/{0}/addArtifactsTo", 3];

/**
 * Add artifacts to a map. Currently only Foundry-managed object types may be added. If unknown objects
 * or objects that don't satisfy the security requirements are provided, the entire request will fail.
 * This creates a new layer that includes all the provided objects per request, thus not idempotent.
 * Returns the IDs of the layers created.
 *
 * @beta
 *
 * Required Scopes: [api:map-write]
 * URL: /v2/gaia/maps/{mapRid}/addArtifactsTo
 */
export function addArtifactsTo(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    mapRid: _Gaia.GaiaMapRid,
    $body: _Gaia.AddArtifactsToMapRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Gaia.AddArtifactsToMapResponse> {
  return $platformFetch($ctx, _addArtifactsTo, ...args);
}

const _load: $PlatformMethod<
  (
    mapRid: _Gaia.GaiaMapRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Gaia.LoadMapResponse>
> = [0, "/v2/gaia/maps/{0}/load", 2];

/**
 * Loads the structure and basic metadata of a Gaia map, given a map GID. Metadata includes the map's title and
 * layer labels.
 *
 * #
 *
 * The response contains a mapping of all layers contained in the map. The map's layer hierarchy can be recreated
 * by using the `rootLayerIds` in the response along with the `subLayerIds` field in the layer's metadata.
 *
 * @beta
 *
 * Required Scopes: [api:map-read]
 * URL: /v2/gaia/maps/{mapRid}/load
 */
export function load(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    mapRid: _Gaia.GaiaMapRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Gaia.LoadMapResponse> {
  return $platformFetch($ctx, _load, ...args);
}

const _loadWithExtension: $PlatformMethod<
  (
    mapRid: _Gaia.GaiaMapRid,
    $body: _Gaia.LoadWithExtensionMapRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Gaia.LoadMapResponse>
> = [2, "/v2/gaia/maps/{0}/loadWithExtension", 3];

/**
 * Same as /gotham/v1/maps/load/{mapGid}, but allows you to pass in a request body for further configuration.
 *
 * Loads the structure and basic metadata of a Gaia map, given a map GID. Metadata includes the map's title and
 * layer labels.
 *
 * The response contains a mapping of all layers contained in the map. The map's layer hierarchy can be recreated
 * by using the `rootLayerIds` in the response along with the `subLayerIds` field in the layer's metadata.
 *
 * @beta
 *
 * Required Scopes: [api:map-read]
 * URL: /v2/gaia/maps/{mapRid}/loadWithExtension
 */
export function loadWithExtension(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    mapRid: _Gaia.GaiaMapRid,
    $body: _Gaia.LoadWithExtensionMapRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Gaia.LoadMapResponse> {
  return $platformFetch($ctx, _loadWithExtension, ...args);
}

const _loadLayers: $PlatformMethod<
  (
    mapRid: _Gaia.GaiaMapRid,
    $body: _Gaia.LoadLayersMapRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Gaia.LoadLayersResponse>
> = [2, "/v2/gaia/maps/{0}/loadLayers", 3];

/**
 * Loads the elements contained in the requested layers of a Gaia map. The response includes the geometries
 * associated with the elements.
 *
 * @beta
 *
 * Required Scopes: [api:map-read]
 * URL: /v2/gaia/maps/{mapRid}/loadLayers
 */
export function loadLayers(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    mapRid: _Gaia.GaiaMapRid,
    $body: _Gaia.LoadLayersMapRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Gaia.LoadLayersResponse> {
  return $platformFetch($ctx, _loadLayers, ...args);
}

const _renderSymbol: $PlatformMethod<
  (
    $body: _Gaia.RenderSymbolMapRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<Response>
> = [2, "/v2/gaia/maps/renderSymbol", 3, , "application/octet-stream"];

/**
 * Fetches the PNG for the given symbol identifier
 *
 * @beta
 *
 * Required Scopes: [api:map-read]
 * URL: /v2/gaia/maps/renderSymbol
 */
export function renderSymbol(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _Gaia.RenderSymbolMapRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<Response> {
  return $platformFetch($ctx, _renderSymbol, ...args);
}
