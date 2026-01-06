/**
 * @file ts-morph AST Modification Service
 *
 * Provides Effect-wrapped ts-morph utilities for modifying existing TypeScript files
 * when scaffolding new vertical slices. Handles:
 * - Adding identity composers to packages.ts
 * - Adding entity ID namespace exports
 * - Modifying AnyEntityId union types
 * - Adding to Layer.mergeAll calls
 * - Adding db-admin re-exports
 *
 * @module create-slice/utils/ts-morph
 * @since 1.0.0
 */

import * as path from "node:path";
import { $RepoCliId } from "@beep/identity/packages";
import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { Project, type SourceFile } from "ts-morph";
import { TsMorphError } from "../errors.js";

// -----------------------------------------------------------------------------
// Identity Composer
// -----------------------------------------------------------------------------

const $I = $RepoCliId.create("commands/create-slice/utils/ts-morph");

// -----------------------------------------------------------------------------
// Layer Configuration Constants
// -----------------------------------------------------------------------------

/**
 * Layer suffixes for the 5 sub-packages in a vertical slice.
 *
 * @internal
 */
const LAYER_SUFFIXES = ["Domain", "Tables", "Server", "Client", "Ui"] as const;

/**
 * Package name suffixes corresponding to layer suffixes.
 *
 * @internal
 */
const PACKAGE_SUFFIXES = ["domain", "tables", "server", "client", "ui"] as const;

// -----------------------------------------------------------------------------
// TsMorphService
// -----------------------------------------------------------------------------

