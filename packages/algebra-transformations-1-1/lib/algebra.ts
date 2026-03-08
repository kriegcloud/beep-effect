import type * as RDF from '@rdfjs/types';
import type { Typed, SubTyped } from '@traqula/core';

/**
 * Enum type listing the type strings for Traqula's SPARQL algebra operations.
 */
export enum Types {
  ASK = 'ask',
  BGP = 'bgp',
  CONSTRUCT = 'construct',
  DESCRIBE = 'describe',
  DISTINCT = 'distinct',
  EXPRESSION = 'expression',
  EXTEND = 'extend',
  FILTER = 'filter',
  FROM = 'from',
  GRAPH = 'graph',
  GROUP = 'group',
  JOIN = 'join',
  LEFT_JOIN = 'leftjoin',
  MINUS = 'minus',
  NOP = 'nop',
  ORDER_BY = 'orderby',
  PATTERN = 'pattern',
  PROJECT = 'project',
  REDUCED = 'reduced',
  SERVICE = 'service',
  SLICE = 'slice',
  UNION = 'union',
  VALUES = 'values',

  // Update
  COMPOSITE_UPDATE = 'compositeupdate',
  DELETE_INSERT = 'deleteinsert',
  LOAD = 'load',
  CLEAR = 'clear',
  CREATE = 'create',
  DROP = 'drop',
  ADD = 'add',
  MOVE = 'move',
  COPY = 'copy',

  // Paths
  PATH = 'path',
  ALT = 'alt',
  INV = 'inv',
  LINK = 'link',
  ONE_OR_MORE_PATH = 'OneOrMorePath',
  SEQ = 'seq',
  NPS = 'nps',
  ZERO_OR_MORE_PATH = 'ZeroOrMorePath',
  ZERO_OR_ONE_PATH = 'ZeroOrOnePath',
}

export enum ExpressionTypes {
  AGGREGATE = 'aggregate',
  EXISTENCE = 'existence',
  NAMED = 'named',
  OPERATOR = 'operator',
  TERM = 'term',
  WILDCARD = 'wildcard',
}

// ----------------------- OPERATIONS -----------------------
/**
 * Union type of all known SPARQL 1.1 operations.
 */
export type Operation = Ask | Expression | Bgp | Construct | Describe | Distinct | Extend | From | Filter
  | Graph | Group | Join | LeftJoin | Minus | Nop | OrderBy | Path | Pattern | Project | PropertyPathSymbol
  | Reduced | Service | Slice | Union | Values | Update | CompositeUpdate;

/**
 * Union type of all known SPARQL 1.1 expression operations.
 */
export type Expression = AggregateExpression | GroupConcatExpression | ExistenceExpression | NamedExpression |
  OperatorExpression | TermExpression | WildcardExpression | BoundAggregate;

/**
 * Union type of all known SPARQL 1.1 Property Path symbols.
 */
export type PropertyPathSymbol = Alt | Inv | Link | Nps | OneOrMorePath | Seq | ZeroOrMorePath | ZeroOrOnePath;

/**
 * Union type of all known SPARQL 1.1 update operations.
 */
export type Update = DeleteInsert | Load | Clear | Create | Drop | Add | Move | Copy;

/**
 * Returns the correct type based on the type enum
 */
export type TypedOperation<T extends Types> = Extract<Operation, { type: T }>;
/**
 * Returns the correct subType based on the type enum
 */
export type TypedExpression<T extends ExpressionTypes> = Extract<Expression, { subType: T }>;

// ----------------------- ABSTRACTS -----------------------

/**
 * All SPARQL operations are typed nodes, allowing them to be altered using the transformers in @traqula/core
 */
export interface BaseOperation extends Typed { }

/**
 * Open interface describing an expression
 */
export interface BaseExpression extends BaseOperation, SubTyped<Types.EXPRESSION> {
  type: Types.EXPRESSION;
  subType: string;
}

