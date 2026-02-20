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
import type * as _Geojson from "@osdk/gotham.geojson";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * Log Safety: UNSAFE
 */
export interface AddArtifactsToMapRequest {
  artifactGids?: Array<_Core.ArtifactGid>;
  label: string;
}

/**
 * The response body to add artifacts to a map, containing the IDs of the created layers.
 *
 * Log Safety: UNSAFE
 */
export interface AddArtifactsToMapResponse {
  dataLayerIds: Array<GaiaLayerId>;
}

/**
 * The response body to add enterprise map layers to a map, containing the IDs of the created layers.
 *
 * Log Safety: UNSAFE
 */
export interface AddEnterpriseMapLayersToMapResponse {
  dataLayerIds: Array<GaiaLayerId>;
}

/**
 * The response body to add objects to a map, containing the ID of the created layer.
 *
 * Log Safety: UNSAFE
 */
export interface AddObjectsToMapResponse {
  dataLayerIds: Array<GaiaLayerId>;
}

/**
 * Security settings for map content
 *
 * Log Safety: SAFE
 */
export interface ArtifactSecurity {
  spaceRid?: SpaceRid;
}

/**
 * The ID of a enterprise map layer.
 *
 * Log Safety: UNSAFE
 */
export type EmlId = LooselyBrandedString<"EmlId">;

/**
 * Log Safety: UNSAFE
 */
