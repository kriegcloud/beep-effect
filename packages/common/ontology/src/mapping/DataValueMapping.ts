/**
 * Ontology data value mapping helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/mapping/DataValueMapping
 */
import type { Attachment, AttachmentUpload } from "../object/Attachment.js";
import type { MediaReference, MediaUpload } from "../object/Media.js";
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("mapping/DataValueMapping");
/**
 * Allowed primitive bucket value types.
 *
 * @since 0.0.0
 * @category models
 */
export type AllowedBucketTypes = string | number | boolean;

/**
 * Allowed bucket key types used in aggregation payloads.
 *
 * @since 0.0.0
 * @category models
 */
export type AllowedBucketKeyTypes =
  | AllowedBucketTypes
  | {
      readonly startValue: AllowedBucketTypes;
      readonly endValue: AllowedBucketTypes;
    };

/**
 * Minimal geo-point shape used by ontology data-value mappings.
 *
 * @since 0.0.0
 * @category models
 */
export interface GeoPoint {
  readonly type: "Point";
  readonly coordinates: readonly [number, number] | readonly [number, number, number];
}

/**
 * Generic geo-shape payload accepted by ontology wire contracts.
 *
 * @since 0.0.0
 * @category models
 */
export type GeoShape = Readonly<Record<string, unknown>>;

/**
 * Map from wire data value types to the client-facing runtime type.
 *
 * @since 0.0.0
 * @category models
 */
export interface DataValueWireToClient {
  readonly attachment: Attachment;
  readonly boolean: boolean;
  readonly byte: number;
  readonly datetime: string;
  readonly date: string;
  readonly decimal: string;
  readonly float: number;
  readonly double: number;
  readonly integer: number;
  readonly long: string;
  readonly marking: string;
  readonly null: null;
  readonly short: number;
  readonly string: string;
  readonly timestamp: string;
  readonly mediaReference: MediaReference;
  readonly twoDimensionalAggregation: Array<{
    readonly key: AllowedBucketKeyTypes;
    readonly value: AllowedBucketTypes;
  }>;
  readonly threeDimensionalAggregation: Array<{
    readonly key: AllowedBucketKeyTypes;
    readonly groups: Array<{
      readonly key: AllowedBucketKeyTypes;
      readonly value: AllowedBucketTypes;
    }>;
  }>;
  readonly struct: Readonly<Record<string, unknown>>;
  readonly set: ReadonlySet<unknown>;
  readonly objectType: string;
  readonly geohash: GeoPoint;
  readonly geoshape: GeoShape;
}

/**
 * Map from wire data value types to accepted client input types.
 *
 * @since 0.0.0
 * @category models
 */
export interface DataValueClientToWire {
  readonly attachment: string | AttachmentUpload | (Blob & { readonly name: string });
  readonly boolean: boolean;
  readonly byte: number;
  readonly datetime: string;
  readonly date: string;
  readonly decimal: string | number;
  readonly float: number;
  readonly double: number;
  readonly integer: number;
  readonly long: string | number;
  readonly marking: string;
  readonly null: null;
  readonly short: number;
  readonly string: string;
  readonly timestamp: string;
  readonly set: ReadonlySet<unknown>;
  readonly mediaReference: MediaReference | MediaUpload;
  readonly twoDimensionalAggregation: Array<{
    readonly key: AllowedBucketKeyTypes;
    readonly value: AllowedBucketTypes;
  }>;
  readonly threeDimensionalAggregation: Array<{
    readonly key: AllowedBucketKeyTypes;
    readonly groups: Array<{
      readonly key: AllowedBucketKeyTypes;
      readonly value: AllowedBucketTypes;
    }>;
  }>;
  readonly struct: Readonly<Record<string, unknown>>;
  readonly objectType: string;
  readonly geohash: GeoPoint;
  readonly geoshape: GeoShape;
}
