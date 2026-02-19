/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: CauseIso
 * Kind: type
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
 * - `CauseIso` is compile-time only, but `Schema.Cause` provides a runtime companion.
 * - `Schema.toCodecIso` demonstrates the executable Cause <-> CauseIso bridge.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "CauseIso";
const exportKind = "type";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDecodeCauseIso = Effect.gen(function* () {
  const causeSchema = SchemaModule.Cause(SchemaModule.String, SchemaModule.Number);
  const causeIsoCodec = SchemaModule.toCodecIso(causeSchema);
  const decodeCauseIso = SchemaModule.decodeUnknownSync(causeIsoCodec);
  const causeIsoInput = [
    { _tag: "Fail", error: "db unavailable" },
    { _tag: "Die", defect: 503 },
    { _tag: "Interrupt", fiberId: 7 },
  ];
  const decodedCause = decodeCauseIso(causeIsoInput);

  yield* Console.log("CauseIso is erased at runtime; decode via Schema.toCodecIso.");
  yield* Console.log(`Iso input: ${formatUnknown(causeIsoInput)}`);
  yield* Console.log(`Decoded Cause: ${String(decodedCause)}`);
});

const exampleCauseIsoRoundTrip = Effect.gen(function* () {
  const causeSchema = SchemaModule.Cause(SchemaModule.String, SchemaModule.Number);
  const causeIsoCodec = SchemaModule.toCodecIso(causeSchema);
  const decodeCauseIso = SchemaModule.decodeUnknownSync(causeIsoCodec);
  const encodeCauseIso = SchemaModule.encodeUnknownSync(causeIsoCodec);
  const decodeCauseIsoExit = SchemaModule.decodeUnknownExit(causeIsoCodec);

  const cause = decodeCauseIso([
    { _tag: "Fail", error: "first failure" },
    { _tag: "Interrupt", fiberId: undefined },
  ]);
  const roundTripIso = encodeCauseIso(cause);
  const invalidExit = decodeCauseIsoExit([{ _tag: "Fail", error: 123 }]);

  yield* Console.log(`Round-trip tags: ${roundTripIso.map((reason) => reason._tag).join(" -> ")}`);
  yield* Console.log(`Round-trip iso: ${formatUnknown(roundTripIso)}`);
  yield* Console.log(`Invalid decode exit: ${String(invalidExit)}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Decode CauseIso via Codec",
      description: "Decode an iso-shaped failure array into a runtime Cause value.",
      run: exampleDecodeCauseIso,
    },
    {
      title: "Round-Trip + Validation Failure",
      description: "Encode Cause back to CauseIso and show invalid iso input failure details.",
      run: exampleCauseIsoRoundTrip,
    },
  ],
});

BunRuntime.runMain(program);
