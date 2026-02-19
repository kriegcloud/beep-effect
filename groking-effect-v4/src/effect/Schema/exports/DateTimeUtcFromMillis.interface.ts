/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: DateTimeUtcFromMillis
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.196Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - `DateTimeUtcFromMillis` is type-level, with runtime behavior from its schema companion.
 * - Examples demonstrate millis <-> DateTime.Utc conversion and invalid input handling.
 */

import { attemptThunk, createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "DateTimeUtcFromMillis";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDecodeFromMillis = Effect.gen(function* () {
  const decodeFromMillis = SchemaModule.decodeUnknownSync(SchemaModule.DateTimeUtcFromMillis);

  const epochMillis = 1706933106000;
  const decoded = decodeFromMillis(epochMillis);

  yield* Console.log(`decode(${epochMillis}) => ${DateTime.formatIso(decoded)}`);
  yield* Console.log(`toEpochMillis(decoded) => ${DateTime.toEpochMillis(decoded)}`);
});

const exampleEncodeToMillisAndFailures = Effect.gen(function* () {
  const decodeFromMillis = SchemaModule.decodeUnknownSync(SchemaModule.DateTimeUtcFromMillis);
  const encodeToMillis = SchemaModule.encodeUnknownSync(SchemaModule.DateTimeUtcFromMillis);

  const utc = decodeFromMillis(1706933106000);
  const encoded = encodeToMillis(utc);
  yield* Console.log(`encode(DateTime.Utc) => ${encoded}`);

  const invalidAttempt = yield* attemptThunk(() => decodeFromMillis("1706933106000"));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log("decode(string millis) unexpectedly succeeded.");
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode(string millis) failed as expected: ${message}`);
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
      title: "Decode Millis -> DateTime.Utc",
      description: "Decode epoch milliseconds into UTC DateTime values.",
      run: exampleDecodeFromMillis,
    },
    {
      title: "Encode + Invalid Input",
      description: "Encode DateTime.Utc back to millis and reject non-number decode input.",
      run: exampleEncodeToMillisAndFailures,
    },
  ],
});

BunRuntime.runMain(program);
