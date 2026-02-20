/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: CauseFailure
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
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "CauseFailure";
const exportKind = "function";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSchemaConstruction = Effect.gen(function* () {
  const causeFailureSchema = SchemaModule.CauseReason(SchemaModule.String, SchemaModule.Number);

  yield* Console.log("Create CauseFailure(String, Number).");
  yield* Console.log(`error schema wired: ${causeFailureSchema.error === SchemaModule.String}`);
  yield* Console.log(`defect schema wired: ${causeFailureSchema.defect === SchemaModule.Number}`);
});

const exampleDecodeReasonVariants = Effect.gen(function* () {
  const causeFailureSchema = SchemaModule.CauseReason(SchemaModule.String, SchemaModule.Number);
  const decodeReason = SchemaModule.decodeUnknownSync(causeFailureSchema);

  const decodedFail = decodeReason(Cause.makeFailReason("missing-profile"));
  const decodedDie = decodeReason(Cause.makeDieReason(500));
  const decodedInterrupt = decodeReason(Cause.makeInterruptReason(7));

  yield* Console.log(`Fail reason: ${formatUnknown(decodedFail)}`);
  yield* Console.log(`Die reason: ${formatUnknown(decodedDie)}`);
  yield* Console.log(`Interrupt reason: ${formatUnknown(decodedInterrupt)}`);
});

const exampleRejectMismatchedPayloads = Effect.gen(function* () {
  const causeFailureSchema = SchemaModule.CauseReason(SchemaModule.String, SchemaModule.Number);
  const decodeReason = SchemaModule.decodeUnknownOption(causeFailureSchema);

  const invalidFail = decodeReason(Cause.makeFailReason(123));
  const invalidDie = decodeReason(Cause.makeDieReason("not-a-number"));

  yield* Console.log(`Invalid Fail decoded: ${invalidFail._tag}`);
  yield* Console.log(`Invalid Die decoded: ${invalidDie._tag}`);
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
      title: "Construct CauseFailure Schema",
      description: "Build Schema.CauseFailure with error and defect members.",
      run: exampleSchemaConstruction,
    },
    {
      title: "Decode Fail, Die, Interrupt",
      description: "Decode each reason variant with matching payload types.",
      run: exampleDecodeReasonVariants,
    },
    {
      title: "Reject Mismatched Reason Payloads",
      description: "Show schema rejection when error/defect payload types drift.",
      run: exampleRejectMismatchedPayloads,
    },
  ],
});

BunRuntime.runMain(program);
