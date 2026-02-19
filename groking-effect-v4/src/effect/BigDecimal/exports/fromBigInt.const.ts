/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: fromBigInt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:14:09.907Z
 *
 * Overview:
 * Creates a `BigDecimal` from a `bigint` value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { BigDecimal } from "effect"
 *
 * const decimal = BigDecimal.fromBigInt(123n)
 * console.log(BigDecimal.format(decimal)) // "123"
 *
 * const largeBigInt = BigDecimal.fromBigInt(9007199254740991n)
 * console.log(BigDecimal.format(largeBigInt)) // "9007199254740991"
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
import * as BigDecimalModule from "effect/BigDecimal";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromBigInt";
const exportKind = "const";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary = "Creates a `BigDecimal` from a `bigint` value.";
const sourceExample =
  'import { BigDecimal } from "effect"\n\nconst decimal = BigDecimal.fromBigInt(123n)\nconsole.log(BigDecimal.format(decimal)) // "123"\n\nconst largeBigInt = BigDecimal.fromBigInt(9007199254740991n)\nconsole.log(BigDecimal.format(largeBigInt)) // "9007199254740991"';
const moduleRecord = BigDecimalModule as Record<string, unknown>;

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
