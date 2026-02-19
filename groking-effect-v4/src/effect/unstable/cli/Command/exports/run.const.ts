/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Command
 * Export: run
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Command.ts
 * Generated: 2026-02-19T04:50:46.255Z
 *
 * Overview:
 * Runs a command with the provided input arguments.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const greetCommand = Command.make("greet", {
 *   name: Flag.string("name")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     yield* Console.log(`Hello, ${config.name}!`)
 *   }))
 *
 * // Automatically gets args from process.argv
 * const program = Command.run(greetCommand, {
 *   version: "1.0.0"
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as CommandModule from "effect/unstable/cli/Command";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "run";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Command";
const sourceSummary = "Runs a command with the provided input arguments.";
const sourceExample =
  'import { Console, Effect } from "effect"\nimport { Command, Flag } from "effect/unstable/cli"\n\nconst greetCommand = Command.make("greet", {\n  name: Flag.string("name")\n}, (config) =>\n  Effect.gen(function*() {\n    yield* Console.log(`Hello, ${config.name}!`)\n  }))\n\n// Automatically gets args from process.argv\nconst program = Command.run(greetCommand, {\n  version: "1.0.0"\n})';
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
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
