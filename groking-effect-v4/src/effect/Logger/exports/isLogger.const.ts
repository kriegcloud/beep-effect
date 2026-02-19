/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: isLogger
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.511Z
 *
 * Overview:
 * Returns `true` if the specified value is a `Logger`, otherwise returns `false`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Logger } from "effect"
 *
 * const myLogger = Logger.make((options) => {
 *   console.log(options.message)
 * })
 *
 * console.log(Logger.isLogger(myLogger)) // true
 * console.log(Logger.isLogger("not a logger")) // false
 * console.log(Logger.isLogger({ log: () => {} })) // false
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
import * as LoggerModule from "effect/Logger";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isLogger";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "Returns `true` if the specified value is a `Logger`, otherwise returns `false`.";
const sourceExample =
  'import { Logger } from "effect"\n\nconst myLogger = Logger.make((options) => {\n  console.log(options.message)\n})\n\nconsole.log(Logger.isLogger(myLogger)) // true\nconsole.log(Logger.isLogger("not a logger")) // false\nconsole.log(Logger.isLogger({ log: () => {} })) // false';
const moduleRecord = LoggerModule as Record<string, unknown>;

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
