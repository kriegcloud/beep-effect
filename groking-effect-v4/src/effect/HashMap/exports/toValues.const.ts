/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: toValues
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.825Z
 *
 * Overview:
 * Returns an `Array` of the values within the `HashMap`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const employees = HashMap.make(
 *   ["alice", { department: "engineering", salary: 90000 }],
 *   ["bob", { department: "marketing", salary: 75000 }],
 *   ["charlie", { department: "engineering", salary: 95000 }]
 * )
 *
 * // Extract all employee records
 * const allEmployees = HashMap.toValues(employees)
 * console.log(allEmployees.length) // 3
 *
 * // Calculate total salary
 * const totalSalary = allEmployees.reduce((sum, emp) => sum + emp.salary, 0)
 * console.log(totalSalary) // 260000
 *
 * // Filter by department
 * const engineers = allEmployees.filter((emp) => emp.department === "engineering")
 * console.log(engineers.length) // 2
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
import * as HashMapModule from "effect/HashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toValues";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Returns an `Array` of the values within the `HashMap`.";
const sourceExample =
  'import * as HashMap from "effect/HashMap"\n\nconst employees = HashMap.make(\n  ["alice", { department: "engineering", salary: 90000 }],\n  ["bob", { department: "marketing", salary: 75000 }],\n  ["charlie", { department: "engineering", salary: 95000 }]\n)\n\n// Extract all employee records\nconst allEmployees = HashMap.toValues(employees)\nconsole.log(allEmployees.length) // 3\n\n// Calculate total salary\nconst totalSalary = allEmployees.reduce((sum, emp) => sum + emp.salary, 0)\nconsole.log(totalSalary) // 260000\n\n// Filter by department\nconst engineers = allEmployees.filter((emp) => emp.department === "engineering")\nconsole.log(engineers.length) // 2';
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
