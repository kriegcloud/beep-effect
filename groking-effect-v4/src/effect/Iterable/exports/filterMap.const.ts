/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: filterMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.234Z
 *
 * Overview:
 * Transforms elements of an iterable using a function that returns an Option, keeping only the Some values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * import * as Option from "effect/Option"
 * 
 * // Parse strings to numbers, keeping only valid ones
 * const strings = ["1", "2", "invalid", "4", "not-a-number"]
 * const numbers = Iterable.filterMap(strings, (s) => {
 *   const num = parseInt(s)
 *   return isNaN(num) ? Option.none() : Option.some(num)
 * })
 * console.log(Array.from(numbers)) // [1, 2, 4]
 * 
 * // Extract specific properties from objects
 * const users = [
 *   { name: "Alice", age: 25, email: "alice@example.com" },
 *   { name: "Bob", age: 17, email: undefined },
 *   { name: "Charlie", age: 30, email: "charlie@example.com" },
 *   { name: "David", age: 16, email: undefined }
 * ]
 * const adultEmails = Iterable.filterMap(
 *   users,
 *   (user) =>
 *     user.age >= 18 && user.email ? Option.some(user.email) : Option.none()
 * )
 * console.log(Array.from(adultEmails)) // ["alice@example.com", "charlie@example.com"]
 * 
 * // Use index in transformation
 * const items = ["a", "b", "c", "d", "e"]
 * const evenIndexItems = Iterable.filterMap(
 *   items,
 *   (item, i) => i % 2 === 0 ? Option.some(`${i}: ${item}`) : Option.none()
 * )
 * console.log(Array.from(evenIndexItems)) // ["0: a", "2: c", "4: e"]
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
const exportName = "filterMap";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Transforms elements of an iterable using a function that returns an Option, keeping only the Some values.";
const sourceExample = "import { Iterable } from \"effect\"\nimport * as Option from \"effect/Option\"\n\n// Parse strings to numbers, keeping only valid ones\nconst strings = [\"1\", \"2\", \"invalid\", \"4\", \"not-a-number\"]\nconst numbers = Iterable.filterMap(strings, (s) => {\n  const num = parseInt(s)\n  return isNaN(num) ? Option.none() : Option.some(num)\n})\nconsole.log(Array.from(numbers)) // [1, 2, 4]\n\n// Extract specific properties from objects\nconst users = [\n  { name: \"Alice\", age: 25, email: \"alice@example.com\" },\n  { name: \"Bob\", age: 17, email: undefined },\n  { name: \"Charlie\", age: 30, email: \"charlie@example.com\" },\n  { name: \"David\", age: 16, email: undefined }\n]\nconst adultEmails = Iterable.filterMap(\n  users,\n  (user) =>\n    user.age >= 18 && user.email ? Option.some(user.email) : Option.none()\n)\nconsole.log(Array.from(adultEmails)) // [\"alice@example.com\", \"charlie@example.com\"]\n\n// Use index in transformation\nconst items = [\"a\", \"b\", \"c\", \"d\", \"e\"]\nconst evenIndexItems = Iterable.filterMap(\n  items,\n  (item, i) => i % 2 === 0 ? Option.some(`${i}: ${item}`) : Option.none()\n)\nconsole.log(Array.from(evenIndexItems)) // [\"0: a\", \"2: c\", \"4: e\"]";
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
