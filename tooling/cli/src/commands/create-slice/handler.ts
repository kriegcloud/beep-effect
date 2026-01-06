/**
 * @file Create-Slice Command Handler
 *
 * Main handler for the create-slice command. Orchestrates:
 * - Validation that slice doesn't already exist
 * - File generation via FileGeneratorService
 * - ts-morph modifications for integration points
 * - tsconfig updates via jsonc-parser
 *
 * Execution flow:
 * 1. Validate slice name and check existence
 * 2. Create context for templates
 * 3. Generate plan (directories + files)
 * 4. If dry-run, preview and exit
 * 5. Execute file generation
 * 6. Run ts-morph modifications
 * 7. Update tsconfig files
 * 8. Display success summary
 *
 * @module create-slice/handler
 * @since 1.0.0
 */

import * as path from "node:path";
import { RepoUtils } from "@beep/tooling-utils";
import * as FileSystem from "@effect/platform/FileSystem";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { type CreateSliceError, FileWriteError, SliceExistsError } from "./errors.js";
import type { CreateSliceInput } from "./schemas.js";
import { ConfigUpdaterService } from "./utils/config-updater.js";
import { FileGeneratorService } from "./utils/file-generator.js";
import { createSliceContext, type SliceContext } from "./utils/template.js";
import { TsMorphService } from "./utils/ts-morph.js";

// Type alias for RepoUtils service
type RepoUtilsService = RepoUtils;

// -----------------------------------------------------------------------------
// TSConfig Update Helpers
// -----------------------------------------------------------------------------

/**
 * Updates tsconfig.base.jsonc with path aliases for the new slice.
 * Uses jsonc-parser to preserve comments and formatting.
 */
const updateTsconfigBase = (
  sliceName: string,
  repoRoot: string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const filePath = path.join(repoRoot, "tsconfig.base.jsonc");

    // Read current content
    const content = yield* fs
      .readFileString(filePath)
      .pipe(Effect.mapError((cause) => new FileWriteError({ filePath, cause })));

    // Import jsonc-parser dynamically
    const jsonc = yield* Effect.tryPromise({
      try: () => import("jsonc-parser"),
      catch: (cause) => new FileWriteError({ filePath, cause }),
    });

    // Parse to get current paths
    type TsconfigPaths = Record<string, ReadonlyArray<string>>;
    const parsed = jsonc.parse(content) as { compilerOptions?: { paths?: TsconfigPaths } } | undefined;
    const currentPaths: TsconfigPaths = parsed?.compilerOptions?.paths ?? {};

    // Add new path aliases (for each layer)
    const layers = ["domain", "tables", "server", "client", "ui"] as const;
    const newPaths: Record<string, string[]> = {};

    for (const layer of layers) {
      const pkg = `@beep/${sliceName}-${layer}`;
      newPaths[pkg] = [`./packages/${sliceName}/${layer}/src/index`];
      newPaths[`${pkg}/*`] = [`./packages/${sliceName}/${layer}/src/*`];
    }

    // Merge paths
    const mergedPaths = { ...currentPaths, ...newPaths };

    // Use jsonc.modify to update the paths while preserving comments
    const edits = jsonc.modify(content, ["compilerOptions", "paths"], mergedPaths, {
      formattingOptions: { tabSize: 2, insertSpaces: true },
    });

    const updatedContent = jsonc.applyEdits(content, edits);
    yield* fs
      .writeFileString(filePath, updatedContent)
      .pipe(Effect.mapError((cause) => new FileWriteError({ filePath, cause })));
  });

/**
 * Updates root tsconfig.json to add reference to slice tsconfig.
 * Uses jsonc-parser to handle trailing commas and preserve formatting.
 */
const updateRootTsconfig = (
  sliceName: string,
  repoRoot: string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const filePath = path.join(repoRoot, "tsconfig.json");

    // Read current content
    const content = yield* fs
      .readFileString(filePath)
      .pipe(Effect.mapError((cause) => new FileWriteError({ filePath, cause })));

    // Import jsonc-parser dynamically
    const jsonc = yield* Effect.tryPromise({
      try: () => import("jsonc-parser"),
      catch: (cause) => new FileWriteError({ filePath, cause }),
    });

    // Parse to get current references
    const parsed = jsonc.parse(content) as { references?: Array<{ path: string }> };
    const references = parsed?.references || [];
    const newRef = { path: `./tsconfig.slices/${sliceName}.json` };

    const exists = F.pipe(
      references,
      A.some((ref) => ref.path === newRef.path)
    );

    if (!exists) {
      // Add new reference
      const updatedRefs = F.pipe(references, A.append(newRef));

      // Use jsonc.modify to update while preserving formatting
      const edits = jsonc.modify(content, ["references"], updatedRefs, {
        formattingOptions: { tabSize: 2, insertSpaces: true },
      });

      const updatedContent = jsonc.applyEdits(content, edits);
      yield* fs
        .writeFileString(filePath, updatedContent)
        .pipe(Effect.mapError((cause) => new FileWriteError({ filePath, cause })));
    }
  });

/**
 * Updates all tsconfig files for the new slice.
 */
