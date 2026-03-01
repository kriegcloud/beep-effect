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

/**
 * TypeScript compiler's authoritative union of AST node types that can host JSDoc.
 *
 * @since 2026-03-01
 * @category DomainModel
 */
export type HasJSDoc =
  | AccessorDeclaration
  | ArrowFunction
  | BinaryExpression
  | Block
  | BreakStatement
  | CallSignatureDeclaration
  | CaseClause
  | ClassLikeDeclaration
  | ClassStaticBlockDeclaration
  | ConstructorDeclaration
  | ConstructorTypeNode
  | ConstructSignatureDeclaration
  | ContinueStatement
  | DebuggerStatement
  | DoStatement
  | ElementAccessExpression
  | EmptyStatement
  | EndOfFileToken
  | EnumDeclaration
  | EnumMember
  | ExportAssignment
  | ExportDeclaration
  | ExportSpecifier
  | ExpressionStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | FunctionDeclaration
  | FunctionExpression
  | FunctionTypeNode
  | Identifier
  | IfStatement
  | ImportDeclaration
  | ImportEqualsDeclaration
  | IndexSignatureDeclaration
  | InterfaceDeclaration
  | JSDocFunctionType
  | JSDocSignature
  | LabeledStatement
  | MethodDeclaration
  | MethodSignature
  | ModuleDeclaration
  | NamedTupleMember
  | NamespaceExportDeclaration
  | ObjectLiteralExpression
  | ParameterDeclaration
  | ParenthesizedExpression
  | PropertyAccessExpression
  | PropertyAssignment
  | PropertyDeclaration
  | PropertySignature
  | ReturnStatement
  | SemicolonClassElement
  | ShorthandPropertyAssignment
  | SpreadAssignment
  | SwitchStatement
  | ThrowStatement
  | TryStatement
  | TypeAliasDeclaration
  | TypeParameterDeclaration
  | VariableDeclaration
  | VariableStatement
  | WhileStatement
  | WithStatement;
