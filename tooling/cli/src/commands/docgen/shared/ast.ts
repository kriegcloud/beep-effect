/**
 * @file TypeScript AST Analysis Utilities
 *
 * Provides Effect-wrapped ts-morph utilities for analyzing TypeScript
 * source files and extracting JSDoc information.
 *
 * Key exports:
 * - createProject: Create a ts-morph Project
 * - addSourceFile: Add a source file to a project
 * - analyzeSourceFile: Extract exports and JSDoc from a file
 * - getSourceFiles: Get all TypeScript source files in a directory
 *
 * IMPORTANT: All operations use Effect patterns. No for...of loops or native
 * array methods per CLAUDE.md requirements.
 *
 * @module docgen/shared/ast
 * @since 0.1.0
 */

import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import {
  type CompilerOptions,
  type ExportDeclaration,
  type JSDoc,
  Node,
  Project,
  type SourceFile,
  SyntaxKind,
} from "ts-morph";
import { TsMorphError } from "../errors.js";
import { type ExportAnalysis, type ExportKind, type IssuePriority, RequiredTags } from "../types.js";

/**
 * Create a new ts-morph Project.
 *
 * @param compilerOptions - Optional TypeScript compiler options
 * @returns A configured Project instance
 * @since 0.1.0
 */
export const createProject = (compilerOptions?: CompilerOptions): Effect.Effect<Project, never, never> =>
  Effect.sync(
    () =>
      new Project({
        compilerOptions: compilerOptions ?? {},
        skipAddingFilesFromTsConfig: true,
      })
  );

/**
 * Add a source file to a project by path.
 *
 * @param project - The ts-morph Project
 * @param filePath - Path to the TypeScript file
 * @returns The added SourceFile
 * @throws TsMorphError if the file cannot be added
 * @since 0.1.0
 */
export const addSourceFile = (project: Project, filePath: string): Effect.Effect<SourceFile, TsMorphError, never> =>
  Effect.try({
    try: () => project.addSourceFileAtPath(filePath),
    catch: (error) =>
      new TsMorphError({
        filePath,
        cause: error,
      }),
  });

/**
 * Determine the kind of an exported node.
 *
 * @param node - The AST node to classify
 * @returns The ExportKind classification
 */
const getExportKind = (node: Node): ExportKind => {
  if (Node.isFunctionDeclaration(node)) return "function";
  if (Node.isVariableDeclaration(node)) return "const";
  if (Node.isTypeAliasDeclaration(node)) return "type";
  if (Node.isInterfaceDeclaration(node)) return "interface";
  if (Node.isClassDeclaration(node)) return "class";
  if (Node.isModuleDeclaration(node)) return "namespace";
  if (Node.isEnumDeclaration(node)) return "enum";
  return "const"; // fallback for arrow functions, etc.
};

/**
 * Get JSDoc comments from a node, checking parent statement for variable declarations.
 *
 * For VariableDeclarations, JSDoc is attached to the VariableStatement (parent),
 * not the declaration itself. This helper traverses up to find the correct JSDoc.
 *
 * @param node - The AST node to get JSDocs from
 * @returns Array of JSDoc comments
 */
const getJsDocs = (node: Node): ReadonlyArray<JSDoc> => {
  // Direct check for JSDocable nodes
  if (Node.isJSDocable(node)) {
    const jsDocs = node.getJsDocs();
    if (A.length(jsDocs) > 0) return jsDocs;
  }

  // For VariableDeclaration, check parent VariableDeclarationList, then VariableStatement
  if (Node.isVariableDeclaration(node)) {
    const parent = node.getParent();
    if (parent) {
      const grandparent = parent.getParent();
      if (grandparent && Node.isJSDocable(grandparent)) {
        return grandparent.getJsDocs();
      }
    }
  }

  return [];
};

/**
 * Extract JSDoc tags from a node.
 *
 * @param node - The AST node to extract tags from
 * @returns Array of tag names (e.g., ["@category", "@since"])
 */
