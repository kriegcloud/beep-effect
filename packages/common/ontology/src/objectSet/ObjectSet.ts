/**
 * Object-set operation and composition contracts.
 *
 * @since 0.0.0
 * @module @beep/ontology/objectSet/ObjectSet
 */
import type { AggregateOpts } from "../aggregate/AggregateOpts.js";
import type { AggregateOptsThatErrorsAndDisallowsOrderingWithMultipleGroupBy } from "../aggregate/AggregateOptsThatErrors.js";
import type { AggregationsResults } from "../aggregate/AggregationsResults.js";
import type { WhereClause } from "../aggregate/WhereClause.js";
import type { DerivedProperty } from "../derivedProperties/DerivedProperty.js";
import type { PrimaryKeyType } from "../OsdkBase.js";
import type {
  ExtractAllPropertiesOption,
  ExtractOptions,
  ExtractRidOption,
  MaybeScore,
  Osdk,
} from "../OsdkObjectFrom.js";
import type {
  AsyncIterArgs,
  Augments,
  FetchPageArgs,
  NullabilityAdherence,
  ObjectSetArgs,
  SelectArg,
} from "../object/FetchPageArgs.js";
import type { Result } from "../object/Result.js";
import type { InterfaceDefinition } from "../ontology/InterfaceDefinition.js";
import type {
  DerivedObjectOrInterfaceDefinition,
  ObjectOrInterfaceDefinition,
  PropertyKeys,
} from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata, ObjectTypeDefinition } from "../ontology/ObjectTypeDefinition.js";
import type { SimplePropertyDef } from "../ontology/SimplePropertyDef.js";
import type { PageResult } from "../PageResult.js";
import type { LinkedType, LinkNames } from "../util/LinkUtils.js";
import type { BaseObjectSet } from "./BaseObjectSet.js";
import type { LinkTypeApiNamesFor, MinimalDirectedObjectLinkInstance } from "./ObjectSetLinks.js";
import type { ObjectSetSubscription } from "./ObjectSetListener.js";
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("objectSet/ObjectSet");
type MergeObjectSet<
  Q extends ObjectOrInterfaceDefinition,
  D extends Record<string, SimplePropertyDef> = {},
> = DerivedObjectOrInterfaceDefinition.WithDerivedProperties<Q, D>;

type ExtractRdp<D extends BaseObjectSet<ObjectOrInterfaceDefinition> | Record<string, SimplePropertyDef>> = [
  D,
] extends [never]
  ? {}
  : D extends BaseObjectSet<ObjectOrInterfaceDefinition>
    ? {}
    : D extends Record<string, SimplePropertyDef>
      ? D
      : {};

type SubSelectKeysHelper<Q extends ObjectOrInterfaceDefinition, L extends string> = [L] extends [never]
  ? PropertyKeys<Q>
  : PropertyKeys<Q> extends L
    ? PropertyKeys<Q>
    : L & PropertyKeys<Q>;

type Extract$Select<X extends { readonly $select?: readonly string[] }> = NonNullable<X["$select"]>[number];

type SelectArgLike<Q extends ObjectOrInterfaceDefinition> = SelectArg<
  Q,
  PropertyKeys<Q>,
  boolean,
  NullabilityAdherence,
  string,
  boolean
>;

type SubSelectKeys<Q extends ObjectOrInterfaceDefinition, X extends SelectArgLike<Q> = never> = SubSelectKeysHelper<
  Q,
  Extract$Select<X>
>;

type AnyCallable = (...args: Array<unknown>) => unknown;
type AnyConstructor = abstract new (...args: Array<unknown>) => unknown;

type NOOP<T> = T extends AnyCallable ? T : T extends AnyConstructor ? T : { [K in keyof T]: T[K] };

type SelectLike = {
  readonly $select?: readonly string[];
};

type SubSelectRDPsHelper<X extends SelectLike, DEFAULT extends string> = [X] extends [never]
  ? DEFAULT
  : (X["$select"] & readonly string[])[number] & DEFAULT;

type SubSelectRDPs<RDPs extends Record<string, SimplePropertyDef>, X extends SelectLike> = [RDPs] extends [never]
  ? never
  : NOOP<{ [K in SubSelectRDPsHelper<X, string & keyof RDPs>]: RDPs[K] }>;

/**
 * Minimal object-set contract shared across object-set operations.
 *
 * @since 0.0.0
 * @category models
 */
export interface MinimalObjectSet<
  Q extends ObjectOrInterfaceDefinition,
  RDPs extends Record<string, SimplePropertyDef> = {},
  ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<PropertyKeys<Q>> = {},
