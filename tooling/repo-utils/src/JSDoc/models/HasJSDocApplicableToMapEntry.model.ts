import { $RepoUtilsId } from "@beep/identity/packages";
import { MappedLiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { ApplicableTo } from "./ApplicableTo.model.js";

const $I = $RepoUtilsId.create("JSDoc/models/HasJSDocApplicableToMapEntry.model");

/**
 * One mapping row from a TypeScript `HasJSDoc` member name to an
 * `ApplicableTo` classification.
 *
 * @since 0.0.0
 * @category DomainModel
 */
const fields = { member: S.String } as const;
/**
 * @since 0.0.0
 */
export const HasJSDocApplicableToMapEntry = ApplicableTo.toTaggedUnion("applicableTo")({
  function: fields,
  method: fields,
  class: fields,
  classStaticBlock: fields,
  interface: fields,
  typeAlias: fields,
  enum: fields,
  enumMember: fields,
  variable: fields,
  constant: fields,
  property: fields,
  accessor: fields,
  constructor: fields,
  parameter: fields, // nested within @callback/@typedef
  signature: fields,
  indexSignature: fields,
  typeParameter: fields,
  tupleMember: fields,
  exportSpecifier: fields,
  identifier: fields,
  statement: fields,
  expression: fields,
  module: fields, // ES module or CJS module
  namespace: fields,
  file: fields, // file-level comment
  event: fields,
  mixin: fields,
  any: fields, // can attach to anything
}).annotate(
  $I.annote("HasJSDocApplicableToMapEntry", {
    description: "One mapping row from a TypeScript `HasJSDoc` member name to an `ApplicableTo` classification.",
  })
);

/**
 * Exhaustive `HasJSDoc` to `ApplicableTo` mapping used by the validator.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const HasJsDocToApplicableToMap = MappedLiteralKit([
  ["AccessorDeclaration", "accessor"],
  ["ArrowFunction", "function"],
  ["BinaryExpression", "expression"],
  ["Block", "statement"],
  ["BreakStatement", "statement"],
  ["CallSignatureDeclaration", "signature"],
  ["CaseClause", "statement"],
  ["ClassLikeDeclaration", "class"],
  ["ClassStaticBlockDeclaration", "classStaticBlock"],
  ["ConstructorDeclaration", "constructor"],
  ["ConstructorTypeNode", "signature"],
  ["ConstructSignatureDeclaration", "signature"],
  ["ContinueStatement", "statement"],
  ["DebuggerStatement", "statement"],
  ["DoStatement", "statement"],
  ["ElementAccessExpression", "expression"],
  ["EmptyStatement", "statement"],
  ["EndOfFileToken", "file"],
  ["EnumDeclaration", "enum"],
  ["EnumMember", "enumMember"],
  ["ExportAssignment", "module"],
  ["ExportDeclaration", "module"],
  ["ExportSpecifier", "exportSpecifier"],
  ["ExpressionStatement", "statement"],
  ["ForInStatement", "statement"],
  ["ForOfStatement", "statement"],
  ["ForStatement", "statement"],
  ["FunctionDeclaration", "function"],
  ["FunctionExpression", "function"],
  ["FunctionTypeNode", "signature"],
  ["Identifier", "identifier"],
  ["IfStatement", "statement"],
  ["ImportDeclaration", "module"],
  ["ImportEqualsDeclaration", "module"],
  ["IndexSignatureDeclaration", "indexSignature"],
  ["InterfaceDeclaration", "interface"],
  ["JSDocFunctionType", "signature"],
  ["JSDocSignature", "signature"],
  ["LabeledStatement", "statement"],
  ["MethodDeclaration", "method"],
  ["MethodSignature", "method"],
  ["ModuleDeclaration", "namespace"],
  ["NamedTupleMember", "tupleMember"],
  ["NamespaceExportDeclaration", "module"],
  ["ObjectLiteralExpression", "expression"],
  ["ParameterDeclaration", "parameter"],
  ["ParenthesizedExpression", "expression"],
  ["PropertyAccessExpression", "expression"],
  ["PropertyAssignment", "property"],
  ["PropertyDeclaration", "property"],
  ["PropertySignature", "property"],
  ["ReturnStatement", "statement"],
  ["SemicolonClassElement", "class"],
  ["ShorthandPropertyAssignment", "property"],
  ["SpreadAssignment", "expression"],
  ["SwitchStatement", "statement"],
  ["ThrowStatement", "statement"],
  ["TryStatement", "statement"],
  ["TypeAliasDeclaration", "typeAlias"],
  ["TypeParameterDeclaration", "typeParameter"],
  ["VariableDeclaration", "variable"],
  ["VariableStatement", "variable"],
  ["WhileStatement", "statement"],
  ["WithStatement", "statement"],
]).annotate(
  $I.annote("HasJsDocToApplicableToMap", {
    description: "Exhaustive `HasJSDoc` to `ApplicableTo` mapping used by the validator.",
  })
);

/**
 * @since 0.0.0
 */
export declare namespace HasJsDocToApplicableToMap {
  /**
   * @since 0.0.0
   */
  export type Type = typeof HasJsDocToApplicableToMap.Type;
  /**
   * @since 0.0.0
   */
  export type Encoded = typeof HasJsDocToApplicableToMap.Encoded;
}
