/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: Do
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * An `Option` containing an empty record `{}`, used as the starting point for do notation chains.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, pipe } from "effect"
 * import * as assert from "node:assert"
 *
 * const result = pipe(
 *   Option.Do,
 *   Option.bind("x", () => Option.some(2)),
 *   Option.bind("y", () => Option.some(3)),
 *   Option.let("sum", ({ x, y }) => x + y),
 *   Option.filter(({ x, y }) => x * y > 5)
 * )
 * assert.deepStrictEqual(result, Option.some({ x: 2, y: 3, sum: 5 }))
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Do";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "An `Option` containing an empty record `{}`, used as the starting point for do notation chains.";
const sourceExample =
  'import { Option, pipe } from "effect"\nimport * as assert from "node:assert"\n\nconst result = pipe(\n  Option.Do,\n  Option.bind("x", () => Option.some(2)),\n  Option.bind("y", () => Option.some(3)),\n  Option.let("sum", ({ x, y }) => x + y),\n  Option.filter(({ x, y }) => x * y > 5)\n)\nassert.deepStrictEqual(result, Option.some({ x: 2, y: 3, sum: 5 }))';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.Do as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleDoNotationSuccess = Effect.gen(function* () {
  yield* Console.log("Build a record from Option.Do using bind/let/filter.");
  const result = O.Do.pipe(
    O.bind("x", () => O.some(2)),
    O.bind("y", () => O.some(3)),
    O.let("sum", ({ x, y }) => x + y),
    O.filter(({ x, y }) => x * y > 5)
  );

  const summary = O.match({
    onNone: () => "None",
    onSome: (record) => `Some(${JSON.stringify(record)})`,
  })(result);
  yield* Console.log(`result: ${summary}`);
});

const exampleDoNotationShortCircuit = Effect.gen(function* () {
  yield* Console.log("Show short-circuiting when one bind returns None.");
  const result = O.Do.pipe(
    O.bind("x", () => O.some(2)),
    O.bind("y", () => O.none())
  );

  yield* Console.log(`isNone: ${O.isNone(result)}`);
  const fallback = O.getOrElse(() => ({ reason: "y missing" }))(result);
  yield* Console.log(`fallback: ${JSON.stringify(fallback)}`);
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
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Do Notation Happy Path",
      description: "Start from Option.Do and compose bind/let/filter to produce a record.",
      run: exampleDoNotationSuccess,
    },
    {
      title: "Do Notation Short-Circuit",
      description: "Demonstrate that a None during bind collapses the whole chain.",
      run: exampleDoNotationShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
