/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Cause
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.195Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Cause";
const exportKind = "function";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log(`Runtime arity: Schema.Cause.length = ${SchemaModule.Cause.length}`);

  const causeSchema = SchemaModule.Cause(SchemaModule.String, SchemaModule.Number);
  yield* Console.log(`Constructed schema AST: ${causeSchema.ast._tag}`);
});

const exampleRoundTrip = Effect.gen(function* () {
  const causeSchema = SchemaModule.Cause(SchemaModule.String, SchemaModule.Number);
  const encodeCause = SchemaModule.encodeSync(causeSchema);
  const decodeCause = SchemaModule.decodeUnknownSync(causeSchema);

  const failCause = Cause.fail("disk full");
  const defectCause = Cause.die(503);

  const failEncoded = encodeCause(failCause);
  const defectEncoded = encodeCause(defectCause);

  const failDecoded = decodeCause(failEncoded);
  const defectDecoded = decodeCause(defectEncoded);

  yield* Console.log(`Encoded fail cause: ${formatUnknown(failEncoded)}`);
  yield* Console.log(`Decoded fail reason: ${failDecoded.reasons[0]?._tag ?? "none"}`);
  yield* Console.log(`Encoded defect cause: ${formatUnknown(defectEncoded)}`);
  yield* Console.log(`Decoded defect reason: ${defectDecoded.reasons[0]?._tag ?? "none"}`);
});

const exampleValidationContrast = Effect.gen(function* () {
  const causeSchema = SchemaModule.Cause(SchemaModule.String, SchemaModule.Number);
  const decodeCauseOption = SchemaModule.decodeUnknownOption(causeSchema);

  const validFailure = Cause.fail("transient");
  const invalidFailure = Cause.fail(404);
  const invalidDefect = Cause.die("boom");

  const acceptsValidFailure = Option.isSome(decodeCauseOption(validFailure));
  const rejectsInvalidFailure = Option.isNone(decodeCauseOption(invalidFailure));
  const rejectsInvalidDefect = Option.isNone(decodeCauseOption(invalidDefect));

  yield* Console.log(`Accepts string failure payload: ${acceptsValidFailure}`);
  yield* Console.log(`Rejects numeric failure payload: ${rejectsInvalidFailure}`);
  yield* Console.log(`Rejects string defect payload: ${rejectsInvalidDefect}`);
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
  examples: [
    {
      title: "Constructor Discovery",
      description: "Show required arity and build a Cause schema from error/defect schemas.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Round-Trip Cause Values",
      description: "Encode and decode fail/defect causes using a concrete Cause schema.",
      run: exampleRoundTrip,
    },
    {
      title: "Validation Contrast",
      description: "Compare accepted payload types against rejected payload types.",
      run: exampleValidationContrast,
    },
  ],
});

BunRuntime.runMain(program);
