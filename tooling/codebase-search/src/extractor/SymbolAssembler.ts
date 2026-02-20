/**
 * Merges JSDoc extraction, Effect pattern detection, and Schema annotation
 * extraction into complete IndexedSymbol records. Operates on in-memory
 * ts-morph data structures as a pure function pipeline.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type * as tsMorph from "ts-morph";
import { SyntaxKind } from "ts-morph";

import type { IndexedSymbol } from "../IndexedSymbol.js";
import {
  buildEmbeddingText,
  classifySymbol,
  computeContentHash,
  generateId,
  validateIndexedSymbol,
} from "../IndexedSymbol.js";
import { detectEffectPattern, extractFieldAnnotations, extractSchemaAnnotations } from "./EffectPatternDetector.js";
import { extractJsDoc, extractModuleDoc } from "./JsDocExtractor.js";

// ---------------------------------------------------------------------------
// extractSignature
// ---------------------------------------------------------------------------

/**
 * Extracts a concise type signature from a ts-morph AST node. Returns the
 * first meaningful line of the declaration text, trimmed and truncated
 * to 500 characters maximum.
 * @since 0.0.0
 * @category helpers
 */
export const extractSignature = (node: tsMorph.Node): string => {
  const text = node.getText();
  const lines = Str.split("\n")(text);
  const firstLine = pipe(
    A.head(lines),
    O.map(Str.trim),
    O.getOrElse(() => "")
  );

  // For short declarations, return the whole thing trimmed
  if (Str.length(text) <= 500) {
    return Str.trim(text);
  }

  // For longer declarations, return just the first line
  return Str.length(firstLine) > 500 ? firstLine.slice(0, 500) : firstLine;
};

// ---------------------------------------------------------------------------
// getExportName
// ---------------------------------------------------------------------------

/** @internal */
const getExportName = (node: tsMorph.Node): O.Option<string> => {
  const kind = node.getKind();

  // Variable statement: export const Foo = ...
  if (kind === SyntaxKind.VariableStatement) {
    const varStmt = node as tsMorph.VariableStatement;
    const declarations = varStmt.getDeclarations();
    if (A.isArrayNonEmpty(declarations)) {
      return O.some(declarations[0].getName());
    }
    return O.none();
  }

  // Function declaration: export function foo() {}
  if (kind === SyntaxKind.FunctionDeclaration) {
    const funcDecl = node as tsMorph.FunctionDeclaration;
    return O.fromNullishOr(funcDecl.getName());
  }

  // Class declaration: export class Foo {}
  if (kind === SyntaxKind.ClassDeclaration) {
    const classDecl = node as tsMorph.ClassDeclaration;
    return O.fromNullishOr(classDecl.getName());
  }

  // Type alias: export type Foo = ...
  if (kind === SyntaxKind.TypeAliasDeclaration) {
    const typeDecl = node as tsMorph.TypeAliasDeclaration;
    return O.some(typeDecl.getName());
  }

  // Interface: export interface Foo {}
  if (kind === SyntaxKind.InterfaceDeclaration) {
    const ifaceDecl = node as tsMorph.InterfaceDeclaration;
    return O.some(ifaceDecl.getName());
  }

  // Enum: export enum Foo {}
  if (kind === SyntaxKind.EnumDeclaration) {
    const enumDecl = node as tsMorph.EnumDeclaration;
    return O.some(enumDecl.getName());
  }

  return O.none();
};

// ---------------------------------------------------------------------------
// isNodeExported
// ---------------------------------------------------------------------------

/** @internal */
const isNodeExported = (node: tsMorph.Node): boolean => {
  const modifiers = pipe(
    O.fromNullishOr("getModifiers" in node ? (node as tsMorph.VariableStatement).getModifiers() : undefined),
    O.getOrElse(() => [] as ReadonlyArray<tsMorph.Node>)
  );

  return A.some(modifiers, (mod) => mod.getKind() === SyntaxKind.ExportKeyword);
};

