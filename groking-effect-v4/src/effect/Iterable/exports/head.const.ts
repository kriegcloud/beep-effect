/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: head
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.235Z
 *
 * Overview:
 * Get the first element of a `Iterable`, or `None` if the `Iterable` is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * import * as Option from "effect/Option"
 * 
 * const numbers = [1, 2, 3]
 * console.log(Iterable.head(numbers)) // Option.some(1)
 * 
 * const empty = Iterable.empty<number>()
 * console.log(Iterable.head(empty)) // Option.none()
 * 
 * // Safe way to get first element
 * const firstEven = Iterable.head(
 *   Iterable.filter([1, 3, 4, 5], (x) => x % 2 === 0)
 * )
 * console.log(firstEven) // Option.some(4)
 * 
 * // Use with Option methods
 * const doubled = Option.map(Iterable.head([5, 10, 15]), (x) => x * 2)
 * console.log(doubled) // Option.some(10)
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
const exportName = "head";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Get the first element of a `Iterable`, or `None` if the `Iterable` is empty.";
const sourceExample = "import { Iterable } from \"effect\"\nimport * as Option from \"effect/Option\"\n\nconst numbers = [1, 2, 3]\nconsole.log(Iterable.head(numbers)) // Option.some(1)\n\nconst empty = Iterable.empty<number>()\nconsole.log(Iterable.head(empty)) // Option.none()\n\n// Safe way to get first element\nconst firstEven = Iterable.head(\n  Iterable.filter([1, 3, 4, 5], (x) => x % 2 === 0)\n)\nconsole.log(firstEven) // Option.some(4)\n\n// Use with Option methods\nconst doubled = Option.map(Iterable.head([5, 10, 15]), (x) => x * 2)\nconsole.log(doubled) // Option.some(10)";
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
