/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Array
 * Kind: const
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
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Array";
const exportKind = "const";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDecodeAndGuardNumbers = Effect.gen(function* () {
  const NumberArray = SchemaModule.Array(SchemaModule.Number);
  const decodeNumberArray = SchemaModule.decodeUnknownSync(NumberArray);
  const isNumberArray = SchemaModule.is(NumberArray);

  const decoded = decodeNumberArray([1, 2, 3]);
  yield* Console.log(`Decoded [1, 2, 3] -> ${formatUnknown(decoded)}`);
  yield* Console.log(`is([1, 2, 3]) -> ${isNumberArray([1, 2, 3])}`);
  yield* Console.log(`is([1, "2", 3]) -> ${isNumberArray([1, "2", 3])}`);
});

const exampleElementConstraintPropagation = Effect.gen(function* () {
  const NonEmptyStringArray = SchemaModule.Array(SchemaModule.NonEmptyString);
  const decodeNonEmptyStrings = SchemaModule.decodeUnknownSync(NonEmptyStringArray);

  const accepted = decodeNonEmptyStrings(["effect", "schema"]);
  yield* Console.log(`Accepted tags -> ${formatUnknown(accepted)}`);

  const rejected = yield* attemptThunk(() => decodeNonEmptyStrings(["effect", ""]));
  if (rejected._tag === "Left") {
    yield* Console.log(`Rejected tags with an empty item -> ${String(rejected.error)}`);
    return;
  }

  yield* Console.log(`Unexpected success -> ${formatUnknown(rejected.value)}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "📚",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Decode + Guard Number Arrays",
      description: "Build an array schema and run decode / is checks against mixed inputs.",
      run: exampleDecodeAndGuardNumbers,
    },
    {
      title: "Element Constraints Apply Per Item",
      description: "Array(NonEmptyString) accepts valid values and rejects empty string elements.",
      run: exampleElementConstraintPropagation,
    },
  ],
});

BunRuntime.runMain(program);
