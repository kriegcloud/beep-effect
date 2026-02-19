/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: TaggedStruct
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:14:18.720Z
 *
 * Overview:
 * A tagged struct is a struct that includes a `_tag` field. This field is used to identify the specific variant of the object, which is especially useful when working with union types.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * 
 * // Defines a struct with a fixed `_tag` field
 * const tagged = Schema.TaggedStruct("A", {
 *   a: Schema.String
 * })
 * 
 * // This is the same as writing:
 * const equivalent = Schema.Struct({
 *   _tag: Schema.tag("A"),
 *   a: Schema.String
 * })
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
const exportName = "TaggedStruct";
const exportKind = "function";
const moduleImportPath = "effect/Schema";
const sourceSummary = "A tagged struct is a struct that includes a `_tag` field. This field is used to identify the specific variant of the object, which is especially useful when working with union t...";
const sourceExample = "import { Schema } from \"effect\"\n\n// Defines a struct with a fixed `_tag` field\nconst tagged = Schema.TaggedStruct(\"A\", {\n  a: Schema.String\n})\n\n// This is the same as writing:\nconst equivalent = Schema.Struct({\n  _tag: Schema.tag(\"A\"),\n  a: Schema.String\n})";
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
