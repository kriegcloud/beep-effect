import type { ImplArgs, RuleDefReturn, Wrap } from '@traqula/core';
import * as l from '../lexer/index.js';
import type { SparqlGrammarRule, SparqlRule } from '../sparql11HelperTypes.js';
import type {
  Expression,
  ExpressionFunctionCall,
  ExpressionOperation,
  TermIri,
  TermLiteral,
} from '../Sparql11types.js';
import { aggregate, builtInCall } from './builtIn.js';
import {
  var_,
  varOrTerm,
} from './general.js';
import {
  booleanLiteral,
  iri,
  numericLiteral,
  numericLiteralNegative,
  numericLiteralPositive,
  rdfLiteral,
} from './literals.js';
import { groupGraphPattern } from './whereClause.js';

/**
 * [[71]](https://www.w3.org/TR/sparql11-query/#rArgList)
 */
export interface IArgList {
  args: Expression[];
  distinct: boolean;
}
export const argList: SparqlRule<'argList', Wrap<IArgList>> = <const> {
  name: 'argList',
  impl: ({ ACTION, CONSUME, SUBRULE1, OPTION, OR, AT_LEAST_ONE_SEP }) => C =>
    OR<RuleDefReturn<typeof argList>>([
      { ALT: () => {
        const nil = CONSUME(l.terminals.nil);
        return ACTION(() =>
          C.astFactory.wrap({ args: [], distinct: false }, C.astFactory.sourceLocation(nil)));
      } },
      { ALT: () => {
        const args: Expression[] = [];
        const open = CONSUME(l.symbols.LParen);
        const distinct = OPTION(() => {
          CONSUME(l.distinct);
          return true;
        }) ?? false;

        AT_LEAST_ONE_SEP({
          SEP: l.symbols.comma,
          DEF: () => {
            const arg = SUBRULE1(expression);
            args.push(arg);
          },
        });
        const close = CONSUME(l.symbols.RParen);
        return ACTION(() =>
          C.astFactory.wrap({ args, distinct }, C.astFactory.sourceLocation(open, close)));
      } },
    ]),
  gImpl: ({ SUBRULE, PRINT_WORD }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => {
      PRINT_WORD('(');
      if (ast.val.distinct) {
        PRINT_WORD('DISTINCT');
      }
    });
    const [ head, ...tail ] = ast.val.args;
    if (head) {
      SUBRULE(expression, head);
    }
    for (const expr of tail) {
      F.printFilter(ast, () => PRINT_WORD(','));
      SUBRULE(expression, expr);
    }
    F.printFilter(ast, () => PRINT_WORD(')'));
  },
};

/**
 * [[72]](https://www.w3.org/TR/sparql11-query/#rConstructTemplate)
 */
export const expressionList: SparqlGrammarRule<'expressionList', Wrap<Expression[]>> = <const> {
  name: 'expressionList',
  impl: ({ ACTION, CONSUME, MANY, OR, SUBRULE1, SUBRULE2 }) => C => OR([
    { ALT: () => {
      const nil = CONSUME(l.terminals.nil);
      return ACTION(() => C.astFactory.wrap([], C.astFactory.sourceLocation(nil)));
    } },
    { ALT: () => {
      const open = CONSUME(l.symbols.LParen);
      const expr1 = SUBRULE1(expression);
      const args: Expression[] = [ expr1 ];
      MANY(() => {
        CONSUME(l.symbols.comma);
        const expr = SUBRULE2(expression);
        args.push(expr);
      });
      const close = CONSUME(l.symbols.RParen);
      return ACTION(() => C.astFactory.wrap(args, C.astFactory.sourceLocation(open, close)));
    } },
  ]),
};

const infixOperators = new Set([ 'in', 'notin', '||', '&&', '=', '!=', '<', '>', '<=', '>=', '+', '-', '*', '/' ]);
const prefixOperator: Record<string, string> = { '!': '', uplus: '+', uminus: '-' };

/**
 * [[110]](https://www.w3.org/TR/sparql11-query/#rExpression)
 */
