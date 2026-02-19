/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: contains
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.347Z
 *
 * Overview:
 * Tests whether an array contains a value, using `Equal.equivalence()` for comparison.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * console.log(pipe(["a", "b", "c", "d"], Array.contains("c"))) // true
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
import { pipe } from "effect/Function";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "contains";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Tests whether an array contains a value, using `Equal.equivalence()` for comparison.";
const sourceExample =
  'import { Array, pipe } from "effect"\n\nconsole.log(pipe(["a", "b", "c", "d"], Array.contains("c"))) // true';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedPipe = Effect.gen(function* () {
  const letters = ["a", "b", "c", "d"];
  const containsC = pipe(letters, A.contains("c"));
  const containsZ = pipe(letters, A.contains("z"));

  yield* Console.log(`pipe(["a", "b", "c", "d"], Array.contains("c")) => ${containsC}`);
  yield* Console.log(`pipe(["a", "b", "c", "d"], Array.contains("z")) => ${containsZ}`);
});

const exampleDataFirstInvocation = Effect.gen(function* () {
  const scores = [10, 20, 30];
  const has20 = A.contains(scores, 20);
  const has99 = A.contains(scores, 99);

  yield* Console.log(`Array.contains([10, 20, 30], 20) => ${has20}`);
  yield* Console.log(`Array.contains([10, 20, 30], 99) => ${has99}`);
});

const exampleStructuralEquality = Effect.gen(function* () {
  const users = [
    { id: 1, name: "Ada" },
    { id: 2, name: "Lin" },
  ];
  const lookup = { id: 2, name: "Lin" };

  const nativeIncludes = users.includes(lookup);
  const containsUser = A.contains(users, lookup);

  yield* Console.log(`users.includes(lookup) => ${nativeIncludes}`);
  yield* Console.log(`Array.contains(users, lookup) => ${containsUser}`);
  yield* Console.log("Array.contains uses Equal.equivalence() for comparison.");
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
      title: "Source-Aligned Curried Usage",
      description: "Use the documented pipe + partial-application style for membership checks.",
      run: exampleSourceAlignedPipe,
    },
    {
      title: "Data-First Invocation",
      description: "Call contains with (iterable, value) and observe true/false outcomes.",
      run: exampleDataFirstInvocation,
    },
    {
      title: "Equal.equivalence Semantics",
      description: "Compare native includes (reference) with Array.contains (structural).",
      run: exampleStructuralEquality,
    },
  ],
});

BunRuntime.runMain(program);
