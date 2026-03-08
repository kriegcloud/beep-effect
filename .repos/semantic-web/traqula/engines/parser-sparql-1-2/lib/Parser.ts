import { ParserBuilder } from '@traqula/core';
import type { Patch, Wrap, ParserBuildArgs } from '@traqula/core';
import { sparql11ParserBuilder } from '@traqula/parser-sparql-1-1';
import {
  gram as g11,
  sparqlCodepointEscape,
} from '@traqula/rules-sparql-1-1';
import type {
  TermIri,
} from '@traqula/rules-sparql-1-1';
import { completeParseContext, copyParseContext, gram as S12, lex as l12 } from '@traqula/rules-sparql-1-2';
import type * as T12 from '@traqula/rules-sparql-1-2';

export const sparql12ParserBuilder = ParserBuilder.create(sparql11ParserBuilder)
  .widenContext<T12.SparqlContext>()
  .typePatch<{
    /// GeneralFile
    queryOrUpdate: [ T12.SparqlQuery];
    /// Query Unit file
    [g11.selectQuery.name]: [Omit<T12.QuerySelect, g11.HandledByBase>];
    [g11.subSelect.name]: [ Omit<T12.SubSelect, 'prefixes'>];
    [g11.selectClause.name]: [Wrap<Pick<T12.QuerySelect, 'variables' | 'distinct' | 'reduced'>>];
    [g11.constructQuery.name]: [Omit<T12.QueryConstruct, g11.HandledByBase>];
    [g11.describeQuery.name]: [Omit<T12.QueryDescribe, g11.HandledByBase>];
    [g11.askQuery.name]: [Omit<T12.QueryAsk, g11.HandledByBase>];
    [g11.valuesClause.name]: [T12.PatternValues[] | undefined];
    [g11.constructTemplate.name]: [Wrap<T12.PatternBgp>];
    [g11.constructTriples.name]: [T12.PatternBgp];
    /// Update Unit file
    [g11.update1.name]: [T12.UpdateOperation];
    [g11.load.name]: [T12.UpdateOperationLoad];
    [g11.clear.name]: [T12.UpdateOperationClear];
    [g11.drop.name]: [T12.UpdateOperationDrop];
    [g11.create.name]: [T12.UpdateOperationCreate];
    [g11.add.name]: [T12.UpdateOperationAdd];
    [g11.move.name]: [T12.UpdateOperationMove];
    [g11.copy.name]: [T12.UpdateOperationCopy];
    [g11.quadPattern.name]: [Wrap<T12.Quads[]>];
    [g11.quadData.name]: [Wrap<T12.Quads[]>];
    [g11.insertData.name]: [T12.UpdateOperationInsertData];
    [g11.deleteData.name]: [T12.UpdateOperationDeleteData];
    [g11.deleteWhere.name]: [T12.UpdateOperationDeleteWhere];
    [g11.modify.name]: [T12.UpdateOperationModify];
    [g11.deleteClause.name]: [Wrap<T12.Quads[]>];
    [g11.insertClause.name]: [Wrap<T12.Quads[]>];
    [g11.graphOrDefault.name]: [T12.GraphRefDefault | T12.GraphRefSpecific];
    [g11.graphRef.name]: [T12.GraphRefSpecific];
    [g11.graphRefAll.name]: [T12.GraphRef];
    [g11.quads.name]: [Wrap<T12.Quads[]>];
    [g11.quadsNotTriples.name]: [T12.GraphQuads];
    /// Built-in functions
    [g11.builtInStr.name]: [T12.ExpressionOperation];
    [g11.builtInLang.name]: [T12.ExpressionOperation];
    [g11.builtInLangmatches.name]: [T12.ExpressionOperation];
    [g11.builtInDatatype.name]: [T12.ExpressionOperation];
    [g11.builtInBound.name]: [T12.ExpressionOperation];
    [g11.builtInIri.name]: [T12.ExpressionOperation];
    [g11.builtInUri.name]: [T12.ExpressionOperation];
    [g11.builtInBnodeSparqlJs.name]: [T12.ExpressionOperation];
    [g11.builtInRand.name]: [T12.ExpressionOperation];
    [g11.builtInAbs.name]: [T12.ExpressionOperation];
    [g11.builtInCeil.name]: [T12.ExpressionOperation];
    [g11.builtInFloor.name]: [T12.ExpressionOperation];
    [g11.builtInRound.name]: [T12.ExpressionOperation];
    [g11.builtInConcat.name]: [T12.ExpressionOperation];
    [g11.substringExpression.name]: [T12.ExpressionOperation];
    [g11.builtInStrlen.name]: [T12.ExpressionOperation];
    [g11.strReplaceExpression.name]: [T12.ExpressionOperation];
    [g11.builtInUcase.name]: [T12.ExpressionOperation];
    [g11.builtInLcase.name]: [T12.ExpressionOperation];
    [g11.builtInEncode_for_uri.name]: [T12.ExpressionOperation];
    [g11.builtInContains.name]: [T12.ExpressionOperation];
    [g11.builtInStrstarts.name]: [T12.ExpressionOperation];
    [g11.builtInStrends.name]: [T12.ExpressionOperation];
    [g11.builtInStrbefore.name]: [T12.ExpressionOperation];
    [g11.builtInStrafter.name]: [T12.ExpressionOperation];
    [g11.builtInYear.name]: [T12.ExpressionOperation];
    [g11.builtInMonth.name]: [T12.ExpressionOperation];
    [g11.builtInDay.name]: [T12.ExpressionOperation];
    [g11.builtInHours.name]: [T12.ExpressionOperation];
    [g11.builtInMinutes.name]: [T12.ExpressionOperation];
    [g11.builtInSeconds.name]: [T12.ExpressionOperation];
    [g11.builtInTimezone.name]: [T12.ExpressionOperation];
    [g11.builtInTz.name]: [T12.ExpressionOperation];
    [g11.builtInNow.name]: [T12.ExpressionOperation];
    [g11.builtInUuid.name]: [T12.ExpressionOperation];
    [g11.builtInStruuid.name]: [T12.ExpressionOperation];
    [g11.builtInMd5.name]: [T12.ExpressionOperation];
    [g11.builtInSha1.name]: [T12.ExpressionOperation];
    [g11.builtInSha256.name]: [T12.ExpressionOperation];
    [g11.builtInSha384.name]: [T12.ExpressionOperation];
    [g11.builtInSha512.name]: [T12.ExpressionOperation];
    [g11.builtInCoalesce.name]: [T12.ExpressionOperation];
    [g11.builtInIf.name]: [T12.ExpressionOperation];
    [g11.builtInStrlang.name]: [T12.ExpressionOperation];
    [g11.builtInStrdt.name]: [T12.ExpressionOperation];
    [g11.builtInSameterm.name]: [T12.ExpressionOperation];
    [g11.builtInIsiri.name]: [T12.ExpressionOperation];
    [g11.builtInIsuri.name]: [T12.ExpressionOperation];
    [g11.builtInIsblank.name]: [T12.ExpressionOperation];
    [g11.builtInIsliteral.name]: [T12.ExpressionOperation];
    [g11.builtInIsnumeric.name]: [T12.ExpressionOperation];
    [g11.existsFunc.name]: [T12.ExpressionPatternOperation];
    [g11.notExistsFunc.name]: [T12.ExpressionPatternOperation];
    [g11.aggregateCount.name]: [T12.ExpressionAggregateOnWildcard | T12.ExpressionAggregateDefault];
    [g11.aggregateSum.name]: [T12.ExpressionAggregateDefault];
    [g11.aggregateMin.name]: [T12.ExpressionAggregateDefault];
    [g11.aggregateMax.name]: [T12.ExpressionAggregateDefault];
    [g11.aggregateAvg.name]: [T12.ExpressionAggregateDefault];
    [g11.aggregateSample.name]: [T12.ExpressionAggregateDefault];
    [g11.aggregateGroup_concat.name]: [T12.ExpressionAggregateDefault | T12.ExpressionAggregateSeparator];
    [g11.aggregate.name]: [T12.ExpressionAggregate];
    [g11.builtInCall.name]: [T12.Expression];
    /// DatasetClause
    [g11.datasetClause.name]: [Wrap<T12.DatasetClauses['clauses'][0]>];
    [g11.defaultGraphClause.name]: [T12.TermIri];
    [g11.usingClause.name]: [Wrap<T12.DatasetClauses['clauses'][0]>];
    [g11.datasetClauseStar.name]: [T12.DatasetClauses];
    [g11.usingClauseStar.name]: [T12.DatasetClauses];
    [g11.namedGraphClause.name]: [Wrap<T12.TermIri>];
    [g11.sourceSelector.name]: [T12.TermIri];
    // Expression file
    [g11.argList.name]: [Wrap<Patch<g11.IArgList, { args: T12.Expression[] }>>];
    [g11.expressionList.name]: [Wrap<T12.Expression[]>];
    [g11.expression.name]: [T12.Expression];
    [g11.conditionalOrExpression.name]: [T12.ExpressionOperation | T12.Expression];
    [g11.conditionalAndExpression.name]: [T12.Expression];
    [g11.valueLogical.name]: [T12.Expression];
    [g11.relationalExpression.name]: [T12.ExpressionOperation | T12.Expression];
    [g11.numericExpression.name]: [T12.Expression];
    [g11.additiveExpression.name]: [T12.Expression];
    [g11.multiplicativeExpression.name]: [T12.Expression];
    [g11.unaryExpression.name]: [T12.Expression];
    [g11.primaryExpression.name]: [T12.Expression];
    [g11.brackettedExpression.name]: [T12.Expression];
    [g11.iriOrFunction.name]: [T12.TermIri | T12.ExpressionFunctionCall];
    /// General
    [g11.prologue.name]: [T12.ContextDefinition[]];
    [g11.baseDecl.name]: [T12.ContextDefinition];
    [g11.prefixDecl.name]: [T12.ContextDefinition];
    [g11.verb.name]: [T12.TermVariable | T12.TermIri];
    [g11.varOrTerm.name]: [T12.Term];
    [g11.varOrIri.name]: [T12.TermIri | T12.TermVariable];
    [g11.var_.name]: [T12.TermVariable];
    [g11.graphTerm.name]: [T12.GraphTerm];
    /// Literals
    [g11.rdfLiteral.name]: [T12.TermLiteral];
    [g11.numericLiteral.name]: [T12.TermLiteralTyped];
    [g11.numericLiteralUnsigned.name]: [T12.TermLiteralTyped];
    [g11.numericLiteralPositive.name]: [T12.TermLiteralTyped];
    [g11.numericLiteralNegative.name]: [T12.TermLiteralTyped];
    [g11.booleanLiteral.name]: [T12.TermLiteralTyped];
    [g11.string.name]: [T12.TermLiteralStr];
    [g11.iri.name]: [T12.TermIri];
    [g11.iriFull.name]: [T12.TermIriFull];
    [g11.prefixedName.name]: [T12.TermIriPrefixed];
    [g11.blankNode.name]: [T12.TermBlank];
    [g11.verbA.name]: [T12.TermIriFull];
    /// / Paths: unchanged
    /// / SolutionModifiers
    [g11.solutionModifier.name]: [T12.SolutionModifiers];
    [g11.groupClause.name]: [T12.SolutionModifierGroup];
    [g11.groupCondition.name]: [T12.Expression | T12.SolutionModifierGroupBind];
    [g11.havingClause.name]: [T12.SolutionModifierHaving];
    [g11.havingCondition.name]: [T12.Expression];
    [g11.orderClause.name]: [T12.SolutionModifierOrder];
    [g11.orderCondition.name]: [T12.Ordering];
    [g11.limitOffsetClauses.name]: [T12.SolutionModifierLimitOffset];
    [g11.limitClause.name]: [Wrap<number>];
    [g11.offsetClause.name]: [ Wrap<number>];
    /// tripleBlock
    [g11.triplesBlock.name]: [T12.PatternBgp];
    [g11.triplesSameSubject.name]: [T12.BasicGraphPattern];
    [g11.triplesSameSubjectPath.name]: [T12.BasicGraphPattern];
    [g11.triplesTemplate.name]: [T12.PatternBgp];
    [g11.propertyList.name]: [T12.TripleNesting[]];
    [g11.propertyListPath.name]: [T12.TripleNesting[]];
    [g11.propertyListNotEmpty.name]: [T12.TripleNesting[]];
    [g11.propertyListPathNotEmpty.name]: [T12.TripleNesting[]];
    [g11.verbPath.name]: [T12.Path];
    [g11.verbSimple.name]: [T12.TermVariable];
    [g11.objectList.name]: [T12.TripleNesting[], [ T12.TripleNesting['subject'], T12.TripleNesting['predicate'] ]];
    [g11.objectListPath.name]: [T12.TripleNesting, [ T12.TripleNesting['subject'], T12.TripleNesting['predicate'] ]];
    [g11.object.name]: [T12.TripleNesting, [ T12.TripleNesting['subject'], T12.TripleNesting['predicate'] ]];
    [g11.objectPath.name]: [T12.TripleNesting[], [ T12.TripleNesting['subject'], T12.TripleNesting['predicate'] ]];
    [g11.collection.name]: [T12.TripleCollectionList];
    [g11.collectionPath.name]: [T12.TripleCollectionList];
    [g11.triplesNode.name]: [T12.TripleCollection];
    [g11.triplesNodePath.name]: [T12.TripleCollection];
    [g11.blankNodePropertyList.name]: [T12.TripleCollectionBlankNodeProperties];
    [g11.blankNodePropertyListPath.name]: [T12.TripleCollectionBlankNodeProperties];
    [g11.graphNode.name]: [T12.Term | T12.TripleCollection];
    [g11.graphNodePath.name]: [T12.Term | T12.TripleCollection];
    /// WhereClause
    [g11.whereClause.name]: [Wrap<T12.PatternGroup>];
    [g11.groupGraphPattern.name]: [T12.PatternGroup];
    [g11.groupGraphPatternSub.name]: [T12.Pattern[]];
    [g11.graphPatternNotTriples.name]: [Exclude<T12.Pattern, T12.SubSelect | T12.PatternBgp>];
    [g11.optionalGraphPattern.name]: [T12.PatternOptional];
    [g11.graphGraphPattern.name]: [T12.PatternGraph];
    [g11.serviceGraphPattern.name]: [T12.PatternService];
    [g11.bind.name]: [T12.PatternBind];
    [g11.inlineData.name]: [T12.PatternValues];
    [g11.dataBlock.name]: [T12.PatternValues];
    [g11.inlineDataOneVar.name]: [T12.PatternValues];
    [g11.inlineDataFull.name]: [T12.PatternValues];
    [g11.dataBlockValue.name]: [T12.TermIri | T12.TermLiteral | undefined];
    [g11.minusGraphPattern.name]: [T12.PatternMinus];
    [g11.groupOrUnionGraphPattern.name]: [T12.PatternGroup | T12.PatternUnion];
    [g11.filter.name]: [T12.PatternFilter];
    [g11.constraint.name]: [T12.Expression];
    [g11.functionCall.name]: [T12.ExpressionFunctionCall];
  }>()
  .addMany(
    S12.reifiedTripleBlock,
    S12.reifiedTripleBlockPath,
    S12.reifier,
    S12.varOrReifierId,
    S12.annotation,
    S12.annotationPath,
    S12.annotationBlockPath,
    S12.annotationBlock,
    S12.reifiedTriple,
    S12.reifiedTripleSubject,
    S12.reifiedTripleObject,
    S12.tripleTerm,
    S12.tripleTermSubject,
    S12.tripleTermObject,
    S12.tripleTermData,
    S12.tripleTermDataSubject,
    S12.tripleTermDataObject,
    S12.exprTripleTerm,
    S12.exprTripleTermSubject,
    S12.exprTripleTermObject,
  )
  .addMany(
    S12.versionDecl,
    S12.versionSpecifier,
  )
  .addMany(
    S12.buildInLangDir,
    S12.buildInLangStrDir,
    S12.buildInHasLang,
    S12.buildInHasLangDir,
    S12.buildInIsTriple,
    S12.buildInTriple,
    S12.buildInSubject,
    S12.buildInPredicate,
    S12.buildInObject,
  )
  .patchRule(S12.dataBlockValue)
  .patchRule(S12.triplesSameSubject)
  .patchRule(S12.triplesSameSubjectPath)
  .patchRule(S12.object)
  .patchRule(S12.objectPath)
  .patchRule(S12.graphNode)
  .patchRule(S12.graphNodePath)
  .patchRule(S12.varOrTerm)
  .deleteRule(g11.graphTerm.name)
  .patchRule(S12.primaryExpression)
  .patchRule(S12.builtInCall)
  .patchRule(S12.rdfLiteral)
  .patchRule(S12.unaryExpression)
  .patchRule(S12.prologue);

