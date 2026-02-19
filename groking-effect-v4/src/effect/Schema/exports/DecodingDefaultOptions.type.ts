/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: DecodingDefaultOptions
 * Kind: type
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
 * - `DecodingDefaultOptions` is compile-time only.
 * - Runtime behavior is demonstrated through `withDecodingDefaultKey` strategies.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "DecodingDefaultOptions";
const exportKind = "type";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const examplePassthroughEncodingStrategy = Effect.gen(function* () {
  const PreferencesPassthrough = SchemaModule.Struct({
    darkMode: SchemaModule.Boolean.pipe(SchemaModule.withDecodingDefaultKey(() => false)),
  });

  const decodePreferences = SchemaModule.decodeUnknownSync(PreferencesPassthrough);
  const encodePreferences = SchemaModule.encodeUnknownSync(PreferencesPassthrough);

  const decoded = decodePreferences({});
  const encoded = encodePreferences(decoded);

  yield* Console.log("DecodingDefaultOptions type is erased; runtime behavior comes from withDecodingDefaultKey.");
  yield* Console.log(`decode({}) => ${formatUnknown(decoded)}`);
  yield* Console.log(`encode(decoded) with default passthrough => ${formatUnknown(encoded)}`);
});

const exampleOmitEncodingStrategy = Effect.gen(function* () {
  const PreferencesOmit = SchemaModule.Struct({
    darkMode: SchemaModule.Boolean.pipe(SchemaModule.withDecodingDefaultKey(() => false, { encodingStrategy: "omit" })),
  });

  const decodePreferences = SchemaModule.decodeUnknownSync(PreferencesOmit);
  const encodePreferences = SchemaModule.encodeUnknownSync(PreferencesOmit);

  const decodedDefault = decodePreferences({});
  const encodedDefault = encodePreferences(decodedDefault);
  const encodedTrue = encodePreferences({ darkMode: true });

  yield* Console.log(`decode({}) => ${formatUnknown(decodedDefault)}`);
  yield* Console.log(`encode(default value) with omit => ${formatUnknown(encodedDefault)}`);
  yield* Console.log(`encode(true) with omit => ${formatUnknown(encodedTrue)}`);
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
      title: "Passthrough Encoding Strategy",
      description: "Show default decode behavior and passthrough encoding for defaulted keys.",
      run: examplePassthroughEncodingStrategy,
    },
    {
      title: "Omit Encoding Strategy",
      description: 'Show how encodingStrategy: "omit" removes the key on encode.',
      run: exampleOmitEncodingStrategy,
    },
  ],
});

BunRuntime.runMain(program);
