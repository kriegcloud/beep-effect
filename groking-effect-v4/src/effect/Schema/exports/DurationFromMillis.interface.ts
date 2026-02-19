/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: DurationFromMillis
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
 * - `DurationFromMillis` is type-level; runtime behavior comes from `Schema.DurationFromMillis`.
 * - Examples cover non-negative decode, Infinity support, and negative-input rejection.
 */

import { attemptThunk, createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "DurationFromMillis";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDecodeFromMillis = Effect.gen(function* () {
  const decodeFromMillis = SchemaModule.decodeUnknownSync(SchemaModule.DurationFromMillis);

  const regular = decodeFromMillis(1500);
  const infinite = decodeFromMillis(Number.POSITIVE_INFINITY);

  yield* Console.log(`decode(1500) => ${Duration.format(regular)}`);
  yield* Console.log(`decode(Infinity) => ${Duration.format(infinite)}`);
});

const exampleEncodeAndFailures = Effect.gen(function* () {
  const decodeFromMillis = SchemaModule.decodeUnknownSync(SchemaModule.DurationFromMillis);
  const encodeToMillis = SchemaModule.encodeUnknownSync(SchemaModule.DurationFromMillis);

  const duration = decodeFromMillis(2500);
  yield* Console.log(`encode(duration from 2500) => ${encodeToMillis(duration)}`);

  const invalidAttempt = yield* attemptThunk(() => decodeFromMillis(-1));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log("decode(-1) unexpectedly succeeded.");
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode(-1) failed as expected: ${message}`);
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
      title: "Decode Milliseconds",
      description: "Decode non-negative milliseconds (including Infinity) into Duration values.",
      run: exampleDecodeFromMillis,
    },
    {
      title: "Encode + Negative Rejection",
      description: "Encode Duration back to millis and reject negative input on decode.",
      run: exampleEncodeAndFailures,
    },
  ],
});

BunRuntime.runMain(program);
