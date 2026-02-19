/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: setLastNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Replaces the last element of a non-empty array with a new value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.setLastNonEmpty([1, 2, 3], 4)) // [1, 2, 4]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "setLastNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Replaces the last element of a non-empty array with a new value.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.setLastNonEmpty([1, 2, 3], 4)) // [1, 2, 4]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect setLastNonEmpty runtime shape before behavior-focused calls.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`setLastNonEmpty.length at runtime: ${A.setLastNonEmpty.length}`);
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3] as const;
  const replaced = A.setLastNonEmpty(input, 4);

  yield* Console.log(`A.setLastNonEmpty([1, 2, 3], 4) => ${formatUnknown(replaced)}`);
  yield* Console.log(`Original input remains => ${formatUnknown(input)}`);
});

const exampleCurriedInvocationAndContractNote = Effect.gen(function* () {
  const setClosed = A.setLastNonEmpty("closed");
  const queueUpdated = setClosed(["todo", "doing"] as const);
  const singleUpdated = setClosed(["solo"] as const);

  // Runtime is permissive here, but the API contract is a non-empty array input.
  const setLastNonEmptyRuntime = A.setLastNonEmpty as unknown as (
    self: ReadonlyArray<string>,
    value: string
  ) => ReadonlyArray<string>;
  const runtimePermissive = setLastNonEmptyRuntime([], "seed");

  yield* Console.log(`A.setLastNonEmpty("closed")(["todo", "doing"]) => ${formatUnknown(queueUpdated)}`);
  yield* Console.log(`A.setLastNonEmpty("closed")(["solo"]) => ${formatUnknown(singleUpdated)}`);
  yield* Console.log(`Runtime-only check with [] via runtime signature => ${formatUnknown(runtimePermissive)}`);
  yield* Console.log("Contract note: pass a NonEmptyReadonlyArray in normal typed usage.");
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
      description: "Inspect runtime metadata and callable arity for setLastNonEmpty.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Invocation",
      description: "Reproduce the documented call that replaces the last element.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Invocation + Contract Note",
      description: "Show data-last usage and clarify runtime-permissive empty-array behavior.",
      run: exampleCurriedInvocationAndContractNote,
    },
  ],
});

BunRuntime.runMain(program);
