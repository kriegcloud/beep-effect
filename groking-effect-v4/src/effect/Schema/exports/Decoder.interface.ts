/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Decoder
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.196Z
 *
 * Overview:
 * A `Codec` view intended for APIs that only *decode* (parse/validate) values.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - `Decoder` is type-level and erased at runtime.
 * - Runtime decoding behavior is exercised with values typed as `Schema.Decoder<T>`.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Decoder";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "A `Codec` view intended for APIs that only *decode* (parse/validate) values.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDecoderErasureAndBridge = Effect.gen(function* () {
  const moduleRecord = SchemaModule as Record<string, unknown>;
  const hasRuntimeDecoder = Object.prototype.hasOwnProperty.call(moduleRecord, "Decoder");

  const numberDecoder: SchemaModule.Decoder<number> = SchemaModule.Number;
  const decodeNumber = SchemaModule.decodeUnknownSync(numberDecoder);

  yield* Console.log(`Schema.Decoder runtime export present: ${hasRuntimeDecoder}`);
  yield* Console.log(`decode(NumberDecoder, 12) => ${decodeNumber(12)}`);

  const invalidAttempt = yield* attemptThunk(() => decodeNumber("12"));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log('decode(NumberDecoder, "12") unexpectedly succeeded.');
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode(NumberDecoder, "12") failed as expected: ${message}`);
  }
});

const exampleSpecializedDecoder = Effect.gen(function* () {
  const bitDecoder: SchemaModule.Decoder<boolean> = SchemaModule.BooleanFromBit;
  const decodeBit = SchemaModule.decodeUnknownSync(bitDecoder);

  const decoded = decodeBit(1);
  yield* Console.log(`decode(BooleanFromBitDecoder, 1) => ${decoded}`);

  const optionSuccess = SchemaModule.decodeUnknownOption(bitDecoder)(0);
  const optionFailure = SchemaModule.decodeUnknownOption(bitDecoder)(2);
  yield* Console.log(`decodeUnknownOption(0) => ${formatUnknown(optionSuccess)}`);
  yield* Console.log(`decodeUnknownOption(2) => ${formatUnknown(optionFailure)}`);
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
      title: "Decoder Type Erasure + Bridge",
      description: "Use a value typed as Schema.Decoder<T> with decodeUnknownSync at runtime.",
      run: exampleDecoderErasureAndBridge,
    },
    {
      title: "Specialized Decoder Flow",
      description: "Decode with BooleanFromBit via sync and option-based decode helpers.",
      run: exampleSpecializedDecoder,
    },
  ],
});

BunRuntime.runMain(program);
