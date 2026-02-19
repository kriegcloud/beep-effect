/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Duration
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
 * - `Duration` is type-level; runtime behavior comes from `Schema.Duration`.
 * - Examples demonstrate runtime guards plus default JSON codec behavior.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Duration";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDurationGuardAndDecode = Effect.gen(function* () {
  const isDuration = SchemaModule.is(SchemaModule.Duration);
  const decodeDuration = SchemaModule.decodeUnknownSync(SchemaModule.Duration);

  const twoSeconds = Duration.seconds(2);
  yield* Console.log(`is(Duration)(Duration.seconds(2)) => ${isDuration(twoSeconds)}`);
  yield* Console.log(`decode(Duration, value) keeps reference => ${decodeDuration(twoSeconds) === twoSeconds}`);

  const invalidAttempt = yield* attemptThunk(() => decodeDuration(2000));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log("decode(Duration, 2000) unexpectedly succeeded.");
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode(Duration, 2000) failed as expected: ${message}`);
  }
});

const exampleDurationJsonCodec = Effect.gen(function* () {
  const DurationJson = SchemaModule.toCodecJson(SchemaModule.Duration);
  const decodeDurationJson = SchemaModule.decodeUnknownSync(DurationJson);
  const encodeDurationJson = SchemaModule.encodeUnknownSync(DurationJson);

  const fromMillis = decodeDurationJson({ _tag: "Millis", value: 500 });
  const fromInfinity = decodeDurationJson({ _tag: "Infinity" });

  yield* Console.log(`decode JSON millis => ${Duration.format(fromMillis)}`);
  yield* Console.log(`decode JSON infinity => ${Duration.format(fromInfinity)}`);
  yield* Console.log(`encode JSON millis => ${formatUnknown(encodeDurationJson(fromMillis))}`);
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
      title: "Duration Guard + Decode",
      description: "Validate runtime Duration values and reject non-Duration inputs.",
      run: exampleDurationGuardAndDecode,
    },
    {
      title: "Duration JSON Codec",
      description: "Decode and encode Duration values via the default JSON codec shape.",
      run: exampleDurationJsonCodec,
    },
  ],
});

BunRuntime.runMain(program);
