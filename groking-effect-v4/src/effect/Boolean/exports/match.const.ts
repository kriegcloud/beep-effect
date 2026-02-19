/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Boolean
 * Export: match
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Boolean.ts
 * Generated: 2026-02-19T04:14:10.094Z
 *
 * Overview:
 * This function returns the result of either of the given functions depending on the value of the boolean parameter. It is useful when you have to run one of two functions depending on the boolean value.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Boolean from "effect/Boolean"
 * import * as assert from "node:assert"
 * 
 * assert.deepStrictEqual(
 *   Boolean.match(true, {
 *     onFalse: () => "It's false!",
 *     onTrue: () => "It's true!"
 *   }),
 *   "It's true!"
 * )
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
const exportName = "match";
const exportKind = "const";
const moduleImportPath = "effect/Boolean";
const sourceSummary = "This function returns the result of either of the given functions depending on the value of the boolean parameter. It is useful when you have to run one of two functions dependi...";
const sourceExample = "import * as Boolean from \"effect/Boolean\"\nimport * as assert from \"node:assert\"\n\nassert.deepStrictEqual(\n  Boolean.match(true, {\n    onFalse: () => \"It's false!\",\n    onTrue: () => \"It's true!\"\n  }),\n  \"It's true!\"\n)";
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
