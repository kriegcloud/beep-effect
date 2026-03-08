import { Text, thunkEmptyStr } from "@beep/utils";
import { Array as A, flow, Match, Order, pipe, String as Str } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import {
  type ClassDeclaration,
  type ConstructorDeclaration,
  DiagnosticCategory,
  type DiagnosticMessageChain,
  type EnumDeclaration,
  type FunctionDeclaration,
  type GetAccessorDeclaration,
  type InterfaceDeclaration,
  type MethodDeclaration,
  Node,
  type SetAccessorDeclaration,
  type TypeAliasDeclaration,
} from "ts-morph";
import type { SourceText, SymbolKind, TsMorphDiagnostic, Symbol as TsMorphSymbol } from "./TSMorph.model.js";
import { symbolCategoryFromKind } from "./TSMorph.model.js";

/**
 * Supported declaration nodes for normalized TSMorph symbol extraction.
 *
 * @since 0.0.0
 * @category Internal
 */
export type OutlineDeclaration =
  | ClassDeclaration
  | ConstructorDeclaration
  | EnumDeclaration
  | FunctionDeclaration
  | GetAccessorDeclaration
  | InterfaceDeclaration
  | MethodDeclaration
  | SetAccessorDeclaration
  | TypeAliasDeclaration;

/**
 * Cached normalized symbol entry used by the TSMorph live service.
 *
 * @since 0.0.0
 * @category Internal
 */
export type ScopeSymbolEntry = {
  readonly symbol: TsMorphSymbol;
  readonly sourceText: SourceText;
  readonly contentHash: TsMorphSymbol["contentHash"];
  readonly searchText: string;
};

const bySymbolNameAscending: Order.Order<TsMorphSymbol> = Order.mapInput(Order.String, (symbol) => symbol.name);
const bySymbolFilePathAscending: Order.Order<TsMorphSymbol> = Order.mapInput(Order.String, (symbol) => symbol.filePath);
const bySymbolStartLineAscending: Order.Order<TsMorphSymbol> = Order.mapInput(
  Order.Number,
  (symbol) => symbol.startLine
);

/**
 * Deterministic symbol ordering used by the scoped symbol index.
 *
 * @since 0.0.0
 * @category Internal
 */
export const byScopeSymbolEntryAscending: Order.Order<ScopeSymbolEntry> = Order.mapInput(
  Order.combine(bySymbolNameAscending, Order.combine(bySymbolFilePathAscending, bySymbolStartLineAscending)),
  (entry: ScopeSymbolEntry) => entry.symbol
);

const byDiagnosticStartLineAscending: Order.Order<TsMorphDiagnostic> = Order.mapInput(
  Order.Number,
  (diagnostic) => diagnostic.startLine
);
const byDiagnosticStartColumnAscending: Order.Order<TsMorphDiagnostic> = Order.mapInput(
  Order.Number,
  (diagnostic) => diagnostic.startColumn
);
const byDiagnosticCodeAscending: Order.Order<TsMorphDiagnostic> = Order.mapInput(
  Order.Number,
  (diagnostic) => diagnostic.code
);

/**
 * Deterministic ordering for normalized diagnostics.
 *
 * @since 0.0.0
 * @category Internal
 */
export const byNormalizedDiagnosticAscending: Order.Order<TsMorphDiagnostic> = Order.combine(
  byDiagnosticStartLineAscending,
  Order.combine(byDiagnosticStartColumnAscending, byDiagnosticCodeAscending)
);

const firstSignatureLine = (text: string): string =>
  pipe(
    Str.split("\n")(text),
    A.map(Str.trim),
    A.findFirst(Str.isNonEmpty),
    O.getOrElse(() => Str.trim(text))
  );

/**
 * Read the normalized JSDoc description text attached to a declaration.
 *
 * @since 0.0.0
 * @category Internal
 */
export const readDocstring = (node: OutlineDeclaration): O.Option<string> => {
  if (!Node.isJSDocable(node)) {
    return O.none();
  }

  const descriptions = pipe(
    node.getJsDocs(),
    A.map(flow((jsDoc) => jsDoc.getDescription(), Str.trim)),
    A.filter(Str.isNonEmpty),
    A.join("\n\n")
  );

  return Str.isNonEmpty(descriptions) ? O.some(descriptions) : O.none();
};

/**
 * Read normalized decorator text attached to a declaration.
 *
 * @since 0.0.0
 * @category Internal
 */
export const readDecorators = (node: OutlineDeclaration): ReadonlyArray<string> =>
  Node.isDecoratable(node)
    ? pipe(node.getDecorators(), A.map(flow((decorator) => decorator.getText(), Str.trim)), A.filter(Str.isNonEmpty))
    : A.empty();

/**
 * Read the first non-empty signature line for a declaration.
 *
 * @since 0.0.0
 * @category Internal
 */
export const readSignature = (node: OutlineDeclaration): string => firstSignatureLine(node.getText());

