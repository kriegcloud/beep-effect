/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Inspectable
 * Export: NodeInspectSymbol
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Inspectable.ts
 * Generated: 2026-02-19T04:14:14.188Z
 *
 * Overview:
 * Symbol used by Node.js for custom object inspection.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Inspectable } from "effect"
 *
 * class CustomObject {
 *   constructor(private value: string) {}
 *
 *   [Inspectable.NodeInspectSymbol]() {
 *     return `CustomObject(${this.value})`
 *   }
 * }
 *
 * const obj = new CustomObject("hello")
 * console.log(obj) // Displays: CustomObject(hello)
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
import * as InspectableModule from "effect/Inspectable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "NodeInspectSymbol";
const exportKind = "const";
const moduleImportPath = "effect/Inspectable";
const sourceSummary = "Symbol used by Node.js for custom object inspection.";
const sourceExample =
  'import { Inspectable } from "effect"\n\nclass CustomObject {\n  constructor(private value: string) {}\n\n  [Inspectable.NodeInspectSymbol]() {\n    return `CustomObject(${this.value})`\n  }\n}\n\nconst obj = new CustomObject("hello")\nconsole.log(obj) // Displays: CustomObject(hello)';
const moduleRecord = InspectableModule as Record<string, unknown>;

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
