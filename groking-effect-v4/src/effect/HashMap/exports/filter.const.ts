/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.824Z
 *
 * Overview:
 * Filters entries out of a `HashMap` using the specified predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * 
 * const map1 = HashMap.make(["a", 1], ["b", 2], ["c", 3], ["d", 4])
 * const map2 = HashMap.filter(map1, (value) => value % 2 === 0)
 * 
 * console.log(HashMap.size(map2)) // 2
 * console.log(HashMap.has(map2, "b")) // true
 * console.log(HashMap.has(map2, "d")) // true
 * console.log(HashMap.has(map2, "a")) // false
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
import * as HashMapModule from "effect/HashMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Filters entries out of a `HashMap` using the specified predicate.";
const sourceExample = "import * as HashMap from \"effect/HashMap\"\n\nconst map1 = HashMap.make([\"a\", 1], [\"b\", 2], [\"c\", 3], [\"d\", 4])\nconst map2 = HashMap.filter(map1, (value) => value % 2 === 0)\n\nconsole.log(HashMap.size(map2)) // 2\nconsole.log(HashMap.has(map2, \"b\")) // true\nconsole.log(HashMap.has(map2, \"d\")) // true\nconsole.log(HashMap.has(map2, \"a\")) // false";
const moduleRecord = HashMapModule as Record<string, unknown>;

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
