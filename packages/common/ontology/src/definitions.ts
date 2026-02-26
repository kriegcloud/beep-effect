/**
 * Shared property definition conversion helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/definitions
 */
import type { GetClientPropertyValueFromWire, GetCreatePropertyValueFromWire } from "./mapping/PropertyValueMapping.js";
import type { ObjectMetadata } from "./ontology/ObjectTypeDefinition.js";

type MaybeArray<T extends { readonly multiplicity?: boolean | undefined }, U> = T["multiplicity"] extends true
  ? Array<U>
  : U;

type MaybeNullable<T extends ObjectMetadata.Property, U> = T["nullable"] extends true ? U | undefined : U;

/**
 * Resolve client-read property type from object property metadata.
 *
 * @since 0.0.0
 * @category models
 */
export type OsdkObjectPropertyType<
  T extends ObjectMetadata.Property,
  STRICTLY_ENFORCE_NULLABLE extends boolean = true,
> = STRICTLY_ENFORCE_NULLABLE extends false
  ? MaybeArray<T, GetClientPropertyValueFromWire<T["type"]>> | undefined
  : MaybeNullable<T, MaybeArray<T, GetClientPropertyValueFromWire<T["type"]>>>;

/**
 * Resolve non-optional client-read property type from object property metadata.
 *
 * @since 0.0.0
 * @category models
 */
export type OsdkObjectPropertyTypeNotUndefined<T extends ObjectMetadata.Property> = MaybeArray<
  T,
  GetClientPropertyValueFromWire<T["type"]>
>;

/**
 * Resolve create-input property type from object property metadata.
 *
 * @since 0.0.0
 * @category models
 */
export type OsdkObjectCreatePropertyType<
  T extends ObjectMetadata.Property,
  STRICTLY_ENFORCE_NULLABLE extends boolean = true,
> = STRICTLY_ENFORCE_NULLABLE extends false
  ? MaybeArray<T, GetCreatePropertyValueFromWire<T["type"]>> | undefined
  : MaybeNullable<T, MaybeArray<T, GetCreatePropertyValueFromWire<T["type"]>>>;
