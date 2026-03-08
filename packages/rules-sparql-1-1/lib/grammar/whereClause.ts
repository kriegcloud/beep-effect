import type { RuleDefReturn, Wrap } from '@traqula/core';
import { traqulaIndentation } from '@traqula/core';
import * as l from '../lexer/index.js';
import type { SparqlGeneratorRule, SparqlGrammarRule, SparqlRule } from '../sparql11HelperTypes.js';
import type {
  Expression,
  ExpressionFunctionCall,
  Pattern,
  PatternBgp,
  PatternBind,
  PatternFilter,
  PatternGraph,
  PatternGroup,
  PatternMinus,
  PatternOptional,
  PatternService,
  PatternUnion,
  PatternValues,
  SubSelect,
  TermIri,
  TermLiteral,
  TermVariable,
  ValuePatternRow,
} from '../Sparql11types.js';
import { checkNote13 } from '../validation/validators.js';
import { builtInCall } from './builtIn.js';
import { argList, brackettedExpression, expression } from './expression.js';
import { var_, varOrIri, varOrTerm } from './general.js';
import { booleanLiteral, iri, numericLiteral, rdfLiteral } from './literals.js';
import { query, subSelect } from './queryUnit.js';
import { graphNodePath, triplesBlock } from './tripleBlock.js';

/**
 * [[17]](https://www.w3.org/TR/sparql11-query/#rWhereClause)
 */
export const whereClause: SparqlRule<'whereClause', Wrap<PatternGroup>> = <const> {
  name: 'whereClause',
  impl: ({ ACTION, SUBRULE, CONSUME, OPTION }) => (C) => {
    const where = OPTION(() => CONSUME(l.where));
    const group = SUBRULE(groupGraphPattern);
    return ACTION(() => C.astFactory.wrap(group, C.astFactory.sourceLocation(where, group)));
  },
  gImpl: ({ SUBRULE, PRINT_WORD }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => PRINT_WORD('WHERE'));
    SUBRULE(groupGraphPattern, ast.val);
  },
};

/**
 * [[53]](https://www.w3.org/TR/sparql11-query/#rGroupGraphPattern)
 */
export const groupGraphPattern: SparqlRule<'groupGraphPattern', PatternGroup> = <const> {
  name: 'groupGraphPattern',
  impl: ({ ACTION, SUBRULE, CONSUME, OR }) => (C) => {
    const open = CONSUME(l.symbols.LCurly);
    const patterns = OR<Pattern[]>([
      { ALT: () => [ SUBRULE(subSelect) ]},
      { ALT: () => SUBRULE(groupGraphPatternSub) },
    ]);
    const close = CONSUME(l.symbols.RCurly);

    return ACTION(() => C.astFactory.patternGroup(patterns, C.astFactory.sourceLocation(open, close)));
  },
  gImpl: ({ SUBRULE, PRINT_WORD, NEW_LINE, PRINT_ON_OWN_LINE }) => (ast, C) => {
    const { astFactory: F, indentInc } = C;
    F.printFilter(ast, () => {
      C[traqulaIndentation] += indentInc;
      PRINT_WORD('{');
      NEW_LINE();
    });

    for (const pattern of ast.patterns) {
      SUBRULE(generatePattern, pattern);
    }

    F.printFilter(ast, () => {
      C[traqulaIndentation] -= indentInc;
      PRINT_ON_OWN_LINE('}');
    });
  },
};

export const generatePattern: SparqlGeneratorRule<'generatePattern', Pattern> = {
  name: 'generatePattern',
  gImpl: ({ SUBRULE }) => (ast, { astFactory: F }) => {
    if (ast.type === 'query') {
      SUBRULE(query, F.querySelect({
        context: [],
        datasets: F.datasetClauses([], F.sourceLocation()),
        where: ast.where,
        variables: ast.variables,
        solutionModifiers: ast.solutionModifiers,
        values: ast.values,
        distinct: ast.distinct,
        reduced: ast.reduced,
      }, ast.loc));
    } else if (ast.subType === 'group') {
      SUBRULE(groupGraphPattern, ast);
    } else if (ast.subType === 'bgp') {
      SUBRULE(triplesBlock, ast);
    } else {
      SUBRULE(graphPatternNotTriples, ast);
    }
  },
};