// ----------------------- ABSTRACTS -----------------------

/**
 * Algebra operation taking a single operation as input.
 */
export interface Single extends BaseOperation {
  input: Operation;
}

/**
 * Algebra operation taking multiple operations as input.
 */
export interface Multi extends BaseOperation {
  input: Operation[];
}

/**
 * Algebra operation taking exactly two input operations.
 */
export interface Double extends Multi {
  input: [Operation, Operation];
}

/**
 * [Aggregate Algebra expression](https://www.w3.org/TR/sparql11-query/#aggregateAlgebra)
 */
export interface AggregateExpression extends BaseExpression {
  subType: ExpressionTypes.AGGREGATE;
  aggregator: 'avg' | 'count' | 'group_concat' | 'max' | 'min' | 'sample' | 'sum';
  distinct: boolean;
  expression: Expression;
  separator?: string;
}

/**
 * @inheritDoc
 */
export interface GroupConcatExpression extends AggregateExpression {
  aggregator: 'group_concat';
  separator?: string;
}

/**
 * [Exists / Not Exists Algebra expression](https://www.w3.org/TR/sparql11-query/#defn_evalExists)
 */
export interface ExistenceExpression extends BaseExpression {
  subType: ExpressionTypes.EXISTENCE;
  not: boolean;
  input: Operation;
}

export interface NamedExpression extends BaseExpression {
  subType: ExpressionTypes.NAMED;
  name: RDF.NamedNode;
  args: Expression[];
}

export interface OperatorExpression extends BaseExpression {
  subType: ExpressionTypes.OPERATOR;
  operator: string;
  args: Expression[];
}

export interface TermExpression extends BaseExpression {
  subType: ExpressionTypes.TERM;
  term: RDF.Term;
}

export interface WildcardExpression extends BaseExpression {
  subType: ExpressionTypes.WILDCARD;
  wildcard: {
    type: 'wildcard';
  };
}

// TODO: currently not differentiating between lists and multisets

// ----------------------- ACTUAL FUNCTIONS -----------------------

/**
 * [Alternative Property Path algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalPP_alternative) representing the [Property path](https://www.w3.org/TR/sparql11-query/#propertypaths) alternative (`|`).
 * Property paths have a specific [SPARQL definition](https://www.w3.org/TR/sparql11-query/#sparqlPropertyPaths)
 */
export interface Alt extends Multi {
  type: Types.ALT;
  input: PropertyPathSymbol[];
}

export interface Ask extends Single {
  type: Types.ASK;
}

export interface Bgp extends BaseOperation {
  type: Types.BGP;
  patterns: Pattern[];
}

export interface Construct extends Single {
  type: Types.CONSTRUCT;
  template: Pattern[];
}

export interface Describe extends Single {
  type: Types.DESCRIBE;
  terms: (RDF.Variable | RDF.NamedNode)[];
}

/**
 * [Distinct algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalDistinct)
 */
export interface Distinct extends Single {
  type: Types.DISTINCT;
}

/**
 * [Extend algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalExtend)
 */
export interface Extend extends Single {
  type: Types.EXTEND;
  variable: RDF.Variable;
  expression: Expression;
}

export interface From extends Single {
  type: Types.FROM;
  default: RDF.NamedNode[];
  named: RDF.NamedNode[];
}

/**
 * [Filter algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalFilter)
 */
export interface Filter extends Single {
  type: Types.FILTER;
  expression: Expression;
}

/**
 * [Graph algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalGraph)
 */
export interface Graph extends Single {
  type: Types.GRAPH;
  name: RDF.Variable | RDF.NamedNode;
}

// Also an expression
export interface BoundAggregate extends AggregateExpression {
  variable: RDF.Variable;
}

/**
 * [Group algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalGroup)
 */
export interface Group extends Single {
  type: Types.GROUP;
  variables: RDF.Variable[];
  aggregates: BoundAggregate[];
}

