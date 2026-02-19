/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaTransformation
 * Export: durationFromNanos
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/SchemaTransformation.ts
 * Generated: 2026-02-19T04:14:19.707Z
 *
 * Overview:
 * Decodes a `bigint` (nanoseconds) into a `Duration` and encodes a `Duration` back to `bigint` nanoseconds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaTransformation } from "effect"
 * 
 * const schema = Schema.BigInt.pipe(
 *   Schema.decodeTo(Schema.Duration, SchemaTransformation.durationFromNanos)
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SchemaTransformationModule from "effect/SchemaTransformation";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "durationFromNanos";
const exportKind = "const";
const moduleImportPath = "effect/SchemaTransformation";
const sourceSummary = "Decodes a `bigint` (nanoseconds) into a `Duration` and encodes a `Duration` back to `bigint` nanoseconds.";
const sourceExample = "import { Schema, SchemaTransformation } from \"effect\"\n\nconst schema = Schema.BigInt.pipe(\n  Schema.decodeTo(Schema.Duration, SchemaTransformation.durationFromNanos)\n)";
const moduleRecord = SchemaTransformationModule as Record<string, unknown>;

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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
