/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: isReadonlyArrayNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Tests whether a `ReadonlyArray` is non-empty, narrowing the type to `NonEmptyReadonlyArray`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.isReadonlyArrayNonEmpty([])) // false
 * console.log(Array.isReadonlyArrayNonEmpty([1, 2, 3])) // true
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
const exportName = "isReadonlyArrayNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Tests whether a `ReadonlyArray` is non-empty, narrowing the type to `NonEmptyReadonlyArray`.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.isReadonlyArrayNonEmpty([])) // false\nconsole.log(Array.isReadonlyArrayNonEmpty([1, 2, 3])) // true';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the runtime export metadata and function preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedChecks = Effect.gen(function* () {
  const empty: ReadonlyArray<number> = [];
  const nonEmpty: ReadonlyArray<number> = [1, 2, 3];
  yield* Console.log(`isReadonlyArrayNonEmpty([]) -> ${A.isReadonlyArrayNonEmpty(empty)}`);
  yield* Console.log(`isReadonlyArrayNonEmpty([1,2,3]) -> ${A.isReadonlyArrayNonEmpty(nonEmpty)}`);
});

const exampleGuardedNonEmptyUsage = Effect.gen(function* () {
  const candidates: ReadonlyArray<ReadonlyArray<number>> = [[], [10, 20, 30]];

  for (const candidate of candidates) {
    if (A.isReadonlyArrayNonEmpty(candidate)) {
      const headByIndex = candidate[0];
      const headByApi = A.headNonEmpty(candidate);
      yield* Console.log(
        `candidate=${JSON.stringify(candidate)} -> non-empty=true; head(index)=${headByIndex}; head(api)=${headByApi}`
      );
    } else {
      yield* Console.log(`candidate=${JSON.stringify(candidate)} -> non-empty=false; skipped non-empty APIs`);
    }
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
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Boolean Checks",
      description: "Run the documented empty/non-empty inputs and log the boolean outcomes.",
      run: exampleSourceAlignedChecks,
    },
    {
      title: "Guarded Non-Empty Flow",
      description: "Use the predicate before accessing guaranteed head values on readonly arrays.",
      run: exampleGuardedNonEmptyUsage,
    },
  ],
});

BunRuntime.runMain(program);