const extractJsDocTags = (node: Node): ReadonlyArray<string> => {
  const jsDocs = getJsDocs(node);
  return F.pipe(
    jsDocs,
    A.flatMap((doc: JSDoc) => doc.getTags()),
    A.map((tag) => `@${tag.getTagName()}`)
  );
};

/**
 * Check if a node has any JSDoc comments.
 *
 * @param node - The AST node to check
 * @returns true if the node has JSDoc
 */
const hasJsDocComment = (node: Node): boolean => {
  const jsDocs = getJsDocs(node);
  return A.length(jsDocs) > 0;
};

/**
 * Get the first line of JSDoc description as context.
 *
 * @param node - The AST node to extract context from
 * @returns The first line of description, or undefined
 */
const extractContext = (node: Node): string | undefined => {
  const jsDocs = getJsDocs(node);
  if (A.length(jsDocs) === 0) return undefined;

  const firstDoc = A.head(jsDocs);
  return F.pipe(
    firstDoc,
    O.flatMap((doc) => O.fromNullable(doc.getDescription())),
    O.map((desc) =>
      F.pipe(
        desc,
        Str.trim,
        Str.split("\n"),
        A.head,
        O.getOrElse(() => Str.empty)
      )
    ),
    O.map(Str.trim),
    O.filter(Str.isNonEmpty),
    O.getOrUndefined
  );
};

/**
 * Compute priority based on missing tags count.
 *
 * - High: Missing 3 tags (all required tags)
 * - Medium: Missing 1-2 tags
 * - Low: Missing 0 tags (fully documented)
 *
 * @param missingTags - Array of missing tag names
 * @returns The computed priority level
 */
const computePriority = (missingTags: ReadonlyArray<string>): IssuePriority => {
  const count = A.length(missingTags);
  if (count >= 3) return "high";
  if (count >= 1) return "medium";
  return "low";
};

/**
 * Get context lines before a position in the source file.
 *
 * @param sourceFile - The ts-morph SourceFile
 * @param line - The target line number (1-indexed)
 * @param numLines - Number of lines to get before the target
 * @returns The context lines joined by newlines
 */
const getContextBefore = (sourceFile: SourceFile, line: number, numLines: number): string => {
  const fullText = sourceFile.getFullText();
  const lines = F.pipe(fullText, Str.split("\n"));
  const startLine = Math.max(0, line - numLines - 1);
  const endLine = line - 1;
  // Take lines from start to end by dropping before and taking what we need
  const sliced = F.pipe(lines, A.drop(startLine), A.take(endLine - startLine));
  return A.join(sliced, "\n");
};

/**
 * Get the source text of an export declaration.
 * For variable declarations, gets the full variable statement.
 *
 * @param node - The AST node
 * @returns The declaration source code
 */
const getDeclarationSource = (node: Node): string => {
  // For VariableDeclaration, get the full VariableStatement
  if (Node.isVariableDeclaration(node)) {
    const parent = node.getParent();
    if (parent) {
      const grandparent = parent.getParent();
      if (grandparent && Node.isVariableStatement(grandparent)) {
        return grandparent.getText();
      }
    }
  }
  return node.getText();
};

/**
 * Get the start line of an export declaration.
 * For variable declarations, gets the line of the variable statement.
 *
 * @param node - The AST node
 * @returns The start line number (1-indexed)
 */
const getDeclarationStartLine = (node: Node): number => {
  // For VariableDeclaration, get the line of the VariableStatement
  if (Node.isVariableDeclaration(node)) {
    const parent = node.getParent();
    if (parent) {
      const grandparent = parent.getParent();
      if (grandparent && Node.isVariableStatement(grandparent)) {
        return grandparent.getStartLineNumber();
      }
    }
  }
  return node.getStartLineNumber();
};

/**
 * Analyze a single export declaration.
 *
 * @param name - The export name
 * @param node - The AST node
 * @param filePath - The source file path
 * @param sourceFile - The ts-morph SourceFile for context extraction
 * @returns ExportAnalysis with documentation status
 */