const updateTsconfigFiles = (
  sliceName: string,
  _context: SliceContext,
  repoRoot: string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    // 1. Update tsconfig.base.jsonc with path aliases
    yield* updateTsconfigBase(sliceName, repoRoot);
    yield* Console.log("   - Updated tsconfig.base.jsonc path aliases");

    // 2. Update root tsconfig.json to reference the slice
    yield* updateRootTsconfig(sliceName, repoRoot);
    yield* Console.log("   - Updated tsconfig.json references");
  });

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/**
 * Main handler for the create-slice command.
 *
 * Orchestrates all steps of slice creation:
 * 1. Validates slice doesn't exist
 * 2. Creates context from input
 * 3. Generates plan and optionally previews (dry-run)
 * 4. Executes file generation
 * 5. Runs ts-morph modifications for integration
 * 6. Updates tsconfig files
 *
 * @example
 * ```ts
 * import { createSliceHandler } from "@beep/repo-cli/commands/create-slice/handler"
 * import { CreateSliceInput, SliceName, SliceDescription } from "@beep/repo-cli/commands/create-slice/schemas"
 * import * as Effect from "effect/Effect"
 *
 * const input = new CreateSliceInput({
 *   sliceName: "notifications" as SliceName,
 *   sliceDescription: "Handles user notifications",
 *   dryRun: false,
 * })
 *
 * Effect.runPromise(createSliceHandler(input).pipe(
 *   Effect.provide(CreateSliceServiceLayer)
 * ))
 * ```
 *
 * @param input - Validated command input containing slice name, description, and options
 * @returns Effect that creates the slice or fails with CreateSliceError
 *
 * @since 0.1.0
 * @category handlers
 */
export const createSliceHandler = (
  input: CreateSliceInput
): Effect.Effect<
  void,
  CreateSliceError,
  FileGeneratorService | TsMorphService | ConfigUpdaterService | RepoUtilsService | FileSystem.FileSystem
> =>
  Effect.gen(function* () {
    const fileGen = yield* FileGeneratorService;
    const tsMorph = yield* TsMorphService;
    const configUpdater = yield* ConfigUpdaterService;
    const repo = yield* RepoUtils;
    const repoRoot = repo.REPOSITORY_ROOT;

    // 1. Check if slice already exists
    const exists = yield* fileGen.sliceExists(input.sliceName);
    if (exists) {
      return yield* new SliceExistsError({ sliceName: input.sliceName });
    }

    // 2. Create context for templates
    const context = createSliceContext(input.sliceName, input.sliceDescription);

    // 3. Generate the plan
    const plan = yield* fileGen.createPlan(context);

    // 4. Dry-run mode - preview and exit
    if (input.dryRun) {
      const preview = yield* fileGen.previewPlan(plan);
      yield* Console.log(preview);
      yield* Console.log("\nDry run complete. No files were created.");
      return;
    }

    // 5. Execute file generation
    yield* Console.log(`Creating slice: ${input.sliceName}`);
    yield* Console.log(`Description: ${input.sliceDescription}`);
    yield* Console.log("");

    yield* Console.log("Creating directories and files...");
    yield* fileGen.executePlan(plan);
    yield* Console.log(`   Created ${A.length(plan.directories)} directories`);
    yield* Console.log(`   Created ${A.length(plan.files)} files`);

    // 6. Run ts-morph modifications
    yield* Console.log("\nUpdating integration points...");

    yield* Console.log("   - Adding identity composers...");
    yield* tsMorph.addIdentityComposers(input.sliceName, context.SliceName);

    yield* Console.log("   - Adding entity ID exports...");
    yield* tsMorph.addEntityIdsNamespaceExport(input.sliceName, context.SliceName);
    yield* tsMorph.addAnyEntityIdUnionMember(input.sliceName, context.SliceName);

    yield* Console.log("   - Updating Persistence layer...");
    yield* tsMorph.addToPersistenceLayer(input.sliceName, context.SliceName);

    yield* Console.log("   - Updating DataAccess layer...");
    yield* tsMorph.addToDataAccessLayer(input.sliceName, context.SliceName);

    yield* Console.log("   - Updating db-admin exports...");
    yield* tsMorph.addToDbAdminTables(input.sliceName);
    yield* tsMorph.addToDbAdminRelations(input.sliceName, context.SliceName);

    yield* Console.log("   - Updating entity-kind.ts...");
    yield* tsMorph.addToEntityKind(input.sliceName, context.SliceName);

    // 7. Update package.json dependencies
    yield* Console.log("\nUpdating package.json dependencies...");
    yield* configUpdater.updateAllPackageJsons(input.sliceName);
    yield* Console.log("   - Updated root package.json workspaces");
    yield* Console.log("   - Updated runtime/server package.json");
    yield* Console.log("   - Updated db-admin package.json");

    // 8. Update tsconfig files
    yield* Console.log("\nUpdating TypeScript configuration...");
    yield* updateTsconfigFiles(input.sliceName, context, repoRoot);
    yield* configUpdater.updateAllSliceTsconfigs(input.sliceName);
    yield* Console.log("   - Updated runtime/server tsconfigs");
    yield* Console.log("   - Updated db-admin tsconfigs");

    // 9. Success summary
    yield* Console.log(`\n${"=".repeat(50)}`);
    yield* Console.log(`Slice "${input.sliceName}" created successfully!`);
    yield* Console.log("=".repeat(50));
    yield* Console.log("\nCreated packages:");
    yield* Console.log(`   @beep/${input.sliceName}-domain`);
    yield* Console.log(`   @beep/${input.sliceName}-tables`);
    yield* Console.log(`   @beep/${input.sliceName}-server`);
    yield* Console.log(`   @beep/${input.sliceName}-client`);
    yield* Console.log(`   @beep/${input.sliceName}-ui`);
    yield* Console.log("\nNext steps:");
    yield* Console.log("   1. Run: bun install");
    yield* Console.log("   2. Add entities to the domain package");
    yield* Console.log("   3. Create tables in the tables package");
    yield* Console.log("   4. Run: bun run db:generate");
    yield* Console.log("   5. Run: bun run check");
  }).pipe(Effect.withSpan("createSliceHandler"));
