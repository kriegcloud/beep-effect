/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: ExitIso
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.197Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - `ExitIso` is type-level and erased at runtime.
 * - Runtime behavior is exercised via `Schema.toCodecIso(Schema.Exit(...))`.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ExitModule from "effect/Exit";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ExitIso";
const exportKind = "type";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleExitIsoBridge = Effect.gen(function* () {
  const moduleRecord = SchemaModule as Record<string, unknown>;
  const hasRuntimeExitIso = Object.prototype.hasOwnProperty.call(moduleRecord, "ExitIso");

  const ExitSchema = SchemaModule.Exit(SchemaModule.Number, SchemaModule.String, SchemaModule.DefectWithStack);
  const ExitIsoCodec = SchemaModule.toCodecIso(ExitSchema);
  const decodeIso = SchemaModule.decodeUnknownSync(ExitIsoCodec);
  const encodeIso = SchemaModule.encodeUnknownSync(ExitIsoCodec);

  const decodedSuccess = decodeIso({ _tag: "Success", value: 9 });
  const encodedSuccess = encodeIso(ExitModule.succeed(12));
  const successSummary = decodedSuccess._tag === "Success" ? `Success(${decodedSuccess.value})` : "Failure(unexpected)";

  yield* Console.log(`Schema.ExitIso runtime export present: ${hasRuntimeExitIso}`);
  yield* Console.log(`decodeIso({ _tag: "Success", value: 9 }) => ${successSummary}`);
  yield* Console.log(`encodeIso(Exit.succeed(12)) => ${formatUnknown(encodedSuccess)}`);
});

const exampleExitIsoFailureShape = Effect.gen(function* () {
  const ExitSchema = SchemaModule.Exit(SchemaModule.Number, SchemaModule.String, SchemaModule.DefectWithStack);
  const ExitIsoCodec = SchemaModule.toCodecIso(ExitSchema);
  const decodeIso = SchemaModule.decodeUnknownSync(ExitIsoCodec);
  const encodeIso = SchemaModule.encodeUnknownSync(ExitIsoCodec);

  const decodedFailure = decodeIso({
    _tag: "Failure",
    cause: [{ _tag: "Fail", error: "missing-token" }],
  });
  const failureSummary =
    decodedFailure._tag === "Failure"
      ? String(Cause.pretty(decodedFailure.cause)).split("\n")[0]
      : "Success(unexpected)";
  yield* Console.log(`decodeIso(failure) => ${failureSummary}`);

  const dieIso = encodeIso(ExitModule.die({ module: "auth", retryable: true }));
  yield* Console.log(`encodeIso(Exit.die(object defect)) => ${formatUnknown(dieIso)}`);

  const invalidShape = yield* attemptThunk(() =>
    decodeIso({
      _tag: "Failure",
      cause: { _tag: "Fail", error: "x" },
    })
  );
  if (invalidShape._tag === "Right") {
    yield* Console.log("decodeIso(non-array cause) unexpectedly succeeded.");
  } else {
    const message = String(invalidShape.error).split("\n")[0] ?? String(invalidShape.error);
    yield* Console.log(`decodeIso(non-array cause) failed as expected: ${message}`);
  }
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
      title: "Type Erasure + Iso Bridge",
      description: "Show ExitIso erasure and bridge runtime behavior with toCodecIso over Exit schemas.",
      run: exampleExitIsoBridge,
    },
    {
      title: "Failure Iso Shape",
      description: "Decode/encode failure iso payloads and reject invalid non-array cause shapes.",
      run: exampleExitIsoFailureShape,
    },
  ],
});

BunRuntime.runMain(program);