export const expression: SparqlRule<'expression', Expression> = <const> {
  name: 'expression',
  impl: ({ SUBRULE }) => () => SUBRULE(conditionalOrExpression),
  gImpl: ({ SUBRULE, PRINT_WORD }) => (ast, { astFactory: F }) => {
    if (F.isTerm(ast)) {
      SUBRULE(varOrTerm, ast);
    } else if (F.isExpressionOperator(ast)) {
      if (infixOperators.has(ast.operator)) {
        const [ left, ...right ] = ast.args;
        F.printFilter(ast, () => PRINT_WORD('('));
        SUBRULE(expression, left);
        F.printFilter(ast, () => {
          if (ast.operator === 'notin') {
            PRINT_WORD('NOT IN');
          } else if (ast.operator === 'in') {
            PRINT_WORD('IN');
          } else {
            PRINT_WORD(ast.operator.toUpperCase());
          }
        });
        if (right.length === 1) {
          SUBRULE(expression, right[0]);
        } else {
          SUBRULE(argList, F.wrap({ args: right, distinct: false }, ast.loc));
        }
        F.printFilter(ast, () => PRINT_WORD(')'));
      } else if (typeof prefixOperator[ast.operator] === 'string') {
        const [ expr ] = <[Expression]>ast.args;
        F.printFilter(ast, () => PRINT_WORD(prefixOperator[ast.operator] || ast.operator.toUpperCase()));
        SUBRULE(expression, expr);
      } else {
        F.printFilter(ast, () => PRINT_WORD(ast.operator.toUpperCase(), '('));
        const [ head, ...tail ] = ast.args;
        if (head) {
          SUBRULE(expression, head);
        }
        for (const arg of tail) {
          F.printFilter(ast, () => PRINT_WORD(','));
          SUBRULE(expression, arg);
        }
        F.printFilter(ast, () => PRINT_WORD(')'));
      }
    } else if (F.isExpressionPatternOperation(ast)) {
      const patterns = ast.args;
      F.printFilter(ast, () => PRINT_WORD(ast.operator === 'exists' ? 'EXISTS' : 'NOT EXISTS'));
      SUBRULE(groupGraphPattern, patterns);
    } else if (F.isExpressionFunctionCall(ast)) {
      SUBRULE(iriOrFunction, ast);
    } else if (F.isExpressionAggregate(ast)) {
      SUBRULE(aggregate, ast);
    }
  },
};

type LeftDeepBuildArgs = (left: Expression) => ExpressionOperation;

function constructLeftDeep(
  startGenerator: () => Expression,
  restGenerator: () => LeftDeepBuildArgs,
  ACTION: ImplArgs['ACTION'],
  MANY: ImplArgs['MANY'],
): ExpressionOperation | Expression {
  // By using iterExpression, we avoid creating unnecessary arrays
  let iterExpr = startGenerator();
  MANY(() => {
    const res = restGenerator();
    ACTION(() => {
      iterExpr = res(iterExpr);
    });
  });
  return iterExpr;
}

/**
 * [[111]](https://www.w3.org/TR/sparql11-query/#rConditionalOrExpression)
 */
export const conditionalOrExpression: SparqlGrammarRule<'conditionalOrExpression', ExpressionOperation | Expression> =
  <const> {
    name: 'conditionalOrExpression',
    impl: ({ ACTION, MANY, CONSUME, SUBRULE1, SUBRULE2 }) => C => constructLeftDeep(
      () => SUBRULE1(conditionalAndExpression),
      () => {
        CONSUME(l.symbols.logicOr);
        const args = SUBRULE2(conditionalAndExpression);
        return left => ACTION(() =>
          C.astFactory.expressionOperation('||', [ left, args ], C.astFactory.sourceLocation(left, args)));
      },
      ACTION,
      MANY,
    ),
  };

/**
 * [[112]](https://www.w3.org/TR/sparql11-query/#rConditionalAndExpression)
 */
export const conditionalAndExpression: SparqlGrammarRule<'conditionalAndExpression', Expression> = <const> {
  name: 'conditionalAndExpression',
  impl: ({ ACTION, MANY, SUBRULE1, SUBRULE2, CONSUME }) => C => constructLeftDeep(
    () => SUBRULE1(valueLogical),
    () => {
      CONSUME(l.symbols.logicAnd);
      const arg = SUBRULE2(valueLogical);
      return left => ACTION(() =>
        C.astFactory.expressionOperation('&&', [ left, arg ], C.astFactory.sourceLocation(left, arg)));
    },
    ACTION,
    MANY,
  ),
};

/**
 * [[113]](https://www.w3.org/TR/sparql11-query/#rValueLogical)
 */
export const valueLogical: SparqlGrammarRule<'valueLogical', Expression> = <const> {
  name: 'valueLogical',
  impl: ({ SUBRULE }) => () => SUBRULE(relationalExpression),
};

/**
 * [[114]](https://www.w3.org/TR/sparql11-query/#rRelationalExpression)
 */
