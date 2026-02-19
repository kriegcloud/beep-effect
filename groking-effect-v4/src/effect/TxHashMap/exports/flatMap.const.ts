/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: flatMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Transforms the TxHashMap by applying a function that returns a TxHashMap to each entry, then flattening the results. Useful for complex transformations that require creating new maps.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a department-employee map
 *   const departments = yield* TxHashMap.make(
 *     ["engineering", ["alice", "bob"]],
 *     ["marketing", ["charlie", "diana"]]
 *   )
 *
 *   // Expand each department into individual employee entries with metadata
 *   const employeeDetails = yield* TxHashMap.flatMap(
 *     departments,
 *     (employees, department) =>
 *       Effect.gen(function*() {
 *         const employeeMap = yield* TxHashMap.empty<
 *           string,
 *           { department: string; role: string }
 *         >()
 *         for (let i = 0; i < employees.length; i++) {
 *           const employee = employees[i]
 *           const role = i === 0 ? "lead" : "member"
 *           yield* TxHashMap.set(employeeMap, employee, { department, role })
 *         }
 *         return employeeMap
 *       })
 *   )
 *
 *   // Check the flattened result
 *   const alice = yield* TxHashMap.get(employeeDetails, "alice")
 *   console.log(alice) // Option.some({ department: "engineering", role: "lead" })
 *
 *   const charlie = yield* TxHashMap.get(employeeDetails, "charlie")
 *   console.log(charlie) // Option.some({ department: "marketing", role: "lead" })
 *
 *   const size = yield* TxHashMap.size(employeeDetails)
 *   console.log(size) // 4 (all employees)
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TxHashMapModule from "effect/TxHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "flatMap";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary =
  "Transforms the TxHashMap by applying a function that returns a TxHashMap to each entry, then flattening the results. Useful for complex transformations that require creating new...";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a department-employee map\n  const departments = yield* TxHashMap.make(\n    ["engineering", ["alice", "bob"]],\n    ["marketing", ["charlie", "diana"]]\n  )\n\n  // Expand each department into individual employee entries with metadata\n  const employeeDetails = yield* TxHashMap.flatMap(\n    departments,\n    (employees, department) =>\n      Effect.gen(function*() {\n        const employeeMap = yield* TxHashMap.empty<\n          string,\n          { department: string; role: string }\n        >()\n        for (let i = 0; i < employees.length; i++) {\n          const employee = employees[i]\n          const role = i === 0 ? "lead" : "member"\n          yield* TxHashMap.set(employeeMap, employee, { department, role })\n        }\n        return employeeMap\n      })\n  )\n\n  // Check the flattened result\n  const alice = yield* TxHashMap.get(employeeDetails, "alice")\n  console.log(alice) // Option.some({ department: "engineering", role: "lead" })\n\n  const charlie = yield* TxHashMap.get(employeeDetails, "charlie")\n  console.log(charlie) // Option.some({ department: "marketing", role: "lead" })\n\n  const size = yield* TxHashMap.size(employeeDetails)\n  console.log(size) // 4 (all employees)\n})';
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
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
