/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: DurationFromNanos
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
 * - `DurationFromNanos` is type-level; runtime behavior comes from `Schema.DurationFromNanos`.
 * - Examples cover non-negative decode/encode plus invalid input and Infinity rejection.
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
const exportName = "DurationFromNanos";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDecodeFromNanos = Effect.gen(function* () {
  const decodeFromNanos = SchemaModule.decodeUnknownSync(SchemaModule.DurationFromNanos);
  const encodeToNanos = SchemaModule.encodeUnknownSync(SchemaModule.DurationFromNanos);

  const onePointFiveSeconds = decodeFromNanos(1_500_000_000n);
  const zero = decodeFromNanos(0n);

  yield* Console.log(`decode(1_500_000_000n) => ${Duration.format(onePointFiveSeconds)}`);
  yield* Console.log(`decode(0n) => ${Duration.format(zero)}`);
  yield* Console.log(`encode(duration from 1_500_000_000n) => ${encodeToNanos(onePointFiveSeconds)}n`);
});

const exampleRejectionCases = Effect.gen(function* () {
  const decodeFromNanos = SchemaModule.decodeUnknownSync(SchemaModule.DurationFromNanos);
  const encodeToNanos = SchemaModule.encodeUnknownSync(SchemaModule.DurationFromNanos);

  const negativeAttempt = yield* attemptThunk(() => decodeFromNanos(-1n));
  if (negativeAttempt._tag === "Right") {
    yield* Console.log("decode(-1n) unexpectedly succeeded.");
  } else {
    const message = String(negativeAttempt.error).split("\n")[0] ?? String(negativeAttempt.error);
    yield* Console.log(`decode(-1n) failed as expected: ${message}`);
  }

  const infinityAttempt = yield* attemptThunk(() => encodeToNanos(Duration.infinity));
  if (infinityAttempt._tag === "Right") {
    yield* Console.log(`encode(Duration.infinity) unexpectedly succeeded => ${String(infinityAttempt.value)}`);
  } else {
    const message = String(infinityAttempt.error).split("\n")[0] ?? String(infinityAttempt.error);
    yield* Console.log(`encode(Duration.infinity) failed as expected: ${message}`);
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
      title: "Decode Nanoseconds",
      description: "Decode non-negative bigint nanoseconds and encode Duration values back to bigint.",
      run: exampleDecodeFromNanos,
    },
    {
      title: "Invalid Value Rejections",
      description: "Reject negative bigint input and reject encoding Infinity to bigint nanoseconds.",
      run: exampleRejectionCases,
    },
  ],
});

BunRuntime.runMain(program);