export interface FillStyle {
  opacity?: number;
  color?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface FoundryObjectSetLoadConfig {
  config: string;
}

/**
 * A conjured coordinate that is NOT geojson and has an actual structure instead of a [lon, lat] array.
 *
 * Log Safety: UNSAFE
 */
export interface GaiaCoordinate {
  lon: number;
  lat: number;
}

/**
   * A representation of an element in a Gaia map. An element can be thought as a leaf node in the structure of a
map. It contains information such as the geometry of a feature. An element has one or more features.
Each element has an ID unique within the context of its parent layer; the ID is not guaranteed to be unique
within the context of a map.
   *
   * Log Safety: UNSAFE
   */
export interface GaiaElement {
  id: GaiaElementId;
  parentId: GaiaLayerId;
  features: Array<GaiaFeature>;
  label: string;
  properties?: GaiaProperties;
}

/**
 * The ID of an element in a map.
 *
 * Log Safety: UNSAFE
 */
export type GaiaElementId = LooselyBrandedString<"GaiaElementId">;

/**
 * Features are the objects you see on a Gaia map. This includes information such as geometry.
 *
 * Log Safety: UNSAFE
 */
export interface GaiaFeature {
  geometry: _Geojson.GeoJsonObject;
  style?: GaiaStyle;
}

/**
 * A representation of a layer in a Gaia map. A layer can contain multiple sub-layers and elements. Each layer has a unique ID within the context of a map.
 *
 * Log Safety: UNSAFE
 */
export interface GaiaLayer {
  id: GaiaLayerId;
  elements: Array<GaiaElement>;
}

/**
 * The ID of a layer in a Gaia map.
 *
 * Log Safety: UNSAFE
 */
export type GaiaLayerId = LooselyBrandedString<"GaiaLayerId">;

/**
 * Log Safety: UNSAFE
 */
export interface GaiaLayerMetadata {
  id: GaiaLayerId;
  subLayerIds: Array<GaiaLayerId>;
  label: string;
  temporaryObjectSet?: TemporaryObjectSet;
}

/**
 * The GID of the map to be loaded.
 *
 * Log Safety: SAFE
 */
export type GaiaMapGid = LooselyBrandedString<"GaiaMapGid">;

/**
 * The locator (value after the last period) of a Gaia Map RID.
 *
 * Log Safety: SAFE
 */
export type GaiaMapId = LooselyBrandedString<"GaiaMapId">;

/**
 * Log Safety: UNSAFE
 */
export interface GaiaMapMetadata {
  mapRid: GaiaMapRid;
  mapGid: GaiaMapGid;
  name: string;
  createdAt: string;
  lastModified: string;
  numLayers?: number;
  numElements?: number;
}

/**
 * The name of the Gaia map.
 *
 * Log Safety: UNSAFE
 */
export type GaiaMapName = LooselyBrandedString<"GaiaMapName">;

/**
 * The RID of a Gaia map.
 *
 * Log Safety: SAFE
 */
export type GaiaMapRid = LooselyBrandedString<"GaiaMapRid">;

/**
   * Strongly-typed properties associated with a Gaia element. We provide API guarantees over fields in this class;
consumers may use these properties programmatically. Note that the fields in this class are not guaranteed
to be populated; we populate these fields on a best effort basis.
   *
   * Log Safety: UNSAFE
   */
export interface GaiaProperties {
  tacticalGraphicProperties?: TacticalGraphicProperties;
}

/**
 * Log Safety: UNSAFE
 */
export interface GaiaStyle {
  label?: LabelStyle;
  stroke?: StrokeStyle;
  fill?: FillStyle;
  symbol?: SymbolStyle;
}

/**
 * Log Safety: UNSAFE
 */
export type GaiaSymbol =
  | ({ type: "MilsymSymbol" } & MilsymSymbol)
  | ({ type: "IconSymbol" } & IconSymbol);

/**
 * Log Safety: UNSAFE
 */
export interface IconFillStyle {
  opacity?: number;
  text?: string;
  color?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface IconStrokeStyle {
  width?: number;
  opacity?: number;
  color?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface IconSymbol {
  id: string;
  stroke?: IconStrokeStyle;
  fill?: IconFillStyle;
}

/**
   * Styling properties for rendering labels on a map. Right now, this will always be attached to a Point geometry.
The "text" field should be drawn with the given visibility/opacity/color. The Y-coordinate of the point
geometry represents the vertical midpoint of the rendered text and the X-coordinate of the point geometry
should line up with either the leftmost, center, or rightmost part of the rendered text as determined by the
textAlignment field. Then, the text should be rotated clockwise about this point geometry as determined by the
rotation field.
   *
   * Log Safety: UNSAFE
   */
export interface LabelStyle {
  text?: string;
  textRotation?: number;
  textColor?: string;
  textAlignment?: TextAlignment;
}

/**
 * Log Safety: UNSAFE
 */
export interface LoadLayersMapRequest {
  layerIds: Array<GaiaLayerId>;
}

/**
 * Log Safety: UNSAFE
 */
export interface LoadLayersResponse {
  layers: Record<GaiaLayerId, GaiaLayer>;
}

/**
 * Contains information related to a Gaia map's structure and basic metadata.
 *
 * Log Safety: UNSAFE
 */
export interface LoadMapResponse {
  title: string;
  rootLayerIds: Array<GaiaLayerId>;
  layers: Record<GaiaLayerId, GaiaLayerMetadata>;
}

/**
 * Log Safety: UNSAFE
 */
export interface LoadWithExtensionMapRequest {
  extensions: MapLoadExtensions;
}

/**
 * Log Safety: UNSAFE
 */
export interface Map {
  rid: GaiaMapRid;
  name: GaiaMapName;
  title: MapTitle;
  rootLayerIds?: Array<GaiaLayerId>;
  layers?: Record<GaiaLayerId, GaiaLayerMetadata>;
  security: ArtifactSecurity;
}

/**
 * Log Safety: UNSAFE
 */
export interface MapLoadExtensions {
  foundryObjectSet?: FoundryObjectSetLoadConfig;
}

/**
 * The title of the loaded Gaia map.
 *
 * Log Safety: UNSAFE
 */
export type MapTitle = LooselyBrandedString<"MapTitle">;

/**
 * Log Safety: UNSAFE
 */
export interface MilSymModifiers {
  aM: Array<number>;
  aN: Array<number>;
  x: Array<number>;
  x1?: number;
  a?: string;
  b?: string;
  c?: string;
  g?: string;
  f?: string;
  h?: string;
  h1?: string;
  h2?: string;
  n?: string;
  j?: string;
  k?: string;
  l?: string;
  m?: string;
  p?: string;
  q?: string;
  r?: string;
  s?: string;
  t?: string;
  t1?: string;
  v?: string;
  w?: string;
  w1?: string;
  y?: string;
  z?: string;
  aA?: string;
  aF?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface MilsymSymbol {
  sidc: string;
}

/**
 * The RID of an object set.
 *
 * Log Safety: SAFE
 */
export type ObjectSetRid = LooselyBrandedString<"ObjectSetRid">;

/**
 * The page token indicates where to start paging. api-gateway's Core.PageToken is an immutable @Unsafe String, which is incompatible with Gaia's backend search. This is a custom PageToken that is an immutable @Safe String.
 *
 * Log Safety: SAFE
 */
export type PageToken = LooselyBrandedString<"PageToken">;

/**
 * Log Safety: UNSAFE
 */
export interface RenderSymbolMapRequest {
  value: GaiaSymbol;
}

/**
 * The response body containing the queried Gaia maps
 *
 * Log Safety: UNSAFE
 */
export interface SearchMapsResponse {
  data: Array<GaiaMapMetadata>;
  nextPageToken?: PageToken;
}

/**
 * The unique identifier for a Foundry space
 *
 * Log Safety: SAFE
 */
export type SpaceRid = LooselyBrandedString<"SpaceRid">;

/**
 * Log Safety: UNSAFE
 */
export interface StrokeStyle {
  width?: number;
  opacity?: number;
  color?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface SymbolStyle {
  symbol: GaiaSymbol;
}

/**
 * The unique properties (WSG84 control points, modifiers, and the SIDC) required to create a tactical graphic.
 *
 * Log Safety: UNSAFE
 */
export interface TacticalGraphicProperties {
  sidc: MilsymSymbol;
  controlPoints?: Array<GaiaCoordinate>;
  modifiers: MilSymModifiers;
}

/**
 * Log Safety: SAFE
 */
export interface TemporaryObjectSet {
  objectSetRid?: ObjectSetRid;
  expiryTime: string;
}

/**
 * Log Safety: SAFE
 */
export type TextAlignment = "CENTER" | "RIGHT" | "LEFT";
