/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: setMany
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.825Z
 *
 * Overview:
 * Sets multiple key-value pairs in the `HashMap`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * 
 * const map1 = HashMap.make(["a", 1], ["b", 2])
 * const newEntries = [["c", 3], ["d", 4], ["a", 10]] as const // "a" will be overwritten
 * const map2 = HashMap.setMany(map1, newEntries)
 * 
 * console.log(HashMap.size(map2)) // 4
 * console.log(HashMap.get(map2, "a")) // Option.some(10)
 * console.log(HashMap.get(map2, "c")) // Option.some(3)
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
const exportName = "setMany";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Sets multiple key-value pairs in the `HashMap`.";
const sourceExample = "import * as HashMap from \"effect/HashMap\"\n\nconst map1 = HashMap.make([\"a\", 1], [\"b\", 2])\nconst newEntries = [[\"c\", 3], [\"d\", 4], [\"a\", 10]] as const // \"a\" will be overwritten\nconst map2 = HashMap.setMany(map1, newEntries)\n\nconsole.log(HashMap.size(map2)) // 4\nconsole.log(HashMap.get(map2, \"a\")) // Option.some(10)\nconsole.log(HashMap.get(map2, \"c\")) // Option.some(3)";
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
