/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaGetter
 * Export: transformOrFail
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaGetter.ts
 * Generated: 2026-02-19T04:14:19.184Z
 *
 * Overview:
 * Creates a getter that applies a fallible, effectful transformation to present values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaGetter, SchemaIssue, Effect, Option } from "effect"
 * 
 * const safeParseInt = SchemaGetter.transformOrFail<number, string>(
 *   (s) => {
 *     const n = parseInt(s, 10)
 *     return isNaN(n)
 *       ? Effect.fail(new SchemaIssue.InvalidValue(Option.some(s), { message: "not an integer" }))
 *       : Effect.succeed(n)
 *   }
 * )
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
const exportName = "transformOrFail";
const exportKind = "function";
const moduleImportPath = "effect/SchemaGetter";
const sourceSummary = "Creates a getter that applies a fallible, effectful transformation to present values.";
const sourceExample = "import { SchemaGetter, SchemaIssue, Effect, Option } from \"effect\"\n\nconst safeParseInt = SchemaGetter.transformOrFail<number, string>(\n  (s) => {\n    const n = parseInt(s, 10)\n    return isNaN(n)\n      ? Effect.fail(new SchemaIssue.InvalidValue(Option.some(s), { message: \"not an integer\" }))\n      : Effect.succeed(n)\n  }\n)";
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
