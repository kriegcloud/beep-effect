/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: intersperse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.235Z
 *
 * Overview:
 * Places an element in between members of an `Iterable`. If the input is a non-empty array, the result is also a non-empty array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * 
 * // Join numbers with separator
 * const numbers = [1, 2, 3, 4]
 * const withCommas = Iterable.intersperse(numbers, ",")
 * console.log(Array.from(withCommas)) // [1, ",", 2, ",", 3, ",", 4]
 * 
 * // Join words with spaces
 * const words = ["hello", "world", "from", "effect"]
 * const sentence = Iterable.intersperse(words, " ")
 * console.log(Array.from(sentence).join("")) // "hello world from effect"
 * 
 * // Empty iterable remains empty
 * const empty = Iterable.empty<string>()
 * const stillEmpty = Iterable.intersperse(empty, "-")
 * console.log(Array.from(stillEmpty)) // []
 * 
 * // Single element has no separators added
 * const single = [42]
 * const noSeparator = Iterable.intersperse(single, "|")
 * console.log(Array.from(noSeparator)) // [42]
 * 
 * // Build CSS-like strings
 * const styles = ["color: red", "font-size: 14px", "margin: 10px"]
 * const css = Iterable.intersperse(styles, "; ")
 * console.log(Array.from(css).join("")) // "color: red; font-size: 14px; margin: 10px"
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
const exportName = "intersperse";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Places an element in between members of an `Iterable`. If the input is a non-empty array, the result is also a non-empty array.";
const sourceExample = "import { Iterable } from \"effect\"\n\n// Join numbers with separator\nconst numbers = [1, 2, 3, 4]\nconst withCommas = Iterable.intersperse(numbers, \",\")\nconsole.log(Array.from(withCommas)) // [1, \",\", 2, \",\", 3, \",\", 4]\n\n// Join words with spaces\nconst words = [\"hello\", \"world\", \"from\", \"effect\"]\nconst sentence = Iterable.intersperse(words, \" \")\nconsole.log(Array.from(sentence).join(\"\")) // \"hello world from effect\"\n\n// Empty iterable remains empty\nconst empty = Iterable.empty<string>()\nconst stillEmpty = Iterable.intersperse(empty, \"-\")\nconsole.log(Array.from(stillEmpty)) // []\n\n// Single element has no separators added\nconst single = [42]\nconst noSeparator = Iterable.intersperse(single, \"|\")\nconsole.log(Array.from(noSeparator)) // [42]\n\n// Build CSS-like strings\nconst styles = [\"color: red\", \"font-size: 14px\", \"margin: 10px\"]\nconst css = Iterable.intersperse(styles, \"; \")\nconsole.log(Array.from(css).join(\"\")) // \"color: red; font-size: 14px; margin: 10px\"";
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
