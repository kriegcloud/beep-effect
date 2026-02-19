/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Command
 * Export: withHandler
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Command.ts
 * Generated: 2026-02-19T04:14:24.445Z
 *
 * Overview:
 * Adds or replaces the handler for a command.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * // Command without initial handler
 * const greet = Command.make("greet", {
 *   name: Flag.string("name")
 * })
 *
 * // Add handler later
 * const greetWithHandler = greet.pipe(
 *   Command.withHandler((config: { readonly name: string }) =>
 *     Console.log(`Hello, ${config.name}!`)
 *   )
 * )
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as CommandModule from "effect/unstable/cli/Command";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withHandler";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Command";
const sourceSummary = "Adds or replaces the handler for a command.";
const sourceExample =
  'import { Console } from "effect"\nimport { Command, Flag } from "effect/unstable/cli"\n\n// Command without initial handler\nconst greet = Command.make("greet", {\n  name: Flag.string("name")\n})\n\n// Add handler later\nconst greetWithHandler = greet.pipe(\n  Command.withHandler((config: { readonly name: string }) =>\n    Console.log(`Hello, ${config.name}!`)\n  )\n)';
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
