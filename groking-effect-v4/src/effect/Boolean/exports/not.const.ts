/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Boolean
 * Export: not
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Boolean.ts
 * Generated: 2026-02-19T04:14:10.094Z
 *
 * Overview:
 * Negates the given boolean: `!self`
 *
 * Source JSDoc Example:
 * ```ts
 * import { not } from "effect/Boolean"
 * import * as assert from "node:assert"
 * 
 * assert.deepStrictEqual(not(true), false)
 * assert.deepStrictEqual(not(false), true)
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
import * as BooleanModule from "effect/Boolean";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "not";
const exportKind = "const";
const moduleImportPath = "effect/Boolean";
const sourceSummary = "Negates the given boolean: `!self`";
const sourceExample = "import { not } from \"effect/Boolean\"\nimport * as assert from \"node:assert\"\n\nassert.deepStrictEqual(not(true), false)\nassert.deepStrictEqual(not(false), true)";
const moduleRecord = BooleanModule as Record<string, unknown>;

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
