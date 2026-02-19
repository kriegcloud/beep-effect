/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: append
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:14:15.164Z
 *
 * Overview:
 * Appends an element to the end of the MutableList. This operation is optimized for high-frequency usage.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 * 
 * const list = MutableList.make<number>()
 * 
 * // Append elements one by one
 * MutableList.append(list, 1)
 * MutableList.append(list, 2)
 * MutableList.append(list, 3)
 * 
 * console.log(list.length) // 3
 * 
 * // Elements are taken from head (FIFO)
 * console.log(MutableList.take(list)) // 1
 * console.log(MutableList.take(list)) // 2
 * console.log(MutableList.take(list)) // 3
 * 
 * // High-throughput usage
 * for (let i = 0; i < 10000; i++) {
 *   MutableList.append(list, i)
 * }
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
import * as MutableListModule from "effect/MutableList";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "append";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary = "Appends an element to the end of the MutableList. This operation is optimized for high-frequency usage.";
const sourceExample = "import * as MutableList from \"effect/MutableList\"\n\nconst list = MutableList.make<number>()\n\n// Append elements one by one\nMutableList.append(list, 1)\nMutableList.append(list, 2)\nMutableList.append(list, 3)\n\nconsole.log(list.length) // 3\n\n// Elements are taken from head (FIFO)\nconsole.log(MutableList.take(list)) // 1\nconsole.log(MutableList.take(list)) // 2\nconsole.log(MutableList.take(list)) // 3\n\n// High-throughput usage\nfor (let i = 0; i < 10000; i++) {\n  MutableList.append(list, i)\n}";
const moduleRecord = MutableListModule as Record<string, unknown>;

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