// ---------------------------------------------------------------------------
// isSchemaPattern
// ---------------------------------------------------------------------------

/** @internal */
const isSchemaPattern = (pattern: string | null): boolean =>
  pattern === "Schema.Struct" ||
  pattern === "Schema.Class" ||
  pattern === "Schema.Union" ||
  pattern === "Schema.TaggedStruct" ||
  pattern === "Schema.TaggedErrorClass" ||
  pattern === "Schema.brand";

// ---------------------------------------------------------------------------
// assembleOneSymbol
// ---------------------------------------------------------------------------

/** @internal */
const assembleOneSymbol = (
  node: tsMorph.Node,
  name: string,
  pkg: string,
  moduleName: string,
  filePath: string,
  moduleDescription: string | null
): IndexedSymbol => {
  // 1. Extract JSDoc metadata
  const jsDoc = extractJsDoc(node);

  // 2. Detect Effect pattern
  const effectPattern = detectEffectPattern(node);

  // 3. Extract Schema annotations
  const schemaAnnotations = extractSchemaAnnotations(node);

  // 4. Extract field annotations for Schema patterns
  const fieldDescriptions = isSchemaPattern(effectPattern) ? extractFieldAnnotations(node) : null;

  // 5. Determine classification inputs
  const kind = node.getKind();
  const isTypeAlias = kind === SyntaxKind.TypeAliasDeclaration;
  const isInterface = kind === SyntaxKind.InterfaceDeclaration;

  // 6. Classify the symbol
  const symbolKind = classifySymbol({
    effectPattern,
    category: jsDoc.category,
    isTypeAlias,
    isInterface,
    isPackageDocumentation: false,
  });

  // 7. Generate ID
  const id = generateId(pkg, moduleName, name);

  // 8. Extract signature
  const signature = extractSignature(node);

  // 9. Compute content hash
  const contentHash = computeContentHash(node.getText());

  // 10. Get line numbers
  const startLine = node.getStartLineNumber();
  const endLine = node.getEndLineNumber();

  // 11. Build the partial IndexedSymbol (without derived fields)
  const partial: IndexedSymbol = {
    id,
    name,
    qualifiedName: `${pkg}/${moduleName}/${name}`,
    filePath,
    startLine,
    endLine,
    kind: symbolKind,
    effectPattern,
    package: pkg,
    module: moduleName,
    category: jsDoc.category,
    domain: jsDoc.domain,
    description: jsDoc.description,
    title: pipe(
      O.fromNullishOr(schemaAnnotations),
      O.flatMap((a) => O.fromNullishOr(a.title)),
      O.getOrElse(() => null as string | null)
    ),
    schemaIdentifier: pipe(
      O.fromNullishOr(schemaAnnotations),
      O.flatMap((a) => O.fromNullishOr(a.identifier)),
      O.getOrElse(() => null as string | null)
    ),
    schemaDescription: pipe(
      O.fromNullishOr(schemaAnnotations),
      O.flatMap((a) => O.fromNullishOr(a.description)),
      O.getOrElse(() => null as string | null)
    ),
    remarks: jsDoc.remarks,
    moduleDescription,
    examples: jsDoc.examples,
    params: jsDoc.params,
    returns: jsDoc.returns,
    errors: jsDoc.errors,
    fieldDescriptions,
    seeRefs: jsDoc.seeRefs,
    provides: jsDoc.provides,
    dependsOn: jsDoc.dependsOn,
    imports: [], // Populated in second pass
    signature,
    since: jsDoc.since,
    deprecated: jsDoc.deprecated,
    exported: isNodeExported(node),
    // Placeholders for derived fields
    embeddingText: "",
    contentHash,
    indexedAt: new Date().toISOString(),
  };

  // 12. Build derived fields
  const embeddingText = buildEmbeddingText(partial);

  const result: IndexedSymbol = {
    ...partial,
    embeddingText,
  };

  // 13. Validate (warn but still include)
  const validationErrors = validateIndexedSymbol(result);
  if (A.isReadonlyArrayNonEmpty(validationErrors)) {
    // Log warnings but still include the symbol
    pipe(
      validationErrors,
      A.forEach((err) => {
        // eslint-disable-next-line no-console
        console.warn(`[SymbolAssembler] Validation warning for ${id}: ${err}`);
      })
    );
  }

  return result;
};

