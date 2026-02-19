/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tuple
 * Export: pick
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Tuple.ts
 * Generated: 2026-02-19T04:14:22.584Z
 *
 * Overview:
 * Creates a new tuple containing only the elements at the specified indices.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Tuple } from "effect"
 *
 * const result = Tuple.pick(["a", "b", "c", "d"], [0, 2, 3])
 * console.log(result) // ["a", "c", "d"]
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
import * as TupleModule from "effect/Tuple";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "pick";
const exportKind = "const";
const moduleImportPath = "effect/Tuple";
const sourceSummary = "Creates a new tuple containing only the elements at the specified indices.";
const sourceExample =
  'import { Tuple } from "effect"\n\nconst result = Tuple.pick(["a", "b", "c", "d"], [0, 2, 3])\nconsole.log(result) // ["a", "c", "d"]';
const moduleRecord = TupleModule as Record<string, unknown>;

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
