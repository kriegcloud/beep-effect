/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Creates a `NonEmptyArray` from one or more elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.make(1, 2, 3)
 * console.log(result) // [1, 2, 3]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ArrayModule from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Creates a `NonEmptyArray` from one or more elements.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.make(1, 2, 3)\nconsole.log(result) // [1, 2, 3]';
const moduleRecord = ArrayModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleDocumentedInvocation = Effect.gen(function* () {
  yield* Console.log("Contract note: intended usage is one-or-more args (for example, make(1, 2, 3)).");
  const makeValue = moduleRecord[exportName];
  if (typeof makeValue !== "function") {
    yield* Console.log("Runtime note: export is not callable.");
    return;
  }

  const result = (makeValue as (...elements: ReadonlyArray<number>) => unknown)(1, 2, 3);
  yield* Console.log(`Invocation result: ${JSON.stringify(result)}`);
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
      title: "Documented Invocation",
      description: "Invoke with one-or-more elements, matching the module summary and JSDoc.",
      run: exampleDocumentedInvocation,
    },
  ],
});

BunRuntime.runMain(program);
