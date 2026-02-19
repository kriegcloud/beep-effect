/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/NonEmptyIterable
 * Export: NonEmptyIterable
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/NonEmptyIterable.ts
 * Generated: 2026-02-19T04:14:15.182Z
 *
 * Overview:
 * Represents an iterable that is guaranteed to contain at least one element.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 * import * as Chunk from "effect/Chunk"
 * import * as NonEmptyIterable from "effect/NonEmptyIterable"
 * 
 * // Function that requires non-empty data
 * function getFirst<A>(data: NonEmptyIterable.NonEmptyIterable<A>): A {
 *   // Safe - guaranteed to have at least one element
 *   const [first] = NonEmptyIterable.unprepend(data)
 *   return first
 * }
 * 
 * // Works with any non-empty iterable
 * const numbers = Array.make(
 *   1,
 *   2,
 *   3
 * ) as unknown as NonEmptyIterable.NonEmptyIterable<number>
 * const firstNumber = getFirst(numbers) // 1
 * 
 * const chars = "hello" as unknown as NonEmptyIterable.NonEmptyIterable<string>
 * const firstChar = getFirst(chars) // "h"
 * 
 * const entries = new Map([["a", 1], [
 *   "b",
 *   2
 * ]]) as unknown as NonEmptyIterable.NonEmptyIterable<[string, number]>
 * const firstEntry = getFirst(entries) // ["a", 1]
 * 
 * // Custom generator
 * function* countdown(): Generator<number> {
 *   yield 3
 *   yield 2
 *   yield 1
 * }
 * const firstCount = getFirst(
 *   Chunk.fromIterable(
 *     countdown()
 *   ) as unknown as NonEmptyIterable.NonEmptyIterable<number>
 * ) // 3
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as NonEmptyIterableModule from "effect/NonEmptyIterable";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "NonEmptyIterable";
const exportKind = "interface";
const moduleImportPath = "effect/NonEmptyIterable";
const sourceSummary = "Represents an iterable that is guaranteed to contain at least one element.";
const sourceExample = "import { Array } from \"effect\"\nimport * as Chunk from \"effect/Chunk\"\nimport * as NonEmptyIterable from \"effect/NonEmptyIterable\"\n\n// Function that requires non-empty data\nfunction getFirst<A>(data: NonEmptyIterable.NonEmptyIterable<A>): A {\n  // Safe - guaranteed to have at least one element\n  const [first] = NonEmptyIterable.unprepend(data)\n  return first\n}\n\n// Works with any non-empty iterable\nconst numbers = Array.make(\n  1,\n  2,\n  3\n) as unknown as NonEmptyIterable.NonEmptyIterable<number>\nconst firstNumber = getFirst(numbers) // 1\n\nconst chars = \"hello\" as unknown as NonEmptyIterable.NonEmptyIterable<string>\nconst firstChar = getFirst(chars) // \"h\"\n\nconst entries = new Map([[\"a\", 1], [\n  \"b\",\n  2\n]]) as unknown as NonEmptyIterable.NonEmptyIterable<[string, number]>\nconst firstEntry = getFirst(entries) // [\"a\", 1]\n\n// Custom generator\nfunction* countdown(): Generator<number> {\n  yield 3\n  yield 2\n  yield 1\n}\nconst firstCount = getFirst(\n  Chunk.fromIterable(\n    countdown()\n  ) as unknown as NonEmptyIterable.NonEmptyIterable<number>\n) // 3";
const moduleRecord = NonEmptyIterableModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
