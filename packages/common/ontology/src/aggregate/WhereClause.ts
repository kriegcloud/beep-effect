/**
 * Aggregate where-clause type system and property-to-filter mapping.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/WhereClause
 */
import type { DerivedObjectOrInterfaceDefinition, ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata, ObjectMetadata } from "../ontology/ObjectTypeDefinition.js";
import type { SimplePropertyDef } from "../ontology/SimplePropertyDef.js";
import type { BaseWirePropertyTypes } from "../ontology/WirePropertyTypes.js";
import type { ArrayFilter } from "./ArrayFilter.js";
import type { BaseFilter } from "./BaseFilter.js";
import type { BooleanFilter } from "./BooleanFilter.js";
import type { DatetimeFilter } from "./DatetimeFilter.js";
import type { GeoFilter } from "./GeoFilter.js";
import type { Just } from "./Just.js";
import type { NumberFilter } from "./NumberFilter.js";
import type { StringFilter } from "./StringFilter.js";

type IsNever<T> = [T] extends [never] ? true : false;

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
 * Supported where-clause filter operators.
 *
 * @since 0.0.0
 * @category models
 */
export type PossibleWhereClauseFilters =
  | "$gt"
  | "$eq"
  | "$ne"
  | "$isNull"
  | "$contains"
  | "$gte"
  | "$lt"
  | "$lte"
  | "$within"
  | "$in"
  | "$intersects"
  | "$startsWith"
  | "$containsAllTermsInOrder"
  | "$containsAnyTerm"
  | "$containsAllTerms";

type DistanceUnit = "CENTIMETERS" | "METERS" | "KILOMETERS" | "INCHES" | "FEET" | "YARDS" | "MILES" | "NAUTICAL_MILES";

// The value side matches the external DistanceUnit type without taking an additional dependency.
/**
 * Distance-unit alias map accepted by geo-distance filters.
 *
 * @since 0.0.0
 * @category constants
 */
export const DistanceUnitMapping: {
  centimeter: "CENTIMETERS";
  centimeters: "CENTIMETERS";
  cm: "CENTIMETERS";
  meter: "METERS";
  meters: "METERS";
  m: "METERS";
  kilometer: "KILOMETERS";
  kilometers: "KILOMETERS";
  km: "KILOMETERS";
  inch: "INCHES";
  inches: "INCHES";
  foot: "FEET";
  feet: "FEET";
  yard: "YARDS";
  yards: "YARDS";
  mile: "MILES";
  miles: "MILES";
  nautical_mile: "NAUTICAL_MILES";
  nauticalMile: "NAUTICAL_MILES";
  "nautical miles": "NAUTICAL_MILES";
} = {
  centimeter: "CENTIMETERS",
  centimeters: "CENTIMETERS",
  cm: "CENTIMETERS",
  meter: "METERS",
  meters: "METERS",
  m: "METERS",
  kilometer: "KILOMETERS",
  kilometers: "KILOMETERS",
  km: "KILOMETERS",
  inch: "INCHES",
  inches: "INCHES",
  foot: "FEET",
  feet: "FEET",
  yard: "YARDS",
  yards: "YARDS",
  mile: "MILES",
  miles: "MILES",
  nautical_mile: "NAUTICAL_MILES",
  nauticalMile: "NAUTICAL_MILES",
  "nautical miles": "NAUTICAL_MILES",
} satisfies Record<string, DistanceUnit>;

/**
 * `$within` geo filter shape.
 *
 * @since 0.0.0
 * @category models
 */
export type GeoFilter_Within = {
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
};

/**
 * `$intersects` geo filter shape.
 *
 * @since 0.0.0
 * @category models
 */
export type GeoFilter_Intersects = {
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
};

type BaseFilterFor<T> =
  T extends Record<string, BaseWirePropertyTypes>
    ? StructFilterOpts<T>
    : T extends "string"
      ? StringFilter
      : T extends "geopoint" | "geoshape"
        ? GeoFilter
        : T extends "datetime" | "timestamp"
          ? DatetimeFilter
          : T extends "boolean"
            ? BooleanFilter
            : T extends WhereClauseNumberPropertyTypes
              ? NumberFilter
              : BaseFilter<string>;

type FilterFor<PD extends ObjectMetadata.Property> = PD["multiplicity"] extends true
  ? ArrayFilter<BaseFilterFor<PD["type"]>>
  : PD["type"] extends Record<string, BaseWirePropertyTypes>
    ? StructFilter<PD["type"]> | BaseFilter.$isNull<string>
    : BaseFilterFor<PD["type"]>;

type StructFilterOpts<ST extends Record<string, BaseWirePropertyTypes>> = {
  [K in keyof ST]?: FilterFor<{ type: ST[K] }>;
};

type StructFilter<ST extends Record<string, BaseWirePropertyTypes>> = {
  [K in keyof ST]: Just<K, StructFilterOpts<ST>>;
}[keyof ST];

type WhereClauseNumberPropertyTypes = "double" | "integer" | "long" | "float" | "decimal" | "byte";

/**
 * Conjunctive where-clause node.
 *
 * @since 0.0.0
 * @category models
 */
export type AndWhereClause<
  T extends ObjectOrInterfaceDefinition,
  RDPs extends Record<string, SimplePropertyDef> = {},
> = {
  $and: Array<WhereClause<T, RDPs>>;
};

/**
 * Disjunctive where-clause node.
 *
 * @since 0.0.0
 * @category models
 */
export type OrWhereClause<
  T extends ObjectOrInterfaceDefinition,
  RDPs extends Record<string, SimplePropertyDef> = {},
> = {
  $or: Array<WhereClause<T, RDPs>>;
};

/**
 * Negated where-clause node.
 *
 * @since 0.0.0
 * @category models
 */
export type NotWhereClause<
  T extends ObjectOrInterfaceDefinition,
  RDPs extends Record<string, SimplePropertyDef> = {},
> = {
  $not: WhereClause<T, RDPs>;
};

/**
 * Property-level where-clause mapping for a definition.
 *
 * @since 0.0.0
 * @category models
 */
export type PropertyWhereClause<T extends ObjectOrInterfaceDefinition> = {
  [P in keyof CompileTimeMetadata<T>["properties"]]?: FilterFor<CompileTimeMetadata<T>["properties"][P]>;
};

type MergedPropertyWhereClause<
  T extends ObjectOrInterfaceDefinition,
  RDPs extends Record<string, SimplePropertyDef> = {},
> = PropertyWhereClause<DerivedObjectOrInterfaceDefinition.WithDerivedProperties<T, RDPs>>;

/**
 * Canonical where-clause union for aggregate APIs.
 *
 * @since 0.0.0
 * @category models
 */
export type WhereClause<T extends ObjectOrInterfaceDefinition, RDPs extends Record<string, SimplePropertyDef> = {}> =
  | OrWhereClause<T, RDPs>
  | AndWhereClause<T, RDPs>
  | NotWhereClause<T, RDPs>
  | (IsNever<keyof CompileTimeMetadata<T>["properties"]> extends true
      ? Record<string, never>
      : MergedPropertyWhereClause<T, RDPs>);
