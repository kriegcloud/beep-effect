/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Encoder
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.197Z
 *
 * Overview:
 * A `Codec` view intended for APIs that only *encode* values.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - `Encoder` is type-level and erased at runtime.
 * - Runtime examples encode through values typed as `Schema.Encoder<E>`.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Encoder";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "A `Codec` view intended for APIs that only *encode* values.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleEncoderErasureAndBridge = Effect.gen(function* () {
  const moduleRecord = SchemaModule as Record<string, unknown>;
  const hasRuntimeEncoder = Object.prototype.hasOwnProperty.call(moduleRecord, "Encoder");

  const numberToStringEncoder: SchemaModule.Encoder<string> = SchemaModule.NumberFromString;
  const encodeNumber = SchemaModule.encodeUnknownSync(numberToStringEncoder);

  yield* Console.log(`Schema.Encoder runtime export present: ${hasRuntimeEncoder}`);
  yield* Console.log(`encode(NumberFromStringEncoder, 42) => ${encodeNumber(42)}`);

  const invalidAttempt = yield* attemptThunk(() => encodeNumber("42"));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log('encode(NumberFromStringEncoder, "42") unexpectedly succeeded.');
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`encode(NumberFromStringEncoder, "42") failed as expected: ${message}`);
  }
});

const exampleSpecializedEncoder = Effect.gen(function* () {
  const bitEncoder: SchemaModule.Encoder<number> = SchemaModule.BooleanFromBit;
  const encodeBit = SchemaModule.encodeUnknownSync(bitEncoder);

  yield* Console.log(`encode(BooleanFromBitEncoder, true) => ${encodeBit(true)}`);
  yield* Console.log(`encode(BooleanFromBitEncoder, false) => ${encodeBit(false)}`);

  const optionSuccess = SchemaModule.encodeUnknownOption(bitEncoder)(true);
  const optionFailure = SchemaModule.encodeUnknownOption(bitEncoder)(1);
  yield* Console.log(`encodeUnknownOption(true) => ${formatUnknown(optionSuccess)}`);
  yield* Console.log(`encodeUnknownOption(1) => ${formatUnknown(optionFailure)}`);
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
      title: "Encoder Type Erasure + Bridge",
      description: "Use a value typed as Schema.Encoder<E> with runtime encode helpers.",
      run: exampleEncoderErasureAndBridge,
    },
    {
      title: "Specialized Encoder Flow",
      description: "Encode booleans with BooleanFromBit and inspect option-based success/failure.",
      run: exampleSpecializedEncoder,
    },
  ],
});

BunRuntime.runMain(program);
