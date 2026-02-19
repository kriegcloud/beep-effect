/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PrimaryKey
 * Export: value
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PrimaryKey.ts
 * Generated: 2026-02-19T04:50:38.342Z
 *
 * Overview:
 * Extracts the string value from a `PrimaryKey`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { PrimaryKey } from "effect"
 *
 * class OrderId implements PrimaryKey.PrimaryKey {
 *   constructor(private timestamp: number, private sequence: number) {}
 *
 *   [PrimaryKey.symbol](): string {
 *     return `order_${this.timestamp}_${this.sequence}`
 *   }
 * }
 *
 * const orderId = new OrderId(1640995200000, 1)
 * console.log(PrimaryKey.value(orderId)) // "order_1640995200000_1"
 *
 * // Can also be used with simple string-based implementations
 * const simpleKey = {
 *   [PrimaryKey.symbol]: () => "simple-key-123"
 * }
 * console.log(PrimaryKey.value(simpleKey)) // "simple-key-123"
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PrimaryKeyModule from "effect/PrimaryKey";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "value";
const exportKind = "const";
const moduleImportPath = "effect/PrimaryKey";
const sourceSummary = "Extracts the string value from a `PrimaryKey`.";
const sourceExample =
  'import { PrimaryKey } from "effect"\n\nclass OrderId implements PrimaryKey.PrimaryKey {\n  constructor(private timestamp: number, private sequence: number) {}\n\n  [PrimaryKey.symbol](): string {\n    return `order_${this.timestamp}_${this.sequence}`\n  }\n}\n\nconst orderId = new OrderId(1640995200000, 1)\nconsole.log(PrimaryKey.value(orderId)) // "order_1640995200000_1"\n\n// Can also be used with simple string-based implementations\nconst simpleKey = {\n  [PrimaryKey.symbol]: () => "simple-key-123"\n}\nconsole.log(PrimaryKey.value(simpleKey)) // "simple-key-123"';
const moduleRecord = PrimaryKeyModule as Record<string, unknown>;

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
