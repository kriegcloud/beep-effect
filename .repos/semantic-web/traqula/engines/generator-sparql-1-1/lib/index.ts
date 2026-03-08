import { GeneratorBuilder } from '@traqula/core';
import type * as T11 from '@traqula/rules-sparql-1-1';
import { gram, completeGeneratorContext } from '@traqula/rules-sparql-1-1';

export const sparql11GeneratorBuilder = GeneratorBuilder.create(<const> [
  gram.queryOrUpdate,
  gram.query,
  gram.selectQuery,
  gram.constructQuery,
  gram.describeQuery,
  gram.askQuery,
  gram.selectClause,
])
  .addMany(
    gram.update,
    gram.update1,
    gram.load,
    gram.clear,
    gram.drop,
    gram.create,
    gram.copy,
    gram.move,
    gram.add,
    gram.insertData,
    gram.deleteData,
    gram.deleteWhere,
    gram.modify,
    gram.graphRef,
    gram.graphRefAll,
    gram.quads,
    gram.quadsNotTriples,
  )
  .addRule(gram.aggregate)
  .addMany(
    gram.datasetClauseStar,
    gram.usingClauseStar,
  )
  .addMany(
    gram.argList,
    gram.expression,
    gram.iriOrFunction,
  )
  .addMany(
    gram.prologue,
    gram.prefixDecl,
    gram.baseDecl,
    gram.varOrTerm,
    gram.var_,
    gram.graphTerm,
  )
  .addMany(
    gram.rdfLiteral,
    gram.iri,
    gram.iriFull,
    gram.prefixedName,
    gram.blankNode,
  )
  .addRule(gram.pathGenerator)
  .addMany(
    gram.solutionModifier,
    gram.groupClause,
    gram.havingClause,
    gram.orderClause,
    gram.limitOffsetClauses,
  )
  .addMany(
    gram.triplesBlock,
    gram.collectionPath,
    gram.blankNodePropertyListPath,
    gram.triplesNodePath,
    gram.graphNodePath,
  )
  .addMany(
    gram.whereClause,
    gram.generatePattern,
    gram.groupGraphPattern,
    gram.graphPatternNotTriples,
    gram.optionalGraphPattern,
    gram.graphGraphPattern,
    gram.serviceGraphPattern,
    gram.bind,
    gram.inlineData,
    gram.minusGraphPattern,
    gram.groupOrUnionGraphPattern,
    gram.filter,
  );

export type SparqlGenerator = ReturnType<typeof sparql11GeneratorBuilder.build>;

/**
 * Generator that can generate a SPARQL 1.1 query string given a SPARQL 1.1 Traqula AST.
 */
export class Generator {
  protected readonly defaultContext: T11.SparqlGeneratorContext;
  public constructor(defaultContext: Partial<T11.SparqlGeneratorContext> = {}) {
    this.defaultContext = completeGeneratorContext(defaultContext);
  }

  private readonly generator: SparqlGenerator = sparql11GeneratorBuilder.build();

  /**
   * Generates a query string starting from the
   * [QueryUnit](https://www.w3.org/TR/sparql11-query/#rQueryUnit)
   * or [QueryUpdate](https://www.w3.org/TR/sparql11-query/#rUpdateUnit) rules.
   * @param ast
   * @param context
   */
  public generate(ast: T11.Query | T11.Update, context: Partial<T11.SparqlGeneratorContext> = {}): string {
    return this.generator.queryOrUpdate(ast, { ...this.defaultContext, ...context }).trim();
  }

  /**
   * Generates a query string starting from the [Path](https://www.w3.org/TR/sparql11-query/#rPath) grammar rule.
   * @param ast
   * @param context
   */
  public generatePath(ast: T11.Path, context: Partial<T11.SparqlGeneratorContext> = {}): string {
    return this.generator.path(ast, completeGeneratorContext({ ...this.defaultContext, ...context }), undefined).trim();
  }
}
