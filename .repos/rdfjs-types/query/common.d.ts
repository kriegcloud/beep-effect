/* Query Interfaces - Common */
/* https://rdf.js.org/query-spec/ */

import { EventEmitter } from "events";
import * as RDF from '../data-model';

/**
 * Helper union type for triple term names.
 */
export type TripleTermName = 'subject' | 'predicate' | 'object';

/**
 * Helper union type for quad term names.
 */
export type QuadTermName = TripleTermName | 'graph';

// TODO: merge this with Stream upon the next major change
/**
 * Custom typings for the RDF/JS ResultStream interface as the current
 * typings restrict the generic param Q to extensions of "BaseQuad",
 * meaning it cannot be used for Bindings.
 */
export interface ResultStream<Q> extends EventEmitter {
  read(): Q | null;
}

/**
 * QueryOperationCost represents the cost of a given query operation.
 */
export interface QueryOperationCost {
  /**
   * An estimation of how many iterations over items are executed.
   * This is used to determine the CPU cost.
   */
  iterations: number;
  /**
   * An estimation of how many items are stored in memory.
   * This is used to determine the memory cost.
   */
  persistedItems: number;
  /**
   * An estimation of how many items block the stream.
   * This is used to determine the time the stream is not progressing anymore.
   */
  blockingItems: number;
  /**
   * An estimation of the time to request items from sources.
   * This is used to determine the I/O cost.
   */
  requestTime: number;
  /**
   * Custom properties
   */
  [key: string]: any;
}

/**
 * QueryOperationOrder represents an ordering of the results of a given query operation.
 *
 * These objects can represent orderings of both quad and bindings streams,
 * respectively identified by quad term names and variables.
 */
export interface QueryOperationOrder<T extends QuadTermName | RDF.Variable> {
  cost: QueryOperationCost;
  terms: { term: T, direction: 'asc' | 'desc' }[];
}

/**
 * QueryResultCardinality represents the number of results, which can either be an estimate or exact value.
 */
export interface QueryResultCardinality {
  /**
   * indicates the type of counting that was done, and MUST either be "estimate" or "exact".
   */
  type: 'estimate' | 'exact';

  /**
   * Indicates an estimated of the number of results in the stream if type = "estimate",
   * or the exact number of results in the stream if type = "exact".
   */
  value: number;
}

/**
 * BaseMetadataQuery is helper interface that provides a metadata callback.
 */
interface BaseMetadataQuery<OrderItemsType extends QuadTermName | RDF.Variable, AdditionalMetadataType extends unknown, SupportedMetadataType> {
  /**
   * Asynchronously return metadata of the current result.
   */
  metadata<M extends MetadataOpts<SupportedMetadataType>>(opts?: M): Promise<ConditionalMetadataType<AdditionalMetadataType, M, OrderItemsType>>;
}

export type AllMetadataSupport = CardinalityMetadataSupport & OrderMetadataSupport & AvailableOrdersMetadataSupport;
export type CardinalityMetadataSupport = { cardinality: true };
export type OrderMetadataSupport = { order: true };
export type AvailableOrdersMetadataSupport = { availableOrders: true };

export type MetadataOpts<SupportedMetadataType> =
  (SupportedMetadataType extends CardinalityMetadataSupport ? CardinalityMetadataOpts : unknown) |
  (SupportedMetadataType extends OrderMetadataSupport ? OrderMetadataOpts : unknown) |
  (SupportedMetadataType extends AvailableOrdersMetadataSupport ? AvailableOrdersMetadataOpts : unknown);
export interface CardinalityMetadataOpts { cardinality: 'estimate' | 'exact'; }
export interface OrderMetadataOpts { order: true; }
export interface AvailableOrdersMetadataOpts { availableOrders: true; }

export type ConditionalMetadataType<AdditionalMetadataType, M, OrderItemsType extends QuadTermName | RDF.Variable> = AdditionalMetadataType
  & (M extends CardinalityMetadataOpts ? { cardinality: QueryResultCardinality } : Record<string, unknown>)
  & (M extends OrderMetadataOpts ? { order: QueryOperationOrder<OrderItemsType>['terms'] } : Record<string, unknown>)
  & (M extends AvailableOrdersMetadataOpts ? { availableOrders: QueryOperationOrder<OrderItemsType>[] } : Record<string, unknown>);

/**
 * Options that can be passed when executing a query.
 */
export interface QueryExecuteOptions<OrderItemsType extends QuadTermName | RDF.Variable> {
  /**
   * The required order for the result stream.
   */
  order?: QueryOperationOrder<OrderItemsType>;

  /**
   * Custom properties
   */
  [key: string]: any;
}

/**
 * Generic interface that defines query objects following the Future pattern.
 */
export interface BaseQuery {
  /**
   * Identifier for the type of result of tis query.
   */
  resultType: string;

  /**
   * Returns either a stream containing all the items that match the given query,
   * a boolean or void depending on the semantics of the given query.
   */
  execute(opts?: any): Promise<ResultStream<any> | boolean | void>;
}

/**
 * Query object that returns bindings.
 */