/**
 * [[54]](https://www.w3.org/TR/sparql11-query/#rGroupGraphPatternSub)
 */
export const groupGraphPatternSub:
SparqlGrammarRule<'groupGraphPatternSub', Pattern[]> = <const> {
  name: 'groupGraphPatternSub',
  impl: ({ ACTION, SUBRULE, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION1, OPTION2, OPTION3 }) => (C) => {
    const patterns: Pattern[] = [];

    const bgpPattern = OPTION1(() => SUBRULE1(triplesBlock));
    if (bgpPattern) {
      patterns.push(bgpPattern);
    }
    MANY(() => {
      const notTriples = SUBRULE(graphPatternNotTriples);
      patterns.push(notTriples);

      OPTION2(() => CONSUME(l.symbols.dot));

      const moreTriples = OPTION3(() => SUBRULE2(triplesBlock));
      if (moreTriples) {
        patterns.push(moreTriples);
      }
    });

    ACTION(() => !C.skipValidation && checkNote13(patterns));

    return patterns;
  },
};

/**
 * [[56]](https://www.w3.org/TR/sparql11-query/#rGraphPatternNotTriples)
 */
export const graphPatternNotTriples: SparqlRule<'graphPatternNotTriples', Exclude<Pattern, SubSelect | PatternBgp>> = {
  name: 'graphPatternNotTriples',
  impl: ({ SUBRULE, OR }) => () => OR<RuleDefReturn<typeof graphPatternNotTriples>>([
    { ALT: () => SUBRULE(groupOrUnionGraphPattern) },
    { ALT: () => SUBRULE(optionalGraphPattern) },
    { ALT: () => SUBRULE(minusGraphPattern) },
    { ALT: () => SUBRULE(graphGraphPattern) },
    { ALT: () => SUBRULE(serviceGraphPattern) },
    { ALT: () => SUBRULE(filter) },
    { ALT: () => SUBRULE(bind) },
    { ALT: () => SUBRULE(inlineData) },
  ]),
  gImpl: ({ SUBRULE }) => (ast) => {
    switch (ast.subType) {
      case 'group':
      case 'union':
        SUBRULE(groupOrUnionGraphPattern, ast);
        break;
      case 'optional':
        SUBRULE(optionalGraphPattern, ast);
        break;
      case 'minus':
        SUBRULE(minusGraphPattern, ast);
        break;
      case 'graph':
        SUBRULE(graphGraphPattern, ast);
        break;
      case 'service':
        SUBRULE(serviceGraphPattern, ast);
        break;
      case 'filter':
        SUBRULE(filter, ast);
        break;
      case 'bind':
        SUBRULE(bind, ast);
        break;
      case 'values':
        SUBRULE(inlineData, ast);
        break;
    }
  },
};

/**
 * [[57]](https://www.w3.org/TR/sparql11-query/#rOptionalGraphPattern)
 */
export const optionalGraphPattern: SparqlRule<'optionalGraphPattern', PatternOptional> = <const> {
  name: 'optionalGraphPattern',
  impl: ({ ACTION, SUBRULE, CONSUME }) => (C) => {
    const optional = CONSUME(l.optional);
    const group = SUBRULE(groupGraphPattern);

    return ACTION(() => C.astFactory.patternOptional(group.patterns, C.astFactory.sourceLocation(optional, group)));
  },
  gImpl: ({ SUBRULE, PRINT_WORD }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => PRINT_WORD('OPTIONAL'));
    SUBRULE(groupGraphPattern, F.patternGroup(ast.patterns, ast.loc));
  },
};

/**
 * [[58]](https://www.w3.org/TR/sparql11-query/#rGraphGraphPattern)
 */
export const graphGraphPattern: SparqlRule<'graphGraphPattern', PatternGraph> = <const> {
  name: 'graphGraphPattern',
  impl: ({ ACTION, SUBRULE, CONSUME }) => (C) => {
    const graph = CONSUME(l.graph.graph);
    const name = SUBRULE(varOrIri);
    const group = SUBRULE(groupGraphPattern);

    return ACTION(() => C.astFactory.patternGraph(name, group.patterns, C.astFactory.sourceLocation(graph, group)));
  },
  gImpl: ({ SUBRULE, PRINT_WORD }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => PRINT_WORD('GRAPH'));
    SUBRULE(varOrTerm, ast.name);
    SUBRULE(groupGraphPattern, F.patternGroup(ast.patterns, ast.loc));
  },
};

