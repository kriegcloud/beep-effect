/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Command
 * Export: withDescription
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Command.ts
 * Generated: 2026-02-19T04:14:24.445Z
 *
 * Overview:
 * Sets the description for a command.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 * 
 * const deploy = Command.make("deploy", {
 *   environment: Flag.string("env")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     yield* Console.log(`Deploying to ${config.environment}`)
 *   })).pipe(
 *     Command.withDescription("Deploy the application to a specified environment")
 *   )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CommandModule from "effect/unstable/cli/Command";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withDescription";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Command";
const sourceSummary = "Sets the description for a command.";
const sourceExample = "import { Console, Effect } from \"effect\"\nimport { Command, Flag } from \"effect/unstable/cli\"\n\nconst deploy = Command.make(\"deploy\", {\n  environment: Flag.string(\"env\")\n}, (config) =>\n  Effect.gen(function*() {\n    yield* Console.log(`Deploying to ${config.environment}`)\n  })).pipe(\n    Command.withDescription(\"Deploy the application to a specified environment\")\n  )";
const moduleRecord = CommandModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