export const relationalExpression:
SparqlGrammarRule<'relationalExpression', ExpressionOperation | Expression> = <const>{
  name: 'relationalExpression',
  impl: ({ ACTION, CONSUME, SUBRULE1, SUBRULE2, OPTION, OR1, OR2, OR3 }) => (C) => {
    const args1 = SUBRULE1(numericExpression);
    const expression = OPTION<ExpressionOperation>(() =>
      OR1<ExpressionOperation>([
        { ALT: () => {
          // Stay in numeric;
          const operator = OR2([
            { ALT: () => CONSUME(l.symbols.equal) },
            { ALT: () => CONSUME(l.symbols.notEqual) },
            { ALT: () => CONSUME(l.symbols.lessThan) },
            { ALT: () => CONSUME(l.symbols.greaterThan) },
            { ALT: () => CONSUME(l.symbols.lessThanEqual) },
            { ALT: () => CONSUME(l.symbols.greaterThanEqual) },
          ]);
          const expr = SUBRULE2(numericExpression);
          return ACTION(() => C.astFactory.expressionOperation(
            operator.image,
            [ args1, expr ],
            C.astFactory.sourceLocation(args1, expr),
          ));
        } },
        { ALT: () => {
          const operator = OR3([
            { ALT: () => CONSUME(l.in_) },
            { ALT: () => CONSUME(l.notIn) },
          ]);
          const args = SUBRULE1(expressionList);
          return ACTION(() => C.astFactory.expressionOperation(
            operator.image,
            [ args1, ...args.val ],
            C.astFactory.sourceLocation(args1, args),
          ));
        } },
      ]));
    return expression ?? args1;
  },
};

/**
 * [[115]](https://www.w3.org/TR/sparql11-query/#rNumericExpression)
 */
export const numericExpression: SparqlGrammarRule<'numericExpression', Expression> = <const> {
  name: 'numericExpression',
  impl: ({ SUBRULE }) => () => SUBRULE(additiveExpression),
};

/**
 * [[116]](https://www.w3.org/TR/sparql11-query/#rAdditiveExpression)
 */
export const additiveExpression: SparqlGrammarRule<'additiveExpression', Expression> = <const> {
  name: 'additiveExpression',
  impl: ({ ACTION, SUBRULE, CONSUME, SUBRULE1, SUBRULE2, MANY1, MANY2, OR1, OR2, OR3, OR4 }) => C =>
    constructLeftDeep(
      () => SUBRULE1(multiplicativeExpression),
      () => OR1<(left: Expression) => ExpressionOperation>([
        { ALT: () => {
          // Multiplicative expression as 2nd argument
          const operator = OR2([
            { ALT: () => CONSUME(l.symbols.opPlus) },
            { ALT: () => CONSUME(l.symbols.opMinus) },
          ]);
          const arg = SUBRULE2(multiplicativeExpression);
          return ACTION(() => left =>
            C.astFactory.expressionOperation(operator.image, [ left, arg ], C.astFactory.sourceLocation(left, arg)));
        } },
        { ALT: () => {
          // The operator of this alternative is actually parsed as part of the signed numeric literal. (note #6)
          const { operator, startInt } = OR3<{ operator: '+' | '-'; startInt: TermLiteral }>([
            { ALT: () => {
              // Note #6. No spaces are allowed between the sign and a number.
              // In this rule however, we do not want to care about this.
              const integer = SUBRULE(numericLiteralPositive);
              return ACTION(() => {
                integer.value = integer.value.replace(/^\+/u, '');
                return <const> {
                  operator: '+',
                  startInt: integer,
                };
              });
            } },
            { ALT: () => {
              const integer = SUBRULE(numericLiteralNegative);
              return ACTION(() => {
                integer.value = integer.value.replace(/^-/u, '');
                return <const> {
                  operator: '-',
                  startInt: integer,
                };
              });
            } },
          ]);
          const multiplicativeExpr = constructLeftDeep(
            () => ACTION(() => startInt),
            () => {
              const innerOperator = OR4([
                { ALT: () => CONSUME(l.symbols.star) },
                { ALT: () => CONSUME(l.symbols.slash) },
              ]);
              const innerExpr = SUBRULE1(unaryExpression);
              return ACTION(() => leftInner => C.astFactory.expressionOperation(
                innerOperator.image,
                [ leftInner, innerExpr ],
                C.astFactory.sourceLocation(leftInner, innerExpr),
              ));
            },
            ACTION,
            MANY2,
          );
          return left => C.astFactory.expressionOperation(
            operator,
            [ left, multiplicativeExpr ],
            C.astFactory.sourceLocation(left, multiplicativeExpr),
          );
        } },
      ]),
      ACTION,
      MANY1,
    ),
};

