/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/String
 * Export: padStart
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/String.ts
 * Generated: 2026-02-19T04:14:21.472Z
 *
 * Overview:
 * Pads the string from the start with a given fill string to a specified length.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 * 
 * assert.deepStrictEqual(pipe("a", String.padStart(5)), "    a")
 * assert.deepStrictEqual(pipe("a", String.padStart(5, "_")), "____a")
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
import * as StringModule from "effect/String";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "padStart";
const exportKind = "const";
const moduleImportPath = "effect/String";
const sourceSummary = "Pads the string from the start with a given fill string to a specified length.";
const sourceExample = "import { pipe, String } from \"effect\"\nimport * as assert from \"node:assert\"\n\nassert.deepStrictEqual(pipe(\"a\", String.padStart(5)), \"    a\")\nassert.deepStrictEqual(pipe(\"a\", String.padStart(5, \"_\")), \"____a\")";
const moduleRecord = StringModule as Record<string, unknown>;

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
