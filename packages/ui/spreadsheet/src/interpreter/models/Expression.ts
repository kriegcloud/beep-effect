import * as Data from "effect/Data";
import * as S from "effect/Schema";

export class UnexpectedTokenError extends S.TaggedError<UnexpectedTokenError>()("UnexpectedTokenError", {
  expected: S.String,
  actual: S.String,
}) {}

export class UnexpectedEndOfInputError extends S.TaggedError<UnexpectedEndOfInputError>()("UnexpectedEndOfInputError", {
  expected: S.String,
}) {}

export class UnexpectedTokenInFactorError extends S.TaggedError<UnexpectedTokenInFactorError>()(
  "UnexpectedTokenInFactorError",
  {
    tokenKind: S.optionalWith(S.String, { nullable: true }),
  }
) {
  static readonly new = (tokenKind?: undefined | string) => new UnexpectedTokenInFactorError({ tokenKind });

  override get message() {
    return `Unexpected token: ${this.tokenKind ?? "undefined"}`;
  }
}

export const NodeKind = {
  Ref: 0,
  CellRange: 1,
  NumberLiteral: 2,
  Addition: 3,
  Subtraction: 4,
  Multiplication: 5,
  Division: 6,
  Modulo: 7,
  Exponent: 8,
  UnaryPlus: 9,
  UnaryMinus: 10,
} as const;

export declare namespace NodeKind {
  export type Ref = 0;
  export type CellRange = 1;
  export type NumberLiteral = 2;
  export type Addition = 3;
  export type Subtraction = 4;
  export type Multiplication = 5;
  export type Division = 6;
  export type Modulo = 7;
  export type Exponent = 8;
  export type UnaryPlus = 9;
  export type UnaryMinus = 10;
}

export interface BinaryExpression {
  left: Expression;
  right: Expression;
}

export interface NumberLiteral {
  _tag: "NumberLiteral";
  kind: NodeKind.NumberLiteral;
  value: number;
}

export interface Ref {
  _tag: "Ref";
  kind: NodeKind.Ref;
  ref: string;
}

export interface UnaryPlus {
  _tag: "UnaryPlus";
  expression: Expression;
  kind: NodeKind.UnaryPlus;
}

export interface UnaryMinus {
  _tag: "UnaryMinus";
  expression: Expression;
  kind: NodeKind.UnaryMinus;
}

export interface Addition extends BinaryExpression {
  _tag: "Addition";
  kind: NodeKind.Addition;
}

export interface Substraction extends BinaryExpression {
  _tag: "Substraction";
  kind: NodeKind.Subtraction;
}

export interface Multiplication extends BinaryExpression {
  _tag: "Multiplication";
  kind: NodeKind.Multiplication;
}

export interface Modulo extends BinaryExpression {
  _tag: "Modulo";
  kind: NodeKind.Modulo;
}

export interface Division extends BinaryExpression {
  _tag: "Division";
  kind: NodeKind.Division;
}

export interface Exponent extends BinaryExpression {
  _tag: "Exponent";
  kind: NodeKind.Exponent;
}

export interface CellRange extends BinaryExpression {
  _tag: "CellRange";
  kind: NodeKind.CellRange;
}

export type OmitTag<A extends { readonly _tag: string }> = Omit<A, "_tag">;

export type Expression = Data.TaggedEnum<{
  Ref: OmitTag<Ref>;
  CellRange: OmitTag<CellRange>;
  NumberLiteral: OmitTag<NumberLiteral>;
  Addition: OmitTag<Addition>;
  Subtraction: OmitTag<Substraction>;
  Multiplication: OmitTag<Multiplication>;
  Division: OmitTag<Division>;
  Modulo: OmitTag<Modulo>;
  Exponent: OmitTag<Exponent>;
  UnaryPlus: OmitTag<UnaryPlus>;
  UnaryMinus: OmitTag<UnaryMinus>;
}>;

export const {
  Subtraction,
  Ref,
  CellRange,
  NumberLiteral,
  Addition,
  Multiplication,
  Division,
  Modulo,
  Exponent,
  UnaryPlus,
  UnaryMinus,
} = Data.taggedEnum<Expression>();

export type Node = Expression;
