import type { Localized, Node, Patch, Wrap } from '@traqula/core';
import type * as T11 from '@traqula/rules-sparql-1-1';

export type Sparql12Nodes =
  | GraphRef
  | UpdateOperation
  | Update
  | Query
  | DatasetClauses
  | TripleCollection
  | TripleNesting
  | Pattern
  | SolutionModifier
  | Expression
  | Path
  | ContextDefinition
  | Wildcard
  | Term;

export type GraphRefBase = T11.GraphRefBase;
export type GraphRefDefault = T11.GraphRefDefault;
export type GraphRefNamed = T11.GraphRefNamed;
export type GraphRefAll = T11.GraphRefAll;
export type GraphRefSpecific = T11.GraphRefSpecific;
export type GraphRef = T11.GraphRef;

export type Quads = PatternBgp | GraphQuads;

export type GraphQuads = Node & {
  type: 'graph';
  graph: TermIri | TermVariable;
  triples: PatternBgp;
};

// https://www.w3.org/TR/sparql11-query/#rUpdate1
export type UpdateOperationBase = Node & { type: 'updateOperation'; subType: string };
export type UpdateOperationLoad = UpdateOperationBase & {
  subType: 'load';
  silent: boolean;
  source: TermIri;
  destination?: GraphRefSpecific;
};
type UpdateOperationClearDropCreateBase = UpdateOperationBase & {
  subType: 'clear' | 'drop' | 'create';
  silent: boolean;
  destination: GraphRef;
};
export type UpdateOperationClear = UpdateOperationClearDropCreateBase & { subType: 'clear' };
export type UpdateOperationDrop = UpdateOperationClearDropCreateBase & { subType: 'drop' };
export type UpdateOperationCreate = UpdateOperationClearDropCreateBase & {
  subType: 'create';
  destination: GraphRefSpecific;
};
type UpdateOperationAddMoveCopy = UpdateOperationBase & {
  subType: 'add' | 'move' | 'copy';
  silent: boolean;
  source: GraphRefDefault | GraphRefSpecific;
  destination: GraphRefDefault | GraphRefSpecific;
};
export type UpdateOperationAdd = UpdateOperationAddMoveCopy & { subType: 'add' };
export type UpdateOperationMove = UpdateOperationAddMoveCopy & { subType: 'move' };
export type UpdateOperationCopy = UpdateOperationAddMoveCopy & { subType: 'copy' };
type UpdateOperationInsertDeleteDelWhere = UpdateOperationBase & {
  subType: 'insertdata' | 'deletedata' | 'deletewhere';
  data: Quads[];
};
export type UpdateOperationInsertData = UpdateOperationInsertDeleteDelWhere & { subType: 'insertdata' };
export type UpdateOperationDeleteData = UpdateOperationInsertDeleteDelWhere & { subType: 'deletedata' };
export type UpdateOperationDeleteWhere = UpdateOperationInsertDeleteDelWhere & { subType: 'deletewhere' };
export type UpdateOperationModify = UpdateOperationBase & {
  subType: 'modify';
  graph: TermIri | undefined;
  insert: Quads[];
  delete: Quads[];
  from: DatasetClauses;
  where: PatternGroup;
};
export type UpdateOperation =
  | UpdateOperationLoad
  | UpdateOperationClear
  | UpdateOperationDrop
  | UpdateOperationCreate
  | UpdateOperationAdd
  | UpdateOperationMove
  | UpdateOperationCopy
  | UpdateOperationInsertData
  | UpdateOperationDeleteData
  | UpdateOperationDeleteWhere
  | UpdateOperationModify;

// https://www.w3.org/TR/sparql11-query/#rUpdate
export type Update = Node & {
  type: 'update';
  updates: {
    operation?: UpdateOperation;
    context: ContextDefinition[];
  }[];
};