export type SparqlParser = ReturnType<typeof sparql12ParserBuilder.build>;

/**
 * Generator that can generate a SPARQL 1.2 AST given a SPARQL 1.2 string.
 */
export class Parser {
  private readonly parser: SparqlParser;
  protected readonly defaultContext: T12.SparqlContext;

  public constructor(
    args: Pick<ParserBuildArgs, 'parserConfig' | 'lexerConfig'> & { defaultContext?: Partial<T12.SparqlContext> } = {},
  ) {
    this.parser = sparql12ParserBuilder.build({
      ...args,
      queryPreProcessor: sparqlCodepointEscape,
      tokenVocabulary: l12.sparql12LexerBuilder.tokenVocabulary,
    });
    this.defaultContext = completeParseContext(args.defaultContext ?? {});
  }

  /**
   * Parse a query string starting from the
   * [QueryUnit](https://www.w3.org/TR/sparql12-query/#rQueryUnit)
   * or [QueryUpdate](https://www.w3.org/TR/sparql12-query/#rUpdateUnit) rules.
   * @param query
   * @param context
   */
  public parse(query: string, context: Partial<T12.SparqlContext> = {}): T12.SparqlQuery {
    const ast = this.parser.queryOrUpdate(query, copyParseContext({ ...this.defaultContext, ...context }));
    ast.loc = this.defaultContext.astFactory.sourceLocationInlinedSource(query, ast.loc, 0, Number.MAX_SAFE_INTEGER);
    return ast;
  }

  /**
   * Parse a query string starting from the [Path](https://www.w3.org/TR/sparql12-query/#rPath) grammar rule.
   * @param query
   * @param context
   */
  public parsePath(
    query: string,
context: Partial<T12.SparqlContext> = {},
  ): (T12.Path & { prefixes: object }) | TermIri {
    const ast = this.parser.path(query, copyParseContext({ ...this.defaultContext, ...context }));
    ast.loc = this.defaultContext.astFactory.sourceLocationInlinedSource(query, ast.loc, 0, Number.MAX_SAFE_INTEGER);
    if (this.defaultContext.astFactory.isPathPure(ast)) {
      return {
        ...ast,
        prefixes: {},
      };
    }
    return ast;
  }
}