/**
 * Effect Service for TypeScript AST manipulation using ts-morph.
 *
 * Provides methods to safely modify existing TypeScript files when creating
 * new vertical slices. All operations are wrapped in Effect for error handling.
 *
 * @example
 * ```ts
 * import { TsMorphService } from "./utils/ts-morph.js"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const tsmorph = yield* TsMorphService
 *   yield* tsmorph.addIdentityComposers("notifications", "Notifications")
 * })
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class TsMorphService extends Effect.Service<TsMorphService>()($I`TsMorphService`, {
  dependencies: [RepoUtilsLive],
  effect: Effect.gen(function* () {
    // Get repo root for resolving file paths
    const repo = yield* RepoUtils;
    const repoRoot = repo.REPOSITORY_ROOT;

    // Create project with performance optimizations
    const project = new Project({
      skipAddingFilesFromTsConfig: true,
      skipFileDependencyResolution: true,
    });

    /**
     * Resolve a relative path to absolute using repo root.
     */
    const resolvePath = (relativePath: string): string => path.join(repoRoot, relativePath);

    // -------------------------------------------------------------------------
    // Core File Operations
    // -------------------------------------------------------------------------

    /**
     * Gets or adds a source file to the project.
     *
     * @param relativePath - Path relative to repo root
     * @returns The SourceFile instance
     */
    const getOrAddSourceFile = (relativePath: string): Effect.Effect<SourceFile, TsMorphError> =>
      Effect.try({
        try: () => {
          const filePath = resolvePath(relativePath);
          // Check if already added
          const existing = project.getSourceFile(filePath);
          if (existing) return existing;
          return project.addSourceFileAtPath(filePath);
        },
        catch: (cause) => new TsMorphError({ filePath: relativePath, operation: "loadFile", cause }),
      });

    /**
     * Saves a source file to disk.
     *
     * @param sourceFile - The ts-morph SourceFile to save
     */
    const saveFile = (sourceFile: SourceFile): Effect.Effect<void, TsMorphError> =>
      Effect.try({
        try: () => sourceFile.saveSync(),
        catch: (cause) => new TsMorphError({ filePath: sourceFile.getFilePath(), operation: "save", cause }),
      });

    // -------------------------------------------------------------------------
    // Modification Functions
    // -------------------------------------------------------------------------

    /**
     * Adds 5 identity composers for a new slice to packages.ts.
     *
     * Pattern in packages.ts:
     * - Composers are added to the `$I.compose(...)` call
     * - Exports are added at the end of the file
     *
     * @param sliceName - kebab-case slice name (e.g., "notifications")
     * @param SliceName - PascalCase slice name (e.g., "Notifications")
     */
    const addIdentityComposers = (sliceName: string, SliceName: string): Effect.Effect<void, TsMorphError> =>
      Effect.gen(function* () {
        const filePath = "packages/common/identity/src/packages.ts";
        const sourceFile = yield* getOrAddSourceFile(filePath);
        const text = sourceFile.getText();

        // 1. Add package names to the $I.compose(...) call
        const composeRegex = /const\s+composers\s*=\s*\$I\.compose\(([\s\S]*?)\);/;
        const composeMatch = composeRegex.exec(text);

        if (O.isSome(O.fromNullable(composeMatch))) {
          const existingPackages = composeMatch![1] ?? "";

          // Build new package names for all 5 layers
          const newPackageNames = F.pipe(
            PACKAGE_SUFFIXES,
            A.map((suffix) => `"${sliceName}-${suffix}"`)
          );

          // Check which ones don't exist yet
          const packagesToAdd = F.pipe(
            newPackageNames,
            A.filter((pkg) => !F.pipe(existingPackages, Str.includes(pkg)))
          );

          if (A.isNonEmptyArray(packagesToAdd)) {
            // Add to the compose call - insert before the closing parenthesis
            const trimmedExisting = F.pipe(existingPackages, Str.trimEnd);
            const hasTrailingComma = F.pipe(trimmedExisting, Str.endsWith(","));
            const separator = hasTrailingComma ? "\n  " : ",\n  ";
            const newPackagesStr = A.join(packagesToAdd, ",\n  ");
            const updatedCompose = `const composers = $I.compose(${trimmedExisting}${separator}${newPackagesStr}\n);`;
            const updatedText = F.pipe(text, Str.replace(composeMatch![0]!, updatedCompose));
            sourceFile.replaceWithText(updatedText);
          }
        }

        // 2. Add export statements for each composer
        // Get updated text after compose modification
        const currentText = sourceFile.getText();

        // Generate export statements for each layer
        const exportStatements = F.pipe(
          A.zip(LAYER_SUFFIXES, PACKAGE_SUFFIXES),
          A.map(([layer, _suffix]) => {
            const composerName = `$${SliceName}${layer}Id`;
            const accessorName = `$${SliceName}${layer}Id`;

            // Check if export already exists
            if (F.pipe(currentText, Str.includes(`export const ${composerName}`))) {
              return O.none<string>();
            }

            // Generate JSDoc and export
            return O.some(`
/**
 * Identity composer for the \`@beep/${sliceName}-${layer.toLowerCase()}\` namespace.
 *
 * @example
 * \`\`\`typescript
 * import { ${composerName} } from "@beep/identity/packages"
 *
 * const schemaId = ${composerName}.make("SchemaId")
 * \`\`\`
 *
 * @category symbols
 * @since 0.1.0
 */
export const ${composerName} = composers.${accessorName};
`);
          }),
          A.getSomes,
          A.join("")
        );

        if (Str.isNonEmpty(exportStatements)) {
          // Append to end of file
          sourceFile.replaceWithText(currentText + exportStatements);
        }

        yield* saveFile(sourceFile);
      }).pipe(Effect.withSpan("TsMorphService.addIdentityComposers"));

    /**
     * Adds a namespace export for new slice entity IDs.
     *
     * Pattern: export * as SliceName from "./slice-name/index.js";
     *
     * @param sliceName - kebab-case slice name
     * @param SliceName - PascalCase slice name
     */
    const addEntityIdsNamespaceExport = (sliceName: string, SliceName: string): Effect.Effect<void, TsMorphError> =>
      Effect.gen(function* () {
        const filePath = "packages/shared/domain/src/entity-ids/entity-ids.ts";
        const sourceFile = yield* getOrAddSourceFile(filePath);

        // Check if export already exists
        const moduleSpecifier = `./${sliceName}`;
        const existingExport = F.pipe(
          sourceFile.getExportDeclarations(),
          A.findFirst((exp) => {
            const spec = exp.getModuleSpecifierValue();
            return spec === moduleSpecifier || spec === `${moduleSpecifier}/index.js`;
          })
        );

        if (O.isSome(existingExport)) {
          return; // Already exists
        }

        // Add namespace export: export * as SliceName from "./slice-name";
        sourceFile.addExportDeclaration({
          namespaceExport: `${SliceName}EntityIds`,
          moduleSpecifier,
        });

        yield* saveFile(sourceFile);
      }).pipe(Effect.withSpan("TsMorphService.addEntityIdsNamespaceExport"));

    /**
     * Adds new slice to AnyEntityId union type.
     *
     * The file has:
     * - Import: import * as SliceName from "./slice-name";
     * - Union: S.Union(Shared.AnyId, Iam.AnyId, ..., SliceName.AnyId)
     *
     * @param sliceName - kebab-case slice name
     * @param SliceName - PascalCase slice name
     */
    const addAnyEntityIdUnionMember = (sliceName: string, SliceName: string): Effect.Effect<void, TsMorphError> =>
      Effect.gen(function* () {
        const filePath = "packages/shared/domain/src/entity-ids/any-entity-id.ts";
        const sourceFile = yield* getOrAddSourceFile(filePath);

        // 1. Add import for the new slice
        const importPath = `./${sliceName}`;
        const existingImport = F.pipe(
          sourceFile.getImportDeclarations(),
          A.findFirst((imp) => imp.getModuleSpecifierValue() === importPath)
        );

        if (O.isNone(existingImport)) {
          sourceFile.addImportDeclaration({
            namespaceImport: SliceName,
            moduleSpecifier: importPath,
          });
        }

        // 2. Find the S.Union(...) call and add new member
        const text = sourceFile.getText();
        const newMember = `${SliceName}.AnyId`;

        // Check if already in union
        if (F.pipe(text, Str.includes(newMember))) {
          yield* saveFile(sourceFile);
          return;
        }

        // Pattern: S.Union(Existing.AnyId, ...)
        const unionRegex = /S\.Union\(([\s\S]*?)\)\.annotations/;
        const unionMatch = unionRegex.exec(text);

        if (O.isSome(O.fromNullable(unionMatch))) {
          const unionContent = F.pipe(unionMatch![1] ?? "", Str.trimEnd);
          const updatedUnion = `${unionContent}, ${newMember}`;
          const updatedText = F.pipe(text, Str.replace(unionMatch![0]!, `S.Union(${updatedUnion}).annotations`));
          sourceFile.replaceWithText(updatedText);
        }

        sourceFile.organizeImports();
        yield* saveFile(sourceFile);
      }).pipe(Effect.withSpan("TsMorphService.addAnyEntityIdUnionMember"));

    /**
     * Adds new slice Db to Persistence layer.
     *
     * Modifications:
     * - Add import: import { SliceNameDb } from "@beep/slice-name-server/db";
     * - Add to DbClients type union
     * - Add to Layer.mergeAll call
     *
     * @param sliceName - kebab-case slice name
     * @param SliceName - PascalCase slice name
     */
    const addToPersistenceLayer = (sliceName: string, SliceName: string): Effect.Effect<void, TsMorphError> =>
      Effect.gen(function* () {
        const filePath = "packages/runtime/server/src/Persistence.layer.ts";
        const sourceFile = yield* getOrAddSourceFile(filePath);

        const importPath = `@beep/${sliceName}-server/db`;
        const dbName = `${SliceName}Db`;

        // 1. Add import if not exists
        const existingImport = F.pipe(
          sourceFile.getImportDeclarations(),
          A.findFirst((imp) => imp.getModuleSpecifierValue() === importPath)
        );

        if (O.isNone(existingImport)) {
          sourceFile.addImportDeclaration({
            namedImports: [dbName],
            moduleSpecifier: importPath,
          });
        }

        // 2. Update DbClients type
        let text = sourceFile.getText();
        const dbClientsRegex = /export\s+type\s+DbClients\s*=\s*([^;]+);/;
        const dbClientsMatch = dbClientsRegex.exec(text);

        if (O.isSome(O.fromNullable(dbClientsMatch))) {
          const currentTypes = dbClientsMatch![1] ?? "";
          const newType = `${dbName}.Db`;

          if (!F.pipe(currentTypes, Str.includes(newType))) {
            const updatedTypes = `${F.pipe(currentTypes, Str.trimEnd)} | ${newType}`;
            text = F.pipe(text, Str.replace(dbClientsMatch![0]!, `export type DbClients = ${updatedTypes};`));
            sourceFile.replaceWithText(text);
          }
        }

        // 3. Add to Layer.mergeAll for sliceClientsLayer
        text = sourceFile.getText();
        const mergeAllRegex = /Layer\.mergeAll\(SharedDb\.layer,\s*IamDb\.layer,\s*DocumentsDb\.layer,[\s\S]*?\)/;
        const mergeAllMatch = mergeAllRegex.exec(text);

        if (O.isSome(O.fromNullable(mergeAllMatch))) {
          const currentLayers = mergeAllMatch![0];
          const newLayer = `${dbName}.layer`;

          if (!F.pipe(currentLayers, Str.includes(newLayer))) {
            // Find the closing parenthesis and insert before it
            const closingParen = F.pipe(currentLayers, Str.lastIndexOf(")"));
            if (O.isSome(closingParen)) {
              const beforeClose = F.pipe(currentLayers, Str.slice(0, closingParen.value));
              const updatedLayers = `${beforeClose}, ${newLayer})`;
              text = F.pipe(text, Str.replace(currentLayers, updatedLayers));
              sourceFile.replaceWithText(text);
            }
          }
        }

        sourceFile.organizeImports();
        yield* saveFile(sourceFile);
      }).pipe(Effect.withSpan("TsMorphService.addToPersistenceLayer"));

    /**
     * Adds new slice Repositories to DataAccess layer.
     *
     * Modifications:
     * - Add import: import { SliceNameRepos } from "@beep/slice-name-server";
     * - Add to SliceRepos type union
     * - Add to Layer.mergeAll call
     *
     * @param sliceName - kebab-case slice name
     * @param SliceName - PascalCase slice name
     */
    const addToDataAccessLayer = (sliceName: string, SliceName: string): Effect.Effect<void, TsMorphError> =>
      Effect.gen(function* () {
        const filePath = "packages/runtime/server/src/DataAccess.layer.ts";
        const sourceFile = yield* getOrAddSourceFile(filePath);

        const importPath = `@beep/${sliceName}-server`;
        const reposName = `${SliceName}Repos`;

        // 1. Add import if not exists
        const existingImport = F.pipe(
          sourceFile.getImportDeclarations(),
          A.findFirst((imp) => imp.getModuleSpecifierValue() === importPath)
        );

        if (O.isNone(existingImport)) {
          sourceFile.addImportDeclaration({
            namedImports: [reposName],
            moduleSpecifier: importPath,
          });
        }

        // 2. Update SliceRepos type
        let text = sourceFile.getText();
        const sliceReposRegex = /type\s+SliceRepos\s*=\s*([^;]+);/;
        const sliceReposMatch = sliceReposRegex.exec(text);

        if (O.isSome(O.fromNullable(sliceReposMatch))) {
          const currentTypes = sliceReposMatch![1] ?? "";
          const newType = `${reposName}.Repos`;

          if (!F.pipe(currentTypes, Str.includes(newType))) {
            const updatedTypes = `${F.pipe(currentTypes, Str.trimEnd)} | ${newType}`;
            text = F.pipe(text, Str.replace(sliceReposMatch![0]!, `type SliceRepos = ${updatedTypes};`));
            sourceFile.replaceWithText(text);
          }
        }

        // 3. Add to Layer.mergeAll for sliceReposLayer
        text = sourceFile.getText();
        const mergeAllRegex = /const\s+sliceReposLayer[\s\S]*?Layer\.mergeAll\(([\s\S]*?)\);/;
        const mergeAllMatch = mergeAllRegex.exec(text);

        if (O.isSome(O.fromNullable(mergeAllMatch))) {
          const fullMatch = mergeAllMatch![0];
          const currentLayers = mergeAllMatch![1] ?? "";
          const newLayer = `${reposName}.layer`;

          if (!F.pipe(currentLayers, Str.includes(newLayer))) {
            const trimmedLayers = F.pipe(currentLayers, Str.trimEnd);
            const updatedLayers = `${trimmedLayers},\n  ${newLayer}`;
            const updatedMatch = F.pipe(fullMatch, Str.replace(currentLayers, updatedLayers));
            text = F.pipe(text, Str.replace(fullMatch, updatedMatch));
            sourceFile.replaceWithText(text);
          }
        }

        sourceFile.organizeImports();
        yield* saveFile(sourceFile);
      }).pipe(Effect.withSpan("TsMorphService.addToDataAccessLayer"));

    /**
     * Adds table re-export to db-admin tables.ts.
     *
     * Pattern: export * from "@beep/slice-name-tables/tables";
     *
     * @param sliceName - kebab-case slice name
     */
    const addToDbAdminTables = (sliceName: string): Effect.Effect<void, TsMorphError> =>
      Effect.gen(function* () {
        const filePath = "packages/_internal/db-admin/src/tables.ts";
        const sourceFile = yield* getOrAddSourceFile(filePath);

        const importPath = `@beep/${sliceName}-tables/tables`;

        // Check if export already exists
        const existingExport = F.pipe(
          sourceFile.getExportDeclarations(),
          A.findFirst((exp) => exp.getModuleSpecifierValue() === importPath)
        );

        if (O.isSome(existingExport)) {
          return;
        }

        // Add re-export: export * from "@beep/slice-name-tables/tables";
        sourceFile.addExportDeclaration({
          moduleSpecifier: importPath,
        });

        yield* saveFile(sourceFile);
      }).pipe(Effect.withSpan("TsMorphService.addToDbAdminTables"));

    /**
     * Adds relations re-export to db-admin slice-relations.ts.
     *
     * This file has a specific comment structure with slice sections.
     * We need to add a comment and export for the new slice.
     *
     * @param sliceName - kebab-case slice name
     * @param SliceName - PascalCase slice name
     */
    const addToDbAdminRelations = (sliceName: string, SliceName: string): Effect.Effect<void, TsMorphError> =>
      Effect.gen(function* () {
        const filePath = "packages/_internal/db-admin/src/slice-relations.ts";
        const sourceFile = yield* getOrAddSourceFile(filePath);

        const text = sourceFile.getText();
        const importPath = `@beep/${sliceName}-tables/relations`;

        // Check if already exported
        if (F.pipe(text, Str.includes(importPath))) {
          return;
        }

        // Add a section comment and export for the new slice
        const newSection = `
/* ${SliceName} */
export {} from "${importPath}";
`;

        // Append to end of file
        sourceFile.replaceWithText(text + newSection);

        yield* saveFile(sourceFile);
      }).pipe(Effect.withSpan("TsMorphService.addToDbAdminRelations"));

    /**
     * Executes all file modifications for a new slice.
     *
     * This is a convenience method that calls all modification functions
     * in the correct order.
     *
     * @param sliceName - kebab-case slice name
     * @param SliceName - PascalCase slice name
     */
    const modifyAllFiles = (sliceName: string, SliceName: string): Effect.Effect<void, TsMorphError> =>
      Effect.gen(function* () {
        // Execute all modifications
        yield* addIdentityComposers(sliceName, SliceName);
        yield* addEntityIdsNamespaceExport(sliceName, SliceName);
        yield* addAnyEntityIdUnionMember(sliceName, SliceName);
        yield* addToPersistenceLayer(sliceName, SliceName);
        yield* addToDataAccessLayer(sliceName, SliceName);
        yield* addToDbAdminTables(sliceName);
        yield* addToDbAdminRelations(sliceName, SliceName);
      }).pipe(Effect.withSpan("TsMorphService.modifyAllFiles"));

    // -------------------------------------------------------------------------
    // Return Service Interface
    // -------------------------------------------------------------------------

    return {
      project,
      getOrAddSourceFile,
      saveFile,
      addIdentityComposers,
      addEntityIdsNamespaceExport,
      addAnyEntityIdUnionMember,
      addToPersistenceLayer,
      addToDataAccessLayer,
      addToDbAdminTables,
      addToDbAdminRelations,
      modifyAllFiles,
    };
  }),
}) {}

// -----------------------------------------------------------------------------
// Layer
// -----------------------------------------------------------------------------

/**
 * Live layer for the TsMorphService.
 *
 * Already includes RepoUtilsLive dependency.
 *
 * @example
 * ```ts
 * import { TsMorphService, TsMorphServiceLive } from "./utils/ts-morph.js"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const tsmorph = yield* TsMorphService
 *   yield* tsmorph.addIdentityComposers("notifications", "Notifications")
 * }).pipe(Effect.provide(TsMorphServiceLive))
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const TsMorphServiceLive = TsMorphService.Default;
