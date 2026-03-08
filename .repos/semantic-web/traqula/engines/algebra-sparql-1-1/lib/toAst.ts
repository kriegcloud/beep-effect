import type {
  Algebra,
} from '@traqula/algebra-transformations-1-1';
import {
  registerProjection,
  resetContext,
  translateAlgAggregateExpression,
  translateAlgAnyExpression,
  translateAlgExpressionOrOrdering,
  translateAlgExpressionOrWild,
  translateAlgPattern,
  translateAlgOrderBy,
  translateAlgPureExpression,
  translateAlgReduced,
  translateAlgPathComponent,
  translateAlgAlt,
  translateAlgInv,
  translateAlgZeroOrMorePath,
  translateAlgSeq,
  translateAlgPatternIntoGroup,
  translateAlgSinglePattern,
  translateAlgPatternNew,
  translateAlgPath,
  translateAlgBgp,
  translateAlgJoin,
  translateAlgGroup,
  operationAlgInputAsPatternList,
  translateAlgService,
  translateAlgLeftJoin,
  translateAlgNamedExpression,
  translateAlgPureOperatorExpression,
  translateAlgExistenceExpression,
  translateAlgWildcardExpression,

  translateAlgExtend,
  translateAlgTerm,

  translateAlgNps,
  translateAlgBoundAggregate,
  translateAlgFrom,

  translateAlgGraph,

  translateAlgSlice,
  translateAlgValues,
  translateAlgUnion,
  translateAlgMinus,
  translateAlgOperatorExpression,
  translateAlgDatasetClauses,
  translateAlgDistinct,

  translateAlgZeroOrOnePath,
  translateAlgOneOrMorePath,
  translateAlgLink,
  translateAlgFilter,
  algWrapInPatternGroup,
  removeAlgQuads,
  removeAlgQuadsRecursive,
  splitAlgBgpToGraphs,
  translateAlgConstruct,
  translateAlgProject,
  registerOrderBy,
  registerVariables,
  putExtensionsInGroup,
  filterReplace,
  translateAlgUpdateOperation,
  translateAlgDeleteInsert,
  translateAlgCompositeUpdate,
  translateAlgLoad,
  translateAlgGraphRef,
  translateAlgClear,
  translateAlgCreate,

  translateAlgDrop,
  translateAlgMove,
  translateAlgCopy,
  translateAlgAdd,
  toUpdate,
  objectContainsVariable,
  cleanupAlgUpdateOperationModify,
  createAstContext,
  convertAlgUpdatePatterns,
  algToSparql,
  registerAlgGroupBy,
  replaceAlgAggregatorVariables,
} from '@traqula/algebra-transformations-1-1';
import { IndirBuilder } from '@traqula/core';
import type { SparqlQuery } from '@traqula/rules-sparql-1-1';

export const toAst11Builder = IndirBuilder
  .create(<const> [ resetContext, registerProjection ])
  .addMany(
    translateAlgPureExpression,
    translateAlgExpressionOrWild,
    translateAlgExpressionOrOrdering,
    translateAlgAnyExpression,
    translateAlgAggregateExpression,
    translateAlgExistenceExpression,
    translateAlgNamedExpression,
    translateAlgPureOperatorExpression,
    translateAlgOperatorExpression,
    translateAlgWildcardExpression,
    // General
    translateAlgTerm,
    translateAlgExtend,
    translateAlgDatasetClauses,
    translateAlgOrderBy,
    translateAlgPattern,
    translateAlgReduced,
    translateAlgDistinct,
    // Path
    translateAlgPathComponent,
    translateAlgAlt,
    translateAlgInv,
    translateAlgLink,
    translateAlgNps,
    translateAlgOneOrMorePath,
    translateAlgSeq,
    translateAlgZeroOrMorePath,
    translateAlgZeroOrOnePath,
  )
  .addMany(
    // Pattern
    translateAlgPatternIntoGroup,
    translateAlgSinglePattern,
    translateAlgPatternNew,
    translateAlgBoundAggregate,
    translateAlgBgp,
    translateAlgPath,
    translateAlgFrom,
    translateAlgFilter,
    translateAlgGraph,
    translateAlgGroup,
    translateAlgJoin,
    translateAlgLeftJoin,
    translateAlgMinus,
    translateAlgService,
    operationAlgInputAsPatternList,
    translateAlgSlice,
    algWrapInPatternGroup,
    translateAlgUnion,
    translateAlgValues,
    // Quads
    removeAlgQuads,
    removeAlgQuadsRecursive,
    splitAlgBgpToGraphs,
    // QueryUnit
    translateAlgConstruct,
    replaceAlgAggregatorVariables,
    translateAlgProject,
    registerAlgGroupBy,
    registerOrderBy,
    registerVariables,
    putExtensionsInGroup,
    filterReplace,
    objectContainsVariable,
    // UpdateUnit
    translateAlgUpdateOperation,
    toUpdate,
    translateAlgCompositeUpdate,
    translateAlgDeleteInsert,
    cleanupAlgUpdateOperationModify,
    translateAlgLoad,
    translateAlgGraphRef,
    translateAlgClear,
    translateAlgCreate,
    translateAlgDrop,
    translateAlgAdd,
    translateAlgMove,
    translateAlgCopy,
    convertAlgUpdatePatterns,
    // ToAst
    algToSparql,
  );

/**
 * Transform an operation to a SPARQL 1.1 Traqula AST.
 * @param op
 */
export function toAst(op: Algebra.Operation): SparqlQuery {
  const c = createAstContext();
  const transformer = toAst11Builder.build();
  return transformer.algToSparql(c, op);
}
