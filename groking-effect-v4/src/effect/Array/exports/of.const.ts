/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: of
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.367Z
 *
 * Overview:
 * Wraps a single value in a `NonEmptyArray`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.of(1)) // [1]
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
const exportName = "of";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Wraps a single value in a `NonEmptyArray`.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.of(1)) // [1]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape and preview for Array.of.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const result = A.of(1);
  yield* Console.log(`Array.of(1) => ${JSON.stringify(result)}`);
  yield* Console.log(`Result length: ${result.length}`);
});

const exampleReferencePreservation = Effect.gen(function* () {
  const payload = { id: 101, tags: ["draft"] };
  const wrapped = A.of(payload);
  payload.tags.push("queued");
  yield* Console.log(`Wrapped payload id: ${wrapped[0].id}`);
  yield* Console.log(`Wrapped payload tags: ${JSON.stringify(wrapped[0].tags)}`);
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
      description: "Run the documented unary call and confirm a single-element non-empty array.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Reference Preservation",
      description: "Show that wrapping an object keeps the same element reference in the resulting array.",
      run: exampleReferencePreservation,
    },
  ],
});

BunRuntime.runMain(program);
