import { HashSet } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import type { ESTree } from "@oxlint/plugins";

/**
 * Node families the rule visitors hand to these helpers: expressions, call
 * arguments, identifier slots, binding targets, and import-export names. All
 * carry a `type` discriminant, so they narrow without `unknown` or `as`.
 *
 * @category models
 * @since 0.1.0
 */
export type AstNode =
  | ESTree.Expression
  | ESTree.Argument
  | ESTree.IdentifierName
  | ESTree.PrivateIdentifier
  | ESTree.BindingIdentifier
  | ESTree.ModuleExportName;

/**
 * A slot that may also be empty (the typed AST exposes nullable child positions).
 *
 * @category models
 * @since 0.1.0
 */
export type MaybeNode = AstNode | null | undefined;

/**
 * Narrow the opaque `ESTree.Node` (e.g. a `.parent` slot, which the typed AST
 * exposes only as the empty base node) to the `Expression` union. Type-predicate
 * guard — no `as` assertion.
 *
 * @param node - The opaque AST node to narrow.
 * @returns `true` when `node` carries a `type` discriminant (an expression).
 * @category utilities
 * @since 0.1.0
 */
export const asExpression = (node: ESTree.Node): node is ESTree.Expression => "type" in node;

/** Expression wrappers the parser interposes; `unwrapExpression` peels them. */
type ExpressionWrapper =
  | ESTree.ChainExpression
  | ESTree.ParenthesizedExpression
  | ESTree.TSNonNullExpression
  | ESTree.TSAsExpression
  | ESTree.TSTypeAssertion;

const asAstNode = (node: MaybeNode): O.Option<AstNode> => (P.isNotNullish(node) ? O.some(node) : O.none());

const EXPRESSION_WRAPPER_TYPES = HashSet.fromIterable([
  "ChainExpression",
  "ParenthesizedExpression",
  "TSNonNullExpression",
  "TSAsExpression",
  "TSTypeAssertion",
]);

const isExpressionWrapper = (node: AstNode): node is ExpressionWrapper =>
  HashSet.has(EXPRESSION_WRAPPER_TYPES, node.type);

/**
 * Peel expression wrappers (chains, parens, TS assertions) to the inner node.
 *
 * @param node - The node (or empty slot) to unwrap.
 * @returns The innermost non-wrapper node, or `None` for an empty slot.
 * @category utilities
 * @since 0.1.0
 */
export const unwrapExpression = (node: MaybeNode): O.Option<AstNode> => {
  let current = asAstNode(node);

  while (O.isSome(current) && isExpressionWrapper(current.value)) {
    current = asAstNode(current.value.expression);
  }

  return current;
};

/**
 * A peeled member access: the unwrapped receiver (`object`) and the raw property
 * slot, ready to feed to `getPropertyName` / `isIdentifier`.
 *
 * @category models
 * @since 0.1.0
 */
export type MemberAccess = {
  readonly object: O.Option<AstNode>;
  readonly property: MaybeNode;
};

/**
 * Peel wrappers off `node`, confirm it is a `MemberExpression`, and expose its
 * unwrapped `object` plus raw `property`. Shared prologue for every rule that
 * inspects `<receiver>.<member>` access.
 *
 * @param node - The candidate member-access node (or empty slot).
 * @returns The unwrapped receiver and raw property, or `None` when not a member access.
 * @category utilities
 * @since 0.1.0
 */
export const unwrapMemberExpression = (node: MaybeNode): O.Option<MemberAccess> =>
  O.flatMap(unwrapExpression(node), (expression) =>
    expression.type === "MemberExpression"
      ? O.some({ object: unwrapExpression(expression.object), property: expression.property })
      : O.none()
  );

/** Identifier-shaped nodes whose textual name lives on the `.name` field. */
const NAME_BEARING_TYPES = HashSet.fromIterable(["Identifier", "PrivateIdentifier"]);

// Lift the carried slot of an identifier (`.name`) or literal (`.value`), when it is a string.
const carriedSlot = (expression: AstNode): unknown =>
  HashSet.has(NAME_BEARING_TYPES, expression.type) && "name" in expression
    ? expression.name
    : expression.type === "Literal"
      ? expression.value
      : undefined;

/**
 * Resolve the textual name of an identifier / private identifier / string literal node.
 *
 * @param node - The node (or empty slot) to read a name from.
 * @returns The string name/value, or `None` when absent or non-string.
 * @category utilities
 * @since 0.1.0
 */
export const getPropertyName = (node: MaybeNode): O.Option<string> =>
  asAstNode(node).pipe(O.map(carriedSlot), O.filter(P.isString));

/**
 * Test whether an already-unwrapped node is an identifier (optionally with a given name).
 *
 * @param node - The already-unwrapped candidate node.
 * @param name - When provided, also require the identifier to carry this exact name.
 * @returns `true` when `node` is a matching identifier.
 * @category utilities
 * @since 0.1.0
 */
export const isIdentifier = (node: O.Option<AstNode>, name?: string): boolean =>
  O.exists(
    node,
    (expression) =>
      expression.type === "Identifier" &&
      P.isString(expression.name) &&
      (name === undefined || expression.name === name)
  );

/**
 * Resolve the string value of a string-literal node.
 *
 * @param node - The node (or empty slot) to read a literal value from.
 * @returns The string literal value, or `None` when not a string literal.
 * @category utilities
 * @since 0.1.0
 */
export const literalStringValue = (node: MaybeNode): O.Option<string> =>
  O.flatMap(asAstNode(node), (expression) =>
    expression.type === "Literal" && P.isString(expression.value) ? O.some(expression.value) : O.none()
  );

/**
 * Resolve the local name of an identifier node.
 *
 * @param node - The node (or empty slot) to read an identifier name from.
 * @returns The identifier name, or `None` when not an identifier.
 * @category utilities
 * @since 0.1.0
 */
export const identifierName = (node: MaybeNode): O.Option<string> =>
  O.flatMap(asAstNode(node), (expression) =>
    expression.type === "Identifier" && P.isString(expression.name) ? O.some(expression.name) : O.none()
  );
