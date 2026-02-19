/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: findFirstWithIndex
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.348Z
 *
 * Overview:
 * Returns a tuple `[element, index]` of the first element matching a predicate, or `undefined` if none match.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.findFirstWithIndex([1, 2, 3, 4, 5], (x) => x > 3)) // [4, 3]
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
const exportName = "findFirstWithIndex";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Returns a tuple `[element, index]` of the first element matching a predicate, or `undefined` if none match.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.findFirstWithIndex([1, 2, 3, 4, 5], (x) => x > 3)) // [4, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect findFirstWithIndex runtime shape.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`findFirstWithIndex.length -> ${A.findFirstWithIndex.length}`);
});

const exampleSourceAlignedLookup = Effect.gen(function* () {
  const numbers = [1, 2, 3, 4, 5];
  const match = A.findFirstWithIndex(numbers, (n) => n > 3);

  yield* Console.log(`findFirstWithIndex([1, 2, 3, 4, 5], n > 3) -> ${JSON.stringify(match)}`);
  if (match !== undefined) {
    const [value, index] = match;
    yield* Console.log(`first match value=${value} index=${index}`);
  }
});

const exampleCurriedNoMatchAndMatch = Effect.gen(function* () {
  type Ticket = { readonly id: string; readonly priority: number };
  const isHighPriorityTicket = (ticket: unknown): ticket is Ticket =>
    typeof ticket === "object" &&
    ticket !== null &&
    "id" in ticket &&
    typeof (ticket as { readonly id: unknown }).id === "string" &&
    "priority" in ticket &&
    typeof (ticket as { readonly priority: unknown }).priority === "number" &&
    (ticket as { readonly priority: number }).priority >= 5;
  const findHighPriority = A.findFirstWithIndex(isHighPriorityTicket);
  const backlog: ReadonlyArray<Ticket> = [
    { id: "T-101", priority: 1 },
    { id: "T-102", priority: 3 },
  ];
  const escalations: ReadonlyArray<Ticket> = [
    { id: "T-201", priority: 2 },
    { id: "T-202", priority: 5 },
    { id: "T-203", priority: 4 },
  ];

  yield* Console.log(`findFirstWithIndex(priority >= 5)(backlog) -> ${JSON.stringify(findHighPriority(backlog))}`);
  yield* Console.log(
    `findFirstWithIndex(priority >= 5)(escalations) -> ${JSON.stringify(findHighPriority(escalations))}`
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
      description: "Inspect export metadata and the function arity exposed at runtime.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Lookup",
      description: "Run the documented value-and-index lookup where a match is present.",
      run: exampleSourceAlignedLookup,
    },
    {
      title: "Curried Lookup With And Without Matches",
      description: "Use the predicate-first form to show both undefined and tuple results.",
      run: exampleCurriedNoMatchAndMatch,
    },
  ],
});

BunRuntime.runMain(program);
