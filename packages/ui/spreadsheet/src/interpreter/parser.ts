// import {
//   Token,
//   Kind as SyntaxKind,
//   NumberToken,
//   RefToken,
//
// } from "./models/SyntaxKind"
// import { Expression as Node } from "./models/Expression";
// export default function parser(tokens: Token.Type[]): Node {
//   let i = 0;
//
//   function currentToken(): Token.Type | undefined {
//     return tokens[i];
//   }
//
//   function testAndConsume(kind: SyntaxKind.Type): boolean {
//     const token = currentToken();
//     if (token !== undefined && token.kind === kind) {
//       i++;
//       return true;
//     }
//     return false;
//   }
//
//   function consumeToken(kind: SyntaxKind.Type): Token.Type {
//     const token = tokens[i];
//     if (token.kind !== kind) {
//       throw new Error(`Unexpected token: ${token}`);
//     }
//     i++;
//     return token;
//   }
//
//   function makeNumberLiteral(token: NumberToken): NumberLiteral {
//     return {
//       kind: NodeKind.NumberLiteral,
//       value: Number.parseFloat(token.value),
//     };
//   }
//
//   function makeRef(token: RefToken): Ref {
//     return {
//       kind: NodeKind.Ref,
//       ref: token.ref,
//     };
//   }
//
//   function factor(): Expression {
//     const token = currentToken();
//     if (testAndConsume(SyntaxKind.PlusToken)) {
//       return { kind: NodeKind.UnaryPlus, expression: factor() };
//     } else if (testAndConsume(SyntaxKind.MinusToken)) {
//       return { kind: NodeKind.UnaryMinus, expression: factor() };
//     } else if (token && token.kind === SyntaxKind.NumberLiteral) {
//       return makeNumberLiteral(
//         consumeToken(SyntaxKind.NumberLiteral) as NumberToken
//       );
//     } else if (testAndConsume(SyntaxKind.OpenParenthesis)) {
//       const node = expr();
//       consumeToken(SyntaxKind.CloseParenthesis);
//       return node;
//     } else if (token && token.kind === SyntaxKind.RefToken) {
//       const ref = makeRef(consumeToken(SyntaxKind.RefToken) as RefToken);
//       const nextToken = currentToken();
//       if (nextToken && nextToken.kind === SyntaxKind.ColonToken) {
//         consumeToken(SyntaxKind.ColonToken);
//         const rightRef = makeRef(consumeToken(SyntaxKind.RefToken) as RefToken);
//         return {
//           kind: NodeKind.CellRange,
//           left: ref,
//           right: rightRef,
//         };
//       }
//       return ref;
//     }
//     throw new Error(`Unexpected token : ${token?.kind}`);
//   }
//
//   function exponent(): Expression {
//     let node: Expression = factor();
//
//     while (testAndConsume(SyntaxKind.CaretToken)) {
//       node = { kind: NodeKind.Exponent, left: node, right: factor() };
//     }
//
//     return node;
//   }
//
//   function term(): Expression {
//     let node: Expression = exponent();
//
//     while (true) {
//       if (testAndConsume(SyntaxKind.AsteriskToken)) {
//         node = { kind: NodeKind.Multiplication, left: node, right: exponent() };
//       } else if (testAndConsume(SyntaxKind.SlashToken)) {
//         node = { kind: NodeKind.Division, left: node, right: exponent() };
//       } else if (testAndConsume(SyntaxKind.ModToken)) {
//         node = { kind: NodeKind.Modulo, left: node, right: exponent() };
//       } else if (testAndConsume(SyntaxKind.OpenParenthesis)) {
//         const ex = expr();
//         consumeToken(SyntaxKind.CloseParenthesis);
//         node = { kind: NodeKind.Multiplication, left: node, right: ex };
//       } else {
//         break;
//       }
//     }
//
//     return node;
//   }
//
//   function additive(): Expression {
//     let node: Expression = term();
//
//     while (true) {
//       if (testAndConsume(SyntaxKind.PlusToken)) {
//         node = { kind: NodeKind.Addition, left: node, right: term() };
//       } else if (testAndConsume(SyntaxKind.MinusToken)) {
//         node = { kind: NodeKind.Substraction, left: node, right: term() };
//       } else {
//         break;
//       }
//     }
//
//     return node;
//   }
//
//   function expr(): Expression {
//     const node: Expression = additive();
//     return node;
//   }
//
//   return expr();
// }
