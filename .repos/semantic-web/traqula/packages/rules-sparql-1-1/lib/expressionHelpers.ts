import type { TokenType } from '@traqula/chevrotain';
import { unCapitalize } from '@traqula/core';
import { var_, expression, expressionList, groupGraphPattern } from './grammar/index.js';
import * as l from './lexer/index.js';
import type { SparqlGrammarRule } from './sparql11HelperTypes.js';
import type {
  Expression,
  ExpressionAggregateDefault,
  ExpressionOperation,
  ExpressionPatternOperation,
  TermVariable,
} from './Sparql11types.js';

export type ExpressionFunctionX<U extends Expression[]> = ExpressionOperation & {
  args: U;
};

export type RuleDefExpressionFunctionX<T extends string, U extends Expression[]>
  = SparqlGrammarRule<T, ExpressionFunctionX<U>>;

export function funcExpr1<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, [Expression]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ ACTION, SUBRULE, CONSUME }) => (C) => {
      const operator = CONSUME(func);
      CONSUME(l.symbols.LParen);
      const arg = SUBRULE(expression);
      const close = CONSUME(l.symbols.RParen);
      return ACTION(() =>
        C.astFactory.expressionOperation(operator.image, [ arg ], C.astFactory.sourceLocation(operator, close)));
    },
  };
}

export function funcExpr2<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, [Expression, Expression]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ ACTION, CONSUME, SUBRULE1, SUBRULE2 }) => (C) => {
      const operator = CONSUME(func);
      CONSUME(l.symbols.LParen);
      const arg1 = SUBRULE1(expression);
      CONSUME(l.symbols.comma);
      const arg2 = SUBRULE2(expression);
      const close = CONSUME(l.symbols.RParen);
      return ACTION(() =>
        C.astFactory.expressionOperation(operator.image, [ arg1, arg2 ], C.astFactory.sourceLocation(operator, close)));
    },
  };
}

export function funcExpr3<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, [Expression, Expression, Expression]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ ACTION, CONSUME, CONSUME1, CONSUME2, SUBRULE1, SUBRULE2, SUBRULE3 }) => (C) => {
      const operator = CONSUME(func);
      CONSUME(l.symbols.LParen);
      const arg1 = SUBRULE1(expression);
      CONSUME1(l.symbols.comma);
      const arg2 = SUBRULE2(expression);
      CONSUME2(l.symbols.comma);
      const arg3 = SUBRULE3(expression);
      const close = CONSUME(l.symbols.RParen);

      return ACTION(() =>
        C.astFactory.expressionOperation(
          operator.image,
          [ arg1, arg2, arg3 ],
          C.astFactory.sourceLocation(operator, close),
        ));
    },
  };
}

export function funcVar1<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, [TermVariable]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ ACTION, SUBRULE, CONSUME }) => (C) => {
      const operator = CONSUME(func);
      CONSUME(l.symbols.LParen);
      const arg = SUBRULE(var_);
      const close = CONSUME(l.symbols.RParen);
      return ACTION(() =>
        C.astFactory.expressionOperation(operator.image, [ arg ], C.astFactory.sourceLocation(operator, close)));
    },
  };
}

export function funcExprOrNil1<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, [] | [Expression]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ ACTION, CONSUME, OR, SUBRULE }) => (C) => {
      const operator = CONSUME(func);
      return OR<ExpressionFunctionX<[] | [Expression]>>([
        { ALT: () => {
          CONSUME(l.symbols.LParen);
          const arg = SUBRULE(expression);
          const close = CONSUME(l.symbols.RParen);
          return ACTION(() =>
            C.astFactory.expressionOperation(operator.image, [ arg ], C.astFactory.sourceLocation(operator, close)));
        } },
        { ALT: () => {
          const nil = CONSUME(l.terminals.nil);
          return ACTION(() =>
            C.astFactory.expressionOperation(operator.image, [], C.astFactory.sourceLocation(operator, nil)));
        } },
      ]);
    },
  };
}

