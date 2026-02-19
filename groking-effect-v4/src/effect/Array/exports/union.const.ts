/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: union
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.370Z
 *
 * Overview:
 * Computes the union of two arrays, removing duplicates using `Equal.equivalence()`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.union([1, 2], [2, 3])) // [1, 2, 3]
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
const exportName = "union";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Computes the union of two arrays, removing duplicates using `Equal.equivalence()`.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.union([1, 2], [2, 3])) // [1, 2, 3]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedUnion = Effect.gen(function* () {
  const left = [1, 2, 2];
  const right = [2, 3, 4];
  const merged = A.union(left, right);

  yield* Console.log(`union([1, 2, 2], [2, 3, 4]) -> ${JSON.stringify(merged)}`);
  yield* Console.log(`inputs unchanged -> left=${JSON.stringify(left)}, right=${JSON.stringify(right)}`);
});

const exampleCurriedUnion = Effect.gen(function* () {
  const unionWithDefaults = A.union(["cpu", "memory"]);
  const merged = unionWithDefaults(["disk", "cpu"]);

  yield* Console.log(`union(["cpu", "memory"])(["disk", "cpu"]) -> ${JSON.stringify(merged)}`);
});

const exampleReferenceEqualityUnion = Effect.gen(function* () {
  const shared = { id: 1 };
  const left = [shared, { id: 2 }];
  const right = [shared, { id: 2 }];
  const merged = A.union(left, right);

  yield* Console.log(`shared reference deduped -> length=${merged.length}`);
  yield* Console.log(`union(left, right) -> ${JSON.stringify(merged)}`);
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
      title: "Source-Aligned Union",
      description: "Use the documented two-argument form and show duplicate removal across both inputs.",
      run: exampleSourceAlignedUnion,
    },
    {
      title: "Curried Union",
      description: "Use data-last style to merge a live list with default dimensions.",
      run: exampleCurriedUnion,
    },
    {
      title: "Reference Equality Behavior",
      description: "Show that repeated references are deduplicated while distinct object literals remain.",
      run: exampleReferenceEqualityUnion,
    },
  ],
});

BunRuntime.runMain(program);
