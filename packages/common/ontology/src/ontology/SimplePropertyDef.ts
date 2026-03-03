/**
 * Simplified ontology property definition helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/SimplePropertyDef
 */
import type { GetClientPropertyValueFromWire } from "../mapping/PropertyValueMapping.js";
import type { ObjectMetadata, PropertyDef } from "./ObjectTypeDefinition.js";
import type { WirePropertyTypes } from "./WirePropertyTypes.js";
/**
 * Compact property definition shorthand used by generated ontology surfaces.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SimplePropertyDef = WirePropertyTypes | undefined | Array<WirePropertyTypes>;

/**
 * Type-level helpers for converting compact property definitions.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace SimplePropertyDef {
  /**
   * Build a compact property definition from explicit base/nullable/multiplicity traits.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type Make<
    T extends WirePropertyTypes,
    N extends "nullable" | "non-nullable",
    M extends "array" | "single",
  > = M extends "array"
    ? N extends "nullable"
      ? Array<T> | undefined
      : Array<T>
    : N extends "nullable"
      ? T | undefined
      : T;

  /**
   * Convert full property metadata to the compact shorthand.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type FromPropertyMetadata<P extends ObjectMetadata.Property> = Make<
    P["type"],
    P["nullable"] extends true ? "nullable" : "non-nullable",
    P["multiplicity"] extends true ? "array" : "single"
  >;

  /**
   * Extract multiplicity marker from compact shorthand.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ExtractMultiplicity<T extends WirePropertyTypes | undefined | Array<WirePropertyTypes>> =
    NonNullable<T> extends Array<unknown> ? "array" : "single";

  /**
   * Extract wire property type from compact shorthand.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ExtractWirePropertyType<T extends SimplePropertyDef> =
    T extends Array<infer Z> ? NonNullable<Z> : NonNullable<T>;

  /**
   * Extract nullable marker from compact shorthand.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ExtractNullable<T extends SimplePropertyDef> = [undefined] extends [T]
    ? "nullable"
    : [[undefined]] extends [T]
      ? "nullable"
      : "non-nullable";

  /**
   * Convert compact shorthand into the canonical property definition type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ToPropertyDef<S extends SimplePropertyDef> = PropertyDef<
    ExtractWirePropertyType<S>,
    ExtractNullable<S>,
    ExtractMultiplicity<S>
  >;

  /**
   * Extract client runtime scalar/object value type from wire shorthand.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ExtractRuntimeBaseType<S extends SimplePropertyDef> = GetClientPropertyValueFromWire<
    ExtractWirePropertyType<S>
  >;

  /**
   * Convert compact shorthand into runtime property shape.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ToRuntimeProperty<S extends SimplePropertyDef> =
    ExtractMultiplicity<S> extends "array"
      ? ExtractNullable<S> extends "nullable"
        ? Array<ExtractRuntimeBaseType<S>> | undefined
        : Array<ExtractRuntimeBaseType<S>>
      : ExtractNullable<S> extends "nullable"
        ? ExtractRuntimeBaseType<S> | undefined
        : ExtractRuntimeBaseType<S>;
}