export function funcNil1<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, []> {
  return {
    name: unCapitalize(func.name),
    impl: ({ ACTION, CONSUME }) => (C) => {
      const operator = CONSUME(func);
      const nil = CONSUME(l.terminals.nil);
      return ACTION(() =>
        C.astFactory.expressionOperation(operator.image, [], C.astFactory.sourceLocation(operator, nil)));
    },
  };
}

export function funcExprList1<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, Expression[]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ ACTION, CONSUME, SUBRULE }) => (C) => {
      const operator = CONSUME(func);
      const args = SUBRULE(expressionList);
      return ACTION(() =>
        C.astFactory.expressionOperation(operator.image, args.val, C.astFactory.sourceLocation(operator, args)));
    },
  };
}

export function funcExpr2or3<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, [Expression, Expression] | [Expression, Expression, Expression]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ ACTION, CONSUME, SUBRULE1, SUBRULE2, SUBRULE3, CONSUME1, OPTION, CONSUME2 }) =>
      (C) => {
        const operator = CONSUME(func);
        CONSUME(l.symbols.LParen);
        const arg1 = SUBRULE1(expression);
        CONSUME1(l.symbols.comma);
        const arg2 = SUBRULE2(expression);
        const arg3 = OPTION(() => {
          CONSUME2(l.symbols.comma);
          return SUBRULE3(expression);
        });
        const close = CONSUME(l.symbols.RParen);
        return ACTION(() => C.astFactory.expressionOperation(
          operator.image,
          arg3 ? <const> [ arg1, arg2, arg3 ] : <const> [ arg1, arg2 ],
          C.astFactory.sourceLocation(operator, close),
        ));
      },
  };
}

export function funcExpr3or4<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<
  Uncapitalize<T>,
    [Expression, Expression, Expression] | [Expression, Expression, Expression, Expression]
> {
  return {
    name: unCapitalize(func.name),
    impl: ({
      ACTION,
      CONSUME,
      SUBRULE1,
      SUBRULE2,
      SUBRULE3,
      SUBRULE4,
      CONSUME1,
      OPTION,
      CONSUME2,
      CONSUME3,
    }) =>
      (C) => {
        const operator = CONSUME(func);
        CONSUME(l.symbols.LParen);
        const arg1 = SUBRULE1(expression);
        CONSUME1(l.symbols.comma);
        const arg2 = SUBRULE2(expression);
        CONSUME2(l.symbols.comma);
        const arg3 = SUBRULE3(expression);
        const arg4 = OPTION(() => {
          CONSUME3(l.symbols.comma);
          return SUBRULE4(expression);
        });
        const close = CONSUME(l.symbols.RParen);
        return ACTION(() => C.astFactory.expressionOperation(
          operator.image,
          arg4 ? <const> [ arg1, arg2, arg3, arg4 ] : <const> [ arg1, arg2, arg3 ],
          C.astFactory.sourceLocation(operator, close),
        ));
      },
  };
}

export function funcGroupGraphPattern<T extends string>(func: TokenType & { name: T }):
SparqlGrammarRule<Uncapitalize<T>, ExpressionPatternOperation> {
  return {
    name: unCapitalize(func.name),
    impl: ({ ACTION, SUBRULE, CONSUME }) => (C) => {
      const operator = CONSUME(func);
      const group = SUBRULE(groupGraphPattern);
      return ACTION(() => C.astFactory.expressionPatternOperation(
        operator.image,
        group,
        C.astFactory.sourceLocation(operator, group),
      ));
    },
  };
}

export type RuleDefExpressionAggregatorX<T extends string> = SparqlGrammarRule<T, ExpressionAggregateDefault>;

export function baseAggregateFunc<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionAggregatorX<Uncapitalize<T>> {
  return {
    name: unCapitalize(func.name),
    impl: ({ ACTION, CONSUME, SUBRULE, OPTION }) => (C) => {
      const operator = CONSUME(func);
      CONSUME(l.symbols.LParen);
      const distinct = OPTION(() => CONSUME(l.distinct));
      const expr1 = SUBRULE(expression);
      const close = CONSUME(l.symbols.RParen);

      return ACTION(() => C.astFactory.aggregate(
        operator.image,
        distinct !== undefined,
        expr1,
        undefined,
        C.astFactory.sourceLocation(operator, close),
      ));
    },
  };
}
