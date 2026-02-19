/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Primitive
 * Export: choice
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Primitive.ts
 * Generated: 2026-02-19T04:50:46.366Z
 *
 * Overview:
 * Creates a primitive that accepts only specific choice values mapped to custom types.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * type LogLevel = "debug" | "info" | "warn" | "error"
 *
 * const logLevelPrimitive = Primitive.choice<LogLevel>([
 *   ["debug", "debug"],
 *   ["info", "info"],
 *   ["warn", "warn"],
 *   ["error", "error"]
 * ])
 *
 * const parseLogLevel = Effect.gen(function*() {
 *   const result1 = yield* logLevelPrimitive.parse("info")
 *   console.log(result1) // "info"
 *
 *   const result2 = yield* logLevelPrimitive.parse("debug")
 *   console.log(result2) // "debug"
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
import * as PrimitiveModule from "effect/unstable/cli/Primitive";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "choice";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Primitive";
const sourceSummary = "Creates a primitive that accepts only specific choice values mapped to custom types.";
const sourceExample =
  'import { Effect } from "effect"\nimport { Primitive } from "effect/unstable/cli"\n\ntype LogLevel = "debug" | "info" | "warn" | "error"\n\nconst logLevelPrimitive = Primitive.choice<LogLevel>([\n  ["debug", "debug"],\n  ["info", "info"],\n  ["warn", "warn"],\n  ["error", "error"]\n])\n\nconst parseLogLevel = Effect.gen(function*() {\n  const result1 = yield* logLevelPrimitive.parse("info")\n  console.log(result1) // "info"\n\n  const result2 = yield* logLevelPrimitive.parse("debug")\n  console.log(result2) // "debug"\n})';
const moduleRecord = PrimitiveModule as Record<string, unknown>;

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
