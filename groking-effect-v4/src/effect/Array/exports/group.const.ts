/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: group
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * Groups consecutive equal elements using `Equal.equivalence()`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.group([1, 1, 2, 2, 2, 3, 1])) // [[1, 1], [2, 2, 2], [3], [1]]
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
const exportName = "group";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Groups consecutive equal elements using `Equal.equivalence()`.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.group([1, 1, 2, 2, 2, 3, 1])) // [[1, 1], [2, 2, 2], [3], [1]]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 1, 2, 2, 2, 3, 1] as const;
  const result = A.group(input);
  yield* Console.log(`group([1, 1, 2, 2, 2, 3, 1]) => ${JSON.stringify(result)}`);
});

const exampleAdjacentOnlyBehavior = Effect.gen(function* () {
  const input = ["a", "b", "a", "a", "b"] as const;
  const result = A.group(input);
  yield* Console.log(`group(["a", "b", "a", "a", "b"]) => ${JSON.stringify(result)}`);
  yield* Console.log("Only adjacent equal values are grouped together.");
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
      title: "Source-Aligned Invocation",
      description: "Group adjacent equal numbers using the source JSDoc example.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Adjacent-Only Behavior",
      description: "Show that equal values separated by different values are not merged.",
      run: exampleAdjacentOnlyBehavior,
    },
  ],
});

BunRuntime.runMain(program);
