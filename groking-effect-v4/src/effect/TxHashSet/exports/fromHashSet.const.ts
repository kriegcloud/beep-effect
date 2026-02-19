/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: fromHashSet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:14:23.138Z
 *
 * Overview:
 * Creates a TxHashSet from an existing HashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 * import * as HashSet from "effect/HashSet"
 * 
 * const program = Effect.gen(function*() {
 *   const hashSet = HashSet.make("x", "y", "z")
 *   const txSet = yield* TxHashSet.fromHashSet(hashSet)
 * 
 *   console.log(yield* TxHashSet.size(txSet)) // 3
 *   console.log(yield* TxHashSet.has(txSet, "y")) // true
 * 
 *   // Original hashSet is unchanged when txSet is modified
 *   yield* TxHashSet.add(txSet, "w")
 *   console.log(HashSet.size(hashSet)) // 3 (original unchanged)
 *   console.log(yield* TxHashSet.size(txSet)) // 4
 * })
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
import * as TxHashSetModule from "effect/TxHashSet";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromHashSet";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "Creates a TxHashSet from an existing HashSet.";
const sourceExample = "import { Effect, TxHashSet } from \"effect\"\nimport * as HashSet from \"effect/HashSet\"\n\nconst program = Effect.gen(function*() {\n  const hashSet = HashSet.make(\"x\", \"y\", \"z\")\n  const txSet = yield* TxHashSet.fromHashSet(hashSet)\n\n  console.log(yield* TxHashSet.size(txSet)) // 3\n  console.log(yield* TxHashSet.has(txSet, \"y\")) // true\n\n  // Original hashSet is unchanged when txSet is modified\n  yield* TxHashSet.add(txSet, \"w\")\n  console.log(HashSet.size(hashSet)) // 3 (original unchanged)\n  console.log(yield* TxHashSet.size(txSet)) // 4\n})";
const moduleRecord = TxHashSetModule as Record<string, unknown>;

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