// ---------------------------------------------------------------------------
// assembleModuleSymbol
// ---------------------------------------------------------------------------

/** @internal */
const assembleModuleSymbol = (
  sourceFile: tsMorph.SourceFile,
  pkg: string,
  moduleName: string,
  filePath: string,
  moduleDoc: {
    readonly description: string;
    readonly since: string;
    readonly category: string;
    readonly moduleDescription: string | null;
  }
): IndexedSymbol => {
  const id = generateId(pkg, moduleName, "_module");
  const now = new Date().toISOString();

  const partial: IndexedSymbol = {
    id,
    name: "_module",
    qualifiedName: `${pkg}/${moduleName}/_module`,
    filePath,
    startLine: 1,
    endLine: sourceFile.getEndLineNumber(),
    kind: "module",
    effectPattern: null,
    package: pkg,
    module: moduleName,
    category: moduleDoc.category,
    domain: null,
    description: moduleDoc.description,
    title: null,
    schemaIdentifier: null,
    schemaDescription: null,
    remarks: null,
    moduleDescription: moduleDoc.moduleDescription,
    examples: [],
    params: [],
    returns: null,
    errors: [],
    fieldDescriptions: null,
    seeRefs: [],
    provides: [],
    dependsOn: [],
    imports: [],
    signature: `module ${moduleName}`,
    since: moduleDoc.since,
    deprecated: false,
    exported: true,
    embeddingText: "",
    contentHash: computeContentHash(sourceFile.getFullText()),
    indexedAt: now,
  };

  const embeddingText = buildEmbeddingText(partial);

  return {
    ...partial,
    embeddingText,
  };
};

// ---------------------------------------------------------------------------
// assembleSymbols
// ---------------------------------------------------------------------------

/**
 * Extracts and assembles IndexedSymbol records from a ts-morph SourceFile.
 * Iterates over all exported declarations, merges JSDoc + Effect pattern
 * detection + Schema annotations, and produces fully populated IndexedSymbol
 * records. Also creates a module-level symbol if @packageDocumentation JSDoc
 * is present.
 *
 * This is a pure function operating on in-memory ts-morph data structures.
 * It does not require FileSystem or any Effect services.
 *
 * @since 0.0.0
 * @category assemblers
 */
export const assembleSymbols = (
  sourceFile: tsMorph.SourceFile,
  pkg: string,
  moduleName: string
): ReadonlyArray<IndexedSymbol> => {
  const filePath = sourceFile.getFilePath();
  const symbols = A.empty<IndexedSymbol>();

  // Extract module-level documentation
  const moduleDoc = extractModuleDoc(sourceFile);
  const moduleDescription = pipe(
    O.fromNullishOr(moduleDoc),
    O.flatMap((doc) => O.fromNullishOr(doc.moduleDescription)),
    O.getOrElse(() => null as string | null)
  );

  // If module-level doc exists, create a module symbol
  if (moduleDoc !== null) {
    const moduleSym = assembleModuleSymbol(sourceFile, pkg, moduleName, filePath, {
      description: moduleDoc.description,
      since: moduleDoc.since,
      category: moduleDoc.category,
      moduleDescription: moduleDoc.moduleDescription,
    });
    symbols.push(moduleSym);
  }

  // Iterate over all statements in the source file
  const statements = sourceFile.getStatements();
  pipe(
    statements,
    A.forEach((node) => {
      // Only process exported declarations
      if (!isNodeExported(node)) return;

      // Get the export name
      const nameOpt = getExportName(node);
      if (O.isNone(nameOpt)) return;
      const name = nameOpt.value;

      const sym = assembleOneSymbol(node, name, pkg, moduleName, filePath, moduleDescription);
      symbols.push(sym);
    })
  );

  return symbols;
};

