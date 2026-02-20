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

import type * as _Geojson from "@osdk/gotham.geojson";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
   * The render capability of the client. Renderables will be returned in the best possible format that's supported
by the client.
   *
   * Log Safety: SAFE
   */
export interface ClientCapabilities {
  supportedRenderableContent?: Array<RenderableContentType>;
}

/**
 * A unique identifier of a Foundry object property.
 *
 * Log Safety: SAFE
 */
export type FoundryObjectPropertyTypeRid = LooselyBrandedString<
  "FoundryObjectPropertyTypeRid"
>;

/**
 * The value of a Foundry object's property. The type of the property value is not preserved.
 *
 * Log Safety: UNSAFE
 */
export type FoundryObjectPropertyValueUntyped = any;

/**
 * The RID of a Foundry object set.
 *
 * Log Safety: SAFE
 */
export type FoundryObjectSetRid = LooselyBrandedString<"FoundryObjectSetRid">;

/**
 * A unique identifier of a Foundry object type.
 *
 * Log Safety: SAFE
 */
export type FoundryObjectTypeRid = LooselyBrandedString<"FoundryObjectTypeRid">;

/**
 * Renderable content represented with GeoJson geometry.
 *
 * Log Safety: UNSAFE
 */
export interface GeometryRenderableContent {
  geometry: _Geojson.GeoJsonObject;
  style: MrsGeometryStyle;
}

/**
   * Represents a request to render a set of Foundry objects. This includes information on how the objects should be
rendered.
   *
   * Log Safety: UNSAFE
   */
export interface Invocation {
  id: InvocationId;
  sourcingOnly?: boolean;
  objects: ObjectsReference;
  renderer: RendererReference;
}

/**
 * Client supplied session-unique identifier for a specific invocation of a render function.
 *
 * Log Safety: UNSAFE
 */
export type InvocationId = LooselyBrandedString<"InvocationId">;

/**
 * Log Safety: UNSAFE
 */
export interface InvocationObject {
  capabilities: ClientCapabilities;
  invocations?: Array<Invocation>;
}

/**
 * Alpha value of the color in the [0, 255] range.
 *
 * Log Safety: UNSAFE
 */
export type MrsAlpha = number;

/**
 * Color to be applied to some component of a renderable.
 *
 * Log Safety: UNSAFE
 */
export interface MrsColor {
  rgb: MrsRgb;
  alpha: MrsAlpha;
}

/**
 * Fill to be applied to some component of a renderable.
 *
 * Log Safety: UNSAFE
 */
export interface MrsFillStyle {
  color: MrsColor;
  pattern: MrsSymbol;
  opacity: MrsAlpha;
}

/**
 * Log Safety: UNSAFE
 */
export interface MrsGenericSdf {
  id: MrsGenericSdfId;
  color: MrsColor;
}

/**
 * Unique identifier for a SDF symbol that can be used to fetch the SDF as a PNG.
 *
 * Log Safety: UNSAFE
 */
export type MrsGenericSdfId = LooselyBrandedString<"MrsGenericSdfId">;

/**
 * Base generic symbol. Clients should always support rendering this symbol type.
 *
 * Log Safety: UNSAFE
 */
export interface MrsGenericSymbol {
  id: MrsGenericSymbolId;
}

/**
   * Unique identifier for a symbol that can be used to fetch the symbol as a PNG using loadGenericSymbol endpoint.
The ID is opaque and not meant to be parsed in any way.
   *
   * Log Safety: UNSAFE
   */
export type MrsGenericSymbolId = LooselyBrandedString<"MrsGenericSymbolId">;

/**
 * Styling information for GeoJson geometry objects.
 *
 * Log Safety: UNSAFE
 */
export interface MrsGeometryStyle {
  symbolStyle?: MrsSymbolStyle;
  strokeStyle?: MrsStrokeStyle;
  fillStyle?: MrsFillStyle;
  labelStyle?: MrsLabelStyle;
}

/**
 * Text to be rendered as part of the renderable content.
 *
 * Log Safety: UNSAFE
 */
export interface MrsLabelStyle {
  color: MrsColor;
  text: string;
  size: MrsVirtualPixels;
}

/**
 * A unique identifier of an object.
 *
 * Log Safety: SAFE
 */
export type MrsObjectRid = LooselyBrandedString<"MrsObjectRid">;

/**
 * Log Safety: SAFE
 */
export interface MrsObjectSourcingContentV2 {
  objectType: FoundryObjectTypeRid;
  objectRid: MrsObjectRid;
}

/**
 * Styling information for raster tiles.
 *
 * Log Safety: UNSAFE
 */
export interface MrsRasterStyle {
  opacity: MrsAlpha;
}

/**
 * RGB values of the color encoded in hex as '#RRGGBB'
 *
 * Log Safety: UNSAFE
 */
export type MrsRgb = LooselyBrandedString<"MrsRgb">;

/**
 * Object for RGB value to use as union
 *
 * Log Safety: UNSAFE
 */
export interface MrsRgbObject {
  rgb: MrsRgb;
}

/**
 * Color to be applied to some component of a renderable.
 *
 * Log Safety: UNSAFE
 */
export interface MrsStrokeStyle {
  color: MrsColor;
  width: MrsVirtualPixels;
  pattern: MrsSymbol;
  opacity: MrsAlpha;
}

