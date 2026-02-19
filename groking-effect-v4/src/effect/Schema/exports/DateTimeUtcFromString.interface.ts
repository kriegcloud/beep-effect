/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: DateTimeUtcFromString
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
 * - `DateTimeUtcFromString` is type-level; runtime behavior comes from its schema companion.
 * - Examples show string <-> DateTime.Utc conversion and invalid-string failure behavior.
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
const exportName = "DateTimeUtcFromString";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDecodeFromString = Effect.gen(function* () {
  const decodeFromString = SchemaModule.decodeUnknownSync(SchemaModule.DateTimeUtcFromString);

  const decoded = decodeFromString("2024-06-15T10:20:30.000Z");
  yield* Console.log(`decode(valid string) => ${DateTime.formatIso(decoded)}`);

  const invalidAttempt = yield* attemptThunk(() => decodeFromString("not-a-date"));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log("decode(invalid string) unexpectedly succeeded.");
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode(invalid string) failed as expected: ${message}`);
  }
});

const exampleEncodeToStringRoundTrip = Effect.gen(function* () {
  const decodeFromString = SchemaModule.decodeUnknownSync(SchemaModule.DateTimeUtcFromString);
  const encodeToString = SchemaModule.encodeUnknownSync(SchemaModule.DateTimeUtcFromString);

  const utc = decodeFromString("2024-06-15T10:20:30.000Z");
  const encoded = encodeToString(utc);
  const roundTrip = decodeFromString(encoded);

  yield* Console.log(`encode(DateTime.Utc) => ${encoded}`);
  yield* Console.log(`round-trip decode => ${DateTime.formatIso(roundTrip)}`);
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
      title: "Decode String -> DateTime.Utc",
      description: "Decode valid UTC strings and reject invalid date strings.",
      run: exampleDecodeFromString,
    },
    {
      title: "Encode + Round-Trip",
      description: "Encode UTC values back to strings and verify round-trip decoding.",
      run: exampleEncodeToStringRoundTrip,
    },
  ],
});

BunRuntime.runMain(program);