> extends BaseObjectSet<Q>,
    FetchPage<Q, RDPs>,
    AsyncIter<Q, RDPs, ORDER_BY_OPTIONS>,
    Where<Q, RDPs>,
    AsyncIterLinks<Q> {}

type ExtractOptions2<X extends { readonly $includeRid?: boolean; readonly $includeAllBaseObjectProperties?: boolean }> =
  [X] extends [never]
    ? never
    :
        | ExtractRidOption<X["$includeRid"] extends true ? true : false>
        | ExtractAllPropertiesOption<X["$includeAllBaseObjectProperties"] extends true ? true : false>;

interface FetchPage<Q extends ObjectOrInterfaceDefinition, RDPs extends Record<string, SimplePropertyDef> = {}> {
  readonly fetchPage: FetchPageSignature<Q, RDPs>;
  readonly fetchPageWithErrors: FetchPageWithErrorsSignature<Q, RDPs>;
}

type ValidAsyncIterArgs<Q extends ObjectOrInterfaceDefinition, RDPs extends Record<string, SimplePropertyDef>> =
  | ObjectSetArgs.AsyncIter<Q, PropertyKeys<Q>, false, string & keyof RDPs>
  | AsyncIterArgs<Q, never, boolean, Augments, NullabilityAdherence, true, string & keyof RDPs>;

interface FetchPageSignature<
  Q extends ObjectOrInterfaceDefinition,
  RDPs extends Record<string, SimplePropertyDef> = {},
> {
  /**
   * Gets a page of objects of this type.
   */
  <
    L extends PropertyKeys<Q> | (string & keyof RDPs),
    R extends boolean,
    const A extends Augments,
    S extends NullabilityAdherence = NullabilityAdherence.Default,
    T extends boolean = false,
    ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<L> = {},
    PROPERTY_SECURITIES extends boolean = false,
  >(
    args?: FetchPageArgs<Q, L, R, A, S, T, never, ORDER_BY_OPTIONS, PROPERTY_SECURITIES>
  ): Promise<
    PageResult<
      MaybeScore<
        Osdk.Instance<
          Q,
          ExtractOptions<R, S, T, PROPERTY_SECURITIES>,
          NoInfer<SubSelectKeys<Q, NonNullable<typeof args>>>,
          SubSelectRDPs<RDPs, NonNullable<typeof args>>
        >,
        ORDER_BY_OPTIONS
      >
    >
  >;
}

interface NearestNeighbors<Q extends ObjectOrInterfaceDefinition> {
  /**
   * Finds nearest neighbors for a text/vector query on a vector property.
   */
  readonly nearestNeighbors: (
    query: string | number[],
    numNeighbors: number,
    property: PropertyKeys.Filtered<Q, "vector">
  ) => this;
}

interface FetchPageWithErrorsSignature<
  Q extends ObjectOrInterfaceDefinition,
  RDPs extends Record<string, SimplePropertyDef> = {},
  PROPERTY_SECURITIES extends boolean = false,
> {
  /**
   * Gets a page of objects of this type wrapped in `Result`.
   */
  <
    L extends PropertyKeys<Q> | (string & keyof RDPs),
    R extends boolean,
    const A extends Augments,
    S extends NullabilityAdherence = NullabilityAdherence.Default,
    T extends boolean = false,
    ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<L> = {},
  >(
    args?: FetchPageArgs<Q, L, R, A, S, T, never, ORDER_BY_OPTIONS, PROPERTY_SECURITIES>
  ): Promise<
    Result<
      PageResult<
        MaybeScore<
          Osdk.Instance<
            Q,
            ExtractOptions<R, S, T, PROPERTY_SECURITIES>,
            NoInfer<SubSelectKeys<Q, NonNullable<typeof args>>>,
            SubSelectRDPs<RDPs, NonNullable<typeof args>>
          >,
          ORDER_BY_OPTIONS
        >
      >
    >
  >;
}

interface Where<Q extends ObjectOrInterfaceDefinition, RDPs extends Record<string, SimplePropertyDef> = {}> {
  /**
   * Filters the object set using a where clause.
   */
  readonly where: (clause: WhereClause<MergeObjectSet<Q, RDPs>>) => this;
}

interface AsyncIterSignature<
  Q extends ObjectOrInterfaceDefinition,
  RDPs extends Record<string, SimplePropertyDef> = {},
  ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<PropertyKeys<Q>> = {},
  PROPERTY_SECURITIES extends boolean = false,
