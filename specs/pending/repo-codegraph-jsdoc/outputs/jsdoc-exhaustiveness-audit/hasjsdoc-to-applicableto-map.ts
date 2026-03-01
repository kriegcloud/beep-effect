/**
 * @module HasJSDocToApplicableToMap
 * @description Authoritative mapping from TypeScript compiler `HasJSDoc` members
 * to audit `ApplicableTo` categories.
 * @since 2026-03-01
 */

import type { ApplicableTo } from "./jsdoc-tags-database";

/**
 * One mapping row from a TypeScript `HasJSDoc` member name to an
 * `ApplicableTo` classification.
 *
 * @since 2026-03-01
 * @category DomainModel
 */
export interface HasJSDocApplicableToMapEntry {
  readonly member: string;
  readonly applicableTo: ApplicableTo;
}

/**
 * Complete ordered set of supported `ApplicableTo` values.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const APPLICABLE_TO_VALUES: ReadonlyArray<ApplicableTo> = [
  "function",
  "method",
  "class",
  "class-static-block",
  "interface",
  "type-alias",
  "enum",
  "enum-member",
  "variable",
  "constant",
  "property",
  "accessor",
  "constructor",
  "parameter",
  "signature",
  "index-signature",
  "type-parameter",
  "tuple-member",
  "export-specifier",
  "identifier",
  "statement",
  "expression",
  "module",
  "namespace",
  "file",
  "event",
  "mixin",
  "any"
] as const;

/**
 * Exhaustive `HasJSDoc` to `ApplicableTo` mapping used by the validator.
 *
 * @since 2026-03-01
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
  { member: "ClassStaticBlockDeclaration", applicableTo: "class-static-block" },
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
  { member: "EnumMember", applicableTo: "enum-member" },
  { member: "ExportAssignment", applicableTo: "module" },
  { member: "ExportDeclaration", applicableTo: "module" },
  { member: "ExportSpecifier", applicableTo: "export-specifier" },
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
  { member: "IndexSignatureDeclaration", applicableTo: "index-signature" },
  { member: "InterfaceDeclaration", applicableTo: "interface" },
  { member: "JSDocFunctionType", applicableTo: "signature" },
  { member: "JSDocSignature", applicableTo: "signature" },
  { member: "LabeledStatement", applicableTo: "statement" },
  { member: "MethodDeclaration", applicableTo: "method" },
  { member: "MethodSignature", applicableTo: "method" },
  { member: "ModuleDeclaration", applicableTo: "namespace" },
  { member: "NamedTupleMember", applicableTo: "tuple-member" },
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
  { member: "TypeAliasDeclaration", applicableTo: "type-alias" },
  { member: "TypeParameterDeclaration", applicableTo: "type-parameter" },
  { member: "VariableDeclaration", applicableTo: "variable" },
  { member: "VariableStatement", applicableTo: "variable" },
  { member: "WhileStatement", applicableTo: "statement" },
  { member: "WithStatement", applicableTo: "statement" }
] as const;
