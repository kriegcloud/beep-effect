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
 */

import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { type CompilerOptions, type JSDoc, Node, Project, type SourceFile } from "ts-morph";
import { TsMorphError } from "../errors.js";
import { type ExportAnalysis, type ExportKind, type IssuePriority, RequiredTags } from "../types.js";

/**
 * Create a new ts-morph Project.
 *
 * @param compilerOptions - Optional TypeScript compiler options
 * @returns A configured Project instance
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
 * Analyze a single export declaration.
 *
 * @param name - The export name
 * @param node - The AST node
 * @param filePath - The source file path
 * @returns ExportAnalysis with documentation status
 */
const analyzeExport = (name: string, node: Node, filePath: string): ExportAnalysis => {
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

  return {
    name,
    kind: getExportKind(node),
    filePath,
    line: node.getStartLineNumber(),
    presentTags: [...presentTags],
    missingTags: [...missingTags],
    hasJsDoc: hasJsDocComment(node),
    context: extractContext(node),
    priority: computePriority(missingTags),
  };
};

/**
 * Analyze all exports in a source file.
 *
 * @param sourceFile - The ts-morph SourceFile
 * @param relativePath - The file path relative to package root
 * @returns Array of ExportAnalysis for each export
 */
export const analyzeSourceFile = (sourceFile: SourceFile, relativePath: string): ReadonlyArray<ExportAnalysis> => {
  const exports = sourceFile.getExportedDeclarations();

  return F.pipe(
    A.fromIterable(exports.entries()),
    A.flatMap(([name, declarations]) =>
      F.pipe(
        declarations,
        A.map((decl) => analyzeExport(name, decl, relativePath))
      )
    )
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