> {
  /**
   * Returns an async iterator over objects in this set.
   */
  <X extends ValidAsyncIterArgs<Q, RDPs> = never>(
    args?: X
  ): AsyncIterableIterator<
    MaybeScore<Osdk.Instance<Q, ExtractOptions2<X>, SubSelectKeys<Q, X>, SubSelectRDPs<RDPs, X>>, ORDER_BY_OPTIONS>
  >;

  /**
   * Returns an async iterator over objects in this set with full arg surface.
   */
  <
    L extends PropertyKeys<Q> | (string & keyof RDPs),
    R extends boolean,
    const A extends Augments,
    S extends NullabilityAdherence = NullabilityAdherence.Default,
    T extends boolean = false,
    LOCAL_ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<PropertyKeys<Q>> = {},
  >(
    args?: AsyncIterArgs<Q, L, R, A, S, T, never, LOCAL_ORDER_BY_OPTIONS, PROPERTY_SECURITIES>
  ): AsyncIterableIterator<
    MaybeScore<
      Osdk.Instance<
        Q,
        ExtractOptions<R, S, T, PROPERTY_SECURITIES>,
        NoInfer<SubSelectKeys<Q, NonNullable<typeof args>>>,
        SubSelectRDPs<RDPs, NonNullable<typeof args>>
      >,
      LOCAL_ORDER_BY_OPTIONS
    >
  >;
}

interface AsyncIter<
  Q extends ObjectOrInterfaceDefinition,
  RDPs extends Record<string, SimplePropertyDef> = {},
  ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<PropertyKeys<Q>> = {},
> {
  readonly asyncIter: AsyncIterSignature<Q, RDPs, ORDER_BY_OPTIONS>;
}

interface WithProperties<
  Q extends ObjectOrInterfaceDefinition = ObjectOrInterfaceDefinition,
  RDPs extends Record<string, SimplePropertyDef> = {},
> {
  readonly withProperties: <NEW extends Record<string, SimplePropertyDef>>(
    clause: { [K in keyof NEW]: DerivedProperty.Creator<Q, NEW[K]> }
  ) => ObjectSet<
    Q,
    {
      [NN in keyof NEW | keyof RDPs]: NN extends keyof NEW ? NEW[NN] : NN extends keyof RDPs ? RDPs[NN] : never;
    }
  >;
}

/**
 * Canonical object-set contract.
 *
 * @since 0.0.0
 * @category models
 */
export interface ObjectSet<
  Q extends ObjectOrInterfaceDefinition = ObjectOrInterfaceDefinition,
  UNUSED_OR_RDP extends BaseObjectSet<Q> | Record<string, SimplePropertyDef> = never,
> extends ObjectSetCleanedTypes<Q, ExtractRdp<UNUSED_OR_RDP>, MergeObjectSet<Q, ExtractRdp<UNUSED_OR_RDP>>> {}

interface Aggregate<Q extends ObjectOrInterfaceDefinition> {
  /**
   * Aggregates over selected fields with optional grouping.
   */
  readonly aggregate: <AO extends AggregateOpts<Q>>(
    req: AggregateOptsThatErrorsAndDisallowsOrderingWithMultipleGroupBy<Q, AO>
  ) => Promise<AggregationsResults<Q, AO>>;
}

interface SetArithmetic<Q extends ObjectOrInterfaceDefinition> {
  /** Unions object sets together. */
  readonly union: (...objectSets: ReadonlyArray<CompileTimeMetadata<Q>["objectSet"]>) => this;

  /** Intersects object sets together. */
  readonly intersect: (...objectSets: ReadonlyArray<CompileTimeMetadata<Q>["objectSet"]>) => this;

  /** Subtracts object sets from this set. */
  readonly subtract: (...objectSets: ReadonlyArray<CompileTimeMetadata<Q>["objectSet"]>) => this;
}

interface PivotTo<Q extends ObjectOrInterfaceDefinition> {
  /** Pivots to a linked object-set type. */
  readonly pivotTo: <L extends LinkNames<Q>>(type: L) => ObjectSet<LinkedType<Q, L>>;
}

interface FetchOneSignature<Q extends ObjectTypeDefinition, RDPs extends Record<string, SimplePropertyDef>> {
  /** Fetches one object by primary key. */
  <
    const L extends PropertyKeys<Q> | (string & keyof RDPs),
    const R extends boolean,
    const S extends false | "throw" = NullabilityAdherence.Default,
    PROPERTY_SECURITIES extends boolean = false,
  >(
    primaryKey: PrimaryKeyType<Q>,
    options?: SelectArg<Q, L, R, S, never, PROPERTY_SECURITIES>
  ): Promise<
    Osdk.Instance<
      Q,
      ExtractOptions<R, S, false, PROPERTY_SECURITIES>,
      NoInfer<SubSelectKeys<Q, { $select: Array<L> }>>,
      SubSelectRDPs<RDPs, { $select: Array<L> }>
    >
  >;
}

