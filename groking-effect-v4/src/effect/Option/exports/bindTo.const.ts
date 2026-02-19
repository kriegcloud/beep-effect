/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: bindTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.452Z
 *
 * Overview:
 * Gives a name to the value of an `Option`, creating a single-key record inside `Some`. Starting point for the do notation pipeline.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, pipe } from "effect"
 * import * as assert from "node:assert"
 * 
 * const result = pipe(
 *   Option.some(2),
 *   Option.bindTo("x"),
 *   Option.bind("y", () => Option.some(3)),
 *   Option.let("sum", ({ x, y }) => x + y)
 * )
 * assert.deepStrictEqual(result, Option.some({ x: 2, y: 3, sum: 5 }))
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
import * as OptionModule from "effect/Option";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "bindTo";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Gives a name to the value of an `Option`, creating a single-key record inside `Some`. Starting point for the do notation pipeline.";
const sourceExample = "import { Option, pipe } from \"effect\"\nimport * as assert from \"node:assert\"\n\nconst result = pipe(\n  Option.some(2),\n  Option.bindTo(\"x\"),\n  Option.bind(\"y\", () => Option.some(3)),\n  Option.let(\"sum\", ({ x, y }) => x + y)\n)\nassert.deepStrictEqual(result, Option.some({ x: 2, y: 3, sum: 5 }))";
const moduleRecord = OptionModule as Record<string, unknown>;

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