/**
 * Derive the normalized summary text for a declaration.
 *
 * @since 0.0.0
 * @category Internal
 */
export const makeSummary = (docstring: O.Option<string>): O.Option<string> => docstring;

/**
 * Build stable symbol keywords from normalized declaration metadata.
 *
 * @since 0.0.0
 * @category Internal
 */
export const makeKeywords = (name: string, qualifiedName: string, kind: SymbolKind): ReadonlyArray<string> =>
  A.make(name, qualifiedName, kind, symbolCategoryFromKind(kind));

/**
 * Build deterministic lowercased search text for a normalized symbol entry.
 *
 * @since 0.0.0
 * @category Internal
 */
export const makeScopeSymbolSearchText = (symbol: TsMorphSymbol, sourceText: SourceText): string =>
  pipe(
    A.make(
      symbol.name,
      symbol.qualifiedName,
      symbol.signature,
      O.getOrElse(symbol.summary, thunkEmptyStr),
      O.getOrElse(symbol.docstring, thunkEmptyStr),
      sourceText
    ),
    A.map(Str.trim),
    A.filter(Str.isNonEmpty),
    A.join(" "),
    Str.toLowerCase
  );

/**
 * Flatten a TypeScript diagnostic message chain into normalized text.
 *
 * @since 0.0.0
 * @category Internal
 */
export const flattenDiagnosticMessageText = (message: string | DiagnosticMessageChain): string =>
  Match.type<string | DiagnosticMessageChain>().pipe(
    Match.when(P.isString, (text) => text),
    Match.orElse((messageChain) =>
      pipe(
        messageChain.getNext() ?? A.empty<DiagnosticMessageChain>(),
        A.reduce(A.make(messageChain.getMessageText()), (lines, next) => {
          const nextText = flattenDiagnosticMessageText(next);
          return Str.isNonEmpty(nextText) ? A.append(lines, nextText) : lines;
        }),
        A.filter(Str.isNonEmpty),
        Text.joinLines
      )
    )
  )(message);

/**
 * Normalize TypeScript diagnostic categories into the public service literal domain.
 *
 * @since 0.0.0
 * @category Internal
 */
export const normalizeDiagnosticCategory = (category: DiagnosticCategory): TsMorphDiagnostic["category"] =>
  Match.type<DiagnosticCategory>().pipe(
    Match.when(DiagnosticCategory.Error, () => "error" as const),
    Match.when(DiagnosticCategory.Warning, () => "warning" as const),
    Match.when(DiagnosticCategory.Suggestion, () => "suggestion" as const),
    Match.orElse(() => "message" as const)
  )(category);

/**
 * Read the normalized name and kind for a supported declaration node.
 *
 * @since 0.0.0
 * @category Internal
 */
export const getDeclarationName = (
  declaration: OutlineDeclaration
): O.Option<{
  readonly name: string;
  readonly kind: SymbolKind;
}> => {
  if (Node.isConstructorDeclaration(declaration)) {
    return O.some({
      name: "constructor",
      kind: "Constructor",
    });
  }

  if (Node.isFunctionDeclaration(declaration)) {
    return pipe(
      O.fromUndefinedOr(declaration.getName()),
      O.map((name) => ({
        name,
        kind: "FunctionDeclaration" as const,
      }))
    );
  }

  if (Node.isClassDeclaration(declaration)) {
    return pipe(
      O.fromUndefinedOr(declaration.getName()),
      O.map((name) => ({
        name,
        kind: "ClassDeclaration" as const,
      }))
    );
  }

  if (Node.isMethodDeclaration(declaration)) {
    return O.some({
      name: declaration.getName(),
      kind: "MethodDeclaration",
    });
  }

  if (Node.isGetAccessorDeclaration(declaration)) {
    return O.some({
      name: declaration.getName(),
      kind: "GetAccessor",
    });
  }

  if (Node.isSetAccessorDeclaration(declaration)) {
    return O.some({
      name: declaration.getName(),
      kind: "SetAccessor",
    });
  }

  if (Node.isInterfaceDeclaration(declaration)) {
    return pipe(
      O.fromUndefinedOr(declaration.getName()),
      O.map((name) => ({
        name,
        kind: "InterfaceDeclaration" as const,
      }))
    );
  }

  if (Node.isTypeAliasDeclaration(declaration)) {
    return pipe(
      O.fromUndefinedOr(declaration.getName()),
      O.map((name) => ({
        name,
        kind: "TypeAliasDeclaration" as const,
      }))
    );
  }

  return pipe(
    O.fromUndefinedOr(declaration.getName()),
    O.map((name) => ({
      name,
      kind: "EnumDeclaration" as const,
    }))
  );
};

/**
 * Extend a parent symbol qualified name with one child declaration segment.
 *
 * @since 0.0.0
 * @category Internal
 */
export const pipeQualifiedName = (parentSymbol: O.Option<TsMorphSymbol>, name: string): string =>
  O.isSome(parentSymbol) ? `${parentSymbol.value.qualifiedName}.${name}` : name;
