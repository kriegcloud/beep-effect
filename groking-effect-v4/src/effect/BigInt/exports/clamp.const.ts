/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigInt
 * Export: clamp
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigInt.ts
 * Generated: 2026-02-19T04:14:10.085Z
 *
 * Overview:
 * Restricts the given `bigint` to be within the range specified by the `minimum` and `maximum` values.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as BigInt from "effect/BigInt"
 * import * as assert from "node:assert"
 * 
 * const clamp = BigInt.clamp({ minimum: 1n, maximum: 5n })
 * 
 * assert.equal(clamp(3n), 3n)
 * assert.equal(clamp(0n), 1n)
 * assert.equal(clamp(6n), 5n)
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
import * as BigIntModule from "effect/BigInt";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "clamp";
const exportKind = "const";
const moduleImportPath = "effect/BigInt";
const sourceSummary = "Restricts the given `bigint` to be within the range specified by the `minimum` and `maximum` values.";
const sourceExample = "import * as BigInt from \"effect/BigInt\"\nimport * as assert from \"node:assert\"\n\nconst clamp = BigInt.clamp({ minimum: 1n, maximum: 5n })\n\nassert.equal(clamp(3n), 3n)\nassert.equal(clamp(0n), 1n)\nassert.equal(clamp(6n), 5n)";
const moduleRecord = BigIntModule as Record<string, unknown>;

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
