/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: lastNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Returns the last element of a `NonEmptyReadonlyArray` directly (no `Option` wrapper).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.lastNonEmpty([1, 2, 3, 4])) // 4
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
const exportName = "lastNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns the last element of a `NonEmptyReadonlyArray` directly (no `Option` wrapper).";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.lastNonEmpty([1, 2, 3, 4])) // 4';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect lastNonEmpty as a runtime export for non-empty array access.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`lastNonEmpty.length at runtime: ${A.lastNonEmpty.length}`);
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4] as const;
  const last = A.lastNonEmpty(input);

  yield* Console.log(`Input values: ${input.join(", ")}`);
  yield* Console.log(`Last value (no Option wrapper): ${last}`);
});

const exampleStructuredValues = Effect.gen(function* () {
  type Revision = {
    readonly id: number;
    readonly label: "draft" | "review" | "approved";
  };

  const single = ["only"] as const;
  const only = A.lastNonEmpty(single);

  const revisions: readonly [Revision, ...Revision[]] = [
    { id: 1, label: "draft" },
    { id: 2, label: "review" },
    { id: 3, label: "approved" },
  ];
  const latest = A.lastNonEmpty(revisions);

  yield* Console.log(`Single-element non-empty array returns: ${only}`);
  yield* Console.log(`Last object by position: ${latest.label} (#${latest.id})`);
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
      description: "Inspect runtime shape and callable metadata for lastNonEmpty.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Last Element",
      description: "Reproduce the documented non-empty number array invocation.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Structured Non-Empty Inputs",
      description: "Show identical behavior for single-element and object arrays.",
      run: exampleStructuredValues,
    },
  ],
});

BunRuntime.runMain(program);
