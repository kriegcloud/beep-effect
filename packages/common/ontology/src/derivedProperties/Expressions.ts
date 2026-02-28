/**
 * Derived-property expression builder type contracts.
 *
 * @since 0.0.0
 * @module @beep/ontology/derivedProperties/Expressions
 */
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata } from "../ontology/ObjectTypeDefinition.js";
import type { SimplePropertyDef } from "../ontology/SimplePropertyDef.js";
import type { WirePropertyTypes } from "../ontology/WirePropertyTypes.js";
import type { DerivedProperty } from "./DerivedProperty.js";

type WithPropertiesNumerics = "integer" | "double" | "float" | "short" | "long";
type WithPropertiesDatetime = "datetime" | "timestamp";

/**
 * Resolve the derived-property definition flavor for a property type.
 *
 * @since 0.0.0
 * @category models
 */
export type DefinitionForType<Q extends ObjectOrInterfaceDefinition, T extends SimplePropertyDef> =
  SimplePropertyDef.ExtractMultiplicity<T> extends "array"
    ? DerivedProperty.Definition<T, Q>
    : SimplePropertyDef.ExtractWirePropertyType<T> extends WithPropertiesNumerics
      ? DerivedProperty.NumericPropertyDefinition<T, Q>
      : SimplePropertyDef.ExtractWirePropertyType<T> extends WithPropertiesDatetime
        ? DerivedProperty.DatetimePropertyDefinition<T, Q>
        : DerivedProperty.Definition<T, Q>;

type NumericExpressionArg<Q extends ObjectOrInterfaceDefinition> =
  | number
  | DerivedProperty.NumericPropertyDefinition<SimplePropertyDef, Q>;

type ReturnTypeForNumericMethod<
  Q extends ObjectOrInterfaceDefinition,
  LEFT extends WirePropertyTypes,
  RIGHT extends WirePropertyTypes,
> = "double" extends LEFT | RIGHT
  ? DerivedProperty.NumericPropertyDefinition<SimplePropertyDef.Make<"double", "non-nullable", "single">, Q>
  : "float" extends LEFT | RIGHT
    ? DerivedProperty.NumericPropertyDefinition<SimplePropertyDef.Make<"double", "non-nullable", "single">, Q>
    : "long" extends LEFT | RIGHT
      ? DerivedProperty.NumericPropertyDefinition<SimplePropertyDef.Make<"long", "non-nullable", "single">, Q>
      : DerivedProperty.NumericPropertyDefinition<SimplePropertyDef.Make<"integer", "non-nullable", "single">, Q>;

type ReturnTypeForDatetimeMethod<
  Q extends ObjectOrInterfaceDefinition,
  LEFT extends WirePropertyTypes,
  RIGHT extends WirePropertyTypes,
> = "timestamp" extends LEFT | RIGHT
  ? DerivedProperty.DatetimePropertyDefinition<SimplePropertyDef.Make<"timestamp", "non-nullable", "single">, Q>
  : DerivedProperty.DatetimePropertyDefinition<SimplePropertyDef.Make<"datetime", "non-nullable", "single">, Q>;

type ExtractWirePropertyTypeFromNumericArg<
  Q extends ObjectOrInterfaceDefinition,
  ARG extends NumericExpressionArg<Q>,
> = ARG extends number
  ? "double"
  : ARG extends DerivedProperty.NumericPropertyDefinition<infer T, Q>
    ? T extends SimplePropertyDef
      ? SimplePropertyDef.ExtractWirePropertyType<T>
      : never
    : ARG extends PropertyKeys.Filtered<Q, WithPropertiesNumerics>
      ? NonNullable<CompileTimeMetadata<Q>["properties"][ARG]["type"]>
      : never;

/**
 * Numeric expression operations available on numeric derived properties.
 *
 * @since 0.0.0
 * @category models
 */
