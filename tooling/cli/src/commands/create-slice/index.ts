/**
 * @file Create-Slice CLI Command
 *
 * CLI command for scaffolding new vertical slices in the beep-effect monorepo.
 * Creates all 5 sub-packages (domain, tables, server, client, ui) with proper
 * configuration, path aliases, and workspace references.
 *
 * Usage:
 *   beep create-slice --name <name> --description <description> [--dry-run]
 *
 * Options:
 *   -n, --name         Slice name in kebab-case (e.g., "notifications")
 *   -d, --description  Brief description of the slice's purpose
 *   --dry-run          Preview changes without writing files
 *
 * Examples:
 *   beep create-slice -n notifications -d "User notification system"
 *   beep create-slice --name billing --description "Billing and payments" --dry-run
 *
 * @module create-slice
 * @since 1.0.0
 */

import { RepoUtilsLive } from "@beep/tooling-utils";
import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import { InvalidSliceNameError } from "./errors.js";
import { createSliceHandler } from "./handler.js";
import { CreateSliceInput, SliceDescription, SliceName } from "./schemas.js";
import { FileGeneratorService } from "./utils/file-generator.js";
import { TsMorphServiceLive } from "./utils/ts-morph.js";

// -----------------------------------------------------------------------------
// Options
// -----------------------------------------------------------------------------

/**
 * Slice name option.
 * Accepts kebab-case names like "notifications" or "user-profile".
 */
const nameOption = Options.text("name").pipe(
  Options.withAlias("n"),
  Options.withDescription("The name of the slice (kebab-case, e.g., 'notifications')")
);

/**
 * Slice description option.
 * Brief description of the slice's purpose for documentation.
 */
const descriptionOption = Options.text("description").pipe(
  Options.withAlias("d"),
  Options.withDescription("A brief description of the slice's purpose")
);

/**
 * Dry-run option.
 * When enabled, previews changes without writing files.
 */
const dryRunOption = Options.boolean("dry-run").pipe(
  Options.withDefault(false),
  Options.withDescription("Preview changes without writing files")
);

// -----------------------------------------------------------------------------
// Service Layer
// -----------------------------------------------------------------------------

/**
 * TsMorph service layer.
 * Already includes RepoUtilsLive dependency.
 */
const TsMorphLayer = TsMorphServiceLive;

/**
 * File generator service layer.
 * Already includes FsUtilsLive and RepoUtilsLive as dependencies.
 */
const FileGeneratorLayer = FileGeneratorService.Default;

/**
 * Combined layer providing all services needed for create-slice.
 *
 * The handler requires:
 * - FileGeneratorService (for file creation)
 * - TsMorphService (for AST modifications)
 * - RepoUtils (for repo root path)
 * - FileSystem (for tsconfig updates)
 */
const CreateSliceServiceLayer = Layer.mergeAll(FileGeneratorLayer, TsMorphLayer, RepoUtilsLive, BunFileSystem.layer);

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

/**
 * Create-slice command definition.
 *
 * Scaffolds a new vertical slice with all 5 sub-packages:
 * - domain: Pure business logic and entity definitions
 * - tables: Drizzle database schema
 * - server: Effect-based infrastructure (repos, services)
 * - client: SDK contracts for client consumption
 * - ui: React components
 *
 * @example
 * ```ts
 * import { createSliceCommand } from "@beep/repo-cli/commands/create-slice"
 * import * as Command from "@effect/cli/Command"
 *
 * // Register with parent command
 * const cli = Command.make("beep").pipe(
 *   Command.withSubcommands([createSliceCommand])
 * )
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const createSliceCommand = Command.make(
  "create-slice",
  { name: nameOption, description: descriptionOption, dryRun: dryRunOption },
  ({ name, description, dryRun }) =>
    Effect.gen(function* () {
      // Validate slice name
      const sliceNameResult = S.decodeUnknownEither(SliceName)(name);
      if (Either.isLeft(sliceNameResult)) {
        // Extract validation message from parse error
        const parseError = sliceNameResult.left;
        const reason =
          parseError.message ?? "Must be 3-50 chars, lowercase kebab-case, start with letter, not reserved";
        return yield* Effect.fail(
          new InvalidSliceNameError({
            sliceName: name,
            reason,
          })
        );
      }

      // Validate description
      const descriptionResult = S.decodeUnknownEither(SliceDescription)(description);
      if (Either.isLeft(descriptionResult)) {
        const parseError = descriptionResult.left;
        const reason = parseError.message ?? "Description must be non-empty and 200 chars or less";
        return yield* Effect.fail(
          new InvalidSliceNameError({
            sliceName: name,
            reason: `Invalid description: ${reason}`,
          })
        );
      }

      // Create validated input
      const input = new CreateSliceInput({
        sliceName: sliceNameResult.right,
        sliceDescription: descriptionResult.right,
        dryRun,
      });

      // Execute handler
      yield* createSliceHandler(input);
    })
).pipe(
  Command.withDescription("Create a new vertical slice with all 5 sub-packages"),
  Command.provide(CreateSliceServiceLayer)
);