const analyzeExport = (name: string, node: Node, filePath: string, sourceFile: SourceFile): ExportAnalysis => {
  const presentTags = extractJsDocTags(node);
  const missingTags = F.pipe(
    RequiredTags,
    A.filter(
      (tag) =>
        !F.pipe(
          presentTags,
          A.some((t) => t === tag)
        )
    )
  );

  const startLine = getDeclarationStartLine(node);
  const jsDocs = getJsDocs(node);

  // Get existing JSDoc range if present
  const existingJsDocRange = F.pipe(
    A.head(jsDocs),
    O.map((firstDoc) => ({
      startLine: firstDoc.getStartLineNumber(),
      endLine: F.pipe(
        A.last(jsDocs),
        O.map((lastDoc) => lastDoc.getEndLineNumber()),
        O.getOrElse(() => firstDoc.getEndLineNumber())
      ),
    })),
    O.getOrUndefined
  );

  // Insertion line is either before existing JSDoc or before the declaration
  const insertionLine = existingJsDocRange?.startLine ?? startLine;

  // Get declaration source (the actual code being documented)
  const declarationSource = getDeclarationSource(node);

  // Get context before (previous 5 lines for AI understanding)
  const contextBefore = getContextBefore(sourceFile, insertionLine, 5);

  return {
    name,
    kind: getExportKind(node),
    filePath,
    line: startLine,
    presentTags: [...presentTags],
    missingTags: [...missingTags],
    hasJsDoc: hasJsDocComment(node),
    context: extractContext(node),
    priority: computePriority(missingTags),
    // New granular editing fields
    insertionLine,
    existingJsDocStartLine: existingJsDocRange?.startLine,
    existingJsDocEndLine: existingJsDocRange?.endLine,
    declarationSource,
    contextBefore: Str.isNonEmpty(contextBefore) ? contextBefore : undefined,
  };
};

/**
 * Analyze the module-level fileoverview JSDoc comment.
 *
 * The @effect/docgen tool requires every module to have a fileoverview comment
 * with at least a @since tag. This function checks for that requirement.
 *
 * @param sourceFile - The ts-morph SourceFile
 * @param relativePath - The file path relative to package root
 * @returns ExportAnalysis for the module fileoverview, or undefined if present and valid
 */
const analyzeModuleFileoverview = (sourceFile: SourceFile, relativePath: string): ExportAnalysis | undefined => {
  // Get the first statement's leading comment trivia
  const fullText = sourceFile.getFullText();

  // Look for a leading JSDoc comment (starts with /** and before any code)
  const leadingCommentMatch = /^\s*(\/\*\*[\s\S]*?\*\/)/.exec(fullText);

  if (!leadingCommentMatch) {
    // No fileoverview comment at all - this is a high priority issue
    return {
      name: "<module fileoverview>",
      kind: "module-fileoverview",
      filePath: relativePath,
      line: 1,
      presentTags: [],
      missingTags: ["@since"], // @effect/docgen only requires @since for fileoverview
      hasJsDoc: false,
      context: "Module is missing fileoverview JSDoc comment",
      priority: "high",
      insertionLine: 1,
      existingJsDocStartLine: undefined,
      existingJsDocEndLine: undefined,
      declarationSource: "",
      contextBefore: undefined,
    };
  }

  const commentText = leadingCommentMatch[1] ?? "";

  // Check if the comment has @since tag
  const hasSinceTag = /@since\s/.test(commentText);

  if (hasSinceTag) {
    // Fileoverview is properly documented
    return undefined;
  }

  // Count lines to find where the comment ends
  const commentLines = F.pipe(commentText, Str.split("\n"), A.length);

  return {
    name: "<module fileoverview>",
    kind: "module-fileoverview",
    filePath: relativePath,
    line: 1,
    presentTags: F.pipe(
      ["@file", "@fileoverview", "@module", "@category", "@example"],
      A.filter((tag) => commentText.includes(tag))
    ),
    missingTags: ["@since"],
    hasJsDoc: true,
    context: "Module fileoverview missing @since tag",
    priority: "medium",
    insertionLine: 1,
    existingJsDocStartLine: 1,
    existingJsDocEndLine: commentLines,
    declarationSource: commentText,
    contextBefore: undefined,
  };
};

