/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: DateTimeUtc
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
 * - `DateTimeUtc` is type-level; runtime behavior comes from `Schema.DateTimeUtc`.
 * - Examples show UTC validation and JSON codec round-trips.
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
const exportName = "DateTimeUtc";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleUtcGuardAndDecode = Effect.gen(function* () {
  const isUtcSchema = SchemaModule.is(SchemaModule.DateTimeUtc);
  const decodeUtc = SchemaModule.decodeUnknownSync(SchemaModule.DateTimeUtc);

  const utc = DateTime.fromDateUnsafe(new Date("2024-06-15T10:20:30.000Z"));
  const zoned = DateTime.makeZonedUnsafe("2024-06-15T10:20:30.000Z", { timeZone: "Europe/London" });

  yield* Console.log("DateTimeUtc interface is erased; runtime checks use Schema.DateTimeUtc.");
  yield* Console.log(`is(DateTimeUtc)(utc) => ${isUtcSchema(utc)}`);
  yield* Console.log(`is(DateTimeUtc)(zoned) => ${isUtcSchema(zoned)}`);

  const decodedUtc = decodeUtc(utc);
  yield* Console.log(`decode(utc) => ${DateTime.formatIso(decodedUtc)}`);

  const zonedAttempt = yield* attemptThunk(() => decodeUtc(zoned));
  if (zonedAttempt._tag === "Right") {
    yield* Console.log("decode(zoned) unexpectedly succeeded.");
  } else {
    const message = String(zonedAttempt.error).split("\n")[0] ?? String(zonedAttempt.error);
    yield* Console.log(`decode(zoned) failed as expected: ${message}`);
  }
});

const exampleUtcJsonCodec = Effect.gen(function* () {
  const DateTimeUtcJson = SchemaModule.toCodecJson(SchemaModule.DateTimeUtc);
  const decodeUtcJson = SchemaModule.decodeUnknownSync(DateTimeUtcJson);
  const encodeUtcJson = SchemaModule.encodeUnknownSync(DateTimeUtcJson);

  const decoded = decodeUtcJson("2024-06-15T10:20:30.000Z");
  const encoded = encodeUtcJson(decoded);

  yield* Console.log(`decode JSON => ${DateTime.formatIso(decoded)}`);
  yield* Console.log(`encode JSON => ${encoded}`);

  const invalidAttempt = yield* attemptThunk(() => decodeUtcJson("not-a-date"));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log("decode invalid JSON unexpectedly succeeded.");
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode invalid JSON failed as expected: ${message}`);
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
      title: "UTC Guard + Decode",
      description: "Validate UTC vs zoned values and decode only UTC instances.",
      run: exampleUtcGuardAndDecode,
    },
    {
      title: "DateTimeUtc JSON Codec",
      description: "Round-trip UTC values through the default JSON codec.",
      run: exampleUtcJsonCodec,
    },
  ],
});

BunRuntime.runMain(program);
