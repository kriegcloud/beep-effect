/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: groupBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * Groups elements into a record by a key-returning function. Each key maps to a `NonEmptyArray` of elements that produced that key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const people = [
 *   { name: "Alice", group: "A" },
 *   { name: "Bob", group: "B" },
 *   { name: "Charlie", group: "A" }
 * ]
 *
 * const result = Array.groupBy(people, (person) => person.group)
 * console.log(result)
 * // { A: [{ name: "Alice", group: "A" }, { name: "Charlie", group: "A" }], B: [{ name: "Bob", group: "B" }] }
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
const exportName = "groupBy";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Groups elements into a record by a key-returning function. Each key maps to a `NonEmptyArray` of elements that produced that key.";
const sourceExample =
  'import { Array } from "effect"\n\nconst people = [\n  { name: "Alice", group: "A" },\n  { name: "Bob", group: "B" },\n  { name: "Charlie", group: "A" }\n]\n\nconst result = Array.groupBy(people, (person) => person.group)\nconsole.log(result)\n// { A: [{ name: "Alice", group: "A" }, { name: "Charlie", group: "A" }], B: [{ name: "Bob", group: "B" }] }';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect groupBy as a runtime value before invoking it.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const people = [
    { name: "Alice", group: "A" },
    { name: "Bob", group: "B" },
    { name: "Charlie", group: "A" },
  ];
  const grouped = A.groupBy(people, (person) => person.group);
  yield* Console.log(`groupBy(people, person => person.group): ${JSON.stringify(grouped)}`);
});

const exampleBucketSemantics = Effect.gen(function* () {
  const numbers = [-2, -1, 0, 1, 2, 3];
  const grouped = A.groupBy(numbers, (n) => (n < 0 ? "negative" : n === 0 ? "zero" : "positive"));
  const emptyGrouped = A.groupBy([] as Array<number>, (n) => (n % 2 === 0 ? "even" : "odd"));

  yield* Console.log(`groupBy(numbers, sign): ${JSON.stringify(grouped)}`);
  yield* Console.log(`groupBy([], parity): ${JSON.stringify(emptyGrouped)}`);
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
      title: "Source-Aligned Grouping",
      description: "Group people by their group field using the documented call shape.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Bucket Semantics",
      description: "Show grouping by derived keys and the empty-array edge case.",
      run: exampleBucketSemantics,
    },
  ],
});

BunRuntime.runMain(program);
