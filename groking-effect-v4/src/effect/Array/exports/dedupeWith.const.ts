/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: dedupeWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.347Z
 *
 * Overview:
 * Removes duplicates using a custom equivalence, preserving the order of the first occurrence.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.dedupeWith([1, 2, 2, 3, 3, 3], (a, b) => a === b)) // [1, 2, 3]
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
const exportName = "dedupeWith";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Removes duplicates using a custom equivalence, preserving the order of the first occurrence.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.dedupeWith([1, 2, 2, 3, 3, 3], (a, b) => a === b)) // [1, 2, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape and confirm dedupeWith is a callable export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  const dedupeWithValue = moduleRecord[exportName];
  if (typeof dedupeWithValue === "function") {
    yield* Console.log(`function.length hint -> ${dedupeWithValue.length}`);
  }
});

const exampleSourceAlignedTwoArgumentUsage = Effect.gen(function* () {
  const input = [1, 2, 2, 3, 3, 3];
  const deduped = A.dedupeWith(input, (left, right) => left === right);

  yield* Console.log(`dedupeWith([1, 2, 2, 3, 3, 3], strictEq) -> [${deduped.join(", ")}]`);
  yield* Console.log(`input preserved -> [${input.join(", ")}]`);
});

const exampleCurriedCustomEquivalence = Effect.gen(function* () {
  type User = { readonly id: number; readonly name: string };
  const users: ReadonlyArray<User> = [
    { id: 1, name: "Ada" },
    { id: 1, name: "Ada Lovelace" },
    { id: 2, name: "Grace" },
    { id: 2, name: "Grace Hopper" },
    { id: 3, name: "Linus" },
  ];
  const dedupeById = A.dedupeWith((left: User, right: User) => left.id === right.id);
  const deduped = dedupeById(users);

  yield* Console.log(`dedupeById(users) -> [${deduped.map((user) => `${user.id}:${user.name}`).join(", ")}]`);
  yield* Console.log(`first id=2 occurrence retained -> ${deduped[1] === users[2]}`);
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
      description: "Inspect module export count, runtime type, and callable arity hint.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Two-Argument Usage",
      description: "Run the JSDoc input with strict equality and verify order-preserving deduplication.",
      run: exampleSourceAlignedTwoArgumentUsage,
    },
    {
      title: "Curried Custom Equivalence",
      description: "Use the curried form to dedupe objects by id while retaining first occurrences.",
      run: exampleCurriedCustomEquivalence,
    },
  ],
});

BunRuntime.runMain(program);