/**
 * Analyze re-export statements (export * from "./module").
 *
 * The @effect/docgen tool requires each re-export statement to have its own
 * JSDoc comment with at least documentation text. This function identifies
 * undocumented re-exports.
 *
 * @param sourceFile - The ts-morph SourceFile
 * @param relativePath - The file path relative to package root
 * @returns Array of ExportAnalysis for undocumented re-exports
 */
const analyzeReExports = (sourceFile: SourceFile, relativePath: string): ReadonlyArray<ExportAnalysis> => {
  // Get all export declarations (export * from, export { } from, etc.)
  const exportDeclarations = sourceFile.getDescendantsOfKind(SyntaxKind.ExportDeclaration);

  return F.pipe(
    exportDeclarations,
    A.filter((decl: ExportDeclaration) => {
      // Only check re-exports (has module specifier like "./module")
      const moduleSpecifier = decl.getModuleSpecifier();
      return moduleSpecifier !== undefined;
    }),
    A.map((decl: ExportDeclaration): ExportAnalysis => {
      const moduleSpecifier = decl.getModuleSpecifierValue() ?? "";
      const startLine = decl.getStartLineNumber();
      const declText = decl.getText();

      // Check if this export declaration has JSDoc
      const jsDocs = Node.isJSDocable(decl) ? decl.getJsDocs() : [];
      const hasJsDoc = A.length(jsDocs) > 0;

      // Extract present tags if JSDoc exists
      const presentTags = hasJsDoc
        ? F.pipe(
            jsDocs,
            A.flatMap((doc: JSDoc) => doc.getTags()),
            A.map((tag) => `@${tag.getTagName()}`)
          )
        : [];

      // For re-exports, @effect/docgen requires at least some documentation
      // We check for @since as the minimum requirement
      const hasSince = F.pipe(
        presentTags,
        A.some((t) => t === "@since")
      );

      if (hasJsDoc && hasSince) {
        // Properly documented - return with no missing tags
        return {
          name: declText,
          kind: "re-export",
          filePath: relativePath,
          line: startLine,
          presentTags: [...presentTags],
          missingTags: [],
          hasJsDoc: true,
          context: `Re-export from ${moduleSpecifier}`,
          priority: "low",
          insertionLine: startLine,
          existingJsDocStartLine: jsDocs[0]?.getStartLineNumber(),
          existingJsDocEndLine: F.pipe(
            A.last(jsDocs),
            O.map((d) => d.getEndLineNumber()),
            O.getOrUndefined
          ),
          declarationSource: declText,
          contextBefore: getContextBefore(sourceFile, startLine, 5),
        };
      }

      // Missing documentation
      const missingTags = hasJsDoc ? (hasSince ? [] : ["@since"]) : ["@category", "@example", "@since"];

      return {
        name: declText,
        kind: "re-export",
        filePath: relativePath,
        line: startLine,
        presentTags: [...presentTags],
        missingTags,
        hasJsDoc,
        context: `Re-export from ${moduleSpecifier} needs documentation`,
        priority: hasJsDoc ? "medium" : "high",
        insertionLine: startLine,
        existingJsDocStartLine: hasJsDoc ? jsDocs[0]?.getStartLineNumber() : undefined,
        existingJsDocEndLine: hasJsDoc
          ? F.pipe(
              A.last(jsDocs),
              O.map((d) => d.getEndLineNumber()),
              O.getOrUndefined
            )
          : undefined,
        declarationSource: declText,
        contextBefore: getContextBefore(sourceFile, startLine, 5),
      };
    }),
    A.filter((analysis) => A.length(analysis.missingTags) > 0)
  );
};

