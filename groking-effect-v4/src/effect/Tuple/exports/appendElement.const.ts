/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tuple
 * Export: appendElement
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Tuple.ts
 * Generated: 2026-02-19T04:14:22.584Z
 *
 * Overview:
 * Appends a single element to the end of a tuple.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Tuple } from "effect"
 * 
 * const result = pipe(Tuple.make(1, 2), Tuple.appendElement("end"))
 * console.log(result) // [1, 2, "end"]
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
import * as TupleModule from "effect/Tuple";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "appendElement";
const exportKind = "const";
const moduleImportPath = "effect/Tuple";
const sourceSummary = "Appends a single element to the end of a tuple.";
const sourceExample = "import { pipe, Tuple } from \"effect\"\n\nconst result = pipe(Tuple.make(1, 2), Tuple.appendElement(\"end\"))\nconsole.log(result) // [1, 2, \"end\"]";
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
