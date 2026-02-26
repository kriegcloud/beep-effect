/**
 * Geospatial-property filter primitives.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/GeoFilter
 */
import type { Just } from "./Just.js";
import type { DistanceUnitMapping } from "./WhereClause.js";

type BBox = [number, number, number, number] | [number, number, number, number, number, number];

type Position = [number, number] | [number, number, number];

interface Point {
  readonly type: "Point";
  readonly coordinates: Position;
  readonly bbox?: BBox;
}

interface Polygon {
  readonly type: "Polygon";
  readonly coordinates: ReadonlyArray<ReadonlyArray<Position>>;
  readonly bbox?: BBox;
}

/**
 * Geo filter option surface.
 *
 * @since 0.0.0
 * @category models
 */
export interface GeoFilterOptions {
  $within:
    | {
        $distance: [number, keyof typeof DistanceUnitMapping];
        $of: [number, number] | Readonly<Point>;
        $bbox?: never;
        $polygon?: never;
      }
    | {
        $bbox: BBox;
        $distance?: never;
        $of?: never;
        $polygon?: never;
      }
    | BBox
    | {
        $polygon: Polygon["coordinates"];
        $bbox?: never;
        $distance?: never;
        $of?: never;
      }
    | Polygon;
  $intersects:
    | {
        $bbox: BBox;
        $polygon?: never;
      }
    | BBox
    | {
        $polygon: Polygon["coordinates"];
        $bbox?: never;
      }
    | Polygon;
  $isNull: boolean;
}

/**
 * Geo filter discriminators.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace GeoFilter {
  /** @since 0.0.0 */
  export interface $within extends Just<"$within", GeoFilterOptions> {}
  /** @since 0.0.0 */
  export interface $intersects extends Just<"$intersects", GeoFilterOptions> {}
  /** @since 0.0.0 */
  export interface $isNull extends Just<"$isNull", GeoFilterOptions> {}
}

/**
 * Canonical geo filter union.
 *
 * @since 0.0.0
 * @category models
 */
export type GeoFilter = GeoFilter.$within | GeoFilter.$intersects | GeoFilter.$isNull;
