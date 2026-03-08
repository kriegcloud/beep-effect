import { toAst11Builder } from '@traqula/algebra-sparql-1-1';
import type { Algebra, algToSparql } from '@traqula/algebra-transformations-1-1';
import type { AstContext } from '@traqula/algebra-transformations-1-2';
import { createAstContext, translateAlgTerm12 } from '@traqula/algebra-transformations-1-2';
import { IndirBuilder } from '@traqula/core';
import type { SparqlQuery } from '@traqula/rules-sparql-1-2';

export const toAst12Builder = IndirBuilder
  .create(toAst11Builder)
  .widenContext<AstContext>()
  .patchRule(translateAlgTerm12)
  .typePatch<{
    [algToSparql.name]: [SparqlQuery, [Algebra.Operation]];
  }>();

/**
 * Transform an operation to a Traqula SPARQL 1.2 AST.
 * @param op
 */
export function toAst(op: Algebra.Operation): SparqlQuery {
  const c = createAstContext();
  const transformer = toAst12Builder.build();
  return transformer.algToSparql(c, op);
}
