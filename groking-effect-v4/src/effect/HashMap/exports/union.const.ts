/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: union
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.825Z
 *
 * Overview:
 * Performs a union of this `HashMap` and that `HashMap`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * 
 * const map1 = HashMap.make(["a", 1], ["b", 2])
 * const map2 = HashMap.make(["b", 20], ["c", 3])
 * const union = HashMap.union(map1, map2)
 * 
 * console.log(HashMap.size(union)) // 3
 * console.log(HashMap.get(union, "b")) // Option.some(20) - map2 wins
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
const exportName = "union";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Performs a union of this `HashMap` and that `HashMap`.";
const sourceExample = "import * as HashMap from \"effect/HashMap\"\n\nconst map1 = HashMap.make([\"a\", 1], [\"b\", 2])\nconst map2 = HashMap.make([\"b\", 20], [\"c\", 3])\nconst union = HashMap.union(map1, map2)\n\nconsole.log(HashMap.size(union)) // 3\nconsole.log(HashMap.get(union, \"b\")) // Option.some(20) - map2 wins";
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
