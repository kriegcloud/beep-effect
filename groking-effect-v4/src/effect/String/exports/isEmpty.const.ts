/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/String
 * Export: isEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/String.ts
 * Generated: 2026-02-19T04:14:21.472Z
 *
 * Overview:
 * Test whether a `string` is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { String } from "effect"
 * import * as assert from "node:assert"
 * 
 * assert.deepStrictEqual(String.isEmpty(""), true)
 * assert.deepStrictEqual(String.isEmpty("a"), false)
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
const exportName = "isEmpty";
const exportKind = "const";
const moduleImportPath = "effect/String";
const sourceSummary = "Test whether a `string` is empty.";
const sourceExample = "import { String } from \"effect\"\nimport * as assert from \"node:assert\"\n\nassert.deepStrictEqual(String.isEmpty(\"\"), true)\nassert.deepStrictEqual(String.isEmpty(\"a\"), false)";
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
