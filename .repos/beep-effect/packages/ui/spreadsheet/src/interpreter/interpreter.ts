import * as Either from "effect/Either";
import { Numerical } from "../utils/isNumerical.ts";
import {
  type ExpressionResult,
  ExpressionResultError,
  ExpressionResultNumber,
  ExpressionResultString,
} from "./models/ExpressionResult.ts";
import type { BinaryExpression, Node, NumberLiteral, Ref } from "./parser";
import parser, { Expression } from "./parser";
import tokenizer from "./tokenizer";

interface NumberExpressionResult {
  value: number;
}

function evaluateAst(ast: Node, getCellValue: (key: string) => number): NumberExpressionResult {
  function visit(node: Expression): NumberExpressionResult {
    return Expression.$match(node, {
      Ref: (node) => visitCellRef(node),
      NumberLiteral: (node) => visitNumberLiteral(node),
      Addition: (node) => visitAdditiveBinaryExpression(node, (l, r) => l + r),
      Subtraction: (node) => visitAdditiveBinaryExpression(node, (l, r) => l - r),
      Multiplication: (node) => visitSimpleBinaryExpression(node, (l, r) => l * r),
      Division: (node) => visitSimpleBinaryExpression(node, (l, r) => l / r),
      Modulo: (node) => visitSimpleBinaryExpression(node, (l, r) => l % r),
      Exponent: (node) => visitSimpleBinaryExpression(node, Math.pow),
      UnaryPlus: (node) => visit(node.expression),
      UnaryMinus: (node) => ({
        value: -visit(node.expression).value,
      }),
      CellRange: (node) => {
        throw new Error(`Unexpected node kind: ${node}`);
      },
    });
  }

  function visitAdditiveBinaryExpression(
    node: BinaryExpression,
    operation: (left: number, right: number) => number
  ): NumberExpressionResult {
    const left = visit(node.left);
    const right = visit(node.right);

    return {
      value: operation(left.value, right.value),
    };
  }

  function visitSimpleBinaryExpression(
    node: BinaryExpression,
    operation: (left: number, right: number) => number
  ): NumberExpressionResult {
    const left = visit(node.left);
    const right = visit(node.right);

    return {
      value: operation(left.value, right.value),
    };
  }

  function visitNumberLiteral(node: NumberLiteral): NumberExpressionResult {
    return {
      value: node.value,
    };
  }

  function visitCellRef(node: Ref) {
    return {
      value: getCellValue(node.ref),
    };
  }

  return visit(ast);
}

export default function (input: string, getCellValue: (key: string) => number): ExpressionResult.Type {
  if (input.length === 0) {
    return new ExpressionResultString({ value: "" });
  }

  if (input[0] !== "=") {
    return Numerical.is(input)
      ? new ExpressionResultNumber({ value: Number.parseFloat(input) })
      : new ExpressionResultString({ value: input });
  }

  return Either.try(() => {
    const tokens = tokenizer(input.slice(1));
    const ast = parser(tokens);
    const result = evaluateAst(ast, getCellValue);
    return new ExpressionResultNumber({
      value: result.value,
    });
  }).pipe(Either.getOrElse(() => new ExpressionResultError()));
}
