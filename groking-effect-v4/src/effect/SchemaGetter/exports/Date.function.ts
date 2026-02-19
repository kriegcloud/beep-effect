/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaGetter
 * Export: Date
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaGetter.ts
 * Generated: 2026-02-19T04:14:19.180Z
 *
 * Overview:
 * Coerces a value to a `Date` using `new Date(input)`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaGetter } from "effect"
 * 
 * const toDate = SchemaGetter.Date<string>()
 * // Getter<Date, string>
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SchemaGetterModule from "effect/SchemaGetter";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Date";
const exportKind = "function";
const moduleImportPath = "effect/SchemaGetter";
const sourceSummary = "Coerces a value to a `Date` using `new Date(input)`.";
const sourceExample = "import { SchemaGetter } from \"effect\"\n\nconst toDate = SchemaGetter.Date<string>()\n// Getter<Date, string>";
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
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
