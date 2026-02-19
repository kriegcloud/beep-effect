/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Number
 * Export: subtract
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Number.ts
 * Generated: 2026-02-19T04:14:15.368Z
 *
 * Overview:
 * Provides a subtraction operation on `number`s.
 *
 * Source JSDoc Example:
 * ```ts
 * import { subtract } from "effect/Number"
 * import * as assert from "node:assert"
 * 
 * assert.deepStrictEqual(subtract(2, 3), -1)
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
import * as NumberModule from "effect/Number";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "subtract";
const exportKind = "const";
const moduleImportPath = "effect/Number";
const sourceSummary = "Provides a subtraction operation on `number`s.";
const sourceExample = "import { subtract } from \"effect/Number\"\nimport * as assert from \"node:assert\"\n\nassert.deepStrictEqual(subtract(2, 3), -1)";
const moduleRecord = NumberModule as Record<string, unknown>;

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
