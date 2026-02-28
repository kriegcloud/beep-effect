/**
 * Ontology property value mapping contracts.
 *
 * @since 0.0.0
 * @module @beep/ontology/mapping/PropertyValueMapping
 */

import type { Attachment, AttachmentUpload } from "../object/Attachment.js";
import type { Media, MediaReference } from "../object/Media.js";
import type { GeotimeSeriesProperty, TimeSeriesProperty } from "../timeseries/timeseries.js";
import type { GeoPoint, GeoShape } from "./DataValueMapping.js";
/**
 * Map from wire property types to client-facing property runtime values.
 *
 * @since 0.0.0
 * @category models
 */
export interface PropertyValueWireToClient {
  readonly attachment: Attachment;
  readonly boolean: boolean;
  readonly byte: number;
  readonly datetime: string;
  readonly decimal: string;
  readonly double: number;
  readonly float: number;
  readonly geopoint: GeoPoint;
  readonly geoshape: GeoShape;
  readonly integer: number;
  readonly long: string;
  readonly marking: string;
  readonly mediaReference: Media;
  readonly short: number;
  readonly string: string;
  readonly timestamp: string;
  readonly numericTimeseries: TimeSeriesProperty<number>;
  readonly stringTimeseries: TimeSeriesProperty<string>;
  readonly sensorTimeseries: TimeSeriesProperty<string | number>;
  readonly geotimeSeriesReference: GeotimeSeriesProperty<GeoPoint>;
  readonly vector: Array<number>;
}

/**
 * Resolve client-facing runtime value type from a wire property key or keyed map.
 *
 * @since 0.0.0
 * @category models
 */
export type GetClientPropertyValueFromWire<
  T extends keyof PropertyValueWireToClient | Record<string, keyof PropertyValueWireToClient>,
> = T extends keyof PropertyValueWireToClient
  ? PropertyValueWireToClient[T]
  : T extends Record<string, keyof PropertyValueWireToClient>
    ? { readonly [K in keyof T]: PropertyValueWireToClient[T[K]] }
    : never;

/**
 * Map from wire property types to accepted client input values.
 *
 * @since 0.0.0
 * @category models
 */
export interface PropertyValueClientToWire {
  readonly attachment: string | AttachmentUpload | (Blob & { readonly name: string });
  readonly boolean: boolean;
  readonly byte: number;
  readonly datetime: string;
  readonly decimal: string | number;
  readonly double: number;
  readonly float: number;
  readonly geopoint: GeoPoint;
  readonly geoshape: GeoShape;
  readonly integer: number;
  readonly long: string | number;
  readonly marking: string;
  readonly short: number;
  readonly string: string;
  readonly timestamp: string;
  readonly mediaReference: Media;
  readonly numericTimeseries: TimeSeriesProperty<number>;
  readonly stringTimeseries: TimeSeriesProperty<string>;
  readonly sensorTimeseries: TimeSeriesProperty<string | number>;
  readonly geotimeSeriesReference: GeotimeSeriesProperty<GeoPoint>;
  readonly vector: Array<number>;
}

/**
 * Resolve accepted wire input type from a wire property key or keyed map.
 *
 * @since 0.0.0
 * @category models
 */
export type GetWirePropertyValueFromClient<
  T extends keyof PropertyValueClientToWire | Record<string, keyof PropertyValueClientToWire>,
> = T extends keyof PropertyValueClientToWire
  ? PropertyValueClientToWire[T]
  : T extends Record<string, keyof PropertyValueClientToWire>
    ? { readonly [K in keyof T]: PropertyValueClientToWire[T[K]] }
    : never;

/**
 * Map from wire property types to accepted create-operation values.
 *
 * @since 0.0.0
 * @category models
 */
export interface PropertyValueWireToCreate {
  readonly attachment: Attachment | string;
  readonly boolean: boolean;
  readonly byte: number;
  readonly datetime: string;
  readonly decimal: string;
  readonly double: number;
  readonly float: number;
  readonly geopoint: GeoPoint;
  readonly geoshape: GeoShape;
  readonly integer: number;
  readonly long: string;
  readonly marking: string;
  readonly mediaReference: Media | MediaReference;
  readonly short: number;
  readonly string: string;
  readonly timestamp: string;
  readonly numericTimeseries: TimeSeriesProperty<number>;
  readonly stringTimeseries: TimeSeriesProperty<string>;
  readonly sensorTimeseries: TimeSeriesProperty<string | number>;
  readonly geotimeSeriesReference: GeotimeSeriesProperty<GeoPoint>;
  readonly vector: Array<number>;
}

/**
 * Resolve accepted create value type from a wire property key or keyed map.
 *
 * @since 0.0.0
 * @category models
 */
export type GetCreatePropertyValueFromWire<
  T extends keyof PropertyValueWireToCreate | Record<string, keyof PropertyValueWireToCreate>,
> = T extends keyof PropertyValueWireToCreate
  ? PropertyValueWireToCreate[T]
  : T extends Record<string, keyof PropertyValueWireToCreate>
    ? { readonly [K in keyof T]: PropertyValueWireToCreate[T[K]] | undefined }
    : never;
