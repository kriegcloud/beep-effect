/**
 * @module HasJSDocToApplicableToMap
 * @description Authoritative mapping from TypeScript compiler `HasJSDoc` members
 * to audit `ApplicableTo` categories.
 * @since 0.0.0
 */

import type { ApplicableTo } from "./jsdoc-tags-database";

/**
 * One mapping row from a TypeScript `HasJSDoc` member name to an
 * `ApplicableTo` classification.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface HasJSDocApplicableToMapEntry {
  readonly applicableTo: ApplicableTo;
  readonly member: string;
}

/**
 * Complete ordered set of supported `ApplicableTo` values.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const APPLICABLE_TO_VALUES: ReadonlyArray<ApplicableTo> = [
  "function",
  "method",
  "class",
  "classStaticBlock",
  "interface",
  "typeAlias",
  "enum",
  "enumMember",
  "variable",
  "constant",
  "property",
  "accessor",
  "constructor",
  "parameter",
  "signature",
  "indexSignature",
  "typeParameter",
  "tupleMember",
  "exportSpecifier",
  "identifier",
  "statement",
  "expression",
  "module",
  "namespace",
  "file",
  "event",
  "mixin",
  "any",
] as const;

/**
 * Exhaustive `HasJSDoc` to `ApplicableTo` mapping used by the validator.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const HAS_JSDOC_TO_APPLICABLE_TO_MAP: ReadonlyArray<HasJSDocApplicableToMapEntry> = [
  { member: "AccessorDeclaration", applicableTo: "accessor" },
  { member: "ArrowFunction", applicableTo: "function" },
  { member: "BinaryExpression", applicableTo: "expression" },
  { member: "Block", applicableTo: "statement" },
  { member: "BreakStatement", applicableTo: "statement" },
  { member: "CallSignatureDeclaration", applicableTo: "signature" },
  { member: "CaseClause", applicableTo: "statement" },
  { member: "ClassLikeDeclaration", applicableTo: "class" },
  { member: "ClassStaticBlockDeclaration", applicableTo: "classStaticBlock" },
  { member: "ConstructorDeclaration", applicableTo: "constructor" },
  { member: "ConstructorTypeNode", applicableTo: "signature" },
  { member: "ConstructSignatureDeclaration", applicableTo: "signature" },
  { member: "ContinueStatement", applicableTo: "statement" },
  { member: "DebuggerStatement", applicableTo: "statement" },
  { member: "DoStatement", applicableTo: "statement" },
  { member: "ElementAccessExpression", applicableTo: "expression" },
  { member: "EmptyStatement", applicableTo: "statement" },
  { member: "EndOfFileToken", applicableTo: "file" },
  { member: "EnumDeclaration", applicableTo: "enum" },
  { member: "EnumMember", applicableTo: "enumMember" },
  { member: "ExportAssignment", applicableTo: "module" },
  { member: "ExportDeclaration", applicableTo: "module" },
  { member: "ExportSpecifier", applicableTo: "exportSpecifier" },
  { member: "ExpressionStatement", applicableTo: "statement" },
  { member: "ForInStatement", applicableTo: "statement" },
  { member: "ForOfStatement", applicableTo: "statement" },
  { member: "ForStatement", applicableTo: "statement" },
  { member: "FunctionDeclaration", applicableTo: "function" },
  { member: "FunctionExpression", applicableTo: "function" },
  { member: "FunctionTypeNode", applicableTo: "signature" },
  { member: "Identifier", applicableTo: "identifier" },
  { member: "IfStatement", applicableTo: "statement" },
  { member: "ImportDeclaration", applicableTo: "module" },
  { member: "ImportEqualsDeclaration", applicableTo: "module" },
  { member: "IndexSignatureDeclaration", applicableTo: "indexSignature" },
  { member: "InterfaceDeclaration", applicableTo: "interface" },
  { member: "JSDocFunctionType", applicableTo: "signature" },
  { member: "JSDocSignature", applicableTo: "signature" },
  { member: "LabeledStatement", applicableTo: "statement" },
  { member: "MethodDeclaration", applicableTo: "method" },
  { member: "MethodSignature", applicableTo: "method" },
  { member: "ModuleDeclaration", applicableTo: "namespace" },
  { member: "NamedTupleMember", applicableTo: "tupleMember" },
  { member: "NamespaceExportDeclaration", applicableTo: "module" },
  { member: "ObjectLiteralExpression", applicableTo: "expression" },
  { member: "ParameterDeclaration", applicableTo: "parameter" },
  { member: "ParenthesizedExpression", applicableTo: "expression" },
  { member: "PropertyAccessExpression", applicableTo: "expression" },
  { member: "PropertyAssignment", applicableTo: "property" },
  { member: "PropertyDeclaration", applicableTo: "property" },
  { member: "PropertySignature", applicableTo: "property" },
  { member: "ReturnStatement", applicableTo: "statement" },
  { member: "SemicolonClassElement", applicableTo: "class" },
  { member: "ShorthandPropertyAssignment", applicableTo: "property" },
  { member: "SpreadAssignment", applicableTo: "expression" },
  { member: "SwitchStatement", applicableTo: "statement" },
  { member: "ThrowStatement", applicableTo: "statement" },
  { member: "TryStatement", applicableTo: "statement" },
  { member: "TypeAliasDeclaration", applicableTo: "typeAlias" },
  { member: "TypeParameterDeclaration", applicableTo: "typeParameter" },
  { member: "VariableDeclaration", applicableTo: "variable" },
  { member: "VariableStatement", applicableTo: "variable" },
  { member: "WhileStatement", applicableTo: "statement" },
  { member: "WithStatement", applicableTo: "statement" },
] as const;
