/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: scan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Left-to-right fold that keeps every intermediate accumulator value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.scan([1, 2, 3, 4], 0, (acc, value) => acc + value)
 * console.log(result) // [0, 1, 3, 6, 10]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "scan";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Left-to-right fold that keeps every intermediate accumulator value.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.scan([1, 2, 3, 4], 0, (acc, value) => acc + value)\nconsole.log(result) // [0, 1, 3, 6, 10]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedRunningTotals = Effect.gen(function* () {
  const values = [1, 2, 3, 4];
  const runningTotals = A.scan(values, 0, (acc, value) => acc + value);

  yield* Console.log(`scan([1, 2, 3, 4], 0, +) -> ${JSON.stringify(runningTotals)}`);
  yield* Console.log(`output length = ${runningTotals.length} (input length + 1)`);
});

const exampleCurriedInventorySnapshots = Effect.gen(function* () {
  const inventoryChanges = [4, -1, -2, 6];
  const scanInventory = A.scan(10, (stock: number, change: number) => stock + change);
  const snapshots = scanInventory(inventoryChanges);
  const finalStock = snapshots[snapshots.length - 1];

  yield* Console.log(`scan(10, +change)([4, -1, -2, 6]) -> ${JSON.stringify(snapshots)}`);
  yield* Console.log(`final stock after changes -> ${finalStock}`);
});

const exampleEmptyInputKeepsInitial = Effect.gen(function* () {
  const result = A.scan([] as ReadonlyArray<number>, 42, (acc, value) => acc + value);

  yield* Console.log(`scan([], 42, +) -> ${JSON.stringify(result)}`);
  yield* Console.log("empty input keeps only the initial accumulator value");
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
      title: "Source-Aligned Running Totals",
      description: "Use the documented call shape and confirm scan includes the initial seed.",
      run: exampleSourceAlignedRunningTotals,
    },
    {
      title: "Curried Inventory Snapshots",
      description: "Use the data-last form to keep each intermediate inventory total.",
      run: exampleCurriedInventorySnapshots,
    },
    {
      title: "Empty Input Keeps Initial",
      description: "Show that scan always returns a non-empty output containing the initial value.",
      run: exampleEmptyInputKeepsInitial,
    },
  ],
});

BunRuntime.runMain(program);
