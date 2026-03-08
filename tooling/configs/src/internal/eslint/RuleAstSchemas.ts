import { thunkSomeEmptyArray } from "@beep/utils";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const ImportKindSchema = S.Union([S.Literal("type"), S.Literal("value")]);

type ImportKind = "type" | "value";

export class IdentifierNode extends S.Class<IdentifierNode>("IdentifierNode")({
  name: S.String,
}) {}

export class ImportNamespaceSpecifierNode extends S.Class<ImportNamespaceSpecifierNode>("ImportNamespaceSpecifierNode")(
  {
    type: S.tag("ImportNamespaceSpecifier"),
    local: IdentifierNode,
  }
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ImportSpecifierNode extends S.Class<ImportSpecifierNode>("ImportSpecifierNode")({
  type: S.tag("ImportSpecifier"),
  importKind: S.optionalKey(ImportKindSchema),
  imported: IdentifierNode,
  local: IdentifierNode,
}) {}

export class ImportSourceLiteralNode extends S.Class<ImportSourceLiteralNode>("ImportSourceLiteralNode")({
  type: S.tag("Literal"),
  value: S.String,
}) {}

export class ImportDeclarationNode extends S.Class<ImportDeclarationNode>("ImportDeclarationNode")({
  type: S.tag("ImportDeclaration"),
  source: ImportSourceLiteralNode,
  importKind: S.optionalKey(ImportKindSchema),
  specifiers: S.Array(S.Unknown).pipe(
    S.withConstructorDefault(thunkSomeEmptyArray<unknown>),
    S.withDecodingDefault(A.empty<unknown>)
  ),
}) {}

export class NamedDeclarationNode extends S.Class<NamedDeclarationNode>("NamedDeclarationNode")({
  id: IdentifierNode,
}) {}

export class VariableDeclaratorIdentifierNode extends S.Class<VariableDeclaratorIdentifierNode>(
  "VariableDeclaratorIdentifierNode"
)({
  id: IdentifierNode,
}) {}

export class VariableDeclarationNode extends S.Class<VariableDeclarationNode>("VariableDeclarationNode")({
  type: S.Literal("VariableDeclaration"),
  declarations: S.Array(VariableDeclaratorIdentifierNode),
}) {}

export class BlockCommentNode extends S.Class<BlockCommentNode>("BlockCommentNode")({
  type: S.Literal("Block"),
  value: S.String,
}) {}

export const decodeImportDeclarationNode = S.decodeUnknownOption(ImportDeclarationNode);
export const decodeImportNamespaceSpecifierNode = S.decodeUnknownOption(ImportNamespaceSpecifierNode);

/**
 * @since 0.0.0
 * @category Utility
 */
export const decodeImportSpecifierNode = S.decodeUnknownOption(ImportSpecifierNode);

/**
 * @since 0.0.0
 * @category Utility
 */
export const resolveImportSpecifierImportKind = (
  node: unknown,
  importDeclarationKind?: ImportKind
): ImportKind | undefined => {
  if (typeof node !== "object" || node === null || !("importKind" in node)) {
    return importDeclarationKind;
  }

  const importKind = Reflect.get(node, "importKind");
  return importKind === "type" || importKind === "value" ? importKind : importDeclarationKind;
};
export const decodeNamedDeclarationNode = S.decodeUnknownOption(NamedDeclarationNode);
export const decodeVariableDeclarationNode = S.decodeUnknownOption(VariableDeclarationNode);
export const decodeBlockCommentNode = S.decodeUnknownOption(BlockCommentNode);
