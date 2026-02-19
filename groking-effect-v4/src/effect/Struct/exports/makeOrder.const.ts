/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: makeOrder
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:14:21.492Z
 *
 * Overview:
 * Creates an `Order` for a struct by providing an `Order` for each property. Properties are compared in the order they appear in the fields object; the first non-zero comparison determines the result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Number, String, Struct } from "effect"
 *
 * const PersonOrder = Struct.makeOrder({
 *   name: String.Order,
 *   age: Number.Order
 * })
 *
 * console.log(PersonOrder({ name: "Alice", age: 30 }, { name: "Bob", age: 25 }))
 * // -1 (Alice comes before Bob)
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
import * as StructModule from "effect/Struct";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeOrder";
const exportKind = "const";
const moduleImportPath = "effect/Struct";
const sourceSummary =
  "Creates an `Order` for a struct by providing an `Order` for each property. Properties are compared in the order they appear in the fields object; the first non-zero comparison d...";
const sourceExample =
  'import { Number, String, Struct } from "effect"\n\nconst PersonOrder = Struct.makeOrder({\n  name: String.Order,\n  age: Number.Order\n})\n\nconsole.log(PersonOrder({ name: "Alice", age: 30 }, { name: "Bob", age: 25 }))\n// -1 (Alice comes before Bob)';
const moduleRecord = StructModule as Record<string, unknown>;

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
