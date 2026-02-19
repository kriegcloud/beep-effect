/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Enum
 * Kind: function
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
 * - `Schema.Enum` builds a runtime schema from enum-like objects.
 * - Examples cover both string-valued and numeric enum objects.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Enum";
const exportKind = "function";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleStringEnumObject = Effect.gen(function* () {
  const Status = SchemaModule.Enum({
    Pending: "pending",
    Active: "active",
    Disabled: "disabled",
  } as const);

  const decodeStatus = SchemaModule.decodeUnknownSync(Status);
  const encodeStatus = SchemaModule.encodeUnknownSync(Status);

  yield* Console.log(`Status.enums keys => ${Object.keys(Status.enums).join(", ")}`);
  yield* Console.log(`decode("active") => ${decodeStatus("active")}`);
  yield* Console.log(`encode("disabled") => ${encodeStatus("disabled")}`);

  const invalidAttempt = yield* attemptThunk(() => decodeStatus("archived"));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log('decode("archived") unexpectedly succeeded.');
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode("archived") failed as expected: ${message}`);
  }
});

const exampleNumericEnumObject = Effect.gen(function* () {
  const TrafficLight = {
    0: "Red",
    1: "Yellow",
    2: "Green",
    Red: 0,
    Yellow: 1,
    Green: 2,
  } as const;
  const Light = SchemaModule.Enum(TrafficLight);
  const decodeLight = SchemaModule.decodeUnknownSync(Light);
  const encodeLight = SchemaModule.encodeUnknownSync(Light);

  yield* Console.log(`decode(0) => ${decodeLight(0)}`);
  yield* Console.log(`decode(2) => ${decodeLight(2)}`);
  yield* Console.log(`encode(1) => ${encodeLight(1)}`);
  yield* Console.log(`TrafficLight schema enums snapshot => ${formatUnknown(Light.enums)}`);

  const invalidAttempt = yield* attemptThunk(() => decodeLight("Red"));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log('decode("Red") unexpectedly succeeded.');
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode("Red") failed as expected: ${message}`);
  }
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "String Enum Schema",
      description: "Build an enum schema from string literal values and validate decode/encode behavior.",
      run: exampleStringEnumObject,
    },
    {
      title: "Numeric Enum Schema",
      description: "Use a numeric enum-style object and observe accepted values and invalid labels.",
      run: exampleNumericEnumObject,
    },
  ],
});

BunRuntime.runMain(program);
