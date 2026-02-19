/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: unionWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.370Z
 *
 * Overview:
 * Computes the union of two arrays using a custom equivalence, removing duplicates.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.unionWith([1, 2], [2, 3], (a, b) => a === b)) // [1, 2, 3]
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
const exportName = "unionWith";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Computes the union of two arrays using a custom equivalence, removing duplicates.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.unionWith([1, 2], [2, 3], (a, b) => a === b)) // [1, 2, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export and confirm it is a callable union builder.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedUnion = Effect.gen(function* () {
  const equalsNumber = (left: number, right: number) => left === right;
  const direct = A.unionWith([1, 2], [2, 3], equalsNumber);
  const curried = A.unionWith([2, 3], equalsNumber)([1, 2]);

  yield* Console.log(`unionWith([1,2],[2,3],===) -> [${direct.join(", ")}]`);
  yield* Console.log(`unionWith([2,3],===)([1,2]) -> [${curried.join(", ")}]`);
});

const exampleObjectUnionById = Effect.gen(function* () {
  type User = { readonly id: number; readonly name: string };
  const localUsers: ReadonlyArray<User> = [
    { id: 1, name: "Ada" },
    { id: 2, name: "Grace" },
    { id: 1, name: "Ada Duplicate" },
  ];
  const remoteUsers: ReadonlyArray<User> = [
    { id: 2, name: "Grace Hopper" },
    { id: 3, name: "Edsger" },
  ];
  const unionById = A.unionWith(localUsers, remoteUsers, (left, right) => left.id === right.id);

  yield* Console.log(`unionById ids -> [${unionById.map((user) => user.id).join(", ")}]`);
  yield* Console.log(`unionById names -> [${unionById.map((user) => user.name).join(", ")}]`);
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
      title: "Source-Aligned Union",
      description: "Run the documented numeric union and compare direct vs curried invocation forms.",
      run: exampleSourceAlignedUnion,
    },
    {
      title: "Object Union by ID",
      description: "Union object arrays with custom ID equivalence to show dedupe and ordering behavior.",
      run: exampleObjectUnionById,
    },
  ],
});

BunRuntime.runMain(program);