/**
 * [[59]](https://www.w3.org/TR/sparql11-query/#rServiceGraphPattern)
 */
export const serviceGraphPattern: SparqlRule<'serviceGraphPattern', PatternService> = <const> {
  name: 'serviceGraphPattern',
  impl: ({ ACTION, SUBRULE1, CONSUME, OPTION }) => (C) => {
    const service = CONSUME(l.service);
    const silent = OPTION(() => {
      CONSUME(l.silent);
      return true;
    }) ?? false;
    const name = SUBRULE1(varOrIri);
    const group = SUBRULE1(groupGraphPattern);

    return ACTION(() =>
      C.astFactory.patternService(name, group.patterns, silent, C.astFactory.sourceLocation(service, group)));
  },
  gImpl: ({ SUBRULE, PRINT_WORD }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => {
      PRINT_WORD('SERVICE');
      if (ast.silent) {
        PRINT_WORD('SILENT');
      }
    });
    SUBRULE(varOrTerm, ast.name);
    SUBRULE(groupGraphPattern, F.patternGroup(ast.patterns, ast.loc));
  },
};

/**
 * [[60]](https://www.w3.org/TR/sparql11-query/#rBind)
 */
export const bind: SparqlRule<'bind', PatternBind> = <const> {
  name: 'bind',
  impl: ({ ACTION, SUBRULE, CONSUME }) => (C) => {
    const bind = CONSUME(l.bind);
    CONSUME(l.symbols.LParen);
    const expressionVal = SUBRULE(expression);
    CONSUME(l.as);
    const variable = SUBRULE(var_);
    const close = CONSUME(l.symbols.RParen);

    return ACTION(() => C.astFactory.patternBind(expressionVal, variable, C.astFactory.sourceLocation(bind, close)));
  },
  gImpl: ({ SUBRULE, PRINT_WORD, NEW_LINE }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => PRINT_WORD('BIND', '('));
    SUBRULE(expression, ast.expression);
    F.printFilter(ast, () => PRINT_WORD('AS'));
    SUBRULE(var_, ast.variable);
    F.printFilter(ast, () => {
      PRINT_WORD(')');
      NEW_LINE();
    });
  },
};

/**
 * [[61]](https://www.w3.org/TR/sparql11-query/#rInlineData)
 */
export const inlineData: SparqlRule<'inlineData', PatternValues> = <const> {
  name: 'inlineData',
  impl: ({ ACTION, SUBRULE, CONSUME }) => (C) => {
    const values = CONSUME(l.values);
    const datablock = SUBRULE(dataBlock);

    return ACTION(() => {
      datablock.loc = C.astFactory.sourceLocation(values, datablock);
      return datablock;
    });
  },
  gImpl: ({ SUBRULE, PRINT_WORD, PRINT_ON_EMPTY, NEW_LINE, PRINT_ON_OWN_LINE }) => (ast, C) => {
    const { astFactory: F, indentInc } = C;
    const variables = ast.variables;
    const singleVar = variables.length === 1;
    F.printFilter(ast, () => {
      PRINT_ON_EMPTY('VALUES', singleVar ? '' : '( ');
    });
    for (const variable of variables) {
      F.printFilter(ast, () => PRINT_WORD(''));
      SUBRULE(varOrTerm, variable);
      F.printFilter(ast, () => PRINT_WORD(''));
    }
    F.printFilter(ast, () => {
      C[traqulaIndentation] += indentInc;
      PRINT_WORD(singleVar ? '' : ')', '{');
      NEW_LINE();
    });

    for (const mapping of ast.values) {
      F.printFilter(ast, () => !singleVar && PRINT_WORD('('));
      for (const variable of variables) {
        const var_ = variable.value;
        if (mapping[var_] === undefined) {
          F.printFilter(ast, () => PRINT_WORD('UNDEF'));
        } else {
          SUBRULE(graphNodePath, mapping[var_]);
        }
      }
      F.printFilter(ast, () => {
        PRINT_WORD(singleVar ? '' : ')');
        NEW_LINE();
      });
    }
    F.printFilter(ast, () => {
      C[traqulaIndentation] -= indentInc;
      PRINT_ON_OWN_LINE('}');
    });
  },
};

