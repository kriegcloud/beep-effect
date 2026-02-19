/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: flatMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.824Z
 *
 * Overview:
 * Chains over the entries of the `HashMap` using the specified function.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * 
 * const map1 = HashMap.make(["a", 1], ["b", 2])
 * const map2 = HashMap.flatMap(
 *   map1,
 *   (value, key) => HashMap.make([key + "1", value], [key + "2", value * 2])
 * )
 * 
 * console.log(HashMap.size(map2)) // 4
 * console.log(HashMap.get(map2, "a1")) // Option.some(1)
 * console.log(HashMap.get(map2, "b2")) // Option.some(4)
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
const exportName = "flatMap";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Chains over the entries of the `HashMap` using the specified function.";
const sourceExample = "import * as HashMap from \"effect/HashMap\"\n\nconst map1 = HashMap.make([\"a\", 1], [\"b\", 2])\nconst map2 = HashMap.flatMap(\n  map1,\n  (value, key) => HashMap.make([key + \"1\", value], [key + \"2\", value * 2])\n)\n\nconsole.log(HashMap.size(map2)) // 4\nconsole.log(HashMap.get(map2, \"a1\")) // Option.some(1)\nconsole.log(HashMap.get(map2, \"b2\")) // Option.some(4)";
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