// https://www.w3.org/TR/sparql11-query/#rQueryUnit
export type QueryBase = Node & {
  type: 'query';
  subType: string;

  context: ContextDefinition[];
  values?: PatternValues;
  solutionModifiers: SolutionModifiers;
  datasets: DatasetClauses;
  where?: PatternGroup;
};
export type QuerySelect = QueryBase & {
  subType: 'select';
  variables: (TermVariable | PatternBind)[] | [Wildcard];
  distinct?: true;
  reduced?: true;
  where: PatternGroup;
};
export type QueryConstruct = QueryBase & {
  subType: 'construct';
  template: PatternBgp;
  where: PatternGroup;
};
export type QueryDescribe = QueryBase & {
  subType: 'describe';
  variables: (TermVariable | TermIri)[] | [Wildcard];
};
export type QueryAsk = QueryBase & {
  subType: 'ask';
  where: PatternGroup;
};
export type Query =
  | QuerySelect
  | QueryConstruct
  | QueryDescribe
  | QueryAsk;

export type SparqlQuery = Query | Update;

// https://www.w3.org/TR/sparql11-query/#rDatasetClause
export type DatasetClauses = Node & {
  type: 'datasetClauses';
  clauses: { clauseType: 'default' | 'named'; value: TermIri }[];
};

// https://www.w3.org/TR/sparql11-query/#rGraphNode
export type TripleCollectionBase = Node & {
  type: 'tripleCollection';
  subType: string;
  triples: TripleNesting[];
  identifier: Term;
};
/**
 * Both subject and predicate of the triples do not have a string manifestation.
 */
export type TripleCollectionList = TripleCollectionBase & {
  subType: 'list';
  identifier: TermBlank;
};
/**
 * The subject of the triples does not have a string manifestation.
 */
export type TripleCollectionBlankNodeProperties = Patch<T11.TripleCollectionBlankNodeProperties, {
  triples: TripleNesting[];
  identifier: TermBlank | TermVariable | TermIri;
}>;
export type TripleCollectionReifiedTriple = TripleCollectionBase & {
  subType: 'reifiedTriple';
  identifier: TermVariable | TermIri | TermBlank;
};

export type TripleCollection =
  | TripleCollectionList
  | TripleCollectionBlankNodeProperties
  | TripleCollectionReifiedTriple;

// https://www.w3.org/TR/sparql11-query/#rGraphNode
export type GraphNode = Term | TripleCollection;
export type Annotation = TripleCollectionBlankNodeProperties | Wrap<TermVariable | TermIri | TermBlank>;
// https://www.w3.org/TR/sparql12-query/#rTriplesBlock
export type TripleNesting = Node & {
  type: 'triple';
  subject: GraphNode;
  predicate: TermIri | TermVariable | Path;
  object: GraphNode;
  annotations?: Annotation[];
};

export type PatternBase = Node & { type: 'pattern'; subType: string };
export type PatternFilter = PatternBase & {
  subType: 'filter';
  expression: Expression;
};
export type PatternMinus = PatternBase & {
  subType: 'minus';
  patterns: Pattern[];
};

export type PatternGroup = PatternBase & {
  subType: 'group';
  patterns: Pattern[];
};
export type PatternOptional = PatternBase & {
  subType: 'optional';
  patterns: Pattern[];
};
export type PatternGraph = PatternBase & {
  subType: 'graph';
  name: TermIri | TermVariable;
  patterns: Pattern[];
};
export type PatternUnion = PatternBase & {
  subType: 'union';
  patterns: PatternGroup[];
};
export type BasicGraphPattern = (TripleNesting | TripleCollection)[];
export type PatternBgp = PatternBase & {
  subType: 'bgp';
  /**
   * Only the first appearance of a subject and predicate have a string manifestation
   */
  triples: BasicGraphPattern;
};
export type PatternBind = PatternBase & {
  subType: 'bind';
  expression: Expression;
  variable: TermVariable;
};
export type PatternService = PatternBase & {
  subType: 'service';
  name: TermIri | TermVariable;
  silent: boolean;
  patterns: Pattern[];
};
/**
 * A single list of assignments maps the variable identifier to the value
 */
export type ValuePatternRow = Record<string, TermIri | TermLiteral | undefined>;
export type PatternValues = PatternBase & {
  subType: 'values';
  values: ValuePatternRow[];
};
export type SubSelect = QuerySelect;

export type Pattern =
  | PatternBgp
  | PatternGroup
  | PatternUnion
  | PatternOptional
  | PatternMinus
  | PatternGraph
  | PatternService
  | PatternFilter
  | PatternBind
  | PatternValues
  | SubSelect;

