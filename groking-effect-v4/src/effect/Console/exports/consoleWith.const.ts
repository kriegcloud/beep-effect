/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Console
 * Export: consoleWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Console.ts
 * Generated: 2026-02-19T04:14:11.195Z
 *
 * Overview:
 * Creates an Effect that provides access to the current console instance.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const program = Console.consoleWith((console) =>
 *   Effect.sync(() => {
 *     console.log("Hello, world!")
 *     console.error("This is an error message")
 *   })
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
import * as ConsoleModule from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "consoleWith";
const exportKind = "const";
const moduleImportPath = "effect/Console";
const sourceSummary = "Creates an Effect that provides access to the current console instance.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nconst program = Console.consoleWith((console) =>\n  Effect.sync(() => {\n    console.log("Hello, world!")\n    console.error("This is an error message")\n  })\n)';
const moduleRecord = ConsoleModule as Record<string, unknown>;

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