interface FetchOneWithErrorsSignature<Q extends ObjectTypeDefinition, RDPs extends Record<string, SimplePropertyDef>> {
  /** Fetches one object by primary key wrapped in `Result`. */
  <
    const L extends PropertyKeys<Q> | (string & keyof RDPs),
    const R extends boolean,
    const S extends false | "throw" = NullabilityAdherence.Default,
    PROPERTY_SECURITIES extends boolean = false,
  >(
    primaryKey: PrimaryKeyType<Q>,
    options?: SelectArg<Q, L, R, S, never, PROPERTY_SECURITIES>
  ): Promise<
    Result<
      Osdk.Instance<
        Q,
        ExtractOptions<R, S, false, PROPERTY_SECURITIES>,
        NoInfer<SubSelectKeys<Q, { $select: Array<L> }>>,
        SubSelectRDPs<RDPs, { $select: Array<L> }>
      >
    >
  >;
}

interface FetchOne<Q extends ObjectOrInterfaceDefinition, RDPs extends Record<string, SimplePropertyDef>> {
  readonly fetchOne: Q extends ObjectTypeDefinition ? FetchOneSignature<Q, RDPs> : never;
  readonly fetchOneWithErrors: Q extends ObjectTypeDefinition ? FetchOneWithErrorsSignature<Q, RDPs> : never;
}

interface Subscribe<Q extends ObjectOrInterfaceDefinition> {
  /**
   * Subscribes to change events for this object set.
   */
  readonly subscribe: <const P extends PropertyKeys<Q>, const R extends boolean = false>(
    listener: ObjectSetSubscription.Listener<Q, P, R>,
    opts?: ObjectSetSubscription.Options<Q, P, R>
  ) => { unsubscribe: () => void };
}

interface NarrowToType<Q extends ObjectOrInterfaceDefinition> {
  /**
   * Narrows this object set to a specific implementing object/interface type.
   */
  readonly narrowToType: <CONVERT_TO extends RestrictToImplementingObjectTypes<Q>>(
    type: CONVERT_TO
  ) => ObjectSet<CONVERT_TO>;
}

type RestrictToImplementingObjectTypes<T extends ObjectOrInterfaceDefinition> = T extends ObjectTypeDefinition
  ? ExtractImplementedInterfaces<T>
  : T extends InterfaceDefinition
    ? ExtractImplementingTypes<T>
    : never;

type ExtractImplementedInterfaces<T extends ObjectTypeDefinition> =
  CompileTimeMetadata<T> extends {
    implements: ReadonlyArray<infer API_NAME>;
  }
    ? API_NAME extends string
      ? InterfaceDefinition & { apiName: API_NAME }
      : never
    : never;

type ExtractImplementingTypes<T extends InterfaceDefinition> =
  CompileTimeMetadata<T> extends {
    implementedBy: ReadonlyArray<infer API_NAME extends string>;
  }
    ? (ObjectTypeDefinition & { apiName: API_NAME }) | InterfaceDefinition
    : InterfaceDefinition;

interface AsyncIterLinks<Q extends ObjectOrInterfaceDefinition> {
  /**
   * Batch-load links from this object set.
   */
  readonly experimental_asyncIterLinks: <LINK_TYPE_API_NAME extends LinkTypeApiNamesFor<Q>>(
    links: LINK_TYPE_API_NAME[]
  ) => AsyncIterableIterator<MinimalDirectedObjectLinkInstance<Q, LINK_TYPE_API_NAME>>;
}

interface ObjectSetCleanedTypes<
  Q extends ObjectOrInterfaceDefinition,
  D extends Record<string, SimplePropertyDef>,
  MERGED extends ObjectOrInterfaceDefinition & Q,
  ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<PropertyKeys<Q>> = {},
> extends MinimalObjectSet<Q, D, ORDER_BY_OPTIONS>,
    WithProperties<Q, D>,
    Aggregate<MERGED>,
    SetArithmetic<MERGED>,
    PivotTo<Q>,
    FetchOne<Q, D>,
    Subscribe<MERGED>,
    NearestNeighbors<Q>,
    NarrowToType<Q> {}
