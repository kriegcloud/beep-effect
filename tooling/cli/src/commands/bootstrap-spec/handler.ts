/**
 * @file Bootstrap-Spec Command Handler
 *
 * Main handler for the bootstrap-spec command. Orchestrates:
 * - Validation that spec doesn't already exist
 * - Context creation from input
 * - Plan generation based on complexity
 * - Dry-run preview or file execution
 *
 * Execution flow:
 * 1. Check if spec already exists
 * 2. Create context for templates
 * 3. Generate plan (directories + files)
 * 4. If dry-run, preview and exit
 * 5. Execute file generation
 * 6. Display success summary
 *
 * @module bootstrap-spec/handler
 * @since 1.0.0
 */

import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { type BootstrapSpecError, SpecExistsError } from "./errors.js";
import type { BootstrapSpecInput } from "./schemas.js";
import { FileGeneratorService } from "./utils/file-generator.js";
import { createSpecContext } from "./utils/template.js";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/**
 * Main handler for the bootstrap-spec command.
 *
 * Orchestrates all steps of spec creation:
 * 1. Validates spec doesn't exist
 * 2. Creates context from input
 * 3. Generates plan based on complexity
 * 4. Previews (dry-run) or executes plan
 *
 * @example
 * ```ts
 * import { bootstrapSpecHandler } from "@beep/repo-cli/commands/bootstrap-spec/handler"
 * import { BootstrapSpecInput, SpecName, SpecDescription } from "@beep/repo-cli/commands/bootstrap-spec/schemas"
 * import * as Effect from "effect/Effect"
 *
 * const input = new BootstrapSpecInput({
 *   specName: "my-feature" as SpecName,
 *   specDescription: "Implements new feature",
 *   complexity: "medium",
 *   dryRun: false,
 * })
 *
 * Effect.runPromise(bootstrapSpecHandler(input).pipe(
 *   Effect.provide(BootstrapSpecServiceLayer)
 * ))
 * ```
 *
 * @param input - Validated command input containing spec name, description, and options
 * @returns Effect that creates the spec or fails with BootstrapSpecError
 *
 * @since 0.1.0
 * @category handlers
 */
export const bootstrapSpecHandler = (
  input: BootstrapSpecInput
): Effect.Effect<void, BootstrapSpecError, FileGeneratorService> =>
  Effect.gen(function* () {
    const fileGen = yield* FileGeneratorService;

    // 1. Check if spec already exists
    const exists = yield* fileGen.specExists(input.specName);
    if (exists) {
      return yield* new SpecExistsError({
        specName: input.specName,
        path: fileGen.getSpecPath(input.specName),
      });
    }

    // 2. Create context for templates
    const context = createSpecContext(input);

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
    yield* Console.log(`Creating spec: ${input.specName}`);
    yield* Console.log(`Description: ${input.specDescription}`);
    yield* Console.log(`Complexity: ${input.complexity}`);
    yield* Console.log("");

    yield* Console.log("Creating directories and files...");
    yield* fileGen.executePlan(plan);
    yield* Console.log(`   Created ${A.length(plan.directories)} directories`);
    yield* Console.log(`   Created ${A.length(plan.files)} files`);

    // 6. Success summary
    yield* Console.log(`\n${"=".repeat(50)}`);
    yield* Console.log(`Spec "${input.specName}" created successfully!`);
    yield* Console.log("=".repeat(50));
    yield* Console.log(`\nLocation: specs/${input.specName}/`);
    yield* Console.log("\nNext steps:");
    yield* Console.log("   1. Review README.md and customize as needed");
    yield* Console.log("   2. Update success criteria");
    yield* Console.log("   3. Begin Phase 1: Discovery");
    if (input.complexity === "complex") {
      yield* Console.log("   4. See MASTER_ORCHESTRATION.md for full workflow");
    }
  }).pipe(Effect.withSpan("bootstrapSpecHandler"));
