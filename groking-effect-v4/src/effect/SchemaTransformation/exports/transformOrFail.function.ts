/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaTransformation
 * Export: transformOrFail
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaTransformation.ts
 * Generated: 2026-02-19T04:14:19.708Z
 *
 * Overview:
 * Creates a `Transformation` from effectful decode and encode functions that can fail with `Issue`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option, Schema, SchemaIssue, SchemaTransformation } from "effect"
 *
 * const DateFromString = Schema.String.pipe(
 *   Schema.decodeTo(
 *     Schema.Date,
 *     SchemaTransformation.transformOrFail({
 *       decode: (s) => {
 *         const d = new Date(s)
 *         return isNaN(d.getTime())
 *           ? Effect.fail(new SchemaIssue.InvalidValue(Option.some(s), { message: "Invalid date" }))
 *           : Effect.succeed(d)
 *       },
 *       encode: (d) => Effect.succeed(d.toISOString())
 *     })
 *   )
 * )
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
import * as SchemaTransformationModule from "effect/SchemaTransformation";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "transformOrFail";
const exportKind = "function";
const moduleImportPath = "effect/SchemaTransformation";
const sourceSummary =
  "Creates a `Transformation` from effectful decode and encode functions that can fail with `Issue`.";
const sourceExample =
  'import { Effect, Option, Schema, SchemaIssue, SchemaTransformation } from "effect"\n\nconst DateFromString = Schema.String.pipe(\n  Schema.decodeTo(\n    Schema.Date,\n    SchemaTransformation.transformOrFail({\n      decode: (s) => {\n        const d = new Date(s)\n        return isNaN(d.getTime())\n          ? Effect.fail(new SchemaIssue.InvalidValue(Option.some(s), { message: "Invalid date" }))\n          : Effect.succeed(d)\n      },\n      encode: (d) => Effect.succeed(d.toISOString())\n    })\n  )\n)';
const moduleRecord = SchemaTransformationModule as Record<string, unknown>;

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
