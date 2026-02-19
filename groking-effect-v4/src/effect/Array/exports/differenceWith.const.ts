/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: differenceWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.348Z
 *
 * Overview:
 * Computes elements in the first array that are not in the second, using a custom equivalence.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const diff = Array.differenceWith<number>((a, b) => a === b)([1, 2, 3], [2, 3, 4])
 * console.log(diff) // [1]
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
const exportName = "differenceWith";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Computes elements in the first array that are not in the second, using a custom equivalence.";
const sourceExample =
  'import { Array } from "effect"\n\nconst diff = Array.differenceWith<number>((a, b) => a === b)([1, 2, 3], [2, 3, 4])\nconsole.log(diff) // [1]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export to confirm it is a higher-order function.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedDifference = Effect.gen(function* () {
  const differenceNumber = A.differenceWith<number>((a, b) => a === b);
  const baseline = differenceNumber([1, 2, 3], [2, 3, 4]);
  const noOverlap = differenceNumber([1, 2], [7, 8]);

  yield* Console.log(`differenceWith(===)([1,2,3],[2,3,4]) -> [${baseline.join(", ")}]`);
  yield* Console.log(`differenceWith(===)([1,2],[7,8]) -> [${noOverlap.join(", ")}]`);
});

const exampleCustomEquivalenceDifference = Effect.gen(function* () {
  type User = { readonly id: number; readonly name: string };
  const currentUsers: ReadonlyArray<User> = [
    { id: 1, name: "Ada" },
    { id: 2, name: "Grace" },
    { id: 3, name: "Edsger" },
  ];
  const syncedUsers: ReadonlyArray<User> = [
    { id: 2, name: "Grace Hopper" },
    { id: 4, name: "Barbara" },
  ];
  const differenceById = A.differenceWith<User>((left, right) => left.id === right.id);
  const missingById = differenceById(syncedUsers)(currentUsers);
  const twoArgumentResult = differenceById(currentUsers, syncedUsers);

  yield* Console.log(`differenceById(syncedUsers)(currentUsers) -> [${missingById.map((user) => user.id).join(", ")}]`);
  yield* Console.log(
    `differenceById(currentUsers, syncedUsers) -> [${twoArgumentResult.map((user) => user.id).join(", ")}]`
  );
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
      title: "Source-Aligned Difference",
      description: "Use the source-style equality comparator and compare overlap vs no-overlap inputs.",
      run: exampleSourceAlignedDifference,
    },
    {
      title: "Custom Equivalence by ID",
      description: "Compare objects by ID and show both curried and two-argument invocation forms.",
      run: exampleCustomEquivalenceDifference,
    },
  ],
});

BunRuntime.runMain(program);
