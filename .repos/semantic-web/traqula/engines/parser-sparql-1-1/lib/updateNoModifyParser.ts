import { ParserBuilder } from '@traqula/core';
import type { UpdateOperation } from '@traqula/rules-sparql-1-1';
import { gram } from '@traqula/rules-sparql-1-1';
import { triplesTemplateParserBuilder } from './triplesTemplateParserBuilder.js';

const update1Patch: typeof gram.update1 = {
  name: 'update1',
  impl: ({ SUBRULE, OR }) => () => OR<UpdateOperation>([
    { ALT: () => SUBRULE(gram.load) },
    { ALT: () => SUBRULE(gram.clear) },
    { ALT: () => SUBRULE(gram.drop) },
    { ALT: () => SUBRULE(gram.add) },
    { ALT: () => SUBRULE(gram.move) },
    { ALT: () => SUBRULE(gram.copy) },
    { ALT: () => SUBRULE(gram.create) },
    { ALT: () => SUBRULE(gram.insertData) },
    { ALT: () => SUBRULE(gram.deleteData) },
    { ALT: () => SUBRULE(gram.deleteWhere) },
  ]),
  gImpl: gram.update1.gImpl,
};

const rulesNoUpdate1 = <const>[
  gram.updateUnit,
  gram.update,
  gram.prologue,
  // Update1,
  gram.baseDecl,
  gram.prefixDecl,
  gram.load,
  gram.clear,
  gram.drop,
  gram.add,
  gram.move,
  gram.copy,
  gram.create,
  gram.insertData,
  gram.deleteData,
  gram.deleteWhere,
  gram.iri,
  gram.prefixedName,
  gram.graphRef,
  gram.graphRefAll,
  gram.graphOrDefault,
  gram.quadData,
  gram.quads,
];

/**
 * Simple SPARQL 1.1 Update parser excluding MODIFY operations.
 * Top enable MODIFY, you need to path the update1 rule.
 */
export const updateNoModifyParserBuilder = ParserBuilder
  .create(rulesNoUpdate1)
  .addRule(update1Patch)
  .merge(triplesTemplateParserBuilder, <const> [])
  .addRule(gram.quadPattern)
  .addRule(gram.quadsNotTriples);

export type updateNoModifyParser = ReturnType<typeof updateNoModifyParserBuilder.build>;
