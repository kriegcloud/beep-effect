/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: findFirst
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.234Z
 *
 * Overview:
 * Returns the first element that satisfies the specified predicate, or `None` if no such element exists.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * import * as Option from "effect/Option"
 * 
 * const numbers = [1, 3, 4, 6, 8]
 * const firstEven = Iterable.findFirst(numbers, (x) => x % 2 === 0)
 * console.log(firstEven) // Option.some(4)
 * 
 * const firstGreaterThan10 = Iterable.findFirst(numbers, (x) => x > 10)
 * console.log(firstGreaterThan10) // Option.none()
 * 
 * // With index
 * const letters = ["a", "b", "c", "d"]
 * const atEvenIndex = Iterable.findFirst(letters, (_, i) => i % 2 === 0)
 * console.log(atEvenIndex) // Option.some("a")
 * 
 * // Type refinement
 * const mixed: Array<string | number> = [1, "hello", 2, "world"]
 * const firstString = Iterable.findFirst(
 *   mixed,
 *   (x): x is string => typeof x === "string"
 * )
 * console.log(firstString) // Option.some("hello")
 * 
 * // Transform during search
 * const findSquareRoot = Iterable.findFirst([1, 4, 9, 16], (x) => {
 *   const sqrt = Math.sqrt(x)
 *   return Number.isInteger(sqrt) ? Option.some(sqrt) : Option.none()
 * })
 * console.log(findSquareRoot) // Option.some(1)
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
const exportName = "findFirst";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Returns the first element that satisfies the specified predicate, or `None` if no such element exists.";
const sourceExample = "import { Iterable } from \"effect\"\nimport * as Option from \"effect/Option\"\n\nconst numbers = [1, 3, 4, 6, 8]\nconst firstEven = Iterable.findFirst(numbers, (x) => x % 2 === 0)\nconsole.log(firstEven) // Option.some(4)\n\nconst firstGreaterThan10 = Iterable.findFirst(numbers, (x) => x > 10)\nconsole.log(firstGreaterThan10) // Option.none()\n\n// With index\nconst letters = [\"a\", \"b\", \"c\", \"d\"]\nconst atEvenIndex = Iterable.findFirst(letters, (_, i) => i % 2 === 0)\nconsole.log(atEvenIndex) // Option.some(\"a\")\n\n// Type refinement\nconst mixed: Array<string | number> = [1, \"hello\", 2, \"world\"]\nconst firstString = Iterable.findFirst(\n  mixed,\n  (x): x is string => typeof x === \"string\"\n)\nconsole.log(firstString) // Option.some(\"hello\")\n\n// Transform during search\nconst findSquareRoot = Iterable.findFirst([1, 4, 9, 16], (x) => {\n  const sqrt = Math.sqrt(x)\n  return Number.isInteger(sqrt) ? Option.some(sqrt) : Option.none()\n})\nconsole.log(findSquareRoot) // Option.some(1)";
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
