/**
 * Derived-property builder and clause typing contracts.
 *
 * @since 0.0.0
 * @module @beep/ontology/derivedProperties/DerivedProperty
 */
import type { ValidAggregationKeys } from "../aggregate/AggregatableKeys.js";
import type { WhereClause } from "../aggregate/WhereClause.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata } from "../ontology/ObjectTypeDefinition.js";
import type { SimplePropertyDef } from "../ontology/SimplePropertyDef.js";
import type { LinkedType, LinkNames } from "../util/LinkUtils.js";
import type { DatetimeExpressions, DefinitionForType, NumericExpressions } from "./Expressions.js";
import type { CollectWithPropAggregations, MinMaxWithPropAggregateOption } from "./WithPropertiesAggregationOptions.js";

declare const DerivedPropertyDefinitionBrand: unique symbol;

/**
 * Derived-property type namespace.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export namespace DerivedProperty {
  /**
   * Marker type for all derived-property definitions.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export interface Definition<T extends SimplePropertyDef, Q extends ObjectOrInterfaceDefinition> {
    readonly [DerivedPropertyDefinitionBrand]: {
      readonly type: T;
      readonly definition: Q;
    };
  }

  /**
   * Numeric derived-property definition shape.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export interface NumericPropertyDefinition<T extends SimplePropertyDef, Q extends ObjectOrInterfaceDefinition>
    extends Definition<T, Q>,
      NumericExpressions<Q, T> {}

  /**
   * Datetime derived-property definition shape.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export interface DatetimePropertyDefinition<T extends SimplePropertyDef, Q extends ObjectOrInterfaceDefinition>
    extends Definition<T, Q>,
      DatetimeExpressions<Q, T> {}

  /**
   * Factory signature for a derived property.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type Creator<Q extends ObjectOrInterfaceDefinition, T extends SimplePropertyDef> = (
    baseObjectSet: Builder<Q, false>
  ) => Definition<T, Q> | NumericPropertyDefinition<T, Q> | DatetimePropertyDefinition<T, Q>;

  /**
   * Mapping from derived-property key to creator.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type Clause<Q extends ObjectOrInterfaceDefinition> = {
    [key: string]: Creator<Q, SimplePropertyDef>;
  };

  interface BaseBuilder<Q extends ObjectOrInterfaceDefinition, CONSTRAINED extends boolean>
    extends Filterable<Q, CONSTRAINED>,
      Pivotable<Q, CONSTRAINED> {}

  /**
   * Builder surface exposed to `withProperties` creators.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export interface Builder<Q extends ObjectOrInterfaceDefinition, CONSTRAINED extends boolean>
    extends BaseBuilder<Q, CONSTRAINED>,
      Selectable<Q>,
      Constant<Q> {}

  /**
   * Builder surface exposed for aggregate-only derived-property paths.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export interface AggregateBuilder<Q extends ObjectOrInterfaceDefinition, CONSTRAINED extends boolean>
    extends BaseBuilder<Q, CONSTRAINED>,
      Aggregatable<Q> {}

  /**
   * Builder surface exposed for select-property paths.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export interface SelectPropertyBuilder<Q extends ObjectOrInterfaceDefinition, CONSTRAINED extends boolean>
    extends AggregateBuilder<Q, CONSTRAINED>,
      Selectable<Q> {}

  /**
   * Supported datetime extraction parts.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ValidParts = "DAYS" | "MONTHS" | "QUARTERS" | "YEARS";
}

type BuilderTypeFromConstraint<
  Q extends ObjectOrInterfaceDefinition,
  CONSTRAINED extends boolean,
> = CONSTRAINED extends true
  ? DerivedProperty.AggregateBuilder<Q, true>
  : DerivedProperty.SelectPropertyBuilder<Q, false>;

type Filterable<Q extends ObjectOrInterfaceDefinition, CONSTRAINED extends boolean> = {
  readonly where: (clause: WhereClause<Q>) => BuilderTypeFromConstraint<Q, CONSTRAINED>;
};

type Pivotable<Q extends ObjectOrInterfaceDefinition, CONSTRAINED extends boolean> = {
  readonly pivotTo: <L extends LinkNames<Q>>(
    type: L
  ) => CONSTRAINED extends true
    ? DerivedProperty.AggregateBuilder<LinkedType<Q, L>, true>
    : NonNullable<CompileTimeMetadata<Q>["links"][L]["multiplicity"]> extends true
      ? DerivedProperty.AggregateBuilder<LinkedType<Q, L>, true>
      : DerivedProperty.SelectPropertyBuilder<LinkedType<Q, L>, false>;
};

type Constant<Q extends ObjectOrInterfaceDefinition> = {
  readonly constant: {
    readonly double: (
      value: number
    ) => DerivedProperty.NumericPropertyDefinition<SimplePropertyDef.Make<"double", "non-nullable", "single">, Q>;

    readonly integer: (
      value: number
    ) => DerivedProperty.NumericPropertyDefinition<SimplePropertyDef.Make<"integer", "non-nullable", "single">, Q>;

    readonly long: (
      value: string
    ) => DerivedProperty.NumericPropertyDefinition<SimplePropertyDef.Make<"long", "non-nullable", "single">, Q>;

    readonly datetime: (
      value: string
    ) => DerivedProperty.DatetimePropertyDefinition<SimplePropertyDef.Make<"datetime", "non-nullable", "single">, Q>;

    readonly timestamp: (
      value: string
    ) => DerivedProperty.DatetimePropertyDefinition<SimplePropertyDef.Make<"timestamp", "non-nullable", "single">, Q>;
  };
};

type Aggregatable<Q extends ObjectOrInterfaceDefinition> = {
  readonly aggregate: <V extends ValidAggregationKeys<Q, "withPropertiesAggregate">>(
    aggregationSpecifier: V,
    opts?: V extends `${string}:${infer P}`
      ? P extends CollectWithPropAggregations
        ? { limit: number }
        : P extends "approximatePercentile"
          ? { percentile: number }
          : never
      : never
  ) => DefinitionForType<
    Q,
    V extends `${infer N}:${infer P}`
      ? P extends CollectWithPropAggregations
        ? SimplePropertyDef.Make<CompileTimeMetadata<Q>["properties"][N]["type"], "nullable", "array">
        : P extends MinMaxWithPropAggregateOption
          ? SimplePropertyDef.Make<CompileTimeMetadata<Q>["properties"][N]["type"], "nullable", "single">
          : P extends "approximateDistinct" | "exactDistinct"
            ? SimplePropertyDef.Make<"integer", "non-nullable", "single">
            : SimplePropertyDef.Make<"double", "nullable", "single">
      : V extends "$count"
        ? SimplePropertyDef.Make<"integer", "non-nullable", "single">
        : never
  >;
};

type Selectable<Q extends ObjectOrInterfaceDefinition> = {
  readonly selectProperty: <R extends PropertyKeys<Q>>(
    propertyName: R
  ) => DefinitionForType<
    Q,
    SimplePropertyDef.Make<
      CompileTimeMetadata<Q>["properties"][R]["type"],
      CompileTimeMetadata<Q>["properties"][R]["nullable"] extends true ? "nullable" : "non-nullable",
      CompileTimeMetadata<Q>["properties"][R]["multiplicity"] extends true ? "array" : "single"
    >
  >;
};
