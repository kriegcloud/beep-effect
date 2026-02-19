/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: headNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * Returns the first element of a `NonEmptyReadonlyArray` directly (no `Option` wrapper).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.headNonEmpty([1, 2, 3, 4])) // 1
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
const exportName = "headNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns the first element of a `NonEmptyReadonlyArray` directly (no `Option` wrapper).";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.headNonEmpty([1, 2, 3, 4])) // 1';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedNumbers = Effect.gen(function* () {
  const numbers = [1, 2, 3, 4] as const;
  const first = A.headNonEmpty(numbers);
  yield* Console.log(`A.headNonEmpty([1, 2, 3, 4]) => ${formatUnknown(first)}`);
});

const exampleDomainRecords = Effect.gen(function* () {
  type Job = {
    readonly id: string;
    readonly priority: "critical" | "high" | "normal";
    readonly attempt: number;
  };

  const queue: readonly [Job, ...Job[]] = [
    { id: "job-17", priority: "critical", attempt: 1 },
    { id: "job-22", priority: "high", attempt: 2 },
    { id: "job-35", priority: "normal", attempt: 1 },
  ];
  const head = A.headNonEmpty(queue);

  yield* Console.log(`First queued job => ${formatUnknown(head)}`);
  yield* Console.log("Contract note: headNonEmpty expects a genuinely non-empty array.");
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
      title: "Source-Aligned First Element",
      description: "Mirror the JSDoc usage and return the first number directly.",
      run: exampleSourceAlignedNumbers,
    },
    {
      title: "Non-Empty Record Queue",
      description: "Read the first record from a domain-like non-empty queue.",
      run: exampleDomainRecords,
    },
  ],
});

BunRuntime.runMain(program);