/**
 * Information used load the symbol from the Symbol loading apis.
 *
 * Log Safety: UNSAFE
 */
export type MrsSymbol =
  | ({ type: "solid" } & MrsRgbObject)
  | ({ type: "sdf" } & MrsGenericSdf)
  | ({ type: "generic" } & MrsGenericSymbol);

/**
 * Symbol to be rendered as part of the renderable content.
 *
 * Log Safety: UNSAFE
 */
export interface MrsSymbolStyle {
  symbol: MrsSymbol;
  size: MrsVirtualPixels;
  opacity: MrsAlpha;
}

/**
   * Size in virtual pixels, accounting for high DPI displays. For browser applications these are CSS pixels or
devicePixelRatio.
   *
   * Log Safety: UNSAFE
   */
export type MrsVirtualPixels = number;

/**
 * Information that could be used to identify an unique Foundry object.
 *
 * Log Safety: UNSAFE
 */
export interface ObjectSourcingContent {
  objectType: FoundryObjectTypeRid;
  primaryKey?: Record<
    FoundryObjectPropertyTypeRid,
    FoundryObjectPropertyValueUntyped
  >;
}

/**
 * Reference to a set of Foundry objects.
 *
 * Log Safety: SAFE
 */
export type ObjectsReference = {
  type: "objectSet";
} & ObjectsReferenceObjectSet;

/**
 * Reference to a Foundry object set. Versioned object sets are currently not supported.
 *
 * Log Safety: SAFE
 */
export interface ObjectsReferenceObjectSet {
  objectSetRid: FoundryObjectSetRid;
}

/**
   * Renderable content represented with raster tiles in the Web Mercator (EPSG:3857) projection, laid out with the
single root tile, (z=0, x=0, y=0), covering the whole world. Construct the url using the url template supplied
to load the raster tile.
See https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames.
   *
   * Log Safety: UNSAFE
   */
export interface RasterTilesRenderableContent {
  url: string;
  tileDisplayResolution: MrsVirtualPixels;
  coveringGeometry: _Geojson.GeoJsonObject;
  style: MrsRasterStyle;
}

/**
 * A set of RenderableContent that represents a property of a Foundry object (i.e. the sourcing) for an invocation.
 *
 * Log Safety: UNSAFE
 */
export interface Renderable {
  id: RenderableId;
  invocation: InvocationId;
  sourcing: SourcingId;
  content?: Record<RenderablePartId, RenderableContent>;
}

/**
 * Represents a set of geopositioned geometries and their corresponding style to be rendered on to a map.
 *
 * Log Safety: UNSAFE
 */
export type RenderableContent =
  | ({ type: "geometry" } & GeometryRenderableContent)
  | ({ type: "rasterTilesWebMercator" } & RasterTilesRenderableContent);

/**
   * Available renderable content types:

GEOMETRY: Base geometry type.
Corresponds to GeometryRenderableContent.
RASTER_TILES_WEB_MERCATOR: Web Mercator (EPSG:3857) projection raster tiles.
Corresponds to RasterTilesRenderableContent.
   *
   * Log Safety: SAFE
   */
export type RenderableContentType = "GEOMETRY" | "RASTER_TILES_WEB_MERCATOR";

/**
 * Globally unique ID for a renderable within a session. The ID is opaque and not meant to be parsed in any way.
 *
 * Log Safety: UNSAFE
 */
export type RenderableId = LooselyBrandedString<"RenderableId">;

/**
 * Locally unique identifier for a part of a renderable.
 *
 * Log Safety: UNSAFE
 */
export type RenderablePartId = LooselyBrandedString<"RenderablePartId">;

/**
   * Reference that can be resolved into a renderer object. The renderer object includes configuration settings for
rendering the objects.
   *
   * Log Safety: SAFE
   */
export type RendererReference = {
  type: "standard";
} & StandardRendererReference;

/**
 * Log Safety: UNSAFE
 */
export interface RenderInvocationObjectRequest {
  capabilities: ClientCapabilities;
  invocations: Array<Invocation>;
}

/**
 * Log Safety: UNSAFE
 */
export interface RenderObjectsResponse {
  renderables?: Array<Renderable>;
  sourcings?: Array<Sourcing>;
}

/**
 * A reference to an individual unit of data Renderables were derived from.
 *
 * Log Safety: UNSAFE
 */
export interface Sourcing {
  id: SourcingId;
  content: SourcingContent;
  title: string;
}

/**
 * Information used to locate the Sourcing and its metadata.
 *
 * Log Safety: UNSAFE
 */
export type SourcingContent =
  | ({ type: "object" } & ObjectSourcingContent)
  | ({ type: "objectV2" } & MrsObjectSourcingContentV2);

/**
 * Globally unique ID for the sourcing within a session. The ID is opaque and not meant to be parsed in any way.
 *
 * Log Safety: UNSAFE
 */
export type SourcingId = LooselyBrandedString<"SourcingId">;

/**
   * The standard built in renderer. Renders the objects with service defined default styling derived from the object
type icon set in ontology manager.
   *
   * Log Safety: SAFE
   */
export interface StandardRendererReference {
  get?: any;
}

/**
 * Log Safety: UNSAFE
 */
export interface Symbol {
  id: MrsGenericSymbolId;
  size?: number;
}
