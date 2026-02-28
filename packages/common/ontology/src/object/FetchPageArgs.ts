/**
 * Pagination argument models for ontology object fetch operations.
 *
 * @since 0.0.0
 * @module @beep/ontology/object/FetchPageArgs
 */

import { $OntologyId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata } from "../ontology/ObjectTypeDefinition.js";

const $I = $OntologyId.create("object/FetchPageArgs");
/**
 * Nullability handling strategy for query/object-fetch decoding.
 *
 * @since 0.0.0
 * @category models
 */
export const NullabilityAdherence = LiteralKit([false, "throw", "drop"]).annotate(
  $I.annote("NullabilityAdherence", {
    description: "Strategy for handling null values in query/object-fetch decoding.",
  })
);
/**
 * Type NullabilityAdherence {@link NullabilityAdherence}
 *
 * @since 0.0.0
 * @category models
 */
export type NullabilityAdherence = typeof NullabilityAdherence.Type;

/**
 * Types for {@link NullabilityAdherence}.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace NullabilityAdherence {
  /**
   * Default nullability strategy.
   *
   * @since 0.0.0
   * @category models
   */
  export type Default = "throw";
}

/**
 * Object-set argument building helpers.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace ObjectSetArgs {
  /**
   * Shared select options.
   *
   * @since 0.0.0
   * @category models
   */
  export interface Select<OBJECT_KEYS extends string = never, RDP_KEYS extends string = never> {
    readonly $select?: readonly (OBJECT_KEYS | RDP_KEYS)[];
    readonly $includeRid?: boolean;
  }

  /**
   * Ordering options for object-set operations.
   *
   * @since 0.0.0
   * @category models
   */
  export type OrderByOptions<L extends string> =
    | {
        readonly [K in L]?: "asc" | "desc";
      }
    | "relevance";

  /**
   * Shared order-by wrapper type.
   *
   * @since 0.0.0
   * @category models
   */
  export interface OrderBy<ORDER_BY_OPTIONS extends OrderByOptions<L>, L extends string = never> {
    readonly $orderBy?: ORDER_BY_OPTIONS;
  }

  /**
   * Async-iteration options for object-set operations.
   *
   * @since 0.0.0
   * @category models
   */
  export interface AsyncIter<
    Q extends ObjectOrInterfaceDefinition,
    K extends PropertyKeys<Q> = never,
    T extends boolean = false,
    RDP_KEYS extends string = never,
    ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<K> = never,
  > extends Select<K, RDP_KEYS>,
      OrderBy<ORDER_BY_OPTIONS, K> {
    readonly $__UNSTABLE_useOldInterfaceApis?: boolean;
    readonly $includeAllBaseObjectProperties?: PropertyKeys<Q> extends K ? T : never;
  }

  /**
   * Page-fetch options for object-set operations.
   *
   * @since 0.0.0
   * @category models
   */
  export interface FetchPage<
    Q extends ObjectOrInterfaceDefinition,
    K extends PropertyKeys<Q> = never,
    T extends boolean = false,
    RDP_KEYS extends string = never,
    ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<K> = never,
  > extends AsyncIter<Q, K, T, RDP_KEYS, ORDER_BY_OPTIONS> {
    readonly $nextPageToken?: string;
    readonly $pageSize?: number;
  }
}

/**
 * Shared select-argument contract.
 *
 * @since 0.0.0
 * @category models
 */
export interface SelectArg<
  Q extends ObjectOrInterfaceDefinition,
  L extends string = PropertyKeys<Q>,
  R extends boolean = false,
  S extends NullabilityAdherence = NullabilityAdherence.Default,
  RDP_KEYS extends string = never,
  PROPERTY_SECURITIES extends boolean = false,
> {
  readonly $select?: readonly L[];
  readonly $includeRid?: R;
  readonly $loadPropertySecurityMetadata?: PROPERTY_SECURITIES;
  readonly __selectArgTypeParams?: [S, RDP_KEYS] extends [never, never] ? never : never;
}

/**
 * Shared order-by argument contract.
 *
 * @since 0.0.0
 * @category models
 */
export interface OrderByArg<
  Q extends ObjectOrInterfaceDefinition,
  L extends string = PropertyKeys<Q>,
  ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<L> = never,
> extends ObjectSetArgs.OrderBy<ORDER_BY_OPTIONS, L> {}

type SelectArgKeyUnion<
  Q extends ObjectOrInterfaceDefinition,
  A extends SelectArg<Q, string, boolean, NullabilityAdherence, string, boolean>,
> =
  A extends SelectArg<
    Q,
    infer L extends string,
    infer _R extends boolean,
    infer _S extends NullabilityAdherence,
    infer _RDP extends string,
    infer _P extends boolean
  >
    ? L
    : never;

/**
 * Extract selected keys from a select-argument shape.
 *
 * @since 0.0.0
 * @category models
 */
export type SelectArgToKeys<
  Q extends ObjectOrInterfaceDefinition,
  A extends SelectArg<Q, string, boolean, NullabilityAdherence, string, boolean>,
> = [SelectArgKeyUnion<Q, A>] extends [never]
  ? PropertyKeys<Q>
  : A["$select"] extends readonly string[]
    ? A["$select"][number]
    : PropertyKeys<Q>;

/**
 * Pagination request arguments for object fetch operations.
 *
 * @since 0.0.0
 * @category models
 */
export interface FetchPageArgs<
  Q extends ObjectOrInterfaceDefinition,
  K extends string = PropertyKeys<Q>,
  R extends boolean = false,
  A extends Augments = never,
  S extends NullabilityAdherence = NullabilityAdherence.Default,
  T extends boolean = false,
  RDP_KEYS extends string = never,
  ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<K> = {},
  PROPERTY_SECURITIES extends boolean = false,
> extends AsyncIterArgs<Q, K, R, A, S, T, RDP_KEYS, ORDER_BY_OPTIONS, PROPERTY_SECURITIES> {
  readonly $nextPageToken?: string;
  readonly $pageSize?: number;
}

/**
 * Async-iteration arguments for object fetch operations.
 *
 * @since 0.0.0
 * @category models
 */
export interface AsyncIterArgs<
  Q extends ObjectOrInterfaceDefinition,
  K extends string = PropertyKeys<Q>,
  R extends boolean = false,
  A extends Augments = never,
  S extends NullabilityAdherence = NullabilityAdherence.Default,
  T extends boolean = false,
  RDP_KEYS extends string = never,
  ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<K> = never,
  PROPERTY_SECURITIES extends boolean = false,
> extends SelectArg<Q, K, R, S, RDP_KEYS, PROPERTY_SECURITIES>,
    OrderByArg<Q, PropertyKeys<Q> | RDP_KEYS, ORDER_BY_OPTIONS> {
  readonly $__UNSTABLE_useOldInterfaceApis?: boolean;
  readonly $includeAllBaseObjectProperties?: PropertyKeys<Q> extends K ? T : never;
  readonly __asyncIterTypeParams?: [A] extends [never] ? never : never;
}

/**
 * Augment descriptor keyed by object/interface API name.
 *
 * @since 0.0.0
 * @category models
 */
export type Augment<X extends ObjectOrInterfaceDefinition, T extends string> = {
  readonly [K in CompileTimeMetadata<X>["apiName"]]: Array<T>;
};

/**
 * Generic augment map type.
 *
 * @since 0.0.0
 * @category models
 */
export type Augments = Record<string, Array<string>>;
