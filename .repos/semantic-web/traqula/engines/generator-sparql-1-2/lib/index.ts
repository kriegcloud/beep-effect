import { GeneratorBuilder } from '@traqula/core';
import type { Wrap, Patch } from '@traqula/core';
import { sparql11GeneratorBuilder } from '@traqula/generator-sparql-1-1';
import type { gram as g11 } from '@traqula/rules-sparql-1-1';
import { gram as g12, completeGeneratorContext } from '@traqula/rules-sparql-1-2';
import type * as T12 from '@traqula/rules-sparql-1-2';

export const sparql12GeneratorBuilder =
  GeneratorBuilder.create(sparql11GeneratorBuilder)
    .widenContext<T12.SparqlGeneratorContext>()
    .typePatch<{
      [g11.queryOrUpdate.name]: [T12.SparqlQuery];
      [g11.query.name]: [T12.Query];
      [g11.selectQuery.name]: [Omit<T12.QuerySelect, g11.HandledByBase>];
      [g11.constructQuery.name]: [ Omit<T12.QueryConstruct, g11.HandledByBase>];
      [g11.describeQuery.name]: [Omit<T12.QueryDescribe, g11.HandledByBase>];
      [g11.askQuery.name]: [Omit<T12.QueryAsk, g11.HandledByBase>];
      [g11.selectClause.name]: [ Wrap<Pick<T12.QuerySelect, 'variables' | 'distinct' | 'reduced'>> ];

      [g11.update.name]: [T12.Update];
      [g11.update1.name]: [T12.UpdateOperation];
      [g11.load.name]: [T12.UpdateOperationLoad];
      [g11.clear.name]: [T12.UpdateOperationClear];
      [g11.drop.name]: [T12.UpdateOperationDrop];
      [g11.create.name]: [T12.UpdateOperationCreate];
      [g11.copy.name]: [T12.UpdateOperationCopy];
      [g11.move.name]: [T12.UpdateOperationMove];
      [g11.add.name]: [T12.UpdateOperationAdd];
      [g11.insertData.name]: [T12.UpdateOperationInsertData];
      [g11.deleteData.name]: [T12.UpdateOperationDeleteData];
      [g11.deleteWhere.name]: [T12.UpdateOperationDeleteWhere];
      [g11.modify.name]: [T12.UpdateOperationModify];
      [g11.graphRef.name]: [T12.TermIri];
      [g11.graphRefAll.name]: [T12.GraphRef];
      [g11.quads.name]: [Wrap<T12.Quads[]>];
      [g11.quadsNotTriples.name]: [T12.GraphQuads];

      [g11.aggregate.name]: [ T12.ExpressionAggregate ];

      [g11.datasetClauseStar.name]: [ T12.DatasetClauses ];
      [g11.usingClauseStar.name]: [ T12.DatasetClauses ];

      // [g11.datasetClause.name]: unchanged;
      [g11.argList.name]: [ Patch<g11.IArgList, { args: T12.Expression[] }> ];
      [g11.expression.name]: [ T12.Expression ];
      [g11.iriOrFunction.name]: [T12.TermIri | T12.ExpressionFunctionCall];

      [g11.prologue.name]: [ T12.ContextDefinition[] ];
      [g11.prefixDecl.name]: [ T12.ContextDefinitionPrefix ];
      [g11.baseDecl.name]: [ T12.ContextDefinitionBase ];
      // [g11.var_.name]: unchanged;
      [g11.varOrTerm.name]: [ T12.Term ];
      [g11.graphTerm.name]: [ T12.GraphTerm ];

      [g11.rdfLiteral.name]: [T12.TermLiteral];
      // [g11.string.name]: unchanged;
      // [g11.iri.name]: unchanged;
      // [g11.iriFull.name]: unchanged;
      // [g11.prefixedName.name]: unchanged;
      // [g11.blankNode.name]: unchanged;

      // [g11.path.name]: unchanged;
      //
      [g11.solutionModifier.name]: [ T12.SolutionModifiers ];
      [g11.groupClause.name]: [ T12.SolutionModifierGroup ];
      [g11.havingClause.name]: [ T12.SolutionModifierHaving ];
      [g11.orderClause.name]: [ T12.SolutionModifierOrder ];
      [g11.limitOffsetClauses.name]: [ T12.SolutionModifierLimitOffset ];

      [g11.triplesBlock.name]: [ T12.PatternBgp ];
      [g11.collectionPath.name]: [ T12.TripleCollectionList ];
      [g11.blankNodePropertyListPath.name]: [ T12.TripleCollectionBlankNodeProperties ];
      [g11.triplesNodePath.name]: [ T12.TripleCollection ];
      [g11.graphNodePath.name]: [ T12.Term | T12.TripleCollection ];

      [g11.whereClause.name]: [ Wrap<T12.PatternGroup> ];
      [g11.generatePattern.name]: [ T12.Pattern ];
      [g11.groupGraphPattern.name]: [ T12.PatternGroup ];
      [g11.graphPatternNotTriples.name]: [ Exclude<T12.Pattern, T12.SubSelect | T12.PatternBgp> ];
      [g11.optionalGraphPattern.name]: [ T12.PatternOptional ];
      [g11.graphGraphPattern.name]: [ T12.PatternGroup ];
      [g11.serviceGraphPattern.name]: [ T12.PatternService ];
      [g11.bind.name]: [ T12.PatternBind ];
      [g11.inlineData.name]: [ T12.PatternValues ];
      [g11.minusGraphPattern.name]: [ T12.PatternMinus ];
      [g11.groupOrUnionGraphPattern.name]: [ T12.PatternGroup | T12.PatternUnion ];
      [g11.filter.name]: [ T12.PatternFilter ];
    }>()
    .addRule(g12.tripleTerm)
    .addRule(g12.reifiedTriple)
    .patchRule(g12.graphNodePath)
    .addRule(g12.annotationBlockPath)
    .addRule(g12.annotationPath)
    .addRule(g12.versionDecl)
    .patchRule(g12.prologue)
    .patchRule(g12.generateTriplesBlock)
    .patchRule(g12.generateGraphTerm);

export type SparqlGenerator = ReturnType<typeof sparql12GeneratorBuilder.build>;

/**
 * Generator that can generate a SPARQL 1.2 query string given a SPARQL 1.2 Traqula AST.
 */
export class Generator {
  protected readonly defaultContext: T12.SparqlGeneratorContext;
  public constructor(defaultContext: Partial<T12.SparqlGeneratorContext> = {}) {
    this.defaultContext = completeGeneratorContext(defaultContext);
  }

  private readonly generator: SparqlGenerator = sparql12GeneratorBuilder.build();

  /**
   * Generates a query string starting from the
   * [QueryUnit](https://www.w3.org/TR/sparql12-query/#rQueryUnit)
   * or [QueryUpdate](https://www.w3.org/TR/sparql12-query/#rUpdateUnit) rules.
   * @param ast
   * @param context
   */
  public generate(ast: T12.Query | T12.Update, context: Partial<T12.SparqlGeneratorContext> = {}): string {
    return this.generator.queryOrUpdate(ast, { ...this.defaultContext, ...context }).trim();
  }

  /**
   * Generates a query string starting from the [Path](https://www.w3.org/TR/sparql12-query/#rPath) grammar rule.
   * @param ast
   * @param context
   */
  public generatePath(ast: T12.Path, context: Partial<T12.SparqlGeneratorContext> = {}): string {
    return this.generator.path(ast, { ...this.defaultContext, ...context }, undefined).trim();
  }
}
