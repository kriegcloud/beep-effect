/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: compact
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.823Z
 *
 * Overview:
 * Filters out `None` values from a `HashMap` of `Options`s.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * import * as Option from "effect/Option"
 * 
 * const map1 = HashMap.make(
 *   ["a", Option.some(1)],
 *   ["b", Option.none()],
 *   ["c", Option.some(3)]
 * )
 * const map2 = HashMap.compact(map1)
 * 
 * console.log(HashMap.size(map2)) // 2
 * console.log(HashMap.get(map2, "a")) // Option.some(1)
 * console.log(HashMap.has(map2, "b")) // false
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
const exportName = "compact";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Filters out `None` values from a `HashMap` of `Options`s.";
const sourceExample = "import * as HashMap from \"effect/HashMap\"\nimport * as Option from \"effect/Option\"\n\nconst map1 = HashMap.make(\n  [\"a\", Option.some(1)],\n  [\"b\", Option.none()],\n  [\"c\", Option.some(3)]\n)\nconst map2 = HashMap.compact(map1)\n\nconsole.log(HashMap.size(map2)) // 2\nconsole.log(HashMap.get(map2, \"a\")) // Option.some(1)\nconsole.log(HashMap.has(map2, \"b\")) // false";
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