export type SolutionModifiers = {
  group?: SolutionModifierGroup;
  having?: SolutionModifierHaving;
  order?: SolutionModifierOrder;
  limitOffset?: SolutionModifierLimitOffset;
};
export type SolutionModifierBase = Node & { type: 'solutionModifier'; subType: string };
export type SolutionModifierGroupBind = Localized & {
  variable: TermVariable;
  value: Expression;
};
export type SolutionModifierGroup = SolutionModifierBase & {
  subType: 'group';
  groupings: (Expression | SolutionModifierGroupBind)[];
};
export type SolutionModifierHaving = SolutionModifierBase & {
  subType: 'having';
  having: Expression[];
};
export type Ordering =
  | Expression
  | (Localized & { descending: boolean; expression: Expression });
export type SolutionModifierOrder = SolutionModifierBase & {
  subType: 'order';
  orderDefs: Ordering[];
};
export type SolutionModifierLimitOffset = T11.SolutionModifierLimitOffset;

export type SolutionModifier =
  | SolutionModifierGroup
  | SolutionModifierHaving
  | SolutionModifierOrder
  | SolutionModifierLimitOffset;

export type ExpressionBase = Node & { type: 'expression'; subType: string };

type ExpressionAggregateBase = ExpressionBase & {
  subType: 'aggregate';
  distinct: boolean;
};
export type ExpressionAggregateDefault = ExpressionAggregateBase & {
  expression: [Expression];
  aggregation: string;
};
export type ExpressionAggregateOnWildcard = ExpressionAggregateBase & {
  expression: [Wildcard];
  aggregation: string;
};
export type ExpressionAggregateSeparator = ExpressionAggregateBase & {
  expression: [Expression];
  aggregation: string;
  separator: string;
};
export type ExpressionAggregate =
  | ExpressionAggregateDefault
  | ExpressionAggregateOnWildcard
  | ExpressionAggregateSeparator;

export type ExpressionOperation = ExpressionBase & {
  subType: 'operation';
  operator: string;
  args: Expression[];
};

export type ExpressionPatternOperation = ExpressionBase & {
  subType: 'patternOperation';
  operator: string;
  // Can be a pattern in case of exists and not exists
  args: PatternGroup;
};

export type ExpressionFunctionCall = ExpressionBase & {
  subType: 'functionCall';
  function: TermIri;
  distinct: boolean;
  args: Expression[];
};

export type Expression =
  | ExpressionOperation
  | ExpressionPatternOperation
  | ExpressionFunctionCall
  | ExpressionAggregate
  | TermIri
  | TermVariable
  | TermLiteral
  | TermTriple;

export type PropertyPathChain = T11.PropertyPathChain;
export type PathModified = T11.PathModified;
export type PathNegatedElt = T11.PathNegatedElt;
export type PathAlternativeLimited = T11.PathAlternativeLimited;
export type PathNegated = T11.PathNegated;
// [[88]](https://www.w3.org/TR/sparql11-query/#rPath)
export type Path = T11.Path;
export type PathPure = PropertyPathChain | PathModified | PathNegated;

export type ContextDefinitionPrefix = T11.ContextDefinitionPrefix;
export type ContextDefinitionBase = T11.ContextDefinitionBase;
export type ContextDefinitionVersion = T11.ContextDefinitionBase_ & {
  subType: 'version';
  version: string;
};
export type ContextDefinition = T11.ContextDefinition | ContextDefinitionVersion;

export type Wildcard = T11.Wildcard;
export type TermLiteralStr = T11.TermLiteralStr;
export type TermLiteralLangStr = T11.TermLiteralLangStr;
export type TermLiteralTyped = T11.TermLiteralTyped;
export type TermLiteral = T11.TermLiteral;
export type TermVariable = T11.TermVariable;
export type TermIriFull = T11.TermIriFull;
export type TermIriPrefixed = T11.TermIriPrefixed;
export type TermIri = T11.TermIri;
export type TermBlank = T11.TermBlank;

export type TermTriple = T11.TermBase & {
  subType: 'triple';
  subject: Term;
  predicate: TermIri | TermVariable;
  object: Term;
};

export type Term = GraphTerm | TermVariable;
export type GraphTerm = TermIri | TermBlank | TermLiteral | TermTriple;
