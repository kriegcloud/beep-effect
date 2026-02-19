/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Function
 * Export: coerceUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Function.ts
 * Generated: 2026-02-19T04:14:13.308Z
 *
 * Overview:
 * Casts the result to the specified type.
 *
 * Source JSDoc Example:
 * ```ts
 * import { coerceUnsafe, identity } from "effect/Function"
 * import * as assert from "node:assert"
 * 
 * assert.deepStrictEqual(coerceUnsafe, identity)
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
import * as FunctionModule from "effect/Function";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "coerceUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Function";
const sourceSummary = "Casts the result to the specified type.";
const sourceExample = "import { coerceUnsafe, identity } from \"effect/Function\"\nimport * as assert from \"node:assert\"\n\nassert.deepStrictEqual(coerceUnsafe, identity)";
const moduleRecord = FunctionModule as Record<string, unknown>;

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
