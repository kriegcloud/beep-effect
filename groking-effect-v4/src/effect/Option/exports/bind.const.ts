/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: bind
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Adds an `Option` value to the do notation record under a given name. If the `Option` is `None`, the whole pipeline short-circuits to `None`.
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
const exportName = "bind";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Adds an `Option` value to the do notation record under a given name. If the `Option` is `None`, the whole pipeline short-circuits to `None`.";
const sourceExample =
  'import { Option, pipe } from "effect"\nimport * as assert from "node:assert"\n\nconst result = pipe(\n  Option.Do,\n  Option.bind("x", () => Option.some(2)),\n  Option.bind("y", () => Option.some(3)),\n  Option.let("sum", ({ x, y }) => x + y),\n  Option.filter(({ x, y }) => x * y > 5)\n)\nassert.deepStrictEqual(result, Option.some({ x: 2, y: 3, sum: 5 }))';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.bind as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleBindBuildRecord = Effect.gen(function* () {
  yield* Console.log("Use bind to build up a record from Option.Do.");
  const result = O.Do.pipe(
    O.bind("x", () => O.some(2)),
    O.bind("y", ({ x }) => O.some(x + 1)),
    O.let("sum", ({ x, y }) => x + y)
  );

  const summary = O.match({
    onNone: () => "None",
    onSome: (record) => `Some(${JSON.stringify(record)})`,
  })(result);
  yield* Console.log(`result: ${summary}`);
});

const exampleBindShortCircuit = Effect.gen(function* () {
  yield* Console.log("When a bind step returns None, the chain short-circuits.");
  const result = O.Do.pipe(
    O.bind("x", () => O.some(2)),
    O.bind("y", () => O.none()),
    O.bind("z", ({ x, y }) => O.some(x + y))
  );

  yield* Console.log(`isNone: ${O.isNone(result)}`);
  const fallback = O.getOrElse(() => ({ reason: "missing y" }))(result);
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
      title: "Build a Record with bind",
      description: "Chain bind calls from Option.Do to accumulate named fields in Some.",
      run: exampleBindBuildRecord,
    },
    {
      title: "Short-Circuit on None",
      description: "Show that once a bind returns None, remaining bind steps are skipped.",
      run: exampleBindShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