export type NumericExpressions<Q extends ObjectOrInterfaceDefinition, LEFT_PROPERTY_TYPE extends SimplePropertyDef> = {
  readonly add: <A extends NumericExpressionArg<Q>>(
    value: A
  ) => ReturnTypeForNumericMethod<
    Q,
    SimplePropertyDef.ExtractWirePropertyType<LEFT_PROPERTY_TYPE>,
    ExtractWirePropertyTypeFromNumericArg<Q, A>
  >;

  readonly subtract: <A extends NumericExpressionArg<Q>>(
    value: A
  ) => ReturnTypeForNumericMethod<
    Q,
    SimplePropertyDef.ExtractWirePropertyType<LEFT_PROPERTY_TYPE>,
    ExtractWirePropertyTypeFromNumericArg<Q, A>
  >;

  readonly multiply: <A extends NumericExpressionArg<Q>>(
    value: A
  ) => ReturnTypeForNumericMethod<
    Q,
    SimplePropertyDef.ExtractWirePropertyType<LEFT_PROPERTY_TYPE>,
    ExtractWirePropertyTypeFromNumericArg<Q, A>
  >;

  readonly divide: <A extends NumericExpressionArg<Q>>(
    value: A
  ) => ReturnTypeForNumericMethod<
    Q,
    SimplePropertyDef.ExtractWirePropertyType<LEFT_PROPERTY_TYPE>,
    ExtractWirePropertyTypeFromNumericArg<Q, A>
  >;

  readonly abs: () => DerivedProperty.NumericPropertyDefinition<LEFT_PROPERTY_TYPE, Q>;
  readonly negate: () => DerivedProperty.NumericPropertyDefinition<LEFT_PROPERTY_TYPE, Q>;

  readonly max: <A extends NumericExpressionArg<Q>>(
    value: A
  ) => ReturnTypeForNumericMethod<
    Q,
    SimplePropertyDef.ExtractWirePropertyType<LEFT_PROPERTY_TYPE>,
    ExtractWirePropertyTypeFromNumericArg<Q, A>
  >;

  readonly min: <A extends NumericExpressionArg<Q>>(
    value: A
  ) => ReturnTypeForNumericMethod<
    Q,
    SimplePropertyDef.ExtractWirePropertyType<LEFT_PROPERTY_TYPE>,
    ExtractWirePropertyTypeFromNumericArg<Q, A>
  >;
};

type DatetimeExpressionArg<Q extends ObjectOrInterfaceDefinition> = DerivedProperty.DatetimePropertyDefinition<
  SimplePropertyDef,
  Q
>;

type ExtractPropertyTypeFromDatetimeArg<Q extends ObjectOrInterfaceDefinition, ARG extends DatetimeExpressionArg<Q>> =
  ARG extends DerivedProperty.DatetimePropertyDefinition<infer T, Q>
    ? T extends SimplePropertyDef
      ? SimplePropertyDef.ExtractWirePropertyType<T>
      : never
    : ARG extends PropertyKeys.Filtered<Q, WithPropertiesDatetime>
      ? NonNullable<CompileTimeMetadata<Q>["properties"][ARG]["type"]>
      : never;

/**
 * Datetime expression operations available on datetime derived properties.
 *
 * @since 0.0.0
 * @category models
 */
export type DatetimeExpressions<Q extends ObjectOrInterfaceDefinition, LEFT_PROPERTY_TYPE extends SimplePropertyDef> = {
  readonly min: <A extends DatetimeExpressionArg<Q>>(
    value: A
  ) => ReturnTypeForDatetimeMethod<
    Q,
    SimplePropertyDef.ExtractWirePropertyType<LEFT_PROPERTY_TYPE>,
    ExtractPropertyTypeFromDatetimeArg<Q, A>
  >;

  readonly max: (
    value: DatetimeExpressionArg<Q>
  ) => ReturnTypeForDatetimeMethod<
    Q,
    SimplePropertyDef.ExtractWirePropertyType<LEFT_PROPERTY_TYPE>,
    ExtractPropertyTypeFromDatetimeArg<Q, typeof value>
  >;

  readonly extractPart: (
    value: DerivedProperty.ValidParts
  ) => DerivedProperty.Definition<SimplePropertyDef.Make<"string", "non-nullable", "single">, Q>;
};
