/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Date
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
 * - `Date` as a type is compile-time only; runtime behavior comes from `Schema.Date`.
 * - Examples contrast plain `Date` acceptance with stricter `DateValid` behavior.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Date";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDateRuntimeCompanion = Effect.gen(function* () {
  const isDate = SchemaModule.is(SchemaModule.Date);
  const decodeDate = SchemaModule.decodeUnknownSync(SchemaModule.Date);

  const validDate = new Date("2024-01-02T03:04:05.000Z");
  const invalidDate = new Date("invalid");

  yield* Console.log("Date interface is erased; runtime checks use Schema.Date.");
  yield* Console.log(`is(Date)(valid) => ${isDate(validDate)}`);
  yield* Console.log(`is(Date)(invalid) => ${isDate(invalidDate)}`);
  yield* Console.log(`decode(valid).toISOString() => ${decodeDate(validDate).toISOString()}`);
  yield* Console.log(`decode(invalid).toString() => ${decodeDate(invalidDate).toString()}`);
});

const exampleDateJsonCodecContrast = Effect.gen(function* () {
  const DateJson = SchemaModule.toCodecJson(SchemaModule.Date);
  const DateValidJson = SchemaModule.toCodecJson(SchemaModule.DateValid);

  const decodeDateJson = SchemaModule.decodeUnknownSync(DateJson);
  const encodeDateJson = SchemaModule.encodeUnknownSync(DateJson);
  const decodeDateValidJson = SchemaModule.decodeUnknownSync(DateValidJson);

  const parsed = decodeDateJson("2024-06-15T10:20:30.000Z");
  const encoded = encodeDateJson(parsed);
  const invalidParsed = decodeDateJson("not-a-date");

  yield* Console.log(`decode Date JSON => ${parsed.toISOString()}`);
  yield* Console.log(`encode Date JSON => ${formatUnknown(encoded)}`);
  yield* Console.log(`decode invalid with Date => ${invalidParsed.toString()}`);

  const strictAttempt = yield* attemptThunk(() => decodeDateValidJson("not-a-date"));
  if (strictAttempt._tag === "Right") {
    yield* Console.log("DateValid JSON unexpectedly accepted an invalid date string.");
  } else {
    const message = String(strictAttempt.error).split("\n")[0] ?? String(strictAttempt.error);
    yield* Console.log(`DateValid JSON rejects invalid date as expected: ${message}`);
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
      title: "Runtime Date Companion",
      description: "Use Schema.Date guard/decode behavior on valid and invalid Date instances.",
      run: exampleDateRuntimeCompanion,
    },
    {
      title: "Date vs DateValid JSON Decode",
      description: "Compare permissive Date JSON decoding with strict DateValid JSON decoding.",
      run: exampleDateJsonCodecContrast,
    },
  ],
});

BunRuntime.runMain(program);
