/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Boolean
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

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Boolean";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";
const moduleRecord = SchemaModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeBridge = Effect.gen(function* () {
  yield* Console.log("Type-level interface is erased; runtime behavior comes from Schema.Boolean.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleBooleanGuard = Effect.gen(function* () {
  const isBoolean = SchemaModule.is(SchemaModule.Boolean);
  const samples: ReadonlyArray<unknown> = [true, false, "true", 0, null];

  for (const sample of samples) {
    yield* Console.log(`is(Boolean)(${JSON.stringify(sample)}) => ${isBoolean(sample)}`);
  }
});

const exampleBooleanDecode = Effect.gen(function* () {
  const decodeBoolean = SchemaModule.decodeUnknownSync(SchemaModule.Boolean);

  yield* Console.log(`decode(true) => ${decodeBoolean(true)}`);
  yield* Console.log(`decode(false) => ${decodeBoolean(false)}`);

  try {
    decodeBoolean("true");
    yield* Console.log('decode("true") unexpectedly succeeded.');
  } catch (error) {
    const message = String(error).split("\n")[0] ?? String(error);
    yield* Console.log(`decode("true") failed as expected: ${message}`);
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
      title: "Runtime Companion Bridge",
      description: "Show the runtime schema value that corresponds to this type-level export.",
      run: exampleRuntimeBridge,
    },
    {
      title: "Boolean Type Guard",
      description: "Use Schema.is with Schema.Boolean to validate unknown inputs.",
      run: exampleBooleanGuard,
    },
    {
      title: "Boolean Decode",
      description: "Decode booleans and show a failing non-boolean input.",
      run: exampleBooleanDecode,
    },
  ],
});

BunRuntime.runMain(program);
