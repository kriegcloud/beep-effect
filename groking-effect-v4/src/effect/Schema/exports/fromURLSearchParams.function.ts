/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: fromURLSearchParams
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:14:18.709Z
 *
 * Overview:
 * `Schema.fromURLSearchParams` returns a schema that reads a `URLSearchParams` instance, converts it into a tree record using bracket notation, and then decodes the resulting structure using the provided schema.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * 
 * const schema = Schema.fromURLSearchParams(
 *   Schema.Struct({
 *     a: Schema.String
 *   })
 * )
 * 
 * const urlSearchParams = new URLSearchParams("a=1&b=2")
 * 
 * console.log(String(Schema.decodeUnknownExit(schema)(urlSearchParams)))
 * // Success({"a":"1"})
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SchemaModule from "effect/Schema";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromURLSearchParams";
const exportKind = "function";
const moduleImportPath = "effect/Schema";
const sourceSummary = "`Schema.fromURLSearchParams` returns a schema that reads a `URLSearchParams` instance, converts it into a tree record using bracket notation, and then decodes the resulting stru...";
const sourceExample = "import { Schema } from \"effect\"\n\nconst schema = Schema.fromURLSearchParams(\n  Schema.Struct({\n    a: Schema.String\n  })\n)\n\nconst urlSearchParams = new URLSearchParams(\"a=1&b=2\")\n\nconsole.log(String(Schema.decodeUnknownExit(schema)(urlSearchParams)))\n// Success({\"a\":\"1\"})";
const moduleRecord = SchemaModule as Record<string, unknown>;

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
