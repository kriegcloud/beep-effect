/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Char
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.195Z
 *
 * Overview:
 * A schema representing a single character.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - `Schema.Char` is the runtime companion for single-character strings.
 * - Examples show guard / decode / encode behavior for valid and invalid inputs.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Char";
const exportKind = "const";
const moduleImportPath = "effect/Schema";
const sourceSummary = "A schema representing a single character.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleCharGuard = Effect.gen(function* () {
  const isChar = SchemaModule.is(SchemaModule.Char);
  const samples: ReadonlyArray<unknown> = ["A", "", "AB", "🧠", 7, null];

  for (const sample of samples) {
    yield* Console.log(`is(Char)(${formatUnknown(sample)}) => ${isChar(sample)}`);
  }
});

const exampleCharDecodeEncode = Effect.gen(function* () {
  const decodeChar = SchemaModule.decodeUnknownSync(SchemaModule.Char);
  const encodeChar = SchemaModule.encodeUnknownSync(SchemaModule.Char);

  const decoded = decodeChar("Z");
  const encoded = encodeChar(decoded);
  yield* Console.log(`decode("Z") => ${decoded}`);
  yield* Console.log(`encode("${decoded}") => ${encoded}`);

  const invalidInputs: ReadonlyArray<unknown> = ["", "AB", 5];
  for (const input of invalidInputs) {
    const attempt = yield* attemptThunk(() => decodeChar(input));
    if (attempt._tag === "Right") {
      yield* Console.log(`decode(${formatUnknown(input)}) unexpectedly succeeded => ${attempt.value}`);
    } else {
      const message = String(attempt.error).split("\n")[0] ?? String(attempt.error);
      yield* Console.log(`decode(${formatUnknown(input)}) failed as expected: ${message}`);
    }
  }
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
      title: "Char Guard Behavior",
      description: "Use Schema.is(Char) on single-char, multi-char, and non-string inputs.",
      run: exampleCharGuard,
    },
    {
      title: "Decode + Encode Char",
      description: "Decode and encode valid chars, then show failures for invalid inputs.",
      run: exampleCharDecodeEncode,
    },
  ],
});

BunRuntime.runMain(program);
