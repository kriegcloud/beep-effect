import type { Localized, Node } from '@traqula/core';

export type Sparql11Nodes =
  | GraphRef
  | GraphQuads
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

export type GraphRefBase = Node & {
  type: 'graphRef';
  subType: string;
};
export type GraphRefDefault = GraphRefBase & {
  subType: 'default';
};
export type GraphRefNamed = GraphRefBase & {
  subType: 'named';
};
export type GraphRefAll = GraphRefBase & {
  subType: 'all';
};
export type GraphRefSpecific = GraphRefBase & {
  subType: 'specific';
  graph: TermIri;
};
export type GraphRef =
  | GraphRefDefault
  | GraphRefNamed
  | GraphRefAll
  | GraphRefSpecific;

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
 * The subject of the triples does not have a string manifestation.
 */
export type TripleCollectionList = TripleCollectionBase & {
  subType: 'list';
  identifier: TermBlank;
};
/**
 * Bot subject and predicate of the triples do not have a string manifestation.
 */
export type TripleCollectionBlankNodeProperties = TripleCollectionBase & {
  subType: 'blankNodeProperties';
  identifier: TermBlank;
};
export type TripleCollection =
  | TripleCollectionList
  | TripleCollectionBlankNodeProperties;

// https://www.w3.org/TR/sparql11-query/#rGraphNode
export type GraphNode = Term | TripleCollection;

// https://www.w3.org/TR/sparql11-query/#rTriplesBlock
export type TripleNesting = Node & {
  type: 'triple';
  subject: GraphNode;
  predicate: TermIri | TermVariable | Path;
  object: GraphNode;
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
  variables: TermVariable[];
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
export type Ordering = Localized & {
  descending: boolean;
  expression: Expression;
};
export type SolutionModifierOrder = SolutionModifierBase & {
  subType: 'order';
  orderDefs: Ordering[];
};
export type SolutionModifierLimitOffset = SolutionModifierBase
  & { subType: 'limitOffset'; limit: number | undefined; offset: number | undefined };

export type SolutionModifier =
  | SolutionModifierGroup
  | SolutionModifierHaving
  | SolutionModifierOrder
  | SolutionModifierLimitOffset;

export type ExpressionBase = Node & { type: 'expression'; subType: string };

type ExpressionAggregateBase = ExpressionBase & {
  subType: 'aggregate';
  distinct: boolean;
  expression: [Expression | Wildcard];
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
  | TermLiteral;

export type PropertyPathBase = Node & { type: 'path'; subType: string };
export type PropertyPathChain = PropertyPathBase & {
  subType: '|' | '/';
  items: Path[];
};

export type PathModified = PropertyPathBase & {
  subType: '?' | '*' | '+' | '^';
  items: [Path];
};

export type PathNegatedElt = PropertyPathBase & {
  subType: '^';
  items: [TermIri];
};

export type PathAlternativeLimited = PropertyPathBase & {
  subType: '|';
  items: (TermIri | PathNegatedElt)[];
};

export type PathNegated = PropertyPathBase & {
  subType: '!';
  items: [TermIri | PathNegatedElt | PathAlternativeLimited];
};

// [[88]](https://www.w3.org/TR/sparql11-query/#rPath)
export type Path =
  | TermIri
  | PropertyPathChain
  | PathModified
  | PathNegated;
export type PathPure = PropertyPathChain | PathModified | PathNegated;

export type ContextDefinitionBase_ = Node & { type: 'contextDef'; subType: string };
export type ContextDefinitionPrefix = ContextDefinitionBase_ & {
  subType: 'prefix';
  key: string;
  value: TermIriFull;
};
export type ContextDefinitionBase = ContextDefinitionBase_ & {
  subType: 'base';
  value: TermIriFull;
};
export type ContextDefinition = ContextDefinitionPrefix | ContextDefinitionBase;

export type Wildcard = Node & {
  type: 'wildcard';
};

export type TermBase = Node & { type: 'term'; subType: string };
export type TermLiteralBase = TermBase & {
  subType: 'literal';
  value: string;
};
export type TermLiteralStr = TermLiteralBase & { langOrIri: undefined };
export type TermLiteralLangStr = TermLiteralBase & { langOrIri: string };
export type TermLiteralTyped = TermLiteralBase & { langOrIri: TermIri };
export type TermLiteral = TermLiteralStr | TermLiteralLangStr | TermLiteralTyped;

export type TermVariable = TermBase & {
  subType: 'variable';
  value: string;
};

export type TermIriBase = TermBase & { subType: 'namedNode' };
export type TermIriFull = TermIriBase & { value: string };
export type TermIriPrefixed = TermIriBase & {
  value: string;
  prefix: string;
};
export type TermIri = TermIriFull | TermIriPrefixed;

export type TermBlank = TermBase & { subType: 'blankNode' } & { label: string };

export type GraphTerm = TermIri | TermBlank | TermLiteral;
export type Term = GraphTerm | TermVariable;
