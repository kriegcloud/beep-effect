import * as HashSet from "effect/HashSet";
import * as Option from "effect/Option";
import * as P from "effect/Predicate";
import type { ESTree } from "@oxlint/plugins";

/**
 * Node families the rule visitors hand to these helpers: expressions, call
 * arguments, identifier slots, binding targets, and import-export names. All
 * carry a `type` discriminant, so they narrow without `unknown` or `as`.
 */
export type AstNode =
  | ESTree.Expression
  | ESTree.Argument
  | ESTree.IdentifierName
  | ESTree.PrivateIdentifier
  | ESTree.BindingIdentifier
  | ESTree.ModuleExportName;

/** A slot that may also be empty (the typed AST exposes nullable child positions). */
export type MaybeNode = AstNode | null | undefined;

/**
 * Narrow the opaque `ESTree.Node` (e.g. a `.parent` slot, which the typed AST
 * exposes only as the empty base node) to the `Expression` union. Type-predicate
 * guard — no `as` assertion.
 */
export const asExpression = (node: ESTree.Node): node is ESTree.Expression => "type" in node;

/** Expression wrappers the parser interposes; `unwrapExpression` peels them. */
type ExpressionWrapper =
  | ESTree.ChainExpression
  | ESTree.ParenthesizedExpression
  | ESTree.TSNonNullExpression
  | ESTree.TSAsExpression
  | ESTree.TSTypeAssertion;

const asAstNode = (node: MaybeNode): Option.Option<AstNode> =>
  P.isNotNullish(node) ? Option.some(node) : Option.none();

const EXPRESSION_WRAPPER_TYPES = HashSet.fromIterable([
  "ChainExpression",
  "ParenthesizedExpression",
  "TSNonNullExpression",
  "TSAsExpression",
  "TSTypeAssertion",
]);

const isExpressionWrapper = (node: AstNode): node is ExpressionWrapper =>
  HashSet.has(EXPRESSION_WRAPPER_TYPES, node.type);

/** Peel expression wrappers (chains, parens, TS assertions) to the inner node. */
export const unwrapExpression = (node: MaybeNode): Option.Option<AstNode> => {
  let current = asAstNode(node);

  while (Option.isSome(current) && isExpressionWrapper(current.value)) {
    current = asAstNode(current.value.expression);
  }

  return current;
};

/**
 * A peeled member access: the unwrapped receiver (`object`) and the raw property
 * slot, ready to feed to `getPropertyName` / `isIdentifier`.
 */
export type MemberAccess = {
  readonly object: Option.Option<AstNode>;
  readonly property: MaybeNode;
};

/**
 * Peel wrappers off `node`, confirm it is a `MemberExpression`, and expose its
 * unwrapped `object` plus raw `property`. Shared prologue for every rule that
 * inspects `<receiver>.<member>` access.
 */
export const unwrapMemberExpression = (node: MaybeNode): Option.Option<MemberAccess> =>
  Option.flatMap(unwrapExpression(node), (expression) =>
    expression.type === "MemberExpression"
      ? Option.some({ object: unwrapExpression(expression.object), property: expression.property })
      : Option.none()
  );

/** Identifier-shaped nodes whose textual name lives on the `.name` field. */
const NAME_BEARING_TYPES = HashSet.fromIterable(["Identifier", "PrivateIdentifier"]);

/** Lift the carried slot of an identifier (`.name`) or literal (`.value`), when it is a string. */
const carriedSlot = (expression: AstNode): unknown =>
  HashSet.has(NAME_BEARING_TYPES, expression.type) && "name" in expression
    ? expression.name
    : expression.type === "Literal"
      ? expression.value
      : undefined;

/** Resolve the textual name of an identifier / private identifier / string literal node. */
export const getPropertyName = (node: MaybeNode): Option.Option<string> =>
  asAstNode(node).pipe(Option.map(carriedSlot), Option.filter(P.isString));

/** Test whether an already-unwrapped node is an identifier (optionally with a given name). */
export const isIdentifier = (node: Option.Option<AstNode>, name?: string): boolean =>
  Option.exists(
    node,
    (expression) =>
      expression.type === "Identifier" && P.isString(expression.name) && (name === undefined || expression.name === name)
  );

/** Resolve the string value of a string-literal node. */
export const literalStringValue = (node: MaybeNode): Option.Option<string> =>
  Option.flatMap(asAstNode(node), (expression) =>
    expression.type === "Literal" && P.isString(expression.value) ? Option.some(expression.value) : Option.none()
  );

/** Resolve the local name of an identifier node. */
export const identifierName = (node: MaybeNode): Option.Option<string> =>
  Option.flatMap(asAstNode(node), (expression) =>
    expression.type === "Identifier" && P.isString(expression.name) ? Option.some(expression.name) : Option.none()
  );
