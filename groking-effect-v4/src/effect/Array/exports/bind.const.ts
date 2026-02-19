/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: bind
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.346Z
 *
 * Overview:
 * Introduces a new array variable into a do-notation scope, producing the cartesian product with all previous bindings.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * const result = pipe(
 *   Array.Do,
 *   Array.bind("x", () => [1, 2]),
 *   Array.bind("y", () => ["a", "b"])
 * )
 * console.log(result)
 * // [{ x: 1, y: "a" }, { x: 1, y: "b" }, { x: 2, y: "a" }, { x: 2, y: "b" }]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "bind";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Introduces a new array variable into a do-notation scope, producing the cartesian product with all previous bindings.";
const sourceExample =
  'import { Array, pipe } from "effect"\n\nconst result = pipe(\n  Array.Do,\n  Array.bind("x", () => [1, 2]),\n  Array.bind("y", () => ["a", "b"])\n)\nconsole.log(result)\n// [{ x: 1, y: "a" }, { x: 1, y: "b" }, { x: 2, y: "a" }, { x: 2, y: "b" }]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect bind as a runtime export used for array do-notation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`bind.length at runtime: ${A.bind.length}`);
});

const exampleSourceAlignedCartesianProduct = Effect.gen(function* () {
  const withX = A.bind(A.Do, "x", () => [1, 2]);
  const result = A.bind(withX, "y", () => ["a", "b"]);

  yield* Console.log(`Two binds over Array.Do: ${JSON.stringify(result)}`);
  yield* Console.log(`Total cartesian combinations: ${result.length}`);
});

const exampleDependentBinding = Effect.gen(function* () {
  const withRegion = A.bind(A.Do, "region", () => ["us", "eu"]);
  const withCurrency = A.bind(withRegion, "currency", ({ region }) => (region === "us" ? ["USD"] : ["EUR", "CHF"]));
  const withPlan = A.bind(withCurrency, "plan", ({ currency }) =>
    currency === "USD" ? ["starter", "pro"] : ["starter"]
  );

  yield* Console.log(`Bindings that depend on prior scope: ${JSON.stringify(withPlan)}`);
  yield* Console.log(`Total dependent combinations: ${withPlan.length}`);
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
      description: "Inspect the bind export and basic runtime metadata.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Cartesian Binding",
      description: "Reproduce the documented two-bind do-notation cartesian product.",
      run: exampleSourceAlignedCartesianProduct,
    },
    {
      title: "Dependent Scope Binding",
      description: "Return arrays from bind callbacks using previously bound scope values.",
      run: exampleDependentBinding,
    },
  ],
});

BunRuntime.runMain(program);
