/**
 * Shared TSMorph normalization helpers.
 *
 * @module
 * @since 0.0.0
 */
import { Text, thunkEmptyStr } from "@beep/utils";
import { flow, Match, Order, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
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
 * @category CrossCutting
 * @since 0.0.0
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

const bySymbolNameAscending: Order.Order<TsMorphSymbol> = Order.mapInput(Order.String, (symbol) => symbol.name);
const bySymbolFilePathAscending: Order.Order<TsMorphSymbol> = Order.mapInput(Order.String, (symbol) => symbol.filePath);
const bySymbolStartLineAscending: Order.Order<TsMorphSymbol> = Order.mapInput(
  Order.Number,
  (symbol) => symbol.startLine
);

/**
 * Deterministic symbol ordering used by normalized TSMorph symbol collections.
 *
 * @category CrossCutting
 * @since 0.0.0
 */
export const byTsMorphSymbolAscending: Order.Order<TsMorphSymbol> = Order.combine(
  bySymbolNameAscending,
  Order.combine(bySymbolFilePathAscending, bySymbolStartLineAscending)
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
 * @category CrossCutting
 * @since 0.0.0
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
 * @param node - Declaration node that may carry JSDoc metadata.
 * @returns Normalized declaration description text when present.
 * @category CrossCutting
 * @since 0.0.0
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
 * @param node - Declaration node that may carry decorators.
 * @returns Normalized decorator source text in declaration order.
 * @category CrossCutting
 * @since 0.0.0
 */
export const readDecorators = (node: OutlineDeclaration): ReadonlyArray<string> =>
  Node.isDecoratable(node)
    ? pipe(node.getDecorators(), A.map(flow((decorator) => decorator.getText(), Str.trim)), A.filter(Str.isNonEmpty))
    : A.empty();

/**
 * Read the first non-empty signature line for a declaration.
 *
 * @param node - Declaration node to read.
 * @returns First non-empty line from the declaration source text.
 * @category CrossCutting
 * @since 0.0.0
 */
export const readSignature = (node: OutlineDeclaration): string => {
  const signatureSourceText = pipe(
    Node.isDecoratable(node) ? node.getDecorators() : A.empty(),
    A.last,
    O.map((decorator) => node.getSourceFile().getFullText().slice(decorator.getEnd(), node.getEnd())),
    O.getOrElse(() => node.getText())
  );

  return firstSignatureLine(signatureSourceText);
};

/**
 * Derive the normalized summary text for a declaration.
 *
 * @param docstring - Optional normalized JSDoc description text.
 * @returns Stable summary text used by the public symbol model.
 * @category CrossCutting
 * @since 0.0.0
 */
export const makeSummary = (docstring: O.Option<string>): O.Option<string> => docstring;

/**
 * Build stable symbol keywords from normalized declaration metadata.
 *
 * @param name - Symbol display name.
 * @param qualifiedName - Fully qualified symbol path.
 * @param kind - Public symbol kind literal.
 * @returns Stable keyword set used by the public symbol model.
 * @category CrossCutting
 * @since 0.0.0
 */
export const makeKeywords = (name: string, qualifiedName: string, kind: SymbolKind): ReadonlyArray<string> =>
  A.make(name, qualifiedName, kind, symbolCategoryFromKind(kind));

/**
 * Build deterministic lowercased search text for a normalized symbol entry.
 *
 * @param symbol - Public normalized symbol metadata.
 * @param sourceText - Extracted declaration source text.
 * @returns Lowercased search corpus for symbol lookup and filtering.
 * @category CrossCutting
 * @since 0.0.0
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

const flattenDiagnosticMessageTextMatcher = Match.type<string | DiagnosticMessageChain>().pipe(
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
);

/**
 * Flatten a TypeScript diagnostic message chain into normalized text.
 *
 * @param message - Diagnostic string or nested TypeScript message chain.
 * @returns Normalized multi-line diagnostic text.
 * @category CrossCutting
 * @since 0.0.0
 */
export const flattenDiagnosticMessageText = (message: string | DiagnosticMessageChain): string =>
  flattenDiagnosticMessageTextMatcher(message);

const errorDiagnosticCategory: TsMorphDiagnostic["category"] = "error";
const warningDiagnosticCategory: TsMorphDiagnostic["category"] = "warning";
const suggestionDiagnosticCategory: TsMorphDiagnostic["category"] = "suggestion";
const messageDiagnosticCategory: TsMorphDiagnostic["category"] = "message";

const normalizeDiagnosticCategoryMatcher = Match.type<DiagnosticCategory>().pipe(
  Match.when(DiagnosticCategory.Error, () => errorDiagnosticCategory),
  Match.when(DiagnosticCategory.Warning, () => warningDiagnosticCategory),
  Match.when(DiagnosticCategory.Suggestion, () => suggestionDiagnosticCategory),
  Match.orElse(() => messageDiagnosticCategory)
);

/**
 * Normalize TypeScript diagnostic categories into the public service literal domain.
 *
 * @param category - Raw TypeScript diagnostic category.
 * @returns Public service diagnostic category literal.
 * @category CrossCutting
 * @since 0.0.0
 */
export const normalizeDiagnosticCategory = (category: DiagnosticCategory): TsMorphDiagnostic["category"] =>
  normalizeDiagnosticCategoryMatcher(category);

/**
 * Read the normalized name and kind for a supported declaration node.
 *
 * @param declaration - Supported declaration node to inspect.
 * @returns Normalized declaration name and public kind when available.
 * @category CrossCutting
 * @since 0.0.0
 */
export const getDeclarationName = (
  declaration: OutlineDeclaration
): O.Option<{
  readonly name: string;
  readonly kind: SymbolKind;
}> => {
  const makeNamedDeclaration = (name: string, kind: SymbolKind) =>
    O.some({
      name,
      kind,
    });

  if (Node.isConstructorDeclaration(declaration)) {
    return makeNamedDeclaration("constructor", "Constructor");
  }

  if (Node.isFunctionDeclaration(declaration)) {
    return pipe(
      O.fromUndefinedOr(declaration.getName()),
      O.flatMap((name) => makeNamedDeclaration(name, "FunctionDeclaration"))
    );
  }

  if (Node.isClassDeclaration(declaration)) {
    return pipe(
      O.fromUndefinedOr(declaration.getName()),
      O.flatMap((name) => makeNamedDeclaration(name, "ClassDeclaration"))
    );
  }

  if (Node.isMethodDeclaration(declaration)) {
    return makeNamedDeclaration(declaration.getName(), "MethodDeclaration");
  }

  if (Node.isGetAccessorDeclaration(declaration)) {
    return makeNamedDeclaration(declaration.getName(), "GetAccessor");
  }

  if (Node.isSetAccessorDeclaration(declaration)) {
    return makeNamedDeclaration(declaration.getName(), "SetAccessor");
  }

  if (Node.isInterfaceDeclaration(declaration)) {
    return pipe(
      O.fromUndefinedOr(declaration.getName()),
      O.flatMap((name) => makeNamedDeclaration(name, "InterfaceDeclaration"))
    );
  }

  if (Node.isTypeAliasDeclaration(declaration)) {
    return pipe(
      O.fromUndefinedOr(declaration.getName()),
      O.flatMap((name) => makeNamedDeclaration(name, "TypeAliasDeclaration"))
    );
  }

  return pipe(
    O.fromUndefinedOr(declaration.getName()),
    O.flatMap((name) => makeNamedDeclaration(name, "EnumDeclaration"))
  );
};

/**
 * Extend a parent symbol qualified name with one child declaration segment.
 *
 * @param parentSymbol - Parent symbol, when the declaration is nested.
 * @param name - Child declaration name segment.
 * @returns Qualified symbol name anchored to the nearest parent symbol.
 * @category CrossCutting
 * @since 0.0.0
 */
export const pipeQualifiedName = (parentSymbol: O.Option<TsMorphSymbol>, name: string): string =>
  O.isSome(parentSymbol) ? `${parentSymbol.value.qualifiedName}.${name}` : name;
