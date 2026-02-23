import * as A from "effect/Array";
import * as O from "effect/Option";
import {
  Addition,
  CellRange,
  Division,
  Exponent,
  type Expression,
  Modulo,
  Multiplication,
  NodeKind,
  NumberLiteral,
  Ref,
  Subtraction,
  UnaryMinus,
  UnaryPlus,
  UnexpectedEndOfInputError,
  UnexpectedTokenError,
  UnexpectedTokenInFactorError,
} from "./models/Expression";
import { type NumberToken, type RefToken, type SyntaxKind, SyntaxKindEnum, type Token } from "./models/SyntaxKind";

function isNumberToken(token: Token.Type): token is NumberToken {
  return token.kind === SyntaxKindEnum.NumberLiteral;
}

function isRefToken(token: Token.Type): token is RefToken {
  return token.kind === SyntaxKindEnum.RefToken;
}

function isColonToken(token: Token.Type): boolean {
  return token.kind === SyntaxKindEnum.ColonToken;
}

export default function parser(tokens: Token.Type[]): Expression {
  let i = 0;

  function currentToken(): O.Option<Token.Type> {
    return A.get(tokens, i);
  }

  function testAndConsume(kind: SyntaxKind.Type): boolean {
    return O.match(currentToken(), {
      onNone: () => false,
      onSome: (token) => {
        if (token.kind === kind) {
          i++;
          return true;
        }
        return false;
      },
    });
  }

  function consumeNumberToken(): NumberToken {
    const maybeToken = currentToken();
    if (O.isNone(maybeToken)) {
      throw new UnexpectedEndOfInputError({ expected: SyntaxKindEnum.NumberLiteral });
    }
    const token = maybeToken.value;
    if (!isNumberToken(token)) {
      throw new UnexpectedTokenError({
        expected: SyntaxKindEnum.NumberLiteral,
        actual: token.kind,
      });
    }
    i++;
    return token;
  }

  function consumeRefToken(): RefToken {
    const maybeToken = currentToken();
    if (O.isNone(maybeToken)) {
      throw new UnexpectedEndOfInputError({ expected: SyntaxKindEnum.RefToken });
    }
    const token = maybeToken.value;
    if (!isRefToken(token)) {
      throw new UnexpectedTokenError({
        expected: SyntaxKindEnum.RefToken,
        actual: token.kind,
      });
    }
    i++;
    return token;
  }

  function consumeToken(kind: SyntaxKind.Type): void {
    const maybeToken = currentToken();
    if (O.isNone(maybeToken)) {
      throw new UnexpectedEndOfInputError({ expected: kind });
    }
    const token = maybeToken.value;
    if (token.kind !== kind) {
      throw new UnexpectedTokenError({ expected: kind, actual: token.kind });
    }
    i++;
  }

  function makeNumberLiteral(token: NumberToken): NumberLiteral {
    return NumberLiteral({
      kind: NodeKind.NumberLiteral,
      value: Number.parseFloat(token.value),
    });
  }

  function makeRef(token: RefToken): Ref {
    return Ref({
      kind: NodeKind.Ref,
      ref: token.ref,
    });
  }

  function factor(): Expression {
    if (testAndConsume(SyntaxKindEnum.PlusToken)) {
      return UnaryPlus({ kind: NodeKind.UnaryPlus, expression: factor() });
    }
    if (testAndConsume(SyntaxKindEnum.MinusToken)) {
      return UnaryMinus({ kind: NodeKind.UnaryMinus, expression: factor() });
    }

    const maybeToken = currentToken();

    if (O.isSome(maybeToken) && isNumberToken(maybeToken.value)) {
      return makeNumberLiteral(consumeNumberToken());
    }

    if (testAndConsume(SyntaxKindEnum.OpenParenthesis)) {
      const node = expr();
      consumeToken(SyntaxKindEnum.CloseParenthesis);
      return node;
    }

    if (O.isSome(maybeToken) && isRefToken(maybeToken.value)) {
      const ref = makeRef(consumeRefToken());
      const nextToken = currentToken();

      const hasColon = O.match(nextToken, {
        onNone: () => false,
        onSome: isColonToken,
      });

      if (hasColon) {
        consumeToken(SyntaxKindEnum.ColonToken);
        const rightRef = makeRef(consumeRefToken());
        return CellRange({
          kind: NodeKind.CellRange,
          left: ref,
          right: rightRef,
        });
      }
      return ref;
    }

    const tokenKind = O.match(maybeToken, {
      onNone: () => undefined,
      onSome: (t) => t.kind,
    });
    throw UnexpectedTokenInFactorError.new(tokenKind);
  }

  function exponent(): Expression {
    let node: Expression = factor();

    while (testAndConsume(SyntaxKindEnum.CaretToken)) {
      node = Exponent({ kind: NodeKind.Exponent, left: node, right: factor() });
    }

    return node;
  }

  function term(): Expression {
    let node: Expression = exponent();

    while (true) {
      if (testAndConsume(SyntaxKindEnum.AsteriskToken)) {
        node = Multiplication({
          kind: NodeKind.Multiplication,
          left: node,
          right: exponent(),
        });
      } else if (testAndConsume(SyntaxKindEnum.SlashToken)) {
        node = Division({
          kind: NodeKind.Division,
          left: node,
          right: exponent(),
        });
      } else if (testAndConsume(SyntaxKindEnum.ModToken)) {
        node = Modulo({
          kind: NodeKind.Modulo,
          left: node,
          right: exponent(),
        });
      } else if (testAndConsume(SyntaxKindEnum.OpenParenthesis)) {
        const ex = expr();
        consumeToken(SyntaxKindEnum.CloseParenthesis);
        node = Multiplication({
          kind: NodeKind.Multiplication,
          left: node,
          right: ex,
        });
      } else {
        break;
      }
    }

    return node;
  }

  function additive(): Expression {
    let node: Expression = term();

    while (true) {
      if (testAndConsume(SyntaxKindEnum.PlusToken)) {
        node = Addition({
          kind: NodeKind.Addition,
          left: node,
          right: term(),
        });
      } else if (testAndConsume(SyntaxKindEnum.MinusToken)) {
        node = Subtraction({
          kind: NodeKind.Subtraction,
          left: node,
          right: term(),
        });
      } else {
        break;
      }
    }

    return node;
  }

  function expr(): Expression {
    return additive();
  }

  return expr();
}

export { NodeKind };
export * from "./models/Expression";
export * as ExpressionResult from "./models/ExpressionResult";
