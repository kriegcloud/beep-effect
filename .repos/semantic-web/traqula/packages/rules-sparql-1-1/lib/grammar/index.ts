import { symbols } from '../lexer/index.js';
import type { SparqlRule } from '../sparql11HelperTypes.js';
import type { Query, SparqlQuery, Update } from '../Sparql11types.js';
import { updateNoReuseBlankNodeLabels } from '../validation/validators.js';
import { prologue } from './general.js';
import type { HandledByBase } from './queryUnit.js';
import { query, askQuery, constructQuery, describeQuery, selectQuery, valuesClause } from './queryUnit.js';
import { update, update1 } from './updateUnit.js';

export * from './queryUnit.js';
export * from './updateUnit.js';
export * from './builtIn.js';
export * from './dataSetClause.js';
export * from './expression.js';
export * from '../expressionHelpers.js';
export * from './general.js';
export * from './literals.js';
export * from './propertyPaths.js';
export * from './solutionModifier.js';
export * from './tripleBlock.js';
export * from './whereClause.js';

/**
 * Query or update, optimized for the Query case.
 * One could implement a new rule that does not use BACKTRACK.
 */
export const queryOrUpdate: SparqlRule<'queryOrUpdate', SparqlQuery> = {
  name: 'queryOrUpdate',
  impl: ({ ACTION, SUBRULE, OR1, OR2, MANY, OPTION1, CONSUME, SUBRULE2 }) => (C) => {
    const prologueValues = SUBRULE(prologue);
    return OR1<Query | Update>([
      { ALT: () => {
        const subType = OR2<Omit<Query, HandledByBase>>([
          { ALT: () => SUBRULE(selectQuery) },
          { ALT: () => SUBRULE(constructQuery) },
          { ALT: () => SUBRULE(describeQuery) },
          { ALT: () => SUBRULE(askQuery) },
        ]);
        const values = SUBRULE(valuesClause);
        return ACTION(() => (<Query>{
          context: prologueValues,
          ...subType,
          type: 'query',
          ...(values && { values }),
          loc: C.astFactory.sourceLocation(
            prologueValues.at(0),
            subType,
            values,
          ),
        }));
      } },
      { ALT: () => {
        const updates: Update['updates'] = [];
        updates.push({ context: prologueValues });
        let parsedSemi = true;
        MANY({
          GATE: () => parsedSemi,
          DEF: () => {
            parsedSemi = false;
            updates.at(-1)!.operation = SUBRULE(update1);

            OPTION1(() => {
              CONSUME(symbols.semi);

              parsedSemi = true;
              const innerPrologue = SUBRULE2(prologue);
              updates.push({ context: innerPrologue });
            });
          },
        });
        return ACTION(() => {
          const update = {
            type: 'update',
            updates,
            loc: C.astFactory.sourceLocation(
              ...updates.flatMap(x => [ ...x.context, x.operation ]),
            ),
          } satisfies Update;
          if (!C.skipValidation) {
            updateNoReuseBlankNodeLabels(update);
          }
          return update;
        });
      } },
    ]);
  },
  gImpl: ({ SUBRULE }) => (ast, { astFactory: F }) => {
    if (F.isQuery(ast)) {
      SUBRULE(query, ast);
    } else {
      SUBRULE(update, ast);
    }
  },
};
