/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: findLast
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.234Z
 *
 * Overview:
 * Find the last element for which a predicate holds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * 
 * const numbers = [1, 3, 4, 6, 8, 2]
 * const lastEven = Iterable.findLast(numbers, (x) => x % 2 === 0)
 * console.log(lastEven) // Option.some(2)
 * 
 * const lastGreaterThan10 = Iterable.findLast(numbers, (x) => x > 10)
 * console.log(lastGreaterThan10) // Option.none()
 * 
 * // With index
 * const letters = ["a", "b", "c", "d", "e"]
 * const lastAtEvenIndex = Iterable.findLast(letters, (_, i) => i % 2 === 0)
 * console.log(lastAtEvenIndex) // Option.some("e") (index 4)
 * 
 * // Type refinement
 * const mixed: Array<string | number> = [1, "hello", 2, "world", 3]
 * const lastString = Iterable.findLast(
 *   mixed,
 *   (x): x is string => typeof x === "string"
 * )
 * console.log(lastString) // Option.some("world")
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as IterableModule from "effect/Iterable";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findLast";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Find the last element for which a predicate holds.";
const sourceExample = "import { Iterable } from \"effect\"\n\nconst numbers = [1, 3, 4, 6, 8, 2]\nconst lastEven = Iterable.findLast(numbers, (x) => x % 2 === 0)\nconsole.log(lastEven) // Option.some(2)\n\nconst lastGreaterThan10 = Iterable.findLast(numbers, (x) => x > 10)\nconsole.log(lastGreaterThan10) // Option.none()\n\n// With index\nconst letters = [\"a\", \"b\", \"c\", \"d\", \"e\"]\nconst lastAtEvenIndex = Iterable.findLast(letters, (_, i) => i % 2 === 0)\nconsole.log(lastAtEvenIndex) // Option.some(\"e\") (index 4)\n\n// Type refinement\nconst mixed: Array<string | number> = [1, \"hello\", 2, \"world\", 3]\nconst lastString = Iterable.findLast(\n  mixed,\n  (x): x is string => typeof x === \"string\"\n)\nconsole.log(lastString) // Option.some(\"world\")";
const moduleRecord = IterableModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
