/**
 * @module TypeScriptHasJSDocType
 * @description Snapshot of TypeScript compiler `HasJSDoc` support surface for
 * audit and reference workflows.
 * @since 2026-03-01
 *
 * @source typescript.d.ts-morph (TypeScript compiler)
 * @description The HasJSDoc union type defines ALL AST node types that the TypeScript
 * compiler recognizes as being able to host JSDoc comments. This is the compiler's
 * authoritative answer to "what can have JSDoc attached to it?"
 *
 * This is critical for the knowledge graph pipeline because it defines the complete
 * set of AST nodes where JSDoc extraction should be attempted.
 */

import type { ts } from "@ts-morph/common";

/**
 * TypeScript compiler's authoritative union of AST node types that can host JSDoc.
 *
 * @since 2026-03-01
 * @category DomainModel
 */
export type HasJSDoc =
  | ts.AccessorDeclaration
  | ts.ArrowFunction
  | ts.BinaryExpression
  | ts.Block
  | ts.BreakStatement
  | ts.CallSignatureDeclaration
  | ts.CaseClause
  | ts.ClassLikeDeclaration
  | ts.ClassStaticBlockDeclaration
  | ts.ConstructorDeclaration
  | ts.ConstructorTypeNode
  | ts.ConstructSignatureDeclaration
  | ts.ContinueStatement
  | ts.DebuggerStatement
  | ts.DoStatement
  | ts.ElementAccessExpression
  | ts.EmptyStatement
  | ts.EndOfFileToken
  | ts.EnumDeclaration
  | ts.EnumMember
  | ts.ExportAssignment
  | ts.ExportDeclaration
  | ts.ExportSpecifier
  | ts.ExpressionStatement
  | ts.ForInStatement
  | ts.ForOfStatement
  | ts.ForStatement
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.FunctionTypeNode
  | ts.Identifier
  | ts.IfStatement
  | ts.ImportDeclaration
  | ts.ImportEqualsDeclaration
  | ts.IndexSignatureDeclaration
  | ts.InterfaceDeclaration
  | ts.JSDocFunctionType
  | ts.JSDocSignature
  | ts.LabeledStatement
  | ts.MethodDeclaration
  | ts.MethodSignature
  | ts.ModuleDeclaration
  | ts.NamedTupleMember
  | ts.NamespaceExportDeclaration
  | ts.ObjectLiteralExpression
  | ts.ParameterDeclaration
  | ts.ParenthesizedExpression
  | ts.PropertyAccessExpression
  | ts.PropertyAssignment
  | ts.PropertyDeclaration
  | ts.PropertySignature
  | ts.ReturnStatement
  | ts.SemicolonClassElement
  | ts.ShorthandPropertyAssignment
  | ts.SpreadAssignment
  | ts.SwitchStatement
  | ts.ThrowStatement
  | ts.TryStatement
  | ts.TypeAliasDeclaration
  | ts.TypeParameterDeclaration
  | ts.VariableDeclaration
  | ts.VariableStatement
  | ts.WhileStatement
  | ts.WithStatement;