// ---------------------------------------------------------------------------
// resolveImports (second pass)
// ---------------------------------------------------------------------------

/**
 * Performs the second-pass import resolution on a collection of IndexedSymbols.
 * For each source file's import declarations, matches import specifiers against
 * known symbol IDs and populates the `imports` field on each symbol.
 *
 * @since 0.0.0
 * @category assemblers
 */
export const resolveImports = (
  symbols: ReadonlyArray<IndexedSymbol>,
  sourceFiles: ReadonlyArray<tsMorph.SourceFile>,
  fileToSymbolIds: ReadonlyMap<string, ReadonlyArray<string>>
): ReadonlyArray<IndexedSymbol> => {
  const normalizePath = (value: string): string => value.replace(/\\/g, "/");
  const makeFileAndNameKey = (filePath: string, symbolName: string): string =>
    `${normalizePath(filePath)}::${symbolName}`;
  const appendUnique = (target: Array<string>, value: string): void => {
    if (!target.includes(value)) {
      target.push(value);
    }
  };
  const isSameList = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean =>
    left.length === right.length && left.every((value, index) => value === (right[index] ?? ""));

  // Build a symbol registry by name and by {file,name}
  const nameToIds = MutableHashMap.empty<string, Array<string>>();
  const fileAndNameToId = MutableHashMap.empty<string, string>();
  pipe(
    symbols,
    A.forEach((sym) => {
      const existing = MutableHashMap.get(nameToIds, sym.name);
      if (O.isSome(existing)) {
        appendUnique(existing.value, sym.id);
      } else {
        MutableHashMap.set(nameToIds, sym.name, [sym.id]);
      }

      MutableHashMap.set(fileAndNameToId, makeFileAndNameKey(sym.filePath, sym.name), sym.id);
    })
  );

  // Build path -> source file map for fast lookup
  const sourceFileByPath = MutableHashMap.empty<string, tsMorph.SourceFile>();
  pipe(
    sourceFiles,
    A.forEach((sf) => {
      MutableHashMap.set(sourceFileByPath, normalizePath(sf.getFilePath()), sf);
    })
  );

  const normalizeReference = (reference: string): string => {
    if (Str.includes("/")(reference)) {
      return reference;
    }

    const direct = MutableHashMap.get(nameToIds, reference);
    if (O.isSome(direct) && direct.value.length === 1) {
      return direct.value[0] ?? reference;
    }

    return reference;
  };

  return pipe(
    symbols,
    A.map((sym): IndexedSymbol => {
      const sourceFile = MutableHashMap.get(sourceFileByPath, normalizePath(sym.filePath));
      const importedIds = A.empty<string>();
      if (O.isSome(sourceFile)) {
        const importDecls = sourceFile.value.getImportDeclarations();

        pipe(
          A.fromIterable(importDecls),
          A.forEach((importDecl) => {
            const importedSourceFile = importDecl.getModuleSpecifierSourceFile();
            const importedSourcePath = pipe(
              O.fromNullishOr(importedSourceFile),
              O.map((sf) => normalizePath(sf.getFilePath()))
            );

            // Get named imports
            const namedImports = importDecl.getNamedImports();
            pipe(
              A.fromIterable(namedImports),
              A.forEach((named) => {
                const importedName = named.getName();
                const resolvedId = pipe(
                  importedSourcePath,
                  O.flatMap((sourcePath) =>
                    MutableHashMap.get(fileAndNameToId, makeFileAndNameKey(sourcePath, importedName))
                  )
                );

                if (O.isSome(resolvedId)) {
                  appendUnique(importedIds, resolvedId.value);
                }
              })
            );

            // Get default import
            const defaultImport = importDecl.getDefaultImport();
            if (defaultImport !== undefined) {
              const defaultName = defaultImport.getText();
              const resolvedId = pipe(
                importedSourcePath,
                O.flatMap((sourcePath) =>
                  MutableHashMap.get(fileAndNameToId, makeFileAndNameKey(sourcePath, defaultName))
                )
              );

              if (O.isSome(resolvedId)) {
                appendUnique(importedIds, resolvedId.value);
              }
            }

            // Fallback for precomputed file->symbol registry, useful in tests.
            const importedFilePath = pipe(
              importedSourcePath,
              O.flatMap((sourcePath) => O.fromNullishOr(fileToSymbolIds.get(sourcePath)))
            );
            if (O.isSome(importedFilePath) && A.isArrayNonEmpty(namedImports)) {
              const firstImportName = namedImports[0].getName();
              pipe(
                importedFilePath.value,
                A.forEach((id) => {
                  if (id.endsWith(`/${firstImportName}`)) {
                    appendUnique(importedIds, id);
                  }
                })
              );
            }
          })
        );
      }

      const normalizedProvides = pipe(sym.provides, A.map(normalizeReference), A.dedupe);

      const normalizedDependsOn = pipe(sym.dependsOn, A.map(normalizeReference), A.dedupe);

      if (
        (A.isArrayNonEmpty(importedIds) && !isSameList(sym.imports, importedIds)) ||
        !isSameList(sym.provides, normalizedProvides) ||
        !isSameList(sym.dependsOn, normalizedDependsOn)
      ) {
        return {
          ...sym,
          imports: A.isArrayNonEmpty(importedIds) ? importedIds : sym.imports,
          provides: normalizedProvides,
          dependsOn: normalizedDependsOn,
        };
      }

      return sym;
    })
  );
};

