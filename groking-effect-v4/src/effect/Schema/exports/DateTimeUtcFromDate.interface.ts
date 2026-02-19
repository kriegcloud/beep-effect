/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: DateTimeUtcFromDate
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
 * - `DateTimeUtcFromDate` is type-level, with runtime behavior from `Schema.DateTimeUtcFromDate`.
 * - Examples exercise Date -> DateTime.Utc decode and DateTime.Utc -> Date encode.
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
const exportName = "DateTimeUtcFromDate";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDecodeFromDate = Effect.gen(function* () {
  const decodeFromDate = SchemaModule.decodeUnknownSync(SchemaModule.DateTimeUtcFromDate);

  const validDate = new Date("2024-06-15T10:20:30.000Z");
  const decoded = decodeFromDate(validDate);
  yield* Console.log(`decode(valid Date) => ${DateTime.formatIso(decoded)}`);

  const invalidAttempt = yield* attemptThunk(() => decodeFromDate(new Date("invalid")));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log("decode(invalid Date) unexpectedly succeeded.");
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode(invalid Date) failed as expected: ${message}`);
  }
});

const exampleEncodeToDate = Effect.gen(function* () {
  const decodeFromDate = SchemaModule.decodeUnknownSync(SchemaModule.DateTimeUtcFromDate);
  const encodeToDate = SchemaModule.encodeUnknownSync(SchemaModule.DateTimeUtcFromDate);

  const utc = decodeFromDate(new Date("2024-06-15T10:20:30.000Z"));
  const encodedDate = encodeToDate(utc);

  yield* Console.log(`encode(DateTime.Utc) returns Date: ${encodedDate instanceof Date}`);
  yield* Console.log(`encode(DateTime.Utc).toISOString() => ${encodedDate.toISOString()}`);
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
      title: "Decode Date -> DateTime.Utc",
      description: "Decode valid Date objects and reject invalid Date instances.",
      run: exampleDecodeFromDate,
    },
    {
      title: "Encode DateTime.Utc -> Date",
      description: "Encode UTC values back into JavaScript Date objects.",
      run: exampleEncodeToDate,
    },
  ],
});

BunRuntime.runMain(program);
