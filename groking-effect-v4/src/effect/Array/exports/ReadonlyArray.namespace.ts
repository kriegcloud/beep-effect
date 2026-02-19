/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: ReadonlyArray
 * Kind: namespace
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Utility types for working with `ReadonlyArray` at the type level. Use these to infer element types, preserve non-emptiness, and flatten nested arrays.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectTypeLikeExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ReadonlyArray";
const exportKind = "namespace";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Utility types for working with `ReadonlyArray` at the type level. Use these to infer element types, preserve non-emptiness, and flatten nested arrays.";
const sourceExample = "";
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeErasure = Effect.gen(function* () {
  yield* Console.log("`Array.ReadonlyArray` is a type-only namespace and is erased at runtime.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
  yield* Console.log("Use `Array.ReadonlyArray.*` only in type positions (`import type`).");
});

const exampleRuntimeAlignment = Effect.gen(function* () {
  const nested: ReadonlyArray<ReadonlyArray<number>> = [[1, 2], [3]];
  const flattened = A.flatten(nested);

  yield* Console.log(`flatten([[1, 2], [3]]) -> ${JSON.stringify(flattened)}`);

  const nonEmpty = A.isReadonlyArrayNonEmpty(flattened);
  yield* Console.log(`isReadonlyArrayNonEmpty(flattened) -> ${nonEmpty}`);

  if (nonEmpty) {
    yield* Console.log(`headNonEmpty(flattened) -> ${A.headNonEmpty(flattened)}`);
  }
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
      title: "Type-Only Namespace Erasure",
      description: "Show that `ReadonlyArray` is a compile-time namespace with no runtime value.",
      run: exampleTypeErasure,
    },
    {
      title: "Runtime APIs Aligned With ReadonlyArray Types",
      description: "Use `flatten` and non-empty narrowing to mirror `Flatten` / non-empty type semantics.",
      run: exampleRuntimeAlignment,
    },
  ],
});

BunRuntime.runMain(program);