/**
 * Analyze all exports in a source file.
 *
 * This includes:
 * 1. Module-level fileoverview documentation
 * 2. Re-export statements (export * from)
 * 3. Direct exported declarations
 *
 * @param sourceFile - The ts-morph SourceFile
 * @param relativePath - The file path relative to package root
 * @returns Array of ExportAnalysis for each export
 * @since 0.1.0
 */
export const analyzeSourceFile = (sourceFile: SourceFile, relativePath: string): ReadonlyArray<ExportAnalysis> => {
  // 1. Check module fileoverview
  const fileoverviewAnalysis = analyzeModuleFileoverview(sourceFile, relativePath);

  // 2. Check re-exports
  const reExportAnalyses = analyzeReExports(sourceFile, relativePath);

  // 3. Check direct exports
  const exports = sourceFile.getExportedDeclarations();
  const directExportAnalyses = F.pipe(
    A.fromIterable(exports.entries()),
    A.flatMap(([name, declarations]) =>
      F.pipe(
        declarations,
        A.map((decl) => analyzeExport(name, decl, relativePath, sourceFile))
      )
    )
  );

  // Combine all analyses
  return F.pipe(
    fileoverviewAnalysis !== undefined ? [fileoverviewAnalysis] : [],
    A.appendAll(reExportAnalyses),
    A.appendAll(directExportAnalyses)
  );
};

/**
 * Get all TypeScript source files in a directory.
 *
 * @param project - The ts-morph Project
 * @param srcDir - The source directory to scan
 * @param exclude - Optional patterns to exclude
 * @returns Array of SourceFiles
 * @throws TsMorphError if files cannot be added
 * @since 0.1.0
 */
export const getSourceFiles = (
  project: Project,
  srcDir: string,
  exclude: ReadonlyArray<string> = []
): Effect.Effect<ReadonlyArray<SourceFile>, TsMorphError, never> =>
  Effect.try({
    try: () => {
      project.addSourceFilesAtPaths(`${srcDir}/**/*.ts`);

      const allFiles = project.getSourceFiles();
      if (A.length(exclude) === 0) return allFiles;

      // Filter out excluded patterns
      return F.pipe(
        allFiles,
        A.filter((file) => {
          const filePath = file.getFilePath();
          return !F.pipe(
            exclude,
            A.some((pattern) => {
              // Simple pattern matching - convert glob to substring check
              const normalizedPattern = F.pipe(pattern, Str.replace("**/*.ts", Str.empty), Str.replace("*", Str.empty));
              return F.pipe(filePath, Str.includes(normalizedPattern));
            })
          );
        })
      );
    },
    catch: (error) =>
      new TsMorphError({
        filePath: srcDir,
        cause: error,
      }),
  });

/**
 * Analyze all source files in a package directory.
 *
 * @param packagePath - Absolute path to the package
 * @param srcDir - Source directory relative to package (default: "src")
 * @param exclude - Patterns to exclude
 * @returns Array of ExportAnalysis for all exports
 * @since 0.1.0
 */
export const analyzePackage = (
  packagePath: string,
  srcDir = "src",
  exclude: ReadonlyArray<string> = []
): Effect.Effect<ReadonlyArray<ExportAnalysis>, TsMorphError, never> =>
  Effect.gen(function* () {
    const project = yield* createProject();
    const fullSrcDir = `${packagePath}/${srcDir}`;
    const sourceFiles = yield* getSourceFiles(project, fullSrcDir, exclude);

    return F.pipe(
      sourceFiles,
      A.flatMap((file) => {
        const fullPath = file.getFilePath();
        // Create relative path from package root
        const relativePath = F.pipe(fullPath, Str.replace(packagePath, Str.empty), Str.replace(/^\//, Str.empty));
        return analyzeSourceFile(file, relativePath);
      })
    );
  });
