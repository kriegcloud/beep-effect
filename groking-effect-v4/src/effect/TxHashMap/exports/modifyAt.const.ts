/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: modifyAt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Updates the value for the specified key using an Option-based update function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option, TxHashMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const storage = yield* TxHashMap.make<string, string | number>([
 *     "file1.txt",
 *     "content1"
 *   ], ["access_count", 0])
 * 
 *   // Increment counter or initialize to 1
 *   const updateFn = (opt: Option.Option<string | number>) =>
 *     Option.isSome(opt) && typeof opt.value === "number"
 *       ? Option.some(opt.value + 1)
 *       : Option.some(1)
 * 
 *   // Increment existing counter
 *   yield* TxHashMap.modifyAt(storage, "access_count", updateFn)
 *   const count1 = yield* TxHashMap.get(storage, "access_count")
 *   console.log(count1) // Option.some(1)
 * 
 *   // Increment existing counter again
 *   yield* TxHashMap.modifyAt(storage, "access_count", updateFn)
 *   const count2 = yield* TxHashMap.get(storage, "access_count")
 *   console.log(count2) // Option.some(2)
 * 
 *   // Remove by returning None
 *   yield* TxHashMap.modifyAt(storage, "file1.txt", () => Option.none())
 *   const hasFile = yield* TxHashMap.has(storage, "file1.txt")
 *   console.log(hasFile) // false
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
import * as TxHashMapModule from "effect/TxHashMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "modifyAt";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Updates the value for the specified key using an Option-based update function.";
const sourceExample = "import { Effect, Option, TxHashMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const storage = yield* TxHashMap.make<string, string | number>([\n    \"file1.txt\",\n    \"content1\"\n  ], [\"access_count\", 0])\n\n  // Increment counter or initialize to 1\n  const updateFn = (opt: Option.Option<string | number>) =>\n    Option.isSome(opt) && typeof opt.value === \"number\"\n      ? Option.some(opt.value + 1)\n      : Option.some(1)\n\n  // Increment existing counter\n  yield* TxHashMap.modifyAt(storage, \"access_count\", updateFn)\n  const count1 = yield* TxHashMap.get(storage, \"access_count\")\n  console.log(count1) // Option.some(1)\n\n  // Increment existing counter again\n  yield* TxHashMap.modifyAt(storage, \"access_count\", updateFn)\n  const count2 = yield* TxHashMap.get(storage, \"access_count\")\n  console.log(count2) // Option.some(2)\n\n  // Remove by returning None\n  yield* TxHashMap.modifyAt(storage, \"file1.txt\", () => Option.none())\n  const hasFile = yield* TxHashMap.has(storage, \"file1.txt\")\n  console.log(hasFile) // false\n})";
const moduleRecord = TxHashMapModule as Record<string, unknown>;

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
