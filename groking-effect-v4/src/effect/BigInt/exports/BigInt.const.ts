/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigInt
 * Export: BigInt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigInt.ts
 * Generated: 2026-02-19T04:14:10.085Z
 *
 * Overview:
 * Reference to the global BigInt constructor.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as BigInt from "effect/BigInt"
 *
 * const bigInt = BigInt.BigInt(123)
 * console.log(bigInt) // 123n
 *
 * const fromString = BigInt.BigInt("456")
 * console.log(fromString) // 456n
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
import * as BigIntModule from "effect/BigInt";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "BigInt";
const exportKind = "const";
const moduleImportPath = "effect/BigInt";
const sourceSummary = "Reference to the global BigInt constructor.";
const sourceExample =
  'import * as BigInt from "effect/BigInt"\n\nconst bigInt = BigInt.BigInt(123)\nconsole.log(bigInt) // 123n\n\nconst fromString = BigInt.BigInt("456")\nconsole.log(fromString) // 456n';
const moduleRecord = BigIntModule as Record<string, unknown>;

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
