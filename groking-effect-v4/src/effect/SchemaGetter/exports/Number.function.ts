/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaGetter
 * Export: Number
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaGetter.ts
 * Generated: 2026-02-19T04:14:19.183Z
 *
 * Overview:
 * Coerces any value to a `number` using the global `Number()` constructor.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaGetter } from "effect"
 *
 * const toNumber = SchemaGetter.Number<string>()
 * // Getter<number, string>
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
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
import * as SchemaGetterModule from "effect/SchemaGetter";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Number";
const exportKind = "function";
const moduleImportPath = "effect/SchemaGetter";
const sourceSummary = "Coerces any value to a `number` using the global `Number()` constructor.";
const sourceExample =
  'import { SchemaGetter } from "effect"\n\nconst toNumber = SchemaGetter.Number<string>()\n// Getter<number, string>';
const moduleRecord = SchemaGetterModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
