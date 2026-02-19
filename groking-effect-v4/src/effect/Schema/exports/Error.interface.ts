/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Error
 * Kind: interface
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
 * - `Error` as a type is compile-time only, while `Schema.Error` provides runtime behavior.
 * - Examples show guard/decode behavior and default JSON codec stack omission.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Error";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleErrorRuntimeCompanion = Effect.gen(function* () {
  const moduleRecord = SchemaModule as Record<string, unknown>;
  const hasRuntimeError = Object.prototype.hasOwnProperty.call(moduleRecord, "Error");

  const isError = SchemaModule.is(SchemaModule.Error);
  const decodeError = SchemaModule.decodeUnknownSync(SchemaModule.Error);

  const networkError = new Error("network timeout");
  networkError.name = "NetworkError";

  const decoded = decodeError(networkError);

  yield* Console.log(`Schema.Error runtime export present: ${hasRuntimeError}`);
  yield* Console.log(`is(Error)(new Error(...)) => ${isError(networkError)}`);
  yield* Console.log(`is(Error)({ message: "x" }) => ${isError({ message: "x" })}`);
  yield* Console.log(`decode(Error, value) keeps reference => ${decoded === networkError}`);
});

const exampleErrorJsonCodec = Effect.gen(function* () {
  const ErrorJson = SchemaModule.toCodecJson(SchemaModule.Error);
  const decodeErrorJson = SchemaModule.decodeUnknownSync(ErrorJson);
  const encodeErrorJson = SchemaModule.encodeUnknownSync(ErrorJson);

  const boom = new Error("boom");
  boom.name = "BoomError";
  boom.stack = "STACK_LINE";

  yield* Console.log(`encode(ErrorJson, Error) => ${formatUnknown(encodeErrorJson(boom))}`);

  const decoded = decodeErrorJson({ name: "UpstreamError", message: "failed", stack: "VISIBLE_STACK" });
  yield* Console.log(`decode(ErrorJson, struct).name => ${decoded.name}`);
  yield* Console.log(`decode(ErrorJson, struct).stack => ${decoded.stack}`);

  const invalidAttempt = yield* attemptThunk(() => decodeErrorJson({ name: "MissingMessage" }));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log("decode(ErrorJson, missing message) unexpectedly succeeded.");
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode(ErrorJson, missing message) failed as expected: ${message}`);
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
      title: "Runtime Error Companion",
      description: "Use Schema.Error guard/decode behavior while highlighting type/runtime split.",
      run: exampleErrorRuntimeCompanion,
    },
    {
      title: "Error JSON Codec Behavior",
      description: "Encode/decode Error JSON and show default stack omission plus required message validation.",
      run: exampleErrorJsonCodec,
    },
  ],
});

BunRuntime.runMain(program);
