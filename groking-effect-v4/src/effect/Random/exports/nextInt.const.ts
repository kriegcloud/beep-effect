/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Random
 * Export: nextInt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Random.ts
 * Generated: 2026-02-19T04:14:16.224Z
 *
 * Overview:
 * Generates a random integer between `Number.MIN_SAFE_INTEGER` (inclusive) and `Number.MAX_SAFE_INTEGER` (inclusive).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const randomInt = yield* Random.nextInt
 *   console.log("Random integer:", randomInt)
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RandomModule from "effect/Random";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "nextInt";
const exportKind = "const";
const moduleImportPath = "effect/Random";
const sourceSummary =
  "Generates a random integer between `Number.MIN_SAFE_INTEGER` (inclusive) and `Number.MAX_SAFE_INTEGER` (inclusive).";
const sourceExample =
  'import { Effect, Random } from "effect"\n\nconst program = Effect.gen(function*() {\n  const randomInt = yield* Random.nextInt\n  console.log("Random integer:", randomInt)\n})';
const moduleRecord = RandomModule as Record<string, unknown>;

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