/**
 * Algebra operation representing the [Property path](https://www.w3.org/TR/sparql11-query/#propertypaths) inverse (`^`).
 * Having a specific [SPARQL definition](https://www.w3.org/TR/sparql11-query/#sparqlPropertyPaths)
 * This operation, besides basic mode is the reason SPARQL can contain literals in the subject position.
 */
export interface Inv extends BaseOperation {
  type: Types.INV;
  path: PropertyPathSymbol;
}

/**
 * [Join algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalJoin)
 */
export interface Join extends Multi {
  type: Types.JOIN;
}

/**
 * [Leftjoin algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalLeftJoin)
 */
export interface LeftJoin extends Double {
  type: Types.LEFT_JOIN;
  expression?: Expression;
}

/**
 * Algebra operation representing the property of a [Property path](https://www.w3.org/TR/sparql11-query/#propertypaths).
 * Property paths have a specific [SPARQL definition](https://www.w3.org/TR/sparql11-query/#sparqlPropertyPaths)
 * This operation, is just a way of saying to a Propery Path operation that nothing fancy is going on,
 * and it should just match this property.
 */
export interface Link extends BaseOperation {
  type: Types.LINK;
  iri: RDF.NamedNode;
}

/**
 * [Algebra operation minus](https://www.w3.org/TR/sparql11-query/#defn_algMinus)
 */
export interface Minus extends Double {
  type: Types.MINUS;
  /**
   * Since our graph translation is not really part of the spec,
   * there is a MINUS edge case we need to consider with GRAPH ?g.
   * If left and right of MINUS have disjoint variables, the whole left solution sequence must be kept.
   * If GRAPH is defined outside of an operator (e.g. MINUS), then the spec says that evaluation of the operators
   * must be done as union over the evaluation of that operator within each graph separately,
   * and that the variable of ?g must only be bound **after** that evaluation.
   * As such, MINUS will not be aware of this variable ?g, and the disjoint case will apply.
   * The code below adds metadata to the operation so that engines can special-case this.
   */
  graphScopeVar?: RDF.Variable;
}

/**
 * An empty operation.
 * For example used for the algebra representation of a query string that does not contain any operation.
 */
export interface Nop extends BaseOperation {
  type: Types.NOP;
}

/**
 * [NegatedPropertySet algebra operation](eval_negatedPropertySet) representing the [Property path](https://www.w3.org/TR/sparql11-query/#propertypaths) negated property set (`!`).
 * Property paths have a specific [SPARQL definition](https://www.w3.org/TR/sparql11-query/#sparqlPropertyPaths)
 */
export interface Nps extends BaseOperation {
  type: Types.NPS;
  iris: RDF.NamedNode[];
}

/**
 * [OneOrMorePath algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalOneOrMorePath) representing the [Property path](https://www.w3.org/TR/sparql11-query/#propertypaths) one or more (`+`).
 * Property paths have a specific [SPARQL definition](https://www.w3.org/TR/sparql11-query/#sparqlPropertyPaths)
 */
export interface OneOrMorePath extends BaseOperation {
  type: Types.ONE_OR_MORE_PATH;
  path: PropertyPathSymbol;
}

/**
 * [OrderBy algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalOrderBy)
 */
export interface OrderBy extends Single {
  type: Types.ORDER_BY;
  expressions: Expression[];
}

export interface Path extends BaseOperation {
  type: Types.PATH;
  subject: RDF.Term;
  predicate: PropertyPathSymbol;
  object: RDF.Term;
  graph: RDF.Term;
}

/**
 * Simple BGP entry (triple)
 */
export interface Pattern extends BaseOperation, RDF.BaseQuad {
  type: Types.PATTERN;
}

/**
 * [Project algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalProject)
 */
export interface Project extends Single {
  type: Types.PROJECT;
  variables: RDF.Variable[];
}

/**
 * [Reduced algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalReduced)
 */
