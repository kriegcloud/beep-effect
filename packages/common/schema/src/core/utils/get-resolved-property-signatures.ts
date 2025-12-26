import * as F from "effect/Function";
import type * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";

const resolveStructAst = (ast: AST.AST): AST.AST => (AST.isTransformation(ast) ? resolveStructAst(ast.from) : ast);

export const getResolvedPropertySignatures = (schema: S.Schema.AnyNoContext): ReadonlyArray<AST.PropertySignature> =>
  F.pipe(schema.ast, resolveStructAst, AST.getPropertySignatures);