/**
 * [[62]](https://www.w3.org/TR/sparql11-query/#rDataBlock)
 */
export const dataBlock: SparqlGrammarRule<'dataBlock', PatternValues> = <const> {
  name: 'dataBlock',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(inlineDataOneVar) },
    { ALT: () => SUBRULE(inlineDataFull) },
  ]),
};

/**
 * [[63]](https://www.w3.org/TR/sparql11-query/#rInlineDataOneVar)
 */
export const inlineDataOneVar: SparqlGrammarRule<'inlineDataOneVar', PatternValues> = <const> {
  name: 'inlineDataOneVar',
  impl: ({ ACTION, SUBRULE, CONSUME, MANY }) => (C) => {
    const res: ValuePatternRow[] = [];
    const varVal = SUBRULE(var_);
    CONSUME(l.symbols.LCurly);
    MANY(() => {
      const value = SUBRULE(dataBlockValue);
      ACTION(() => {
        res.push({ [varVal.value]: value });
      });
    });
    const close = CONSUME(l.symbols.RCurly);

    return ACTION(() => C.astFactory.patternValues([ varVal ], res, C.astFactory.sourceLocation(varVal, close)));
  },
};

/**
 * [[64]](https://www.w3.org/TR/sparql11-query/#rInlineDataFull)
 */
export const inlineDataFull: SparqlGrammarRule<'inlineDataFull', PatternValues> = <const> {
  name: 'inlineDataFull',
  impl: ({
    ACTION,
    OR,
    MANY1,
    MANY2,
    MANY3,
    MANY4,
    SUBRULE,
    CONSUME1,
    CONSUME2,
  }) => (C) => {
    const res: ValuePatternRow[] = [];
    const vars: TermVariable[] = [];
    return OR<RuleDefReturn<typeof inlineDataFull>>([
      { ALT: () => {
        // Grammar rule 64 together with note 11 learns us that a nil should be followed by a nil in DataBlock.
        const nil = CONSUME1(l.terminals.nil);
        CONSUME1(l.symbols.LCurly);
        MANY1(() => {
          CONSUME2(l.terminals.nil);
          res.push({});
        });
        const close = CONSUME1(l.symbols.RCurly);

        return ACTION(() => C.astFactory.patternValues(vars, res, C.astFactory.sourceLocation(nil, close)));
      } },
      { ALT: () => {
        const open = CONSUME1(l.symbols.LParen);
        MANY2(() => {
          vars.push(SUBRULE(var_));
        });
        CONSUME1(l.symbols.RParen);
        CONSUME2(l.symbols.LCurly);
        MANY3(() => {
          let parsedValues = 0;
          const currentRow: ValuePatternRow = {};
          CONSUME2(l.symbols.LParen);
          MANY4(() => {
            ACTION(() => {
              if (!C.skipValidation && parsedValues >= vars.length) {
                throw new Error('Number of dataBlockValues does not match number of variables. Too much values.');
              }
            });
            const value = SUBRULE(dataBlockValue);
            ACTION(() => {
              currentRow[vars[parsedValues].value] = value;
              parsedValues++;
            });
          });
          CONSUME2(l.symbols.RParen);
          ACTION(() => {
            res.push(currentRow);
            if (!C.skipValidation && vars.length !== parsedValues) {
              throw new Error('Number of dataBlockValues does not match number of variables. Too few values.');
            }
          });
        });
        const close = CONSUME2(l.symbols.RCurly);
        return ACTION(() => C.astFactory.patternValues(vars, res, C.astFactory.sourceLocation(open, close)));
      } },
    ]);
  },
};

/**
 * [[65]](https://www.w3.org/TR/sparql11-query/#rDataBlockValue)
 */
