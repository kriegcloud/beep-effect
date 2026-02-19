/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Array$
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.195Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import { createPlaygroundProgram, inspectTypeLikeExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Array$";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";
const moduleRecord = SchemaModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Array$ is erased at runtime; use Schema.Array for executable behavior.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleArrayPredicateChecks = Effect.gen(function* () {
  const numberArraySchema = SchemaModule.Array(SchemaModule.Number);
  const isNumberArray = SchemaModule.is(numberArraySchema);

  yield* Console.log(`Schema.is(Array(Number)) on [1,2,3]: ${isNumberArray([1, 2, 3])}`);
  yield* Console.log(`Schema.is(Array(Number)) on [1,"2",3]: ${isNumberArray([1, "2", 3])}`);
});

const exampleArrayDecodeValidation = Effect.gen(function* () {
  const nonEmptyStringArray = SchemaModule.Array(SchemaModule.NonEmptyString);
  const decodeUnknown = SchemaModule.decodeUnknownSync(nonEmptyStringArray);
  const validInput = ["alpha", "beta"];
  const invalidInput = ["alpha", ""];

  const decoded = decodeUnknown(validInput);
  yield* Console.log(`Decoded valid array length: ${decoded.length}`);

  try {
    decodeUnknown(invalidInput);
    yield* Console.log("Invalid array unexpectedly decoded.");
  } catch (error) {
    const firstLine = String(error).split("\n")[0] ?? String(error);
    yield* Console.log(`Invalid array rejected: ${firstLine}`);
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
      title: "Type Erasure Check",
      description: "Confirm that Array$ does not exist as a runtime export.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Companion Predicate Check",
      description: "Use Schema.Array with Schema.is to validate number arrays.",
      run: exampleArrayPredicateChecks,
    },
    {
      title: "Companion Decode Validation",
      description: "Decode valid input and show item-level validation failure behavior.",
      run: exampleArrayDecodeValidation,
    },
  ],
});

BunRuntime.runMain(program);
