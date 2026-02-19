/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: prepend
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.235Z
 *
 * Overview:
 * Prepend an element to the front of an `Iterable`, creating a new `Iterable`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * 
 * const numbers = [2, 3, 4]
 * const withOne = Iterable.prepend(numbers, 1)
 * console.log(Array.from(withOne)) // [1, 2, 3, 4]
 * 
 * // Works with any iterable
 * const letters = "abc"
 * const withZ = Iterable.prepend(letters, "z")
 * console.log(Array.from(withZ)) // ["z", "a", "b", "c"]
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
const exportName = "prepend";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Prepend an element to the front of an `Iterable`, creating a new `Iterable`.";
const sourceExample = "import { Iterable } from \"effect\"\n\nconst numbers = [2, 3, 4]\nconst withOne = Iterable.prepend(numbers, 1)\nconsole.log(Array.from(withOne)) // [1, 2, 3, 4]\n\n// Works with any iterable\nconst letters = \"abc\"\nconst withZ = Iterable.prepend(letters, \"z\")\nconsole.log(Array.from(withZ)) // [\"z\", \"a\", \"b\", \"c\"]";
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