export interface QueryBindings<SupportedMetadataType> extends BaseQuery, BaseMetadataQuery<RDF.Variable, { variables: RDF.Variable[] }, SupportedMetadataType> {
  resultType: 'bindings';
  execute(opts?: QueryExecuteOptions<RDF.Variable>): Promise<ResultStream<Bindings>>;
}

/**
 * Query object that returns quads.
 */
export interface QueryQuads<SupportedMetadataType> extends BaseQuery, BaseMetadataQuery<QuadTermName, unknown, SupportedMetadataType> {
  resultType: 'quads';
  execute(opts?: QueryExecuteOptions<QuadTermName>): Promise<ResultStream<RDF.Quad>>;
}

/**
 * Query object that returns a boolean.
 */
export interface QueryBoolean extends BaseQuery {
  resultType: 'boolean';
  execute(): Promise<boolean>;
}

/**
 * Query object that returns void.
 */
export interface QueryVoid extends BaseQuery {
  resultType: 'void';
  execute(): Promise<void>;
}

/**
 * Union type for the different query types.
 */
export type Query<SupportedMetadataType> = QueryBindings<SupportedMetadataType> | QueryBoolean | QueryQuads<SupportedMetadataType> | QueryVoid;

/**
 * Bindings represents the mapping of variables to RDF values using an immutable Map-like representation.
 * This means that methods such as `set` and `delete` do not modify this instance,
 * but they return a new Bindings instance that contains the modification.
 *
 * Bindings instances are created using a BindingsFactory.
 *
 * The internal order of variable-value entries is undefined.
 */
export interface Bindings extends Iterable<[RDF.Variable, RDF.Term]> {
  type: 'bindings';
  /**
   * Check if a binding exist for the given variable.
   * @param key A variable term or string. If it is a string, no `?` prefix must be given.
   */
  has: (key: RDF.Variable | string) => boolean;
  /**
   * Obtain the binding value for the given variable.
   * @param key A variable term or string. If it is a string, no `?` prefix must be given.
   */
  get: (key: RDF.Variable | string) => RDF.Term | undefined;
  /**
   * Create a new Bindings object by adding the given variable and value mapping.
   *
   * If the variable already exists in the binding, then the existing mapping is overwritten.
   *
   * @param key The variable key term or string. If it is a string, no `?` prefix must be given.
   * @param value The value.
   */
  set: (key: RDF.Variable | string, value: RDF.Term) => Bindings;
  /**
   * Create a new Bindings object by removing the given variable.
   *
   * If the variable does not exist in the binding, a copy of the Bindings object is returned.
   *
   * @param key The variable key term or string. If it is a string, no `?` prefix must be given.
   */
  delete: (key: RDF.Variable | string) => Bindings;
  /**
   * Obtain all variables for which mappings exist.
   */
  keys: () => Iterable<RDF.Variable>;
  /**
   * Obtain all values that are mapped to.
   */
  values: () => Iterable<RDF.Term>;
  /**
   * Iterate over all variable-value pairs.
   * @param fn A callback that is called for each variable-value pair
   *           with value as first argument, and variable as second argument.
   */
  forEach: (fn: (value: RDF.Term, key: RDF.Variable) => any) => void;
  /**
   * The number of variable-value pairs.
   */
  size: number;
  /**
   * Iterator over all variable-value pairs.
   */
  [Symbol.iterator]: () => Iterator<[RDF.Variable, RDF.Term]>;
  /**
   * Check if all entries contained in this Bindings object are equal to all entries in the other Bindings object.
   * @param other A Bindings object.
   */
  equals(other: Bindings | null | undefined): boolean;
  /**
   * Create a new Bindings object by filtering entries using a callback.
   * @param fn A callback that is applied on each entry.
   *           Returning true indicates that this entry must be contained in the resulting Bindings object.
   */
  filter: (fn: (value: RDF.Term, key: RDF.Variable) => boolean) => Bindings;
  /**
   * Create a new Bindings object by mapping entries using a callback.
   * @param fn A callback that is applied on each entry, in which the original value is replaced by the returned value.
   */
  map: (fn: (value: RDF.Term, key: RDF.Variable) => RDF.Term) => Bindings;
  /**
   * Merge this bindings with another.
   *
   * If a merge conflict occurs (this and other have an equal variable with unequal value),
   * then undefined is returned.
   *
   * @param other A Bindings object.
   */
  merge: (other: Bindings) => Bindings | undefined;
  /**
   * Merge this bindings with another, where merge conflicts can be resolved using a callback function.
   * @param merger A function that is invoked when a merge conflict occurs,
   *               for which the returned value is considered the merged value.
   * @param other A Bindings object.
   */
  mergeWith: (
    merger: (self: RDF.Term, other: RDF.Term, key: RDF.Variable) => RDF.Term,
    other: Bindings,
  ) => Bindings;
}

/**
 * BindingsFactory can create new instances of Bindings.
 */
export interface BindingsFactory {
  /**
   * Create a new Bindings object from the given variable-value entries.
   * @param entries An array of entries, where each entry is a tuple containing a variable and a term.
   */
  bindings: (entries?: [RDF.Variable, RDF.Term][]) => Bindings;

  /**
   * Create a copy of the given bindings object using this factory.
   * @param bindings A Bindings object.
   */
  fromBindings: (bindings: Bindings) => Bindings;
}