// ---------------------------------------------------------------------------
// resolveLayerContractErrors
// ---------------------------------------------------------------------------

/**
 * Collects lint-like validation errors for Layer symbols.
 * Ensures `@provides` and `@depends` are present for `kind === "layer"`.
 *
 * @since 0.0.0
 * @category validators
 */
export const resolveLayerContractErrors = (symbols: ReadonlyArray<IndexedSymbol>): ReadonlyArray<string> =>
  pipe(
    symbols,
    A.flatMap((symbol) => {
      if (symbol.kind !== "layer") {
        return A.empty<string>();
      }

      const errors = A.empty<string>();
      if (A.isReadonlyArrayEmpty(symbol.provides)) {
        errors.push(`${symbol.id}: Layer symbols must declare at least one @provides entry.`);
      }
      if (A.isReadonlyArrayEmpty(symbol.dependsOn)) {
        errors.push(`${symbol.id}: Layer symbols must declare at least one @depends entry.`);
      }
      return errors;
    })
  );

// ---------------------------------------------------------------------------
// resolveModuleName
// ---------------------------------------------------------------------------

/**
 * Extracts the module name from a file path relative to the package src
 * directory. Strips the `src/` prefix and `.ts` extension to produce a
 * clean module path (e.g. `tooling/cli/src/commands/codegen.ts` yields
 * `commands/codegen`).
 *
 * @since 0.0.0
 * @category helpers
 */
export const resolveModuleName = (filePath: string): string => {
  // Find the src/ segment and extract everything after it
  const srcIndex = filePath.indexOf("/src/");
  if (srcIndex === -1) {
    // Fall back to just stripping the extension
    const lastSlash = filePath.lastIndexOf("/");
    const basename = lastSlash >= 0 ? filePath.slice(lastSlash + 1) : filePath;
    return basename.replace(/\.ts$/, "");
  }

  const afterSrc = filePath.slice(srcIndex + 5); // skip "/src/"
  // Remove .ts extension
  return afterSrc.replace(/\.ts$/, "");
};
