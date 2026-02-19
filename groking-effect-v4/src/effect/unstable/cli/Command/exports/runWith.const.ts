/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Command
 * Export: runWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Command.ts
 * Generated: 2026-02-19T04:50:46.255Z
 *
 * Overview:
 * Runs a command with explicitly provided arguments instead of using process.argv.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const greet = Command.make("greet", {
 *   name: Flag.string("name"),
 *   count: Flag.integer("count").pipe(Flag.withDefault(1))
 * }, (config) =>
 *   Effect.gen(function*() {
 *     for (let i = 0; i < config.count; i++) {
 *       yield* Console.log(`Hello, ${config.name}!`)
 *     }
 *   }))
 *
 * // Test with specific arguments
 * const testProgram = Effect.gen(function*() {
 *   const runCommand = Command.runWith(greet, { version: "1.0.0" })
 *
 *   // Test normal execution
 *   yield* runCommand(["--name", "Alice", "--count", "2"])
 *
 *   // Test help display
 *   yield* runCommand(["--help"])
 *
 *   // Test version display
 *   yield* runCommand(["--version"])
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
const exportName = "runWith";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Command";
const sourceSummary = "Runs a command with explicitly provided arguments instead of using process.argv.";
const sourceExample =
  'import { Console, Effect } from "effect"\nimport { Command, Flag } from "effect/unstable/cli"\n\nconst greet = Command.make("greet", {\n  name: Flag.string("name"),\n  count: Flag.integer("count").pipe(Flag.withDefault(1))\n}, (config) =>\n  Effect.gen(function*() {\n    for (let i = 0; i < config.count; i++) {\n      yield* Console.log(`Hello, ${config.name}!`)\n    }\n  }))\n\n// Test with specific arguments\nconst testProgram = Effect.gen(function*() {\n  const runCommand = Command.runWith(greet, { version: "1.0.0" })\n\n  // Test normal execution\n  yield* runCommand(["--name", "Alice", "--count", "2"])\n\n  // Test help display\n  yield* runCommand(["--help"])\n\n  // Test version display\n  yield* runCommand(["--version"])\n})';
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
