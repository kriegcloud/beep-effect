/* Query Interfaces - Queryable */
/* https://rdf.js.org/query-spec/ */

import * as RDF from '../data-model';
import { Bindings, Query, ResultStream } from './common';

/**
 * Context properties provide a way to pass additional bits information to the query engine when executing a query.
 */
export interface QueryContext {
  /**
   * The date that should be used by SPARQL operations such as NOW().
   */
  queryTimestamp?: Date;
  /**
   * Other options
   */
  [key: string]: any;
}

/**
 * Context properties in the case the passed query is a string.
 */
export interface QueryStringContext extends QueryContext {
  /**
   * The format in which the query string is defined.
   * Defaults to { language: 'sparql', version: '1.1' }
   */
  queryFormat?: QueryFormat;
  /**
   * The baseIRI for parsing the query.
   */
  baseIRI?: string;
}

/**
 * Context properties in the case the passed query is an algebra object.
 */
export type QueryAlgebraContext = QueryContext;

/**
 * Context properties for engines that can query upon dynamic sets of sources.
 */
export interface QuerySourceContext<SourceType> {
  /**
   * An array of data sources the query engine must use.
   */
  sources: [SourceType, ...SourceType[]];
}

/**
 * Represents a specific query format
 */
export interface QueryFormat {
  /**
   * The query language, e.g. 'sparql'.
   */
  language: string;
  /**
   * The version of the query language, e.g. '1.1'.
   */
  version: string;
  /**
   * An optional array of extensions on the query language.
   * The representation of these extensions is undefined.
   */
  extensions?: string[];
}

/**
 * Generic query engine interfaces.
 * It allow engines to return any type of result object for string queries.
 * @param SupportedMetadataType The allowed metadata types.
 * @param QueryStringContextType Type of the string-based query context.
 */
export interface StringQueryable<
  SupportedMetadataType,
  QueryStringContextType extends QueryStringContext = QueryStringContext,
> {
  /**
   * Initiate a given query provided as a string.
   *
   * This will produce a future to a query result, which has to be executed to obtain the query results.
   *
   * This can reject given an unsupported or invalid query.
   *
   * @see Query
   */
  query(query: string, context?: QueryStringContextType): Promise<Query<SupportedMetadataType>>;
}

/**
 * Generic query engine interfaces.
 * It allow engines to return any type of result object for Algebra queries.
 * @param AlgebraType The supported algebra types.
 * @param SupportedMetadataType The allowed metadata types.
 * @param QueryStringContextType Type of the algebra-based query context.
 */
 export interface AlgebraQueryable<
 AlgebraType,
 SupportedMetadataType,
 QueryAlgebraContextType extends QueryAlgebraContext = QueryAlgebraContext,
> {
 /**
  * Initiate a given query provided as an Algebra object.
  *
  * This will produce a future to a query result, which has to be executed to obtain the query results.
  *
  * This can reject given an unsupported or invalid query.
  *
  * @see Query
  */
 query(query: AlgebraType, context?: QueryAlgebraContextType): Promise<Query<SupportedMetadataType>>;
}

/**
 * SPARQL-constrained query interface for queries provided as strings.
 *
 * This interface guarantees that result objects are of the expected type as defined by the SPARQL spec.
 */
export type StringSparqlQueryable<SupportedResultType, QueryStringContextType extends QueryStringContext = QueryStringContext> = unknown
  & (SupportedResultType extends BindingsResultSupport ? {
  queryBindings(query: string, context?: QueryStringContextType): Promise<ResultStream<Bindings>>;
} : unknown)
  & (SupportedResultType extends BooleanResultSupport ? {
  queryBoolean(query: string, context?: QueryStringContextType): Promise<boolean>;
} : unknown)
  & (SupportedResultType extends QuadsResultSupport ? {
  queryQuads(query: string, context?: QueryStringContextType): Promise<ResultStream<RDF.Quad>>;
} : unknown)
  & (SupportedResultType extends VoidResultSupport ? {
  queryVoid(query: string, context?: QueryStringContextType): Promise<void>;
} : unknown)
;

/**
 * SPARQL-constrainted query interface for queries provided as Algebra objects.
 *
 * This interface guarantees that result objects are of the expected type as defined by the SPARQL spec.
 */
 export type AlgebraSparqlQueryable<AlgebraType, SupportedResultType, QueryAlgebraContextType extends QueryAlgebraContext = QueryAlgebraContext> = unknown
 & (SupportedResultType extends BindingsResultSupport ? {
 queryBindings(query: AlgebraType, context?: QueryAlgebraContextType): Promise<ResultStream<Bindings>>;
} : unknown)
 & (SupportedResultType extends BooleanResultSupport ? {
 queryBoolean(query: AlgebraType, context?: QueryAlgebraContextType): Promise<boolean>;
} : unknown)
 & (SupportedResultType extends QuadsResultSupport ? {
 queryQuads(query: AlgebraType, context?: QueryAlgebraContextType): Promise<ResultStream<RDF.Quad>>;
} : unknown)
 & (SupportedResultType extends VoidResultSupport ? {
 queryVoid(query: AlgebraType, context?: QueryAlgebraContextType): Promise<void>;
} : unknown)
;

export type SparqlResultSupport = BindingsResultSupport & VoidResultSupport & QuadsResultSupport & BooleanResultSupport;
export type BindingsResultSupport = { bindings: true };
export type VoidResultSupport = { void: true };
export type QuadsResultSupport = { quads: true };
export type BooleanResultSupport = { boolean: true };
