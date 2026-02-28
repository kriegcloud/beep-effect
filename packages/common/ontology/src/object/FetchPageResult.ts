/**
 * Pagination result type helpers for object-set and query flows.
 *
 * @since 0.0.0
 * @module @beep/ontology/object/FetchPageResult
 */

import type { ExtractOptions, IsNever, MaybeScore, Osdk } from "../OsdkObjectFrom.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "../ontology/ObjectOrInterface.js";
import type { SimplePropertyDef } from "../ontology/SimplePropertyDef.js";
import type { PageResult } from "../PageResult.js";
import type { NullabilityAdherence, ObjectSetArgs } from "./FetchPageArgs.js";
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("object/FetchPageResult");
/**
 * Resolve strict-nullability behavior from nullability adherence options.
 *
 * @since 0.0.0
 * @category models
 */
export type RespectNullability<S extends NullabilityAdherence> = S extends false ? false : true;

/**
 * Conditionally union an extra member when a condition is false.
 *
 * @since 0.0.0
 * @category models
 */
export type UnionIfFalse<S extends string, JUST_S_IF_TRUE extends boolean, E> =
  IsNever<S> extends true ? never : JUST_S_IF_TRUE extends true ? S : S | E;

/**
 * Conditionally union an extra member when a condition is true.
 *
 * @since 0.0.0
 * @category models
 */
export type UnionIfTrue<S extends string, UNION_IF_TRUE extends boolean, E extends string> =
  IsNever<S> extends true ? never : UNION_IF_TRUE extends true ? S | E : S;

/**
 * Type-level conversion from fetch-page args to paged OSDK instances.
 *
 * @since 0.0.0
 * @category models
 */
export type FetchPageResult<
  Q extends ObjectOrInterfaceDefinition,
  L extends PropertyKeys<Q>,
  R extends boolean,
  S extends NullabilityAdherence,
  T extends boolean = false,
  ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<L> = {},
> = PageResult<
  MaybeScore<Osdk.Instance<Q, ExtractOptions<R, S, T>, PropertyKeys<Q> extends L ? never : L>, ORDER_BY_OPTIONS>
>;

/**
 * Type-level conversion from single-object fetch args to an OSDK instance.
 *
 * @since 0.0.0
 * @category models
 */
export type SingleOsdkResult<
  Q extends ObjectOrInterfaceDefinition,
  L extends PropertyKeys<Q> | (keyof RDPs & string),
  R extends boolean,
  S extends NullabilityAdherence,
  RDPs extends Record<string, SimplePropertyDef> = {},
  T extends boolean = false,
  ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<L> = {},
> = MaybeScore<
  Osdk.Instance<
    Q,
    ExtractOptions<R, S, T>,
    PropertyKeys<Q> extends L ? PropertyKeys<Q> : PropertyKeys<Q> & L,
    { [K in Extract<keyof RDPs, L>]: RDPs[K] }
  >,
  ORDER_BY_OPTIONS
>;

/**
 * Detect whether a type is `any`.
 *
 * @since 0.0.0
 * @category models
 */
export type IsAny<T> = unknown extends T ? ([keyof T] extends [never] ? false : true) : false;