/**
 * [[117]](https://www.w3.org/TR/sparql11-query/#rMultiplicativeExpression)
 */
export const multiplicativeExpression: SparqlGrammarRule<'multiplicativeExpression', Expression> = <const> {
  name: 'multiplicativeExpression',
  impl: ({ ACTION, CONSUME, MANY, SUBRULE1, SUBRULE2, OR }) => C => constructLeftDeep(
    () => SUBRULE1(unaryExpression),
    () => {
      const operator = OR([
        { ALT: () => CONSUME(l.symbols.star) },
        { ALT: () => CONSUME(l.symbols.slash) },
      ]);
      const expr = SUBRULE2(unaryExpression);
      return (left: Expression) => ({
        type: 'expression',
        subType: 'operation',
        operator: operator.image,
        args: [ left, expr ],
        loc: C.astFactory.sourceLocation(left, expr),
      });
    },
    ACTION,
    MANY,
  ),
};

/**
 * [[118]](https://www.w3.org/TR/sparql11-query/#rUnaryExpression)
 */
export const unaryExpression: SparqlGrammarRule<'unaryExpression', Expression> = <const> {
  name: 'unaryExpression',
  impl: ({ ACTION, CONSUME, SUBRULE1, SUBRULE2, OR1, OR2 }) => C => OR1<Expression>([
    { ALT: () => SUBRULE1(primaryExpression) },
    { ALT: () => {
      const operator = OR2([
        { ALT: () => CONSUME(l.symbols.exclamation) },
        { ALT: () => CONSUME(l.symbols.opPlus) },
        { ALT: () => CONSUME(l.symbols.opMinus) },
      ]);
      const expr = SUBRULE2(primaryExpression);
      return ACTION(() => C.astFactory.expressionOperation(
        operator.image === '!' ? '!' : (operator.image === '+' ? 'UPLUS' : 'UMINUS'),
        [ expr ],
        C.astFactory.sourceLocation(operator, expr),
      ));
    } },
  ]),
};

/**
 * [[119]](https://www.w3.org/TR/sparql11-query/#rPrimaryExpression)
 */
export const primaryExpression: SparqlGrammarRule<'primaryExpression', Expression> = <const> {
  name: 'primaryExpression',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(brackettedExpression) },
    { ALT: () => SUBRULE(builtInCall) },
    { ALT: () => SUBRULE(iriOrFunction) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { ALT: () => SUBRULE(var_) },
  ]),
};

/**
 * [[120]](https://www.w3.org/TR/sparql11-query/#rBrackettedExpression)
 */
export const brackettedExpression: SparqlGrammarRule<'brackettedExpression', Expression> = <const> {
  name: 'brackettedExpression',
  impl: ({ ACTION, SUBRULE, CONSUME }) => (C) => {
    const open = CONSUME(l.symbols.LParen);
    const expr = SUBRULE(expression);
    const close = CONSUME(l.symbols.RParen);
    return ACTION(() => {
      expr.loc = C.astFactory.sourceLocation(open, close);
      return expr;
    });
  },
};

/**
 * [[128]](https://www.w3.org/TR/sparql11-query/#ririOrFunction)
 */
export const iriOrFunction: SparqlRule<'iriOrFunction', TermIri | ExpressionFunctionCall> = <const> {
  name: 'iriOrFunction',
  impl: ({ ACTION, SUBRULE, OPTION }) => (C) => {
    const iriVal = SUBRULE(iri);
    const functionCall = OPTION<ExpressionFunctionCall>(() => {
      const args = SUBRULE(argList);
      return ACTION(() => {
        const distinct = args.val.distinct;
        if (!C.parseMode.has('canParseAggregate') && distinct) {
          throw new Error(`DISTINCT implies that this function is an aggregated function, which is not allowed in this context.`);
        }
        return {
          type: 'expression',
          subType: 'functionCall',
          function: iriVal,
          args: args.val.args,
          distinct,
          loc: C.astFactory.sourceLocation(iriVal, args),
        };
      });
    });
    return functionCall ?? iriVal;
  },
  gImpl: ({ SUBRULE }) => (ast, { astFactory: F }) => {
    if (F.isTermNamed(ast)) {
      SUBRULE(iri, ast);
    } else {
      SUBRULE(iri, ast.function);
      SUBRULE(argList, F.wrap({ args: ast.args, distinct: ast.distinct }, ast.loc));
    }
  },
};