export const dataBlockValue: SparqlGrammarRule<'dataBlockValue', TermIri | TermLiteral | undefined> = {
  name: 'dataBlockValue',
  impl: ({ SUBRULE, CONSUME, OR }) => () => OR<RuleDefReturn<typeof dataBlockValue>>([
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { ALT: () => {
      CONSUME(l.undef);
      // eslint-disable-next-line unicorn/no-useless-undefined
      return undefined;
    } },
  ]),
};

/**
 * [[66]](https://www.w3.org/TR/sparql11-query/#rMinusGraphPattern)
 */
export const minusGraphPattern: SparqlRule<'minusGraphPattern', PatternMinus> = <const> {
  name: 'minusGraphPattern',
  impl: ({ ACTION, SUBRULE, CONSUME }) => (C) => {
    const minus = CONSUME(l.minus);
    const group = SUBRULE(groupGraphPattern);

    return ACTION(() => C.astFactory.patternMinus(group.patterns, C.astFactory.sourceLocation(minus, group)));
  },
  gImpl: ({ SUBRULE, PRINT_WORD }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => PRINT_WORD('MINUS'));
    SUBRULE(groupGraphPattern, F.patternGroup(ast.patterns, ast.loc));
  },
};

/**
 * [[67]](https://www.w3.org/TR/sparql11-query/#rGroupOrUnionGraphPattern)
 */
export const groupOrUnionGraphPattern: SparqlRule<'groupOrUnionGraphPattern', PatternGroup | PatternUnion> =
  <const> {
    name: 'groupOrUnionGraphPattern',
    impl: ({ ACTION, MANY, SUBRULE1, SUBRULE2, CONSUME }) => (C) => {
      const groups: PatternGroup[] = [];

      const group = SUBRULE1(groupGraphPattern);
      groups.push(group);
      MANY(() => {
        CONSUME(l.union);
        const group = SUBRULE2(groupGraphPattern);
        groups.push(group);
      });

      return ACTION(() => groups.length === 1 ?
        groups[0] :
        C.astFactory.patternUnion(
          groups,
          C.astFactory.sourceLocation(group, groups.at(-1)),
        ));
    },
    gImpl: ({ SUBRULE, PRINT_WORD }) => (ast, { astFactory: F }) => {
      if (F.isPatternUnion(ast)) {
        const [ head, ...tail ] = ast.patterns;
        SUBRULE(groupGraphPattern, head);
        for (const pattern of tail) {
          F.printFilter(ast, () => PRINT_WORD('UNION'));
          SUBRULE(groupGraphPattern, pattern);
        }
      } else {
        SUBRULE(groupGraphPattern, ast);
      }
    },
  };

/**
 * [[68]](https://www.w3.org/TR/sparql11-query/#rFilter)
 */
export const filter: SparqlRule<'filter', PatternFilter> = <const> {
  name: 'filter',
  impl: ({ ACTION, SUBRULE, CONSUME }) => (C) => {
    const filterToken = CONSUME(l.filter);
    const expression = SUBRULE(constraint);

    return ACTION(() => C.astFactory.patternFilter(expression, C.astFactory.sourceLocation(filterToken, expression)));
  },
  gImpl: ({ SUBRULE, PRINT_WORD, NEW_LINE }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => PRINT_WORD('FILTER ('));
    SUBRULE(expression, ast.expression);
    F.printFilter(ast, () => {
      PRINT_WORD(')');
      NEW_LINE();
    });
  },
};

/**
 * [[69]](https://www.w3.org/TR/sparql11-query/#rConstraint)
 */
export const constraint: SparqlGrammarRule<'constraint', Expression> = <const> {
  name: 'constraint',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(brackettedExpression) },
    { ALT: () => SUBRULE(builtInCall) },
    { ALT: () => SUBRULE(functionCall) },
  ]),
};

/**
 * [[70]](https://www.w3.org/TR/sparql11-query/#rFunctionCall)
 */
export const functionCall: SparqlGrammarRule<'functionCall', ExpressionFunctionCall> = <const> {
  name: 'functionCall',
  impl: ({ ACTION, SUBRULE }) => (C) => {
    const func = SUBRULE(iri);
    const args = SUBRULE(argList);
    return ACTION(() => C.astFactory.expressionFunctionCall(
      func,
      args.val.args,
      args.val.distinct,
      C.astFactory.sourceLocation(func, args),
    ));
  },
};
