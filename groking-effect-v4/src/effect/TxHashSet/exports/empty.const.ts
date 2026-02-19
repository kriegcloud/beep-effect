/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: empty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:14:23.138Z
 *
 * Overview:
 * Creates an empty TxHashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const txSet = yield* TxHashSet.empty<string>()
 * 
 *   console.log(yield* TxHashSet.size(txSet)) // 0
 *   console.log(yield* TxHashSet.isEmpty(txSet)) // true
 * 
 *   // Add some values
 *   yield* TxHashSet.add(txSet, "hello")
 *   yield* TxHashSet.add(txSet, "world")
 *   console.log(yield* TxHashSet.size(txSet)) // 2
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
const exportName = "empty";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "Creates an empty TxHashSet.";
const sourceExample = "import { Effect, TxHashSet } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const txSet = yield* TxHashSet.empty<string>()\n\n  console.log(yield* TxHashSet.size(txSet)) // 0\n  console.log(yield* TxHashSet.isEmpty(txSet)) // true\n\n  // Add some values\n  yield* TxHashSet.add(txSet, \"hello\")\n  yield* TxHashSet.add(txSet, \"world\")\n  console.log(yield* TxHashSet.size(txSet)) // 2\n})";
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
