/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: empty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.348Z
 *
 * Overview:
 * Creates an empty array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.empty<number>()
 * console.log(result) // []
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
const exportName = "empty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Creates an empty array.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.empty<number>()\nconsole.log(result) // []';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape and preview for Array.empty.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const result = A.empty<number>();
  yield* Console.log(`Array.empty<number>() => ${JSON.stringify(result)}`);
  yield* Console.log(`Result length: ${result.length}`);
});

const exampleCallIsolation = Effect.gen(function* () {
  const first = A.empty<number>();
  const second = A.empty<number>();
  yield* Console.log(`Two calls share the same reference: ${Object.is(first, second)}`);
  yield* Console.log(`Lengths: first=${first.length}, second=${second.length}`);
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
      description: "Run the documented zero-arg call and log the produced empty array.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Call Isolation Check",
      description: "Compare two calls to see whether they reuse the same runtime array reference.",
      run: exampleCallIsolation,
    },
  ],
});

BunRuntime.runMain(program);