export interface Reduced extends Single {
  type: Types.REDUCED;
}

/**
 * Algebra operation representing the [Property path](https://www.w3.org/TR/sparql11-query/#propertypaths) sequence (`/`).
 * Property paths have a specific [SPARQL definition](https://www.w3.org/TR/sparql11-query/#sparqlPropertyPaths)
 */
export interface Seq extends Multi {
  type: Types.SEQ;
  input: PropertyPathSymbol[];
}

export interface Service extends Single {
  type: Types.SERVICE;
  name: RDF.Variable | RDF.NamedNode;
  silent: boolean;
}

/**
 * [Slice algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalSlice)
 */
export interface Slice extends Single {
  type: Types.SLICE;
  start: number;
  length?: number;
}

/**
 * [Union algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalUnion)
 */
export interface Union extends Multi {
  type: Types.UNION;
}

/**
 * Algebra operation representing the [VALUES pattern](https://www.w3.org/TR/sparql11-query/#inline-data)
 * Has a list of variables that will be assigned.
 * The assignments are represented as a list of object containing bindings.
 * Each binging links the variable value to the appropriate Term for this binding.
 * Does not take any input.
 */
export interface Values extends BaseOperation {
  type: Types.VALUES;
  variables: RDF.Variable[];
  bindings: Record<string, RDF.Literal | RDF.NamedNode>[];
}

/**
 * [ZeroOrMore algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalZeroOrMorePath) representing the [Property path](https://www.w3.org/TR/sparql11-query/#propertypaths) zero or more (`*`).
 * The having specific [SPARQL definition](https://www.w3.org/TR/sparql11-query/#sparqlPropertyPaths)
 */
export interface ZeroOrMorePath extends BaseOperation {
  type: Types.ZERO_OR_MORE_PATH;
  path: PropertyPathSymbol;
}

/**
 * [ZeroOrOnePath algebra operation](https://www.w3.org/TR/sparql11-query/#defn_evalPP_ZeroOrOnePath) representing the [Property path](https://www.w3.org/TR/sparql11-query/#propertypaths) zero or one (`?`).
 * The having specific [SPARQL definition](https://www.w3.org/TR/sparql11-query/#sparqlPropertyPaths)
 */
export interface ZeroOrOnePath extends BaseOperation {
  type: Types.ZERO_OR_ONE_PATH;
  path: PropertyPathSymbol;
}

// ----------------------- UPDATE FUNCTIONS -----------------------
export interface CompositeUpdate extends BaseOperation {
  type: Types.COMPOSITE_UPDATE;
  updates: (Update | Nop)[];
}

export interface DeleteInsert extends BaseOperation {
  type: Types.DELETE_INSERT;
  delete?: Pattern[];
  insert?: Pattern[];
  where?: Operation;
}

export interface UpdateGraph extends BaseOperation {
  silent?: boolean;
}

export interface Load extends UpdateGraph {
  type: Types.LOAD;
  source: RDF.NamedNode;
  destination?: RDF.NamedNode;
}

export interface Clear extends UpdateGraph {
  type: Types.CLEAR;
  source: 'DEFAULT' | 'NAMED' | 'ALL' | RDF.NamedNode;
}

export interface Create extends UpdateGraph {
  type: Types.CREATE;
  source: RDF.NamedNode;
}

export interface Drop extends UpdateGraph {
  type: Types.DROP;
  source: 'DEFAULT' | 'NAMED' | 'ALL' | RDF.NamedNode;
}

export interface UpdateGraphShortcut extends UpdateGraph {
  source: 'DEFAULT' | RDF.NamedNode;
  destination: 'DEFAULT' | RDF.NamedNode;
}

export interface Add extends UpdateGraphShortcut {
  type: Types.ADD;
}

export interface Move extends UpdateGraphShortcut {
  type: Types.MOVE;
}

export interface Copy extends UpdateGraphShortcut {
  type: Types.COPY;
}
