/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: sortBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Sorts an array by multiple `Order`s applied in sequence: the first order is used first; ties are broken by the second order, and so on.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Order, pipe } from "effect"
 *
 * const users = [
 *   { name: "Alice", age: 30 },
 *   { name: "Bob", age: 25 },
 *   { name: "Charlie", age: 30 }
 * ]
 *
 * const result = pipe(
 *   users,
 *   Array.sortBy(
 *     Order.mapInput(Order.Number, (user: (typeof users)[number]) => user.age),
 *     Order.mapInput(Order.String, (user: (typeof users)[number]) => user.name)
 *   )
 * )
 * console.log(result)
 * // [{ name: "Bob", age: 25 }, { name: "Alice", age: 30 }, { name: "Charlie", age: 30 }]
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
import * as Order from "effect/Order";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "sortBy";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Sorts an array by multiple `Order`s applied in sequence: the first order is used first; ties are broken by the second order, and so on.";
const sourceExample =
  'import { Array, Order, pipe } from "effect"\n\nconst users = [\n  { name: "Alice", age: 30 },\n  { name: "Bob", age: 25 },\n  { name: "Charlie", age: 30 }\n]\n\nconst result = pipe(\n  users,\n  Array.sortBy(\n    Order.mapInput(Order.Number, (user: (typeof users)[number]) => user.age),\n    Order.mapInput(Order.String, (user: (typeof users)[number]) => user.name)\n  )\n)\nconsole.log(result)\n// [{ name: "Bob", age: 25 }, { name: "Alice", age: 30 }, { name: "Charlie", age: 30 }]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect sortBy as a runtime value before running sorting scenarios.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const users = [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
    { name: "Charlie", age: 30 },
  ] as const;

  const byAge = Order.mapInput(Order.Number, (user: (typeof users)[number]) => user.age);
  const byName = Order.mapInput(Order.String, (user: (typeof users)[number]) => user.name);
  const sorted = A.sortBy(byAge, byName)(users);

  yield* Console.log(`users: ${formatUnknown(users)}`);
  yield* Console.log(`A.sortBy(byAge, byName)(users): ${formatUnknown(sorted)}`);
});

const exampleTieBreakerSequence = Effect.gen(function* () {
  const builds = [
    { id: "b3", status: "failed", durationMs: 3100 },
    { id: "b1", status: "passed", durationMs: 2400 },
    { id: "b2", status: "failed", durationMs: 1800 },
    { id: "b4", status: "passed", durationMs: 800 },
  ] as const;

  const byStatus = Order.mapInput(Order.String, (build: (typeof builds)[number]) => build.status);
  const byDuration = Order.mapInput(Order.Number, (build: (typeof builds)[number]) => build.durationMs);
  const sortBuilds = A.sortBy(byStatus, byDuration);
  const sortedBuilds = sortBuilds(builds);
  const orderedIds = sortedBuilds.map((build) => build.id);

  yield* Console.log(`ordered build ids: ${formatUnknown(orderedIds)}`);
  yield* Console.log("status is the primary key; duration breaks ties within each status.");
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
      description: "Sort users by age and then by name using the documented Order.mapInput pattern.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Tie-Breaker Sequence",
      description: "Show that the first order groups results and the second order resolves ties.",
      run: exampleTieBreakerSequence,
    },
  ],
});

BunRuntime.runMain(program);
