/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: DateValid
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
 * - `DateValid` is type-level; runtime checks use `Schema.DateValid`.
 * - Examples highlight the stricter validation compared with `Schema.Date`.
 */

import { attemptThunk, createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "DateValid";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDateValidGuardAndDecode = Effect.gen(function* () {
  const isDate = SchemaModule.is(SchemaModule.Date);
  const isDateValid = SchemaModule.is(SchemaModule.DateValid);
  const decodeDateValid = SchemaModule.decodeUnknownSync(SchemaModule.DateValid);

  const validDate = new Date("2024-06-15T10:20:30.000Z");
  const invalidDate = new Date("invalid");

  yield* Console.log(`is(Date)(invalid Date) => ${isDate(invalidDate)}`);
  yield* Console.log(`is(DateValid)(valid Date) => ${isDateValid(validDate)}`);
  yield* Console.log(`is(DateValid)(invalid Date) => ${isDateValid(invalidDate)}`);
  yield* Console.log(`decode(DateValid, valid).toISOString() => ${decodeDateValid(validDate).toISOString()}`);

  const invalidAttempt = yield* attemptThunk(() => decodeDateValid(invalidDate));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log("decode(DateValid, invalid Date) unexpectedly succeeded.");
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode(DateValid, invalid Date) failed as expected: ${message}`);
  }
});

const exampleDateValidJsonStrictness = Effect.gen(function* () {
  const decodeDateJson = SchemaModule.decodeUnknownSync(SchemaModule.toCodecJson(SchemaModule.Date));
  const decodeDateValidJson = SchemaModule.decodeUnknownSync(SchemaModule.toCodecJson(SchemaModule.DateValid));

  const permissive = decodeDateJson("not-a-date");
  yield* Console.log(`toCodecJson(Date) accepts invalid string => ${permissive.toString()}`);

  const strictAttempt = yield* attemptThunk(() => decodeDateValidJson("not-a-date"));
  if (strictAttempt._tag === "Right") {
    yield* Console.log("toCodecJson(DateValid) unexpectedly accepted invalid string.");
  } else {
    const message = String(strictAttempt.error).split("\n")[0] ?? String(strictAttempt.error);
    yield* Console.log(`toCodecJson(DateValid) rejects invalid string as expected: ${message}`);
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
      title: "DateValid Guard + Decode",
      description: "Validate and decode only valid Date instances.",
      run: exampleDateValidGuardAndDecode,
    },
    {
      title: "DateValid JSON Strictness",
      description: "Contrast permissive Date JSON decoding with strict DateValid JSON decoding.",
      run: exampleDateValidJsonStrictness,
    },
  ],
});

BunRuntime.runMain(program);
