/**
 * @file Bootstrap-Spec CLI Command
 *
 * CLI command for scaffolding new specifications in the beep-effect monorepo.
 * Creates standardized spec structures with README, REFLECTION_LOG, and other
 * files based on complexity level.
 *
 * Usage:
 *   beep bootstrap-spec --name <name> --description <description> [--complexity <level>] [--dry-run]
 *
 * Options:
 *   -n, --name         Spec name in kebab-case (e.g., "my-feature")
 *   -d, --description  Brief description of the spec's purpose
 *   -c, --complexity   Complexity level: simple, medium (default), complex
 *   --dry-run          Preview changes without writing files
 *
 * Examples:
 *   beep bootstrap-spec -n my-feature -d "New feature implementation"
 *   beep bootstrap-spec --name api-redesign --description "API improvements" -c complex
 *   beep bootstrap-spec -n quick-fix -d "Bug fix" -c simple --dry-run
 *
 * @module bootstrap-spec
 * @since 0.1.0
 */

import { RepoUtilsLive } from "@beep/tooling-utils";
import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { InvalidSpecNameError } from "./errors.js";
import { bootstrapSpecHandler } from "./handler.js";
import { BootstrapSpecInput, SpecComplexity, SpecDescription, SpecName } from "./schemas.js";
import { FileGeneratorService } from "./utils/file-generator.js";

// -----------------------------------------------------------------------------
// Options
// -----------------------------------------------------------------------------

/**
 * Spec name option.
 * Accepts kebab-case names like "my-feature" or "api-redesign".
 */
const nameOption = Options.text("name").pipe(
  Options.withAlias("n"),
  Options.withDescription("The name of the spec (kebab-case, e.g., 'my-feature')")
);

/**
 * Spec description option.
 * Brief description of the spec's purpose for documentation.
 */
const descriptionOption = Options.text("description").pipe(
  Options.withAlias("d"),
  Options.withDescription("A brief description of the spec's purpose")
);

/**
 * Purpose option.
 * Optional purpose statement for README.
 */
const purposeOption = Options.text("purpose").pipe(
  Options.withAlias("p"),
  Options.withDescription("Purpose statement for README (optional)"),
  Options.optional
);

/**
 * Problem option.
 * Optional problem statement for README.
 */
const problemOption = Options.text("problem").pipe(
  Options.withDescription("Problem statement for README (optional)"),
  Options.optional
);

/**
 * Scope option.
 * Optional scope definition for README.
 */
const scopeOption = Options.text("scope").pipe(
  Options.withAlias("s"),
  Options.withDescription("Scope definition for README (optional)"),
  Options.optional
);

/**
 * Complexity option.
 * Determines the file structure to generate.
 */
const complexityOption = Options.choice("complexity", ["simple", "medium", "complex"]).pipe(
  Options.withAlias("c"),
  Options.withDefault("medium" as const),
  Options.withDescription("Complexity level: simple (basic), medium (default), complex (full orchestration)")
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
 * File generator service layer.
 * Already includes FsUtilsLive and RepoUtilsLive as dependencies.
 */
const FileGeneratorLayer = FileGeneratorService.Default;

/**
 * Combined layer providing all services needed for bootstrap-spec.
 *
 * The handler requires:
 * - FileGeneratorService (for file creation)
 * - RepoUtils (for repo root path)
 * - FileSystem (for file operations)
 */
const BootstrapSpecServiceLayer = Layer.mergeAll(FileGeneratorLayer, RepoUtilsLive, BunFileSystem.layer);

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

/**
 * Bootstrap-spec command definition.
 *
 * Scaffolds a new specification with standardized structure based on complexity:
 *
 * **Simple:**
 * - README.md
 * - REFLECTION_LOG.md
 *
 * **Medium (default):**
 * - README.md
 * - REFLECTION_LOG.md
 * - QUICK_START.md
 * - outputs/
 *
 * **Complex:**
 * - README.md
 * - REFLECTION_LOG.md
 * - QUICK_START.md
 * - MASTER_ORCHESTRATION.md
 * - AGENT_PROMPTS.md
 * - RUBRICS.md
 * - outputs/
 * - templates/
 * - handoffs/
 *
 * @example
 * ```ts
 * import { bootstrapSpecCommand } from "@beep/repo-cli/commands/bootstrap-spec"
 * import * as Command from "@effect/cli/Command"
 *
 * // Register with parent command
 * const cli = Command.make("beep").pipe(
 *   Command.withSubcommands([bootstrapSpecCommand])
 * )
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const bootstrapSpecCommand = Command.make(
  "bootstrap-spec",
  {
    name: nameOption,
    description: descriptionOption,
    purpose: purposeOption,
    problem: problemOption,
    scope: scopeOption,
    complexity: complexityOption,
    dryRun: dryRunOption,
  },
  ({ name, description, purpose, problem, scope, complexity, dryRun }) =>
    Effect.gen(function* () {
      // Validate spec name
      const specNameResult = S.decodeUnknownEither(SpecName)(name);
      if (Either.isLeft(specNameResult)) {
        const parseError = specNameResult.left;
        const reason = parseError.message ?? "Must be 3-50 chars, lowercase kebab-case, start with letter";
        return yield* Effect.fail(
          new InvalidSpecNameError({
            specName: name,
            reason,
          })
        );
      }

      // Validate description
      const descriptionResult = S.decodeUnknownEither(SpecDescription)(description);
      if (Either.isLeft(descriptionResult)) {
        const parseError = descriptionResult.left;
        const reason = parseError.message ?? "Description must be non-empty and 200 chars or less";
        return yield* Effect.fail(
          new InvalidSpecNameError({
            specName: name,
            reason: `Invalid description: ${reason}`,
          })
        );
      }

      // Validate complexity
      const complexityResult = S.decodeUnknownEither(SpecComplexity)(complexity);
      if (Either.isLeft(complexityResult)) {
        return yield* Effect.fail(
          new InvalidSpecNameError({
            specName: name,
            reason: "Invalid complexity: must be 'simple', 'medium', or 'complex'",
          })
        );
      }

      // Create validated input
      const input = new BootstrapSpecInput({
        specName: specNameResult.right,
        specDescription: descriptionResult.right,
        purpose: O.getOrElse(purpose, () => ""),
        problemStatement: O.getOrElse(problem, () => ""),
        scope: O.getOrElse(scope, () => ""),
        complexity: complexityResult.right,
        dryRun,
      });

      // Execute handler
      yield* bootstrapSpecHandler(input);
    })
).pipe(
  Command.withDescription("Create a new specification with standardized structure"),
  Command.provide(BootstrapSpecServiceLayer)
);
